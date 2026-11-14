# ADR-0024 : Carte de la factory dans docs/FACTORY.md, tenue à jour par une règle et la commande /factory

- **Statut** : Acceptée
- **Date** : 2026-11-14
- **Issue / PR** : #115
- **Découle de** : [ADR-0023](0023-software-factory.md)
- **Remplace** : —
- **Liée à** : [ADR-0005](0005-apres-merge-pre-prod.md), [ADR-0008](0008-pr-mise-en-prod-automatique.md), [ADR-0011](0011-tag-version-automatique.md)

## Contexte

La factory (ADR-0023) est répartie entre `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.github/` et les ADR. Le mainteneur, débutant, ne voit pas d'un coup d'œil qui fait quoi (lui, Claude ou une GitHub Action), ni quel fichier règle chaque étape. Une telle carte se périme dès qu'un workflow ou une règle change sans qu'on pense à la mettre à jour. `docs/factory.md` existait déjà (DoR, DoD, feuille de route) ; le mainteneur a demandé `docs/FACTORY.md`, et ces deux noms ne peuvent pas coexister sur macOS et Windows (systèmes de fichiers insensibles à la casse).

## Options envisagées

1. **Un seul fichier `docs/FACTORY.md`** (renommage de `docs/factory.md` et fusion), mis à jour par une règle d'`AGENTS.md`, plus une commande `/factory` (`.claude/commands/factory.md`) qui compare la carte au dépôt et propose les corrections sans les appliquer. _Pour_ : une seule source ; la règle couvre les PR prévues, la commande attrape les oublis ; le mainteneur garde la main. _Contre_ : la vérification n'est pas automatique, il faut penser à lancer `/factory`.
2. **Deux fichiers** (`factory.md` + `FACTORY.md`). _Contre_ : conflit de casse au clonage sur macOS / Windows, deux sources à tenir.
3. **Carte générée automatiquement** par un script ou un workflow à partir des YAML. _Pour_ : jamais périmée sur ce qu'il sait lire. _Contre_ : ne sait pas expliquer pour un débutant ni lire les règles en prose d'`AGENTS.md` ; un outil de plus à maintenir.
4. **Commande qui corrige directement le fichier.** _Contre_ : des modifications de documentation sans relecture, contraire à la demande du mainteneur.

## Décision et raison

Option 1. L'option 2 est écartée pour le conflit de casse, la 3 parce qu'une explication pour débutant ne se génère pas d'un YAML, la 4 parce que le mainteneur veut valider chaque correction.

## Conséquences

- `docs/factory.md` devient `docs/FACTORY.md` ; les liens sont mis à jour (sauf dans l'ADR-0023, acceptée, qui garde l'ancien nom).
- Toute PR qui change le fonctionnement de la factory (workflows, modèles, `.claude/`, règles d'`AGENTS.md`) met aussi à jour `docs/FACTORY.md`.
- `/factory` ne modifie rien sans accord ; ensuite elle suit le parcours normal (issue, branche, PR).
- À réviser si la factory grossit au point qu'un contrôle automatique en CI devienne utile (par exemple : un workflow qui signale une PR touchant `.github/` sans toucher `docs/FACTORY.md`).
