# ADR-0021 : Forme par bloc dans `links.data`, `border-radius` ou `clip-path` en double couche

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #20
- **Découle de** : [ADR-0020](0020-themes-de-page.md)
- **Remplace** : —
- **Liée à** : [ADR-0019](0019-reorganiser-sur-la-page-publique.md)

## Contexte

Depuis #19, l'arrondi des blocs est réglé pour toute la page par le thème (`--block-radius`). #20 demande une forme propre à chaque bloc (carré, cercle, octogone…). Les blocs ont des tailles différentes (Petit, Large, Grand) et des proportions qui ne sont jamais carrées. Les thèmes donnent aux cartes une bordure (tous), une lueur en `box-shadow` (Néon) et un flou d'arrière-plan (Verre) : une forme ne doit rien en perdre.

## Options envisagées

**Stockage**

1. **`links.data.shape`**, comme la position (`data.align`, #90). *Pour* : aucune migration, même chemin d'écriture que la disposition. *Contre* : valeur validée par l'application (`blockShape()`), pas par la base.
2. **Colonne `links.style`** (jsonb ou texte). *Contre* : migration et contrainte pour une donnée d'affichage, alors que `data` existe pour ça (ADR-0017).

**Rendu**

1. **`border-radius`** pour les formes simples (coins droits, rond) et **`clip-path` en double couche** pour les polygones (octogone, hexagone) : la carte devient transparente, une couche découpée peint la bordure, une seconde, en retrait de l'épaisseur de bordure, peint le fond ; la lueur passe par `filter: drop-shadow`, qui suit la forme découpée. *Pour* : CSS seul, s'adapte à toutes les proportions (retraits en px), bordure, survol et thèmes conservés.
2. **`clip-path` seul sur la carte.** *Contre* : la bordure et l'ombre sont coupées avec la carte.
3. **Masques ou formes SVG.** *Contre* : plus lourd, une bordure qui suit la forme demande de dupliquer le tracé, et le contenu n'est plus du HTML simple.

## Décision et raison

- Stockage **option 1**, rendu **option 1** (`lib/blocks.ts` : `BLOCK_SHAPES`, `blockShape`, `withShape`, `withData` générique ; `components/blocks/link-card.tsx` ; `app/globals.css`, règles `[data-shape]` dans `.page-theme`).
- Formes : **Thème** (pas de valeur, arrondi du thème), **Coins droits**, **Rond** (`border-radius: 50%`, donc un ovale sur un bloc rectangulaire, puisqu'aucune taille n'est carrée aujourd'hui), **Octogone** (coins coupés de 14 px), **Hexagone** (pointes de 16 px à gauche et à droite, contenu en retrait).
- Réglage dans le mode « Personnaliser » de la page (bouton « Forme » dans la barre de chaque bloc, petit menu de vignettes) et dans le dashboard (sélecteur à côté de la taille). Enregistrement avec la disposition : un bloc est modifié si sa taille ou ses `data` changent.

## Conséquences

- Pas de migration ; une nouvelle forme = une valeur dans `BLOCK_SHAPES`, une règle CSS et un libellé.
- Avec Verre, le flou est porté par la couche de fond découpée ; avec Néon, la lueur par `drop-shadow` (un peu plus coûteux à l'affichage que `box-shadow`, limité aux blocs découpés).
- Un vrai cercle demandera une taille carrée (piste de #93, tailles verticales).
- Les futurs types de blocs (#22) devront reprendre la double couche s'ils acceptent les formes découpées.
