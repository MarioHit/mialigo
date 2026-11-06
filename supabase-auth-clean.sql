-- ============================================
-- Recréer les tables avec Supabase Auth (CLEAN)
-- ============================================
-- ATTENTION : Ceci va supprimer toutes les données existantes !

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
