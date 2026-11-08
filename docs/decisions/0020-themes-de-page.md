# ADR-0020 : Thèmes de page en variables CSS, stockés dans `users.theme` (jsonb validé par CHECK)

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #19
- **Découle de** : [ADR-0017](0017-modele-blocs-registre-apercu.md)
- **Remplace** : —
- **Liée à** : [ADR-0019](0019-reorganiser-sur-la-page-publique.md)

## Contexte

Toutes les pages ont la même apparence : variables CSS globales (`--bg-color`, `--link-bg`…) et bascule clair / sombre du visiteur (`theme-toggle.tsx`, classe `.dark-mode`). #19 demande des thèmes prédéfinis (classique, verre, minimal, néon), une couleur d'accent avec contrôle de contraste et un choix d'arrondis. Le rendu doit être identique sur la page publique et dans l'aperçu du dashboard (ADR-0017), et rester léger pour les visiteurs.

## Options envisagées

**Stockage**

1. **`users.theme` jsonb** (`style`, `accent`, `radius`), validé par une contrainte CHECK (clés exactes, listes, format `#rrggbb`), `NULL` = thème par défaut. *Pour* : une colonne, extensible, la base refuse une valeur invalide même via l'API directe. *Contre* : la contrainte et `lib/themes.ts` à garder synchronisés.
2. **Trois colonnes** (`theme_style`, `theme_accent`, `theme_radius`). *Contre* : trois `GRANT SELECT` par colonne (#14), et une colonne de plus à chaque option future.
3. **Table `themes`** partagée. *Contre* : inutile tant que les thèmes ne sont pas créés par les utilisateurs.

**Rendu**

1. **Variables CSS sur un conteneur** (`.page-theme[data-page-style]`, `--accent` et `--block-radius` en style inline) : chaque style redéfinit les variables existantes (`--bg-color`, `--link-bg`, `--muted-color`…) pour ses enfants, en mode clair et sombre. *Pour* : aucun JavaScript, les blocs existants (`.block-card`) en profitent sans changement, même rendu partout via `PageThemeScope`.
2. **Classes Tailwind calculées en JavaScript par thème.** *Contre* : logique dupliquée dans chaque composant de bloc, classes dynamiques non détectées par Tailwind.

**Contraste** : l'accent sert de contour et de survol. Contrôle WCAG (élément graphique, 3:1) contre les fonds du style, dans les deux modes : **avertissement** dans le dashboard plutôt que blocage (l'utilisateur garde le choix) ; les couleurs proposées passent toutes le contrôle ; le texte posé sur l'accent (`--accent-contrast`) est choisi automatiquement noir ou blanc.

## Décision et raison

- Stockage **option 1** (`supabase-themes.sql`) et rendu **option 1** (`lib/themes.ts`, `components/page-theme-scope.tsx`, `app/globals.css`).
- **Classique** et **Minimal** suivent le mode clair / sombre du visiteur ; **Verre** a un fond dégradé de l'accent, en clair et en sombre ; **Néon** est toujours sombre (son principe), la bascule du visiteur n'y change rien.
- **Verre** : `backdrop-filter: blur(12px)` sur les cartes seulement, avec cartes plus opaques si le navigateur ne le gère pas (`@supports`). Coût à vérifier sur mobile d'entrée de gamme (demandé par l'issue).
- **Arrondis** : `--block-radius` (aucun, léger, fort, pilule), plafonné à 1,75 rem pour les tuiles petites et grandes (une pilule sur une tuile carrée deviendrait un ovale).
- Le choix se fait dans un onglet **Apparence** du dashboard, avec l'aperçu en direct (brouillon `setThemeDraft`), **ou directement sur sa page** : le mode d'édition d'[ADR-0019](0019-reorganiser-sur-la-page-publique.md) devient « **Personnaliser** » (disposition et apparence) ; le bouton « 🎨 Apparence » ouvre un panneau en bas d'écran, hors de la zone du thème pour rester lisible, et la page elle-même sert d'aperçu. Les deux interfaces partagent le même sélecteur (`components/theme-picker.tsx`) ; sur la page, il est chargé à la demande (`next/dynamic`), comme la grille triable. « Enregistrer » écrit `users.theme` (ou `NULL` pour le thème par défaut) ; sur la page, dans la même opération que la disposition.

## Conséquences

- `supabase-themes.sql` doit être exécuté en prod **avant** le déploiement (lecture de `users.theme`).
- Un nouveau style = une valeur dans `THEME_STYLES` et dans la contrainte (nouvelle migration), plus un bloc CSS `[data-page-style="…"]`.
- La couleur du texte des pages légales, de l'accueil et du dashboard ne change pas : les thèmes ne s'appliquent qu'à la page publique et à l'aperçu.
- Le style par bloc (#20) pourra s'appuyer sur les mêmes variables.
