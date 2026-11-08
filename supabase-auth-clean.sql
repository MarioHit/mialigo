-- ============================================
-- Recréer les tables avec Supabase Auth (CLEAN)
-- ============================================
--
-- ⛔⛔⛔ NE JAMAIS EXÉCUTER CE FICHIER SUR LA BASE DE PRODUCTION ⛔⛔⛔
--
-- Il commence par DROP TABLE ... CASCADE : TOUS les profils et TOUS les liens
-- seraient supprimés définitivement. Il décrit le schéma complet, à jour, pour
-- une base NEUVE (projet de test, nouvelle installation) et sert de référence.
--
-- Pour faire évoluer la production, exécuter UNIQUEMENT le script de migration
-- non destructif de la PR concernée, dans le SQL Editor. Ordre d'application :
--   1. supabase-security-fixes.sql        (correctifs Security Advisor)
--   2. supabase-fix-trigger-username.sql  (pseudo choisi à l'inscription)
--   3. supabase-reserved-usernames.sql    (pseudos réservés)
--   4. supabase-fix-email-exposure.sql    (#14, email non lisible via l'API)
--   5. supabase-avatars.sql               (#15, photo de profil et bannière)
--   6. supabase-blocks.sql                (#16, liens → blocs typés)
--   7. supabase-reorder-blocks.sql        (#18, reorder_blocks, taille « wide » par défaut)
--   8. supabase-themes.sql                (#19, users.theme)
--   9. supabase-page-layout.sql           (#98, disposition et densité dans users.theme)
-- Toute nouvelle migration : un nouveau fichier supabase-*.sql non destructif,
-- ajouté à cette liste, ET sa définition recopiée dans ce fichier.

-- 1. Supprimer les tables existantes
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Créer la table users avec la bonne structure
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  -- Thème de page (#19, disposition #98 : même définition que
  -- supabase-page-layout.sql ; listes synchronisées avec lib/themes.ts).
  -- NULL = thème par défaut.
  theme JSONB CONSTRAINT users_theme_check CHECK (
    theme IS NULL OR (
      jsonb_typeof(theme) = 'object'
      AND theme ?& ARRAY['style', 'accent', 'radius']
      AND (theme - ARRAY['style', 'accent', 'radius', 'layout', 'density']) = '{}'::jsonb
      AND (theme->>'style') IN ('classic', 'glass', 'minimal', 'neon')
      AND (theme->>'accent') ~ '^#[0-9a-fA-F]{6}$'
      AND (theme->>'radius') IN ('none', 'soft', 'strong', 'pill')
      AND (NOT theme ? 'layout' OR (theme->>'layout') IN ('grid', 'honeycomb', 'bubbles'))
      AND (NOT theme ? 'density' OR (theme->>'density') IN ('compact', 'roomy'))
    )
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table links
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'fa-solid fa-link',
  "order" INTEGER NOT NULL DEFAULT 1,
  -- Blocs typés (#16, même définition que supabase-blocks.sql ;
  -- types et tailles synchronisés avec lib/blocks.ts)
  type TEXT NOT NULL DEFAULT 'link' CONSTRAINT links_type_check CHECK (type IN ('link')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb CONSTRAINT links_data_check CHECK (jsonb_typeof(data) = 'object'),
  size TEXT NOT NULL DEFAULT 'wide' CONSTRAINT links_size_check CHECK (size IN ('small', 'wide', 'large')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. Pseudos réservés (⚠️ à garder synchronisés avec lib/reserved-usernames.ts)
--     (Même définition que supabase-reserved-usernames.sql)
CREATE OR REPLACE FUNCTION public.is_reserved_username(candidate TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT LOWER(TRIM(candidate)) = ANY (ARRAY[
    -- Routes existantes
    'auth', 'cgu', 'confidentialite', 'contact', 'dashboard', 'login',
    'mentions-legales', 'signup', 'suppression-compte',
    -- Routes techniques Next.js / futures
    '_next', 'api', 'aide', 'help', 'tarifs', 'pricing', 'blog', 'settings',
    'parametres', 'logout', 'register', 'inscription', 'connexion',
    -- Comptes pouvant passer pour officiels
    'admin', 'administrateur', 'mialigo', 'support', 'root', 'staff'
  ]);
$$;

-- Refuse un INSERT ou un changement de pseudo vers un nom réservé (même via l'API directe).
-- Un pseudo réservé déjà attribué peut être conservé.
CREATE OR REPLACE FUNCTION public.guard_reserved_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_reserved_username(NEW.username) THEN
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE' AND NEW.username = OLD.username)
     OR (TG_OP = 'INSERT' AND EXISTS (
       SELECT 1 FROM public.users u WHERE u.id = NEW.id AND u.username = NEW.username
     )) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Ce nom d''utilisateur est réservé, choisissez-en un autre.'
    USING ERRCODE = 'check_violation';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_reserved_username() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER users_reserved_username_guard
  BEFORE INSERT OR UPDATE OF username ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_reserved_username();

-- 4. Trigger pour créer automatiquement un profil après inscription
--    Pseudo/nom choisis sur /signup (user metadata), sinon préfixe de l'email.
--    Pseudo réservé ou déjà pris → suffixe -2, -3… ; ne bloque jamais l'inscription.
--    (Même définition que supabase-reserved-usernames.sql)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  base_username TEXT;
  candidate TEXT;
  display_name TEXT;
  attempt INT := 1;
BEGIN
  base_username := regexp_replace(
    LOWER(COALESCE(NULLIF(TRIM(meta->>'username'), ''), SPLIT_PART(NEW.email, '@', 1))),
    '[^a-z0-9_-]', '', 'g'
  );
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user';
  END IF;

  display_name := COALESCE(NULLIF(TRIM(meta->>'name'), ''), base_username);
  candidate := base_username;
  -- Pseudo réservé : traité comme déjà pris → suffixe -2
  IF public.is_reserved_username(base_username) THEN
    attempt := 2;
    candidate := base_username || '-2';
  END IF;

  LOOP
    BEGIN
      INSERT INTO public.users (id, email, username, name, bio)
      VALUES (NEW.id, NEW.email, candidate, display_name, 'Bienvenue sur ma page !')
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      IF attempt <= 10 THEN
        candidate := base_username || '-' || attempt;
      ELSIF attempt = 11 THEN
        candidate := base_username || '-' || LEFT(REPLACE(NEW.id::text, '-', ''), 8);
      ELSE
        RAISE WARNING '[handle_new_user] Profil non créé (pseudo ou email en conflit).';
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fonction de trigger uniquement : pas d'appel via /rest/v1/rpc
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Attacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Activer Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour users

-- Tout le monde peut voir les profils publics
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Seul le propriétaire peut modifier son profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Seul le propriétaire peut insérer son profil (via trigger)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- La RLS filtre des lignes, pas des colonnes : email ne doit pas être lisible via l'API.
-- (Même définition que supabase-fix-email-exposure.sql)
-- ⚠️ Toute nouvelle colonne de users doit être ajoutée à ce GRANT.
-- ⚠️ Conséquence : pas d'upsert sur users depuis l'app (il exige de lire email) → insert / update.
REVOKE SELECT ON public.users FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, username, name, bio, avatar_url, banner_url, theme, created_at, updated_at)
  ON public.users TO anon, authenticated;

-- 7. Politiques RLS pour links

-- Tout le monde peut voir les liens publics
CREATE POLICY "Public links are viewable by everyone"
  ON links FOR SELECT
  USING (true);

-- Seul le propriétaire peut gérer ses liens
CREATE POLICY "Users can insert own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Fonction pour vérifier la disponibilité d'un username
CREATE OR REPLACE FUNCTION public.is_username_available(desired_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(desired_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

-- 9. Index pour optimiser les recherches
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_order ON links("order");

-- 9b. Réordonner les blocs en une requête (#18, même définition que supabase-reorder-blocks.sql)
CREATE OR REPLACE FUNCTION public.reorder_blocks(ids UUID[])
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  UPDATE public.links AS l
  SET "order" = t.pos
  FROM unnest(ids) WITH ORDINALITY AS t(id, pos)
  WHERE l.id = t.id
    AND l.user_id = (SELECT auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.reorder_blocks(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_blocks(UUID[]) TO authenticated;

-- 10. Storage : photo de profil et bannière (bucket public « avatars »)
-- Même définition que supabase-avatars.sql (#15) : chacun n'écrit que dans « <auth.uid()>/… ».
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatars : lecture de son dossier" ON storage.objects;
CREATE POLICY "Avatars : lecture de son dossier"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Avatars : ajout dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : ajout dans son dossier"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Avatars : modification dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : modification dans son dossier"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Avatars : suppression dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : suppression dans son dossier"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
