# ADR-0009 : Un CHANGELOG.md au format Keep a Changelog, alimenté par chaque PR

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #54
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0005](0005-apres-merge-pre-prod.md), [ADR-0008](0008-pr-mise-en-prod-automatique.md)

## Contexte

Rien ne résume, pour un utilisateur ou pour le mainteneur, ce qui a changé à chaque mise en production. Il faut lire les descriptions de PR, rédigées pour des développeurs (noms de fichiers, SQL, règles de ruleset). Les PR de mise en prod (`pre-prod` → `main`) listent les PR incluses, mais elles ne sont pas lisibles par un non-développeur et ne sont pas dans le dépôt.

Le projet n'a ni tag Git ni numéro de version suivi : `package.json` reste à `0.1.0`, et la mise en prod se fait par le merge d'une PR `pre-prod` → `main` par le mainteneur ([ADR-0004](0004-regles-git-pr-pre-prod.md)). Le développement est confié en grande partie à des agents, qui ont besoin d'une règle simple et vérifiable.

## Options envisagées

1. **Pas de changelog, s'appuyer sur les PR de mise en prod.** *Pour* : aucun travail en plus. *Contre* : contenu technique, hors du dépôt, rien de lisible pour un utilisateur.
2. **Changelog généré depuis les commits ou les titres de PR** (conventional commits, release-please, git-cliff). *Pour* : automatique. *Contre* : les messages de commit sont techniques et pas toujours conventionnels dans l'historique ; l'outil suppose des versions SemVer et des tags ; le texte reste écrit pour des développeurs.
3. **GitHub Releases.** *Pour* : intégré à GitHub. *Contre* : demande des tags et une étape manuelle à chaque mise en prod ; le texte n'est pas versionné avec le code ni relu dans la PR.
4. **`CHANGELOG.md` au format Keep a Changelog, rédigé à la main par chaque PR.** *Pour* : format connu, lisible, relu dans la PR qui fait le changement ; pas d'outil. *Contre* : une ligne à écrire par PR ; risque d'oubli ; les entrées doivent être déplacées de « Non publié » vers une section datée après chaque mise en prod.

Pour l'intitulé des sections publiées :

- **a. Versions SemVer** (`## [0.2.0] - 2026-11-07`). *Contre* : aucune version n'est tenue aujourd'hui ; il faudrait des tags et une règle pour choisir le numéro.
- **b. Date de mise en prod** (`## [2026-11-07]`). *Pour* : correspond exactement au fonctionnement actuel (une mise en prod = un merge vers `main`). *Contre* : s'écarte un peu de l'exemple de Keep a Changelog.

Pour les PR sans effet visible (outillage, documentation, règles des agents) :

- **i. Les dispenser de ligne.** *Contre* : la règle devient « chaque PR, sauf… », plus facile à contourner, et le mainteneur perd la trace de ces changements.
- **ii. Une catégorie « Interne »**, en plus des six de Keep a Changelog. *Pour* : chaque PR écrit sa ligne, l'utilisateur sait qu'il peut sauter la section.

## Décision et raison

Option **4**, sections datées (**b**), catégorie « Interne » (**ii**).

- Le texte est écrit **pour l'utilisateur**, en français : ce qui change pour lui, sans noms de fichiers ni jargon. Un outil de génération (2) ne sait pas le faire à partir de commits techniques ; GitHub Releases (3) ajoute une étape manuelle hors de la PR.
- Écrire la ligne dans la PR qui fait le changement permet de la relire avec le code, et l'auteur est le mieux placé pour la rédiger.
- Dater les sections plutôt que les numéroter évite d'inventer une politique de version qui n'existe pas ; une section par jour de mise en prod regroupe toutes les PR mergées vers `main` ce jour-là.
- La catégorie « Interne » garde une règle sans exception (chaque PR écrit une ligne) tout en séparant ce qui ne concerne pas l'utilisateur.

Le changelog initial a été rempli à partir de toutes les PR déjà en prod (#1 à #53).

## Conséquences

- `AGENTS.md` impose qu'une PR ajoute au moins une ligne sous `## [Non publié]`, dans la bonne catégorie, avec un lien vers la PR.
- Après chaque mise en prod, les lignes livrées doivent passer de « Non publié » à une section datée. Faute d'accès en écriture à `main`, c'est la **PR suivante** vers `pre-prod` qui le fait (règle dans `AGENTS.md`) : elle déplace les lignes des PR incluses dans la PR de mise en prod mergée, sous la date de son merge. Entre-temps, « Non publié » peut contenir des lignes déjà en prod.
- Le numéro de PR n'est connu qu'à sa création : l'auteur l'ajoute ou le corrige juste après `gh pr create`.
- Suivi possible : faire déplacer les lignes automatiquement par le workflow `release-pr.yml` ou un workflow sur `main`, et ajouter un check qui échoue si une PR ne modifie pas `CHANGELOG.md`. À revoir aussi si le projet adopte des versions SemVer ou des tags.
