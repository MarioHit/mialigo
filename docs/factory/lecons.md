# Leçons apprises en review

Le journal des erreurs trouvées en review (Copilot ou humain) sur les PR de Mialigo. L'objectif est qu'une erreur ne revienne pas : on la note dès la première fois, et si elle revient, elle devient une règle, puis un contrôle automatique.

- Règle d'origine : `AGENTS.md` (Workflow rules) demande d'ajouter ici chaque erreur trouvée en review et de tenir son statut à jour.
- Carte de la chaîne : [`docs/FACTORY.md`](../FACTORY.md), étape 6 « Checks et test sur la preview ».

## Statuts

| Statut                | Sens                                                         | Ce qu'on fait                                                  |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **vue une fois**      | L'erreur est apparue une seule fois.                         | On la note ici et on la corrige.                               |
| **récurrente**        | La même erreur, ou la même cause, revient sur une autre PR.  | On ajoute la PR à la ligne existante et on propose une règle.  |
| **devenue une règle** | Une règle écrite (`AGENTS.md`, modèle de PR, DoD) l'empêche. | On cite la règle dans la colonne « Cause ».                    |
| **automatisée**       | Un check (GitHub Action, test, lint) la détecte tout seul.   | On cite le check ; l'erreur ne peut plus passer sans être vue. |

## Journal

La plus récente en haut. Une ligne par erreur ; si elle se répète, on complète la ligne existante (PR, statut) au lieu d'en ajouter une.

| Date       | Ce qui s'est passé                                                                                                                                                                                                                                                                                                                                                                                                               | Cause                                                                                                                                                                                                                                                                                                                             | PR                                                   | Statut            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| 2026-11-14 | Copilot a dû relire la PR deux fois. Pour corriger son premier commentaire (la DoD ne peut pas être entièrement cochée à l'ouverture de la PR), la correction désignait les cases à compléter à l'étape 6 comme « les deux dernières ». Or la case « critères d'acceptation vérifiés sur la preview » est la **première** du modèle de PR : suivie à la lettre, la consigne aurait laissé la validation sur la preview décochée. | La correction a été relue seulement sur les mots changés, sans la comparer au modèle de PR qu'elle décrivait, et désignait des éléments par leur position plutôt que par leur nom. Règle ajoutée : après chaque correction de review, relire tout le passage, le comparer à sa source et nommer les éléments (`AGENTS.md`, #120). | [#119](https://github.com/MarioHit/mialigo/pull/119) | devenue une règle |
