# ADR-0011 : Le tag de version est posé par GitHub Actions à chaque push sur `main`

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #66
- **Découle de** : [ADR-0010](0010-versionnage-semver-tags.md)
- **Remplace** : [ADR-0010](0010-versionnage-semver-tags.md), pour la pose du tag uniquement
- **Liée à** : [ADR-0008](0008-pr-mise-en-prod-automatique.md)

## Contexte

[ADR-0010](0010-versionnage-semver-tags.md) prévoit qu'un agent ou le mainteneur pose à la main le tag annoté `vX.Y.Z` sur le merge vers `main`, juste après la mise en prod. Cette étape dépend de quelqu'un qui y pense au bon moment : le mainteneur merge la PR de mise en prod seul, souvent sans agent actif, et une étape manuelle de plus s'oublie facilement. ADR-0010 citait déjà l'automatisation du tag comme suivi possible.

La version à taguer est connue sans ambiguïté : c'est celle du `package.json` du commit poussé sur `main`, mise à jour par la PR de version.

## Options envisagées

1. **Garder le tag manuel (ADR-0010).** *Pour* : rien à faire. *Contre* : oublis probables ; un agent doit être relancé après chaque merge du mainteneur.
2. **Workflow sur `push` vers `main`** : lit la version du `package.json` et crée le tag annoté `vX.Y.Z` sur le commit poussé s'il n'existe pas déjà. *Pour* : automatique, quelques lignes de shell, jeton intégré suffisant (aucune règle ne protège les tags) ; un push sans changement de version ne fait rien. *Contre* : si la PR de version a été oubliée, la mise en prod n'est pas taguée (le tag de la version précédente existe déjà).
3. **Workflow qui calcule la version et met à jour `package.json` lui-même** (release-please, semantic-release). *Contre* : écarté par ADR-0010 (commits non conventionnels, changelog généré pour des développeurs) ; il faudrait en plus committer sur `main`, ce que le flux interdit.
4. **Tag posé sur `pre-prod` au merge de la PR de version.** *Contre* : le commit tagué ne serait pas celui qui part en prod (le merge vers `main` est un autre commit), et la version pourrait ne jamais être mise en prod.

## Décision et raison

Option **2**, workflow `.github/workflows/version-tag.yml`.

- Il n'automatise que ce qui est mécanique : le numéro reste choisi dans la PR de version, relue comme les autres.
- Le tag est posé sur le commit réellement mis en prod, ce qu'exclut l'option 4.
- Un tag existant n'est jamais déplacé : en cas de mise en prod sans PR de version, le workflow ne fait rien, et la PR de version de rattrapage déclenche le tag à son propre merge vers `main` (même règle qu'ADR-0010).

Le reste d'ADR-0010 (changelog, SemVer, PR de version avant la mise en prod) est inchangé.

## Conséquences

- `AGENTS.md` ne demande plus de poser le tag ; il demande seulement de vérifier, après une mise en prod, que le run « Tag de version » a réussi.
- Un tag créé avec le jeton intégré ne déclenche pas d'autre workflow ; si un jour une GitHub Release doit être publiée à partir du tag, il faudra la faire dans ce même workflow ou utiliser un autre jeton.
- Si une règle de protection des tags est ajoutée, le workflow devra y être autorisé.
- Le tag `v0.1.2` sera le premier posé par ce workflow, au merge vers `main` de la PR qui l'ajoute.
