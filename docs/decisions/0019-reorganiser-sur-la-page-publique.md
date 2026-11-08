# ADR-0019 : Réorganiser ses blocs directement sur sa page publique

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #90
- **Découle de** : [ADR-0018](0018-drag-drop-dnd-kit-grille-bento.md)
- **Remplace** : —
- **Liée à** : [ADR-0017](0017-modele-blocs-registre-apercu.md)

## Contexte

Avec [ADR-0018](0018-drag-drop-dnd-kit-grille-bento.md), on réorganise les blocs dans la liste de `/dashboard/blocs`, et le résultat n'est visible que dans l'aperçu. Sur mobile, l'aperçu est caché derrière un bouton ; sur grand écran, il est réduit. Le retour du mainteneur : « on ne voit pas le rendu direct ». Le besoin ne porte que sur l'**ordre** ; la taille et le contenu restent modifiés dans le dashboard.

## Options envisagées

1. **Mode « Réorganiser » sur `/<pseudo>`**, visible par le propriétaire seulement. *Pour* : le vrai rendu, en plein écran, y compris sur mobile ; réutilise `ProfileView`, le registre de blocs et `reorder_blocks`. *Contre* : la page publique contient un peu de code propre au propriétaire.
2. **Glisser dans l'aperçu du dashboard.** *Contre* : l'aperçu reste petit ou caché sur mobile, c'est précisément le problème.
3. **Page plein écran `/dashboard/organiser`.** *Pour* : n'affecte pas la page publique. *Contre* : une copie de la page plutôt que la page elle-même, et une navigation de plus.

## Décision et raison

Option **1**.

- `app/[username]/page.tsx` transmet l'`id` du propriétaire (déjà public). Le client compare cet `id` avec celui de la session pour **afficher** le bouton ; l'**écriture** reste protégée par la RLS : `reorder_blocks` est `SECURITY INVOKER` et ignore tout bloc dont `user_id` n'est pas `auth.uid()`. Aucune migration.
- La grille triable (`components/blocks/sortable-block-grid.tsx`) est chargée avec `next/dynamic` au passage en mode : les visiteurs ne téléchargent pas `@dnd-kit`.
- Pas de décalage calculé par `@dnd-kit` (blocs de tailles différentes, grille « dense ») : l'ordre est mis à jour pendant le glisser et la vraie grille se réarrange, avec une copie du bloc qui suit le pointeur (`DragOverlay`). Sur mobile, l'appui long (250 ms) déclenche le déplacement, pour que la page continue de défiler.
- Enregistrement explicite (barre « Annuler / Enregistrer l'ordre ») plutôt qu'à chaque dépôt : on essaie plusieurs dispositions, puis on valide. `router.refresh()` relit ensuite la page côté serveur.
- La liste du dashboard (ADR-0018) est conservée, avec une astuce qui renvoie vers ce mode.

## Conséquences

- Les annonces pour lecteurs d'écran sont partagées entre les deux interfaces (`lib/block-dnd.ts`).
- La page publique a maintenant un mode d'édition : tout nouvel outil propre au propriétaire (#19 thèmes, #20 styles) pourra s'y ajouter sur le même principe (bouton propriétaire, code chargé à la demande, écriture protégée par la RLS).
- Le bouton « Modifier » reste affiché pour toute personne connectée (inchangé) ; seul « Réorganiser » est réservé au propriétaire.
