-- ============================================
-- #14 — Ne plus exposer public.users.email via l'API
-- ============================================
-- Non destructif : modifie uniquement des droits d'accès, aucune donnée ni table touchée.
--
-- ⚠️ ORDRE : exécuter APRÈS le déploiement en production du code de la PR #14
-- (lectures de `users` en colonnes explicites). Avec l'ancien code (`select("*")`),
-- les pages profil et le dashboard tomberaient en erreur.
--
-- Problème : la policy RLS « Public profiles are viewable by everyone » (USING (true))
-- rend toutes les lignes lisibles, y compris la colonne email.
-- La RLS filtre des LIGNES, pas des COLONNES : on retire donc le droit de lecture
-- sur la colonne email aux rôles de l'API (anon = visiteurs, authenticated = connectés).
--
-- Après ce script :
--   - lecture de id, username, name, bio, created_at, updated_at : inchangée
--   - lecture de email : refusée (« permission denied ») pour anon et authenticated
--   - INSERT / UPDATE / upsert (callback, dashboard) : inchangés
--   - triggers SECURITY DEFINER (handle_new_user…) : inchangés
--
-- ⚠️ Toute NOUVELLE colonne de users devra être autorisée explicitement, ex. :
--   GRANT SELECT (avatar_url) ON public.users TO anon, authenticated;

REVOKE SELECT ON public.users FROM PUBLIC, anon, authenticated;

GRANT SELECT (id, username, name, bio, created_at, updated_at)
  ON public.users TO anon, authenticated;
