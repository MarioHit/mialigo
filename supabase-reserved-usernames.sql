-- ============================================
-- Pseudos réservés : blocage côté base
-- ============================================
-- Non destructif : ajoute deux fonctions et un trigger, remplace handle_new_user.
-- À exécuter APRÈS supabase-fix-trigger-username.sql. Aucune donnée modifiée.
--
-- - public.is_reserved_username(text) : liste unique côté base
--   (⚠️ à garder synchronisée avec lib/reserved-usernames.ts).
-- - Trigger users_reserved_username_guard : refuse un INSERT ou un changement
--   de pseudo vers un nom réservé, même en contournant le formulaire (appel API direct).
--   Un profil qui possède DÉJÀ un pseudo réservé peut le conserver et modifier
--   son nom / sa bio normalement.
-- - handle_new_user utilise désormais is_reserved_username (plus de liste dupliquée).

-- 1. Liste des pseudos réservés
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

-- 2. Garde sur public.users
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

  -- Pseudo inchangé : autorisé (profil historique).
  -- Couvre UPDATE et l'INSERT d'un upsert (le dashboard fait un upsert sur une ligne existante).
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

CREATE OR REPLACE TRIGGER users_reserved_username_guard
  BEFORE INSERT OR UPDATE OF username ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_reserved_username();

-- 3. handle_new_user : même logique qu'avant, liste remplacée par is_reserved_username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
