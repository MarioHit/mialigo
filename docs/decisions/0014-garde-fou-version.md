# ADR-0014 : La PR de mise en prod reste en brouillon tant que la version n'a pas changé

- **Statut** : Remplacée par [ADR-0015](0015-version-par-pr.md)
- **Date** : 2026-11-07
- **Issue / PR** : #72
- **Découle de** : [ADR-0010](0010-versionnage-semver-tags.md)
- **Remplace** : —
- **Liée à** : [ADR-0008](0008-pr-mise-en-prod-automatique.md), [ADR-0011](0011-tag-version-automatique.md)

## Contexte

[ADR-0010](0010-versionnage-semver-tags.md) demande qu'une PR de version (`Unreleased` → `[X.Y.Z]`, `package.json`) soit mergée dans `pre-prod` **avant** que le mainteneur merge la PR de mise en prod. Sur les trois premières mises en prod versionnées, deux sont parties sans (#65, #70) : la PR de mise en prod, créée automatiquement ([ADR-0008](0008-pr-mise-en-prod-automatique.md)), est mergeable aussitôt, et rien ne signale qu'il manque la version. Résultat : version livrée sans numéro, pas de tag ([ADR-0011](0011-tag-version-automatique.md) ne fait rien si la version n'a pas bougé), PR de rattrapage.

## Options envisagées

1. **Rappel seulement** (commentaire ou avertissement dans la PR de mise en prod). *Pour* : n'empêche rien. *Contre* : facile à ignorer, comme la règle actuelle.
2. **PR de mise en prod en brouillon** tant que `package.json` a la même version sur `pre-prod` et sur `main`, avec un commentaire ; le workflow la repasse en « prête » dès que la version change. *Pour* : un brouillon ne peut pas être mergé ; aucun réglage de dépôt ; se corrige tout seul au merge de la PR de version. *Contre* : contournable en la passant « prête » à la main.
3. **Check obligatoire dans le ruleset de `main`** qui échoue sans changement de version. *Pour* : bloquant même pour un merge manuel. *Contre* : un workflow de plus sur les PR vers `main`, réglage du ruleset à maintenir, et le check reste rouge jusqu'à un nouveau push sur `pre-prod` (pas de relance automatique simple).
4. **Le workflow fait lui-même la PR de version.** *Contre* : la version (MINOR ou PATCH) et la date se décident à la mise en prod ; le contenu du changelog doit être relu.

## Décision et raison

Option **2**, dans `release-pr.yml` (étape « Garde-fou de version », après la création ou la mise à jour de la PR).

- Elle bloque réellement le merge (un brouillon n'est pas mergeable) sans modifier le ruleset (3).
- Le brouillon est expliqué par un commentaire, et levé automatiquement : le merge de la PR de version dans `pre-prod` relance le workflow.
- Le choix du numéro reste humain et relu (4).

La comparaison porte sur `package.json` de `pre-prod` et de `main` (lus par l'API), pas sur le dernier tag : c'est exactement la condition dans laquelle le tag automatique ne serait pas créé.

## Conséquences

- Une PR de mise en prod en brouillon signifie « PR de version à faire ». `AGENTS.md` interdit de la repasser « prête » à la main.
- Limite acceptée : si une PR est mergée dans `pre-prod` après la PR de version, la mise en prod n'est plus en brouillon (la version a déjà changé) mais contient une ligne restée dans `Unreleased` ; la PR de version doit donc être la dernière avant la mise en prod.
- Si le garde-fou ne suffit pas (passage « prêt » manuel répété), passer à l'option 3.
