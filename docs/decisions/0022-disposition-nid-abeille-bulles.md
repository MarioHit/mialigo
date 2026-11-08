# ADR-0022 : Dispositions nid d'abeille et bulles, réglage du thème rendu en CSS

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #98
- **Découle de** : [ADR-0020](0020-themes-de-page.md)
- **Remplace** : —
- **Liée à** : [ADR-0019](0019-reorganiser-sur-la-page-publique.md)

## Contexte

Les blocs d'une page sont disposés en grille de rectangles (2 colonnes, tailles Petit / Large / Grand, ADR-0018 et 0019). Le mainteneur veut pouvoir donner à **toute la page** une autre organisation : des hexagones qui s'emboîtent en nid d'abeille, ou des cercles en quinconce. Ce n'est pas la forme d'un bloc isolé (idée de la #20, gardée à part), mais une disposition de l'ensemble. Une maquette (`docs/maquettes/dispositions.html`) a servi à choisir : les deux dispositions, en rangées « 3 puis 2 » ou « 2 puis 1 », tous les blocs de la même taille.

Contraintes : rendu identique sur la page publique, dans l'aperçu du dashboard et en mode « Personnaliser » (grille triable `@dnd-kit`) ; garder les bordures, le survol, la lueur Néon et le flou Verre des thèmes ; ne pas perdre les tailles et positions choisies en grille.

## Options envisagées

1. **Réglage du thème (`users.theme.layout` et `density`), rendu en CSS pur** : `PageThemeScope` pose `data-page-layout` / `data-page-density`, et des règles CSS redisposent les mêmes `<li>` (6 ou 4 colonnes, `nth-child` pour décaler une rangée sur deux, pas vertical de 0,866 × la largeur). *Pour* : aucun composant de rendu dupliqué, la grille triable marche telle quelle, l'aperçu suit le brouillon de thème sans code. *Contre* : impossible de mêler des tailles (le motif `nth-child` suppose des blocs identiques).
2. **Calcul des positions en JS** (rangées et coordonnées calculées par un composant). *Pour* : permettrait un bloc Grand imbriqué. *Contre* : un second moteur de mise en page pour la page, l'aperçu et la grille triable ; inutile tant que les blocs sont identiques.
3. **Nouvelle colonne `users.layout`**. *Pour* : séparée du thème. *Contre* : migration et droit de lecture par colonne en plus, alors que la disposition se choisit avec le style dans le même sélecteur, s'enregistre et s'annule avec lui.
4. **Masques SVG pour les hexagones**. *Contre* : bordure et survol difficiles, plus lourd que `clip-path`.

## Décision et raison

Option 1. Les deux clés sont **facultatives** dans `users.theme` (`supabase-page-layout.sql` élargit `users_theme_check`), et `serializeTheme()` ne les écrit que si elles diffèrent du défaut (`grid`, `compact`) : les thèmes existants restent valides et un enregistrement sans disposition passe même avant la migration.

- **Hexagone** pointe en haut par `clip-path` ; comme il coupe la bordure et les ombres, la carte devient transparente et deux couches découpées dessinent la bordure puis le fond (survol à l'accent, flou Verre sur le fond, lueur Néon par `filter: drop-shadow` qui suit la forme).
- **Cercle** par `border-radius: 50%` : bordure et ombres gardées telles quelles.
- **Tailles et positions** ignorées à l'affichage dans ces dispositions, mais conservées en base : repasser en Grille les rend. En mode « Personnaliser », leurs boutons sont masqués ; l'arrondi du thème est masqué dans le sélecteur.
- La mesure se fait en unités de conteneur (`cqw`) sur le `<nav class="block-nav">` de `ProfileView`.

L'option 2 est écartée pour l'instant (pas de tailles mêlées), l'option 3 pour la migration en plus sans bénéfice, l'option 4 pour le coût.

## Conséquences

- Une seule mise en page, en CSS, pour la page, l'aperçu et la grille triable ; le glisser-déposer marche sans changement (ordre au dépôt, ADR-0019).
- Titres sur 2 lignes au plus : un titre long est coupé, surtout en « 3 puis 2 ».
- Pas de bloc Grand dans ces dispositions : #100 (bloc Grand imbriqué), qui demandera sans doute l'option 2.
- Galerie de modèles pour choisir sa disposition avec ses propres liens : #99.
