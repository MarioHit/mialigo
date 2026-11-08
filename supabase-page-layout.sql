-- ============================================
-- #98 — Disposition de page (grille, nid d'abeille, bulles)
-- ============================================
-- Non destructif : élargit la contrainte users_theme_check pour accepter deux
-- clés FACULTATIVES dans users.theme. Aucune donnée modifiée, les thèmes
-- existants restent valides. Réexécutable sans erreur.
--
--   layout  : 'grid' | 'honeycomb' | 'bubbles'  (absente = 'grid')
--   density : 'compact' | 'roomy'               (absente = 'compact', 3 puis 2)
--
-- ⚠️ ORDRE : exécuter AVANT de tester l'enregistrement d'une disposition
-- (preview) et avant le déploiement en production du code de la PR #98 :
-- sans elle, enregistrer « Nid d'abeille » ou « Bulles » est refusé.
-- Le code n'écrit ces clés que si elles diffèrent du défaut (serializeTheme).

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_theme_check;
ALTER TABLE public.users ADD CONSTRAINT users_theme_check CHECK (
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
);
