# ADR-0015 : Chaque PR met à jour la version et le CHANGELOG elle-même

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #78
- **Découle de** : [ADR-0010](0010-versionnage-semver-tags.md)
- **Remplace** : [ADR-0010](0010-versionnage-semver-tags.md) pour la PR de version séparée et la section `Unreleased` ; [ADR-0014](0014-garde-fou-version.md) en entier
- **Liée à** : [ADR-0011](0011-tag-version-automatique.md)

## Contexte

[ADR-0010](0010-versionnage-semver-tags.md) fait écrire les lignes du changelog dans `## [Unreleased]`, puis demande une **PR de version** séparée avant chaque mise en prod (`Unreleased` → `[X.Y.Z]`, `package.json`). En pratique :

- cette PR ajoute une issue, une branche, des checks et un merge à chaque mise en prod, pour modifier deux fichiers ;
- elle a été oubliée deux fois sur trois (#65, #70), d'où le garde-fou d'[ADR-0014](0014-garde-fou-version.md), qui met la PR de mise en prod en brouillon : une étape de plus pour compenser une étape de trop.

Aujourd'hui les issues sont traitées **une par une** : une seule PR ouverte à la fois vers `pre-prod`. Le ruleset interdit tout commit direct sur `pre-prod` et `main`, donc la version ne peut être changée que dans une PR.

## Options envisagées

1. **Garder la PR de version manuelle + garde-fou (ADR-0010, ADR-0014).** *Contre* : une étape par mise en prod, facile à oublier, d'où le garde-fou.
2. **A. PR de version générée par `release-pr.yml`** : quand la version n'a pas changé, le workflow ouvre lui-même la PR de version (MINOR ou PATCH selon les catégories, date du jour). *Pour* : aucune rédaction, pas de conflit entre PR parallèles. *Contre* : un merge de plus à chaque mise en prod ; une PR créée par le jeton intégré ne déclenche pas les autres workflows (Lint, gitleaks), il faudrait un autre jeton.
3. **B. Chaque PR met à jour la version elle-même** : la PR qui fait le changement écrit sa ligne directement dans la section de la prochaine version et met `package.json` à jour selon sa catégorie, par rapport à la version de `main`. *Pour* : aucune étape à la mise en prod ; le tag automatique (ADR-0011) suffit. *Contre* : deux PR ouvertes en même temps modifient la même version, d'où des conflits sur `package.json` et `CHANGELOG.md`.
4. **C. Version par date** (`2026.11.07`). *Contre* : perd MINOR / PATCH, et le changelog devrait être découpé au merge sur `main`, ce qui demande un commit sur `main`.

## Décision et raison

Option **B**.

- Avec une seule PR ouverte à la fois, son unique inconvénient (les conflits entre PR parallèles) ne se présente pas, et elle supprime toute étape à la mise en prod : la PR de mise en prod (ADR-0008) se merge telle quelle, et le tag est créé automatiquement (ADR-0011).
- L'option A garde un merge de plus par mise en prod et un problème de jeton à régler, pour un bénéfice (le parallélisme) dont on n'a pas encore besoin.
- Le garde-fou d'ADR-0014 n'a plus d'objet : la version change avec chaque PR. Il est retiré de `release-pr.yml`.

Règles (détaillées dans `AGENTS.md`) :

- La version de référence est celle de `package.json` sur `main` (en prod). En `0.x`, une PR avec une ligne Ajouté, Modifié, Supprimé ou Obsolète demande un MINOR, les autres un PATCH.
- Si la branche a la même version que `main`, la PR crée la section `## [X.Y.Z] - date` en haut du changelog. Si une PR précédente a déjà ouvert la prochaine version, elle y ajoute sa ligne, met la date à jour, et passe de PATCH à MINOR si besoin.
- La section `## [Unreleased]` disparaît : les lignes vont directement dans la section de la prochaine version, qui joue ce rôle tant qu'elle n'est pas sur `main`.

**On reviendra à l'option A le jour où des issues tourneront en parallèle** (plusieurs PR ouvertes en même temps vers `pre-prod`, par exemple les étapes 2 et 3 du plan de dépendances). Les conflits de version deviendraient alors systématiques ; ce jour-là, un nouvel ADR remplacera celui-ci.

## Conséquences

- Plus de PR de version ni de brouillon : une mise en prod = merger la PR `pre-prod` → `main`, puis vérifier le tag.
- La date d'une version est celle de la dernière PR qui l'a modifiée, pas celle du merge sur `main` : écart d'un jour ou deux accepté.
- Si une PR est ouverte pendant qu'une autre est mergée, elle doit fusionner `origin/pre-prod` et recalculer sa version (étape 4 d'`AGENTS.md`).
- Signal pour passer à l'option A : deux PR vers `pre-prod` ouvertes en même temps, ou des conflits répétés sur `package.json` / `CHANGELOG.md`.
