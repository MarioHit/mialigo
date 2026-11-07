# ADR-0010 : Versions SemVer, `package.json` et tag Git à chaque mise en prod

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #57
- **Découle de** : —
- **Remplace** : [ADR-0009](0009-changelog-keep-a-changelog.md)
- **Liée à** : [ADR-0004](0004-regles-git-pr-pre-prod.md), [ADR-0008](0008-pr-mise-en-prod-automatique.md)

## Contexte

[ADR-0009](0009-changelog-keep-a-changelog.md) a introduit un `CHANGELOG.md` au format Keep a Changelog, avec une section par **date** de mise en prod, faute de numéro de version. Conséquences constatées :

- rien ne relie une mise en prod à `package.json` (resté à `0.1.0`) ni à un point précis de l'historique Git ;
- les lignes déjà en prod restent dans « Non publié » jusqu'à ce que la PR suivante les déplace, sous une date qu'elle doit retrouver ;
- les lignes citent le numéro de PR, qui n'est connu qu'après `gh pr create` : il faut un commit de plus pour le corriger.

La mise en prod reste un merge `pre-prod` → `main` fait par le mainteneur ([ADR-0004](0004-regles-git-pr-pre-prod.md)) ; la PR de mise en prod est créée par GitHub Actions ([ADR-0008](0008-pr-mise-en-prod-automatique.md)). Les agents ne peuvent pas committer sur `main`.

## Options envisagées

1. **Garder les sections datées d'ADR-0009.** *Pour* : rien à changer. *Contre* : les problèmes ci-dessus.
2. **Keep a Changelog rédigé à la main + versions SemVer + tag Git.** Chaque PR écrit sa ligne dans `## [Unreleased]` avec le numéro d'issue ; une PR de version (vers `pre-prod`) transforme `Unreleased` en `## [X.Y.Z] - AAAA-MM-JJ` et met à jour `package.json` ; après le merge vers `main`, un tag `vX.Y.Z` est posé sur le commit de merge. *Pour* : aucun outil ni dépendance, texte écrit pour l'utilisateur et relu dans la PR, version identique dans le changelog, `package.json` et Git. *Contre* : étapes manuelles (PR de version, tag) qu'on peut oublier.
3. **[Changesets](https://github.com/changesets/changesets)** : chaque PR ajoute un fichier dans `.changeset/` qui décrit le changement et le type de version ; `changeset version` calcule la version et génère le changelog. *Pour* : calcul de version automatique, pas de conflit sur un fichier unique. *Contre* : conçu pour publier des paquets npm (monorepos) ; une dépendance et un bot GitHub de plus ; format du changelog généré différent de Keep a Changelog (pas de catégories Ajouté / Corrigé…) ; le texte de chaque PR n'est plus lisible au même endroit. **Écarté pour l'instant.**
4. **[release-please](https://github.com/googleapis/release-please)** : une GitHub Action lit les commits et maintient une PR de release qui met à jour le changelog, la version et crée le tag. *Pour* : quasiment tout est automatique, tag compris. *Contre* : exige des messages de commit Conventional Commits stricts (l'historique ne l'est pas) ; le texte vient des commits, donc écrit pour des développeurs ; sa PR de release vise la branche par défaut et ferait doublon avec le flux `pre-prod` → `main` et le workflow `release-pr.yml` ; format de changelog propre à l'outil. **Écarté pour l'instant.**

## Décision et raison

Option **2**.

- Le changelog doit rester écrit **pour l'utilisateur**, ce qu'aucun outil ne fait à partir des commits (4) ; Changesets (3) apporte surtout de quoi publier des paquets npm, dont Mialigo n'a pas besoin.
- Le versionnage sémantique donne un numéro unique à chaque mise en prod, le même dans `CHANGELOG.md`, `package.json` et le tag Git ; on retrouve ainsi exactement le code d'une version.
- Le numéro d'**issue** remplace celui de la PR : il existe avant la branche, donc la ligne est juste dès le premier commit.
- La catégorie « Interne » d'ADR-0009 est conservée, pour que chaque PR écrive sa ligne sans exception.
- Tant que la version est en `0.x`, la règle est : MINOR (`0.2.0`) si la mise en prod contient au moins une ligne Ajouté, Modifié, Supprimé ou Obsolète, sinon PATCH (`0.1.1`). Le passage à `1.0.0` est une décision du mainteneur.

La prod actuelle (merge #56 sur `main`, commit `d2b2222`) devient la version `0.1.0`, déjà inscrite dans `package.json` ; le tag `v0.1.0` est posé sur ce commit. L'historique daté d'ADR-0009 est résumé dans cette version initiale.

## Conséquences

- `AGENTS.md` décrit les trois étapes : ligne dans `Unreleased` à chaque PR, PR de version vers `pre-prod` avant la mise en prod, tag après le merge vers `main`.
- La PR de version doit être mergée dans `pre-prod` **avant** que le mainteneur merge la PR de mise en prod ; sinon la version livrée n'a pas de numéro, et la PR de version suivante doit la rattraper.
- Le tag est posé par un agent ou le mainteneur juste après le merge vers `main` ; un tag publié n'est jamais déplacé ni supprimé.
- Suivi possible : faire vérifier par `release-pr.yml` que `package.json` a changé depuis le dernier tag, poser le tag automatiquement par un workflow sur `main`, publier une GitHub Release à partir de la section du changelog. Changesets ou release-please pourront être réévalués si ces étapes manuelles deviennent pénibles ou si les commits passent en Conventional Commits.
