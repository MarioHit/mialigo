# ADR-0007 : L'issue passe à « In progress » dès le début du travail

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #48
- **Découle de** : [ADR-0005](0005-apres-merge-pre-prod.md)
- **Remplace** : —

## Contexte

[ADR-0005](0005-apres-merge-pre-prod.md) fait passer une issue à « In review » quand sa PR est mergée dans `pre-prod`. GitHub la passe en « Done » à sa fermeture sur `main`. Mais pendant tout le développement, l'issue restait en **Backlog** : le Project « Mialigo » (n° 17) ne distinguait pas une issue en cours d'une issue pas encore commencée. ADR-0005 notait déjà ce manque comme l'étape suivante.

Avec plusieurs agents, ce statut sert aussi de **signal** : une issue « In progress » est déjà prise.

## Options envisagées

1. **Ne rien changer** : *Contre* : on ne voit pas ce qui est en cours ; deux agents pourraient prendre la même issue.
2. **« In progress » à l'ouverture de la PR** : *Pour* : facile à repérer. *Contre* : trop tard ; tout le travail avant la PR reste invisible.
3. **« In progress » dès le début du travail**, avant même de créer la branche.
4. **Automatisation** (workflow GitHub Actions déclenché à la création d'une branche `…/<n>-…`) : *Pour* : indépendant des agents. *Contre* : un jeton avec le droit `project` à placer dans la CI ; prématuré, comme dans ADR-0005.

## Décision et raison

**Option 3**, écrite dans `AGENTS.md` (*Workflow rules*) : dès que l'agent commence à travailler sur une issue, il la passe à « In progress » (`gh project item-edit`, option `47fc9ee4`). Si l'issue n'est pas encore dans le Project, il l'y ajoute d'abord (`gh project item-add`).

C'est la seule option qui rend visible **tout** le travail en cours, et le plus tôt possible. L'option 2 laisse un angle mort. L'option 4 reste possible plus tard, pour les mêmes raisons que dans ADR-0005.

Cycle complet d'une issue :

| Statut | Quand | Qui |
|---|---|---|
| Backlog | création de l'issue | GitHub (ajout automatique au Project) |
| **In progress** | début du travail | agent (cette décision) |
| In review | merge de la PR dans `pre-prod` | agent ([ADR-0005](0005-apres-merge-pre-prod.md)) |
| Done | fermeture de l'issue au merge vers `main` | GitHub |

## Conséquences

- Appliqué dès cette issue : #48 est passée à « In progress » à sa création, et #46 (en cours, PR #47) aussi.
- Comme pour ADR-0005, il faut le droit `project` sur le jeton `gh`, et les identifiants écrits dans `AGENTS.md` doivent être tenus à jour.
- Pas encore de règle pour **reprendre** une issue déjà « In progress » ni pour la remettre en Backlog si le travail est abandonné. À décider quand plusieurs agents travailleront en parallèle.
