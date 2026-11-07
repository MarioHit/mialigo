# ADR-0005 : Après un merge vers `pre-prod` : PR vers `main` et issue « In review »

- **Statut** : Acceptée, en partie remplacée par [ADR-0008](0008-pr-mise-en-prod-automatique.md) (la PR de mise en prod est créée par GitHub Actions)
- **Date** : 2026-11-07
- **Issue / PR** : #41
- **Découle de** : [ADR-0004](0004-regles-git-pr-pre-prod.md)
- **Remplace** : —

## Contexte

D'après [ADR-0004](0004-regles-git-pr-pre-prod.md), un agent peut merger vers `pre-prod` quand tous les checks passent, mais seul le mainteneur merge vers `main`. Après un merge vers `pre-prod`, deux choses restaient implicites :

- **la mise en production** : rien ne signalait au mainteneur qu'un changement attendait dans `pre-prod`. La PR `pre-prod` → `main` était ouverte à la main, sans description (#39) ;
- **le suivi des issues** : le Project « Mialigo » (n° 17) a un champ *Status* (Backlog, Ready, In progress, In review, Done). Une issue dont le code est intégré restait en Backlog jusqu'à sa fermeture.

Constat : #39 (`pre-prod` → `main`) a fermé #36 mais **pas #34**, alors que le code des deux PR (#35 et #37) est arrivé sur `main`. Les `Closes #n` des PR mergées vers `pre-prod` ne garantissent pas la fermeture des issues au passage en production.

## Options envisagées

**Mise en production**

1. **Laisser le mainteneur ouvrir la PR vers `main`** : *Pour* : rien à automatiser. *Contre* : risque d'oubli, et description vide (#39).
2. **Une PR vers `main` par PR mergée dans `pre-prod`** : *Pour* : correspondance 1-1. *Contre* : impossible, car GitHub n'autorise qu'une PR ouverte par couple de branches (`pre-prod` → `main`).
3. **Une seule PR de mise en prod, ouverte ou mise à jour par l'agent** : elle accumule les PR intégrées depuis la dernière mise en prod.
4. **Automatisation par GitHub Actions** : *Pour* : indépendant des agents. *Contre* : un workflow à écrire et à maintenir, et des droits `project` à donner à un jeton dans la CI ; prématuré.

**Suivi de l'issue**

- **a. Ne rien changer** (Backlog jusqu'à Done) : le tableau ne montre pas ce qui attend la mise en prod.
- **b. Passer l'issue à « In review »** après le merge vers `pre-prod` : elle signifie « intégrée, en attente de validation et de mise en prod par le mainteneur ».

## Décision et raison

**Option 3 et option b**, effectuées par l'agent juste après chaque merge vers `pre-prod`, et écrites dans `AGENTS.md` :

1. chercher une PR ouverte `pre-prod` → `main` ; la créer s'il n'y en a pas, sinon la mettre à jour (`gh pr edit`). Sa description liste **toutes** les PR qu'elle livre et une ligne `Closes #n` **par issue** ;
2. passer l'issue au statut **In review** dans le Project n° 17 (`gh project item-edit`, identifiants dans `AGENTS.md`).

L'option 3 est la seule compatible avec la limite GitHub d'une PR ouverte par couple de branches, et elle donne au mainteneur une vue complète de ce qu'il met en production. Les `Closes` repris dans cette PR, qui cible la branche par défaut, ferment les issues de façon fiable à son merge (contrairement aux `Closes` des PR vers `pre-prod`). L'option 4 reste possible plus tard, si plusieurs agents rendent l'oubli probable.

« In review » est le statut existant qui correspond à « intégré, en attente du mainteneur ». « Done » est posé par GitHub à la fermeture de l'issue.

## Conséquences

- Le jeton `gh` doit avoir le droit `project` (ajouté le 2026-11-07 avec `gh auth refresh -s project`). Sans lui, l'étape 2 échoue : l'agent doit le signaler plutôt que l'ignorer.
- Les identifiants du Project, du champ *Status* et de l'option « In review » sont écrits dans `AGENTS.md`. S'ils changent (champ recréé, option renommée), il faut les relever avec `gh project field-list 17 --owner MarioHit` et mettre `AGENTS.md` à jour.
- La règle ne couvre que **« In review »**. Le passage à « In progress » au début du travail n'est pas encore demandé ; ce serait l'étape suivante pour un tableau complet.
- Toujours aucun merge vers `main` par un agent : la PR de mise en prod reste à la main du mainteneur.
