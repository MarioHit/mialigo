-- ============================================
-- #16 — Les liens deviennent des blocs typés
-- ============================================
-- Non destructif : ajoute trois colonnes avec valeur par défaut et leurs contraintes.
-- Les liens existants deviennent des blocs « link » (valeur par défaut), sans
-- copie de données : title, url et icon restent les colonnes du bloc « link ».
-- Réexécutable sans erreur.
--
-- ⚠️ ORDRE : exécuter AVANT le déploiement en production du code de la PR #16
-- (la page publique et le dashboard lisent type / data / size).

-- 1. Colonnes (PostgreSQL ≥ 11 : ajout instantané, sans réécrire la table)
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'link';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT 'small';

-- 2. Contraintes. Un nouveau type de bloc (#22, #24…) remplace links_type_check
-- par une migration qui étend la liste (à garder synchronisée avec lib/blocks.ts).
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_type_check;
ALTER TABLE public.links ADD CONSTRAINT links_type_check
  CHECK (type IN ('link'));

-- Tailles de la future grille (#18) : petit 1×1, large 2×1, grand 2×2.
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_size_check;
ALTER TABLE public.links ADD CONSTRAINT links_size_check
  CHECK (size IN ('small', 'wide', 'large'));

-- data : données propres à chaque type, toujours un objet JSON.
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_data_check;
ALTER TABLE public.links ADD CONSTRAINT links_data_check
  CHECK (jsonb_typeof(data) = 'object');

-- Les policies RLS de links (lecture publique, écriture par le propriétaire)
-- s'appliquent telles quelles aux nouvelles colonnes.
