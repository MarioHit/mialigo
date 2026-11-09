# ADR-0023 : Software factory sur GitHub, construite étape par étape

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #103 (epic), #104
- **Découle de** : [ADR-0005](0005-apres-merge-pre-prod.md), [ADR-0007](0007-in-progress-debut-travail.md), [ADR-0015](0015-version-par-pr.md)
- **Remplace** : —
- **Liée à** : [ADR-0008](0008-pr-mise-en-prod-automatique.md), [ADR-0011](0011-tag-version-automatique.md)

## Contexte

Mialigo a déjà des règles de travail (AGENTS.md : branches, PR vers `pre-prod`, CHANGELOG et version par PR, ADR, statuts du GitHub Project) et quelques automatismes (lint, scan des secrets, PR de mise en prod, tag de version). Mais rien ne structure l'issue elle-même (critères d'acceptation absents ou implicites), la checklist « terminé » n'existe que dans AGENTS.md, et il n'y a ni vérification des types en CI, ni tests, ni contrôle des migrations SQL : plusieurs erreurs n'ont été vues que sur la preview, par le mainteneur.

Le mainteneur veut une chaîne qui garantisse que chaque user story va au bout, **réutilisable comme base pour d'autres projets**, où **chaque étape est utile seule** et documentée par une ADR.

## Options envisagées

1. **Tout sur GitHub** (modèles d'issue et de PR, Actions, Project, Dependabot), construit en étapes livrées séparément. *Pour* : déjà en place en partie, gratuit, tout est versionné dans le dépôt donc recopiable, les agents (Claude Code) y ont accès par `gh`. *Contre* : moins riche qu'un outil de gestion de projet dédié.
2. **Outil de gestion dédié** (Jira, Linear) relié à GitHub. *Pour* : tableaux, sprints, rapports. *Contre* : un outil et un compte de plus, configuration hors du dépôt (non recopiable), surdimensionné pour un mainteneur seul.
3. **Tout mettre en place en une fois** (une grosse PR : modèles, CI, tests, e2e). *Contre* : longue à relire et à tester, rien n'est utile avant la fin, risque d'abandon à mi-chemin.
4. **Ne rien formaliser de plus** (les règles d'AGENTS.md suffisent). *Contre* : les oublis et régressions continuent d'être trouvés à la main, et rien n'est réutilisable tel quel.

## Décision et raison

Option 1, en **six étapes** suivies dans l'epic #103, chacune avec son issue, sa PR, son ADR et sa **fiche d'étape** (`docs/factory/NN-<slug>.md`, modèle `00-modele.md`) qui décrit en mots simples **a.** l'état d'avant, **b.** ce qui change concrètement dans le processus et ses impacts, **c.** le résultat après :

1. **Cadre** (#104, cette ADR, fiche `01-cadre.md`) : modèles d'issue (User story avec critères « Étant donné / Quand / Alors », Bug), issues vierges désactivées, modèle de PR portant la Definition of Done, `docs/factory.md` (Definition of Ready / Done, parcours, feuille de route, réutilisation) et une page explicative (`docs/factory.html`).
2. **CI qualité** (#105) : TypeScript et build en CI, Dependabot.
3. **Tests unitaires** (#106).
4. **Tests de bout en bout sur la preview** (#107).
5. **Migrations SQL vérifiées** (#108).
6. **Observabilité** (#109) : Umami auto-hébergé, suivi des erreurs.

L'ordre va du moins coûteux au plus coûteux, et chaque étape renforce les suivantes (la CI de l'étape 2 exécutera les tests des étapes 3 et 5). L'option 2 est écartée (outil de plus, configuration non versionnée), l'option 3 parce qu'elle retarde tout bénéfice, l'option 4 parce qu'elle ne règle pas le problème.

## Conséquences

- Chaque nouvelle issue passe par un modèle (sur le site GitHub ; `gh issue create --body` reste libre, les agents reprennent les mêmes sections).
- La Definition of Done vit à deux endroits : le modèle de PR (la checklist) et `docs/factory.md` (l'explication). AGENTS.md y renvoie au lieu de la recopier.
- La checklist ne bloque rien d'elle-même : ce sont les checks des étapes 2 à 5 qui rendront la plupart des points automatiques.
- L'ADR garde le *pourquoi* technique ; la fiche d'étape garde le *vécu* du processus (avant / changement / après), lisible sans connaissance technique.
- Pour un autre projet : recopier `.github/`, `docs/factory.md` et `docs/factory/`, adapter les noms (section « Réutiliser » de `docs/factory.md`).
