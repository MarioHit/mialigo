-- ============================================
-- #18 — Drag & drop et grille bento
-- ============================================
-- Non destructif : ajoute une fonction, change la valeur par défaut de links.size
-- et passe les blocs « link » existants en taille « wide ».
-- Réexécutable sans erreur.
--
-- Pourquoi « wide » : dans la grille à 2 colonnes, un bloc « small » occupe une
-- demi-largeur. Les liens existants (créés avant la grille, tous en « small »
-- par défaut depuis #16, taille encore jamais utilisée) gardent ainsi leur
-- apparence actuelle : une ligne pleine largeur.
--
-- ⚠️ ORDRE : exécuter AVANT le déploiement en production du code de la PR #18
-- (le dashboard appelle reorder_blocks).

-- 1. Taille par défaut des nouveaux blocs, et liens existants en pleine largeur
ALTER TABLE public.links ALTER COLUMN size SET DEFAULT 'wide';
UPDATE public.links SET size = 'wide' WHERE type = 'link' AND size = 'small';

-- 2. Réordonner tous les blocs en une requête : ids dans l'ordre voulu.
-- SECURITY INVOKER : la RLS de links s'applique (« Users can update own links »),
-- et le filtre user_id = auth.uid() ignore tout id qui n'appartient pas à l'appelant.
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

-- Appelable par les utilisateurs connectés uniquement (via /rest/v1/rpc).
REVOKE EXECUTE ON FUNCTION public.reorder_blocks(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_blocks(UUID[]) TO authenticated;
