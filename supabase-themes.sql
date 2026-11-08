-- ============================================
-- #19 — Thèmes de page
-- ============================================
-- Non destructif : ajoute une colonne nullable, sa contrainte et son droit de lecture.
-- NULL = thème par défaut (apparence actuelle). Réexécutable sans erreur.
--
-- ⚠️ ORDRE : exécuter AVANT le déploiement en production du code de la PR #19
-- (la page publique et le dashboard lisent users.theme).

-- 1. Colonne : { "style": …, "accent": "#rrggbb", "radius": … }
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme JSONB;

-- 2. Valeurs validées par la base (à garder synchronisées avec lib/themes.ts) :
-- exactement les trois clés, chacune dans sa liste ou au bon format.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_theme_check;
ALTER TABLE public.users ADD CONSTRAINT users_theme_check CHECK (
  theme IS NULL OR (
    jsonb_typeof(theme) = 'object'
    AND theme ?& ARRAY['style', 'accent', 'radius']
    AND (theme - ARRAY['style', 'accent', 'radius']) = '{}'::jsonb
    AND (theme->>'style') IN ('classic', 'glass', 'minimal', 'neon')
    AND (theme->>'accent') ~ '^#[0-9a-fA-F]{6}$'
    AND (theme->>'radius') IN ('none', 'soft', 'strong', 'pill')
  )
);

-- 3. Droits de lecture par colonne (cf. supabase-fix-email-exposure.sql, #14).
GRANT SELECT (theme) ON public.users TO anon, authenticated;
