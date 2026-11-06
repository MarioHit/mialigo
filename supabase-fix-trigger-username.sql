-- ============================================
-- handle_new_user : utiliser le pseudo et le nom choisis sur /signup
-- ============================================
-- Non destructif : remplace uniquement la fonction du trigger.
-- À exécuter APRÈS supabase-security-fixes.sql. Aucune table ni donnée modifiée,
-- les profils existants ne changent pas.
--
-- Comportement :
--   1. Pseudo = raw_user_meta_data.username (envoyé par /signup),
--      sinon la partie de l'email avant le @.
--      Nettoyé comme côté client : minuscules, uniquement [a-z0-9_-].
--   2. Moins de 3 caractères après nettoyage → "user".
--   3. Pseudo déjà pris → suffixe "-2", "-3"… (10 essais), puis suffixe tiré de l'id.
--   4. En dernier recours, l'erreur est avalée : l'inscription n'est jamais bloquée,
--      le profil sera créé par /auth/callback ou le dashboard.

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

-- CREATE OR REPLACE conserve les droits, mais on le réaffirme par sécurité.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
