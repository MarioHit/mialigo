-- ============================================
-- Correctifs Security Advisor Supabase (docs/advisor.json)
-- ============================================
-- Non destructif : à exécuter une fois dans le SQL Editor sur la base existante.

-- 1. handle_new_user : fonction de trigger, ne doit pas être appelable via /rest/v1/rpc
--    - search_path figé (lint 0011) : le corps n'utilise que public.users (qualifié)
--      et des fonctions de pg_catalog, donc '' ne change rien au comportement.
--    - EXECUTE retiré à anon / authenticated / public (lints 0028 / 0029).
--      Le trigger on_auth_user_created continue de fonctionner : le droit EXECUTE
--      n'est vérifié qu'à la création du trigger, pas à son déclenchement.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. is_username_available : SECURITY DEFINER inutile, la table users est déjà
--    lisible par tous (policy "Public profiles are viewable by everyone").
--    Passage en SECURITY INVOKER + search_path figé + nom de table qualifié.
--    Elle reste appelable par anon (utile pour vérifier un pseudo avant inscription).
CREATE OR REPLACE FUNCTION public.is_username_available(desired_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.users WHERE LOWER(username) = LOWER(desired_username)
  );
END;
$$;
