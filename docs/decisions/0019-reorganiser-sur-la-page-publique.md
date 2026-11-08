# ADR-0019 : Modifier la disposition de ses blocs (ordre et taille) directement sur sa page publique

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #90
- **Découle de** : [ADR-0018](0018-drag-drop-dnd-kit-grille-bento.md)
- **Remplace** : [ADR-0018](0018-drag-drop-dnd-kit-grille-bento.md) pour le remplissage « dense » de la grille
- **Liée à** : [ADR-0017](0017-modele-blocs-registre-apercu.md)

## Contexte

Avec [ADR-0018](0018-drag-drop-dnd-kit-grille-bento.md), on réorganise les blocs dans la liste de `/dashboard/blocs`, et le résultat n'est visible que dans l'aperçu. Sur mobile, l'aperçu est caché derrière un bouton ; sur grand écran, il est réduit. Le retour du mainteneur : « on ne voit pas le rendu direct ». Le besoin porte sur la **disposition** : l'ordre et la taille des blocs ; le contenu reste modifié dans le dashboard.

Premiers essais sur la preview :

- la grille d'ADR-0018 utilise `grid-flow-row-dense` : un bloc « petit » ne peut pas rester seul sur sa ligne, le petit bloc suivant est remonté à côté, quel que soit l'ordre voulu ;
- réordonner pendant le survol (`onDragOver`) provoquait « Maximum update depth exceeded » : la grille, dont les blocs ont des tailles différentes, bougeait sous le pointeur et relançait un survol en boucle.

## Options envisagées

1. **Mode « Réorganiser » sur `/<pseudo>`**, visible par le propriétaire seulement. *Pour* : le vrai rendu, en plein écran, y compris sur mobile ; réutilise `ProfileView`, le registre de blocs et `reorder_blocks`. *Contre* : la page publique contient un peu de code propre au propriétaire.
2. **Glisser dans l'aperçu du dashboard.** *Contre* : l'aperçu reste petit ou caché sur mobile, c'est précisément le problème.
3. **Page plein écran `/dashboard/organiser`.** *Pour* : n'affecte pas la page publique. *Contre* : une copie de la page plutôt que la page elle-même, et une navigation de plus.

## Décision et raison

Option **1**, sous le nom « Modifier la disposition ».

- `app/[username]/page.tsx` transmet l'`id` du propriétaire (déjà public). Le client compare cet `id` avec celui de la session pour **afficher** le bouton ; l'**écriture** reste protégée par la RLS : `reorder_blocks` est `SECURITY INVOKER` et ignore tout bloc dont `user_id` n'est pas `auth.uid()`. Aucune migration.
- La grille triable (`components/blocks/sortable-block-grid.tsx`) est chargée avec `next/dynamic` au passage en mode : les visiteurs ne téléchargent pas `@dnd-kit`.
- **L'ordre change au dépôt, pas au survol** : pendant le glisser, aucun décalage n'est calculé, le bloc d'origine reste en place (estompé), une copie suit le pointeur (`DragOverlay`) et le bloc survolé est mis en évidence ; au dépôt, la vraie grille se réarrange une fois. Plus de boucle de mises à jour. Sur mobile, l'appui long (250 ms) déclenche le déplacement, pour que la page continue de défiler.
- **Taille modifiable sur la page** : une barre « Petit / Large / Grand » sur chaque bloc, qui n'enclenche pas de glisser ; le bloc prend sa nouvelle place tout de suite.
- **Fin du remplissage « dense »** (remplace ce point d'ADR-0018) : les blocs se placent strictement dans l'ordre choisi, un petit bloc peut rester seul sur sa ligne. La page suit les choix de l'utilisateur plutôt qu'un tassement automatique.
- **Enregistrement explicite** (barre « Annuler / Enregistrer ») : on essaie plusieurs dispositions, puis on valide. Les tailles modifiées sont écrites par des `update` simples sur `links.size` (peu de blocs changent à la fois, pas de nouvelle fonction SQL ni de migration), puis l'ordre par `reorder_blocks` s'il a changé ; `router.refresh()` relit ensuite la page côté serveur.
- La liste du dashboard (ADR-0018) est conservée, avec une astuce qui renvoie vers ce mode.

## Conséquences

- Les annonces pour lecteurs d'écran sont partagées entre les deux interfaces (`lib/block-dnd.ts`).
- La page publique a maintenant un mode d'édition : tout nouvel outil propre au propriétaire (#19 thèmes, #20 styles) pourra s'y ajouter sur le même principe (bouton propriétaire, code chargé à la demande, écriture protégée par la RLS).
- Le bouton « Modifier » reste affiché pour toute personne connectée (inchangé) ; seul « Modifier la disposition » est réservé au propriétaire.
- Limite acceptée : tailles et ordre ne sont pas écrits dans une même transaction ; en cas d'échec partiel, un message s'affiche et le mode reste ouvert pour réessayer. Une fonction SQL unique (`save_layout`) pourra les regrouper si besoin.
- Sans remplissage dense, une demi-ligne peut rester vide : c'est voulu.
