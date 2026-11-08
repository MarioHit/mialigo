-- ============================================
-- #15 — Photo de profil et bannière
-- ============================================
-- Non destructif : ajoute deux colonnes nullables, un bucket Storage et ses policies.
-- Aucune donnée existante n'est modifiée. Réexécutable sans erreur.
--
-- ⚠️ ORDRE : exécuter AVANT le déploiement en production du code de la PR #15
-- (la page publique et le dashboard lisent avatar_url / banner_url : sans ces
-- colonnes, la lecture du profil échouerait).

-- 1. Colonnes : URL publique de l'image dans le bucket « avatars » (NULL = pas d'image)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Droits de lecture par colonne (cf. supabase-fix-email-exposure.sql, #14) :
-- toute nouvelle colonne de users doit être autorisée explicitement. email reste exclu.
GRANT SELECT (avatar_url, banner_url) ON public.users TO anon, authenticated;

-- 3. Bucket public « avatars » : lecture par URL publique, sans authentification.
-- Taille et types limités côté serveur (le dashboard redimensionne avant l'envoi).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 Mo
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Policies : chaque utilisateur n'écrit que dans son dossier « <auth.uid()>/… ».
-- La lecture publique passe par l'URL publique du bucket (pas de policy SELECT pour anon) ;
-- la policy SELECT ci-dessous ne sert qu'au propriétaire (lister / remplacer ses fichiers).
DROP POLICY IF EXISTS "Avatars : lecture de son dossier" ON storage.objects;
CREATE POLICY "Avatars : lecture de son dossier"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Avatars : ajout dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : ajout dans son dossier"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Avatars : modification dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : modification dans son dossier"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Avatars : suppression dans son dossier" ON storage.objects;
CREATE POLICY "Avatars : suppression dans son dossier"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
