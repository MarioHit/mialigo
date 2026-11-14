# Leçons apprises

Le journal unique des erreurs de la chaîne de travail de Mialigo : celles trouvées en review (Copilot ou humaine) et celles découvertes après le merge. L'objectif est qu'une erreur ne revienne pas : on la note dès la première fois, et si elle revient, elle devient une règle, puis un contrôle automatique.

- Règle d'origine : `AGENTS.md` (Workflow rules) demande d'ajouter ici chaque erreur, quel que soit le moment où elle est trouvée, et de tenir son statut à jour.
- Carte de la chaîne : [`docs/FACTORY.md`](../FACTORY.md), section « Leçons apprises ».

## Trouvée par

- **review Copilot** : un commentaire de Copilot sur la PR ;
- **review humaine** : un commentaire ou un test du mainteneur avant le merge ;
- **après le merge** : l'erreur est découverte une fois la PR mergée (dans `pre-prod` ou en production).

## Statuts

| Statut                | Sens                                                         | Ce qu'on fait                                                  |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **vue une fois**      | L'erreur est apparue une seule fois.                         | On la note ici et on la corrige.                               |
| **récurrente**        | La même erreur, ou la même cause, revient sur une autre PR.  | On ajoute la PR à la ligne existante et on propose une règle.  |
| **devenue une règle** | Une règle écrite (`AGENTS.md`, modèle de PR, DoD) l'empêche. | On cite la règle dans la colonne « Cause ».                    |
| **automatisée**       | Un check (GitHub Action, test, lint) la détecte tout seul.   | On cite le check ; l'erreur ne peut plus passer sans être vue. |

## Journal

La plus récente en haut. Une ligne par erreur ; si elle se répète, on complète la ligne existante (PR, statut) au lieu d'en ajouter une.

| Date       | Ce qui s'est passé                                                                                                                                                                                                                                                                                                                                                                                                               | Cause                                                                                                                                                                                                                                                                                                                                                                                | Trouvée par    | PR                                                                                                         | Statut            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| 2026-11-14 | Copilot a dû relire la PR deux fois. Pour corriger son premier commentaire (la DoD ne peut pas être entièrement cochée à l'ouverture de la PR), la correction désignait les cases à compléter à l'étape 6 comme « les deux dernières ». Or la case « critères d'acceptation vérifiés sur la preview » est la **première** du modèle de PR : suivie à la lettre, la consigne aurait laissé la validation sur la preview décochée. | La correction a été relue seulement sur les mots changés, sans la comparer au modèle de PR qu'elle décrivait, et désignait des éléments par leur position plutôt que par leur nom. Règle ajoutée : après chaque correction de review, relire tout le passage, le comparer à sa source et nommer les éléments (`AGENTS.md`, #120).                                                    | review Copilot | [#119](https://github.com/MarioHit/mialigo/pull/119)                                                       | devenue une règle |
| 2026-11-09 | La PR #111 a été mergée dans `pre-prod` alors que la 0.9.0 venait d'arriver en production : sa ligne du CHANGELOG s'est retrouvée dans la section 0.9.0, une version déjà publiée. Il a fallu une PR de correction (#113) pour la déplacer en 0.9.1.                                                                                                                                                                             | La règle existait (`AGENTS.md`, Changelog and versions, point 5 : revérifier la version de `main` juste avant le merge), mais la vérification et le merge ont été lancés dans la même commande : le merge est parti sans que le résultat soit lu. Depuis, la vérification se fait dans une étape à part, et elle a fonctionné pour la #122 (ligne déplacée en 0.9.4 avant le merge). | après le merge | [#111](https://github.com/MarioHit/mialigo/pull/111), [#113](https://github.com/MarioHit/mialigo/pull/113) | vue une fois      |
