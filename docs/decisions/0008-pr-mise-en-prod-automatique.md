# ADR-0008 : La PR de mise en prod est créée par GitHub Actions

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #52
- **Découle de** : [ADR-0005](0005-apres-merge-pre-prod.md)
- **Remplace** : [ADR-0005](0005-apres-merge-pre-prod.md), en partie : la création ou la mise à jour de la PR de mise en prod (option 3) ; le passage à « In review » reste tel quel
- **Liée à** : [ADR-0004](0004-regles-git-pr-pre-prod.md), [ADR-0006](0006-merge-commit-seulement.md)

## Contexte

Selon [ADR-0005](0005-apres-merge-pre-prod.md), c'est l'agent qui crée ou met à jour la PR `pre-prod` → `main` juste après un merge dans `pre-prod`. Mais le mainteneur merge aussi lui-même des PR dans `pre-prod` (#49). Dans ce cas, aucun agent n'est là pour faire l'étape, et la mise en prod reste en attente sans PR.

Un premier rattrapage à la main a aussi montré que cette étape est fragile. L'agent a modifié la description d'une PR de mise en prod **déjà mergée** (#50) au lieu d'en ouvrir une nouvelle (#51).

ADR-0005 avait écarté l'automatisation (option 4) comme prématurée. Ce n'est plus le cas : le besoin est réel dès qu'un humain merge.

## Options envisagées

1. **Garder l'étape côté agent** : *Contre* : rien ne se passe quand le mainteneur merge, et l'étape dépend de la rigueur de chaque agent.
2. **Workflow GitHub Actions avec le jeton intégré (`GITHUB_TOKEN`)**, déclenché à chaque PR mergée dans `pre-prod` : il crée la PR de mise en prod, ou la complète si elle est déjà ouverte, en y recopiant la description de la PR mergée.
3. **Même workflow, mais avec une GitHub App ou un jeton personnel** : *Pour* : les PR créées déclenchent les workflows. Pourrait aussi passer l'issue à « In review », car le jeton intégré n'a pas accès au Project d'un compte personnel. *Contre* : un secret de plus à créer, à protéger et à renouveler.
4. **Automatisations intégrées au Project** : *Contre* : elles ne créent pas de PR, et elles changent le statut de la PR, pas celui de l'issue liée.

## Décision et raison

**Option 2** : `.github/workflows/release-pr.yml`, déclenché par `pull_request` `closed` sur `pre-prod`, quand la PR est mergée (et que sa branche source n'est pas `main`).

- Si aucune PR `pre-prod` → `main` n'est ouverte, il la crée. Titre : `🚀 Mise en prod : <titre> (#n)`. Description : un en-tête qui rappelle de merger en merge commit, puis celle de la PR mergée.
- Si une PR est ouverte, il ajoute une section avec la description de la PR mergée et complète le titre (`+ #n`).
- Chaque section commence par un marqueur `<!-- release-pr:n -->`. Un workflow relancé n'ajoute donc pas de doublon.
- Les `Closes #n` de la PR mergée sont recopiés tels quels. Comme la PR de mise en prod vise `main`, ils ferment les issues à son merge, et le constat d'ADR-0005 reste couvert.

Le jeton intégré suffit, contrairement à ce qu'on pouvait craindre. Une PR créée avec ce jeton ne déclenche aucun workflow, mais le check obligatoire `Scan des secrets` est rattaché au **commit**, pas à l'événement. Or le push sur `pre-prod` lance déjà `gitleaks.yml` sur ce même commit (vérifié sur #51 : deux runs « Scan des secrets », un par événement, sur le même SHA). L'option 3 n'apporterait que le statut « In review », ce qui ne justifie pas un secret de plus pour l'instant.

## Conséquences

- Réglage du dépôt requis : *Settings → Actions → General → Workflow permissions → « Allow GitHub Actions to create and approve pull requests »*. Sans lui, le workflow échoue à la création de la PR. Avec 0 approbation exigée par le ruleset, la possibilité d'approuver n'ouvre rien de plus.
- Dans `AGENTS.md`, l'étape 1 après un merge devient une **vérification** : la PR de mise en prod existe et cite la PR mergée. L'agent ne la crée à la main que si le workflow a échoué.
- La description de la PR de mise en prod reprend ce qu'ont écrit les PR, footers compris. Une PR sans `Closes` ne fermera pas son issue.
- Le passage à « In review » reste à l'agent ([ADR-0005](0005-apres-merge-pre-prod.md), option b). Quand le mainteneur merge lui-même, il est à faire à la main ou par un agent. L'automatiser demandera l'option 3.
- Le workflow n'utilise que `gh` (préinstallé sur les runners) : aucune action tierce.
