# ADR-0018 : Réorganisation par drag & drop avec `@dnd-kit` et grille « bento » en CSS Grid

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #18
- **Découle de** : [ADR-0017](0017-modele-blocs-registre-apercu.md)
- **Remplace** : —
- **Liée à** : —

## Contexte

Les blocs s'affichent dans l'ordre de la colonne `"order"`, mais le dashboard ne permet pas de le changer. La colonne `size` (#16) existe sans être utilisée. #18 demande un drag & drop utilisable à la souris, au doigt et au clavier, une grille à 2 colonnes avec trois tailles (petit 1×1, large 2×1, grand 2×2), et l'enregistrement de l'ordre en une seule requête.

## Options envisagées

**Drag & drop**

1. **`@dnd-kit`** (`core`, `sortable`, `utilities`). *Pour* : souris, tactile et clavier, annonces pour lecteurs d'écran (traduisibles), compatible React 19, environ 15 Ko gzip, chargé uniquement dans le dashboard. *Contre* : une dépendance de plus.
2. **API HTML5 drag and drop native.** *Contre* : pas de tactile sur mobile, pas de clavier, accessibilité à écrire soi-même.
3. **`react-beautiful-dnd` / `@hello-pangea/dnd`.** *Contre* : listes seulement (pas de grille, utile plus tard), le premier n'est plus maintenu.
4. **Boutons monter / descendre.** *Pour* : aucune dépendance. *Contre* : pénible au-delà de quelques blocs, ne répond pas à l'issue.

**Enregistrement de l'ordre**

1. **Fonction `reorder_blocks(ids uuid[])`**, `SECURITY INVOKER`, un seul `UPDATE ... FROM unnest(ids) WITH ORDINALITY`, filtrée sur `user_id = auth.uid()`. *Pour* : une requête, la RLS s'applique, un id étranger est ignoré.
2. **Un `update` par bloc depuis le navigateur.** *Contre* : N requêtes, ordre incohérent si l'une échoue.

**Grille**

1. **CSS Grid à 2 colonnes, `grid-flow-row-dense`**, hauteur de ligne fixe, `col-span` / `row-span` selon la taille. *Pour* : aucune librairie, les trous laissés par un petit bloc isolé sont comblés automatiquement.
2. **Librairie de masonry.** *Contre* : JavaScript à l'affichage de la page publique pour un résultat équivalent.

## Décision et raison

- **`@dnd-kit`** (option 1), dans `app/dashboard/blocs/page.tsx` uniquement : liste verticale triable, poignée dédiée (le reste de la ligne reste cliquable), `PointerSensor` avec 5 px de seuil et `KeyboardSensor`, annonces en français. Le drag & drop se fait dans la **liste** du dashboard ; la grille se voit dans l'aperçu en direct, mis à jour immédiatement.
- **`reorder_blocks`** (option 1, `supabase-reorder-blocks.sql`) : ordre affiché tout de suite, puis une requête ; en cas d'échec, les blocs sont relus.
- **CSS Grid** (option 1) dans `BlockList` (`components/blocks/registry.tsx`) ; `LinkCard` adapte sa forme (ligne, tuile, grande tuile).
- **Taille par défaut `wide`** pour les liens (et les liens existants passés en `wide`) : un `small` occupe une demi-largeur, les pages existantes auraient changé d'aspect sans que leurs auteurs le demandent. La taille n'était pas encore utilisée, la mise à jour ne perd rien.

## Conséquences

- `supabase-reorder-blocks.sql` doit être exécuté en prod **avant** le déploiement.
- Nouvelle dépendance `@dnd-kit/*`, utilisée par le dashboard seulement ; à mettre à jour avec React.
- Le drag & drop dans la grille elle-même (comme sur un tableau bento) n'est pas fait : la liste suffit tant que l'aperçu montre le résultat. À revoir si les blocs portfolio (#22) rendent la liste peu lisible.
- Les futurs types de blocs (#22) doivent prévoir leur rendu dans les trois tailles.
