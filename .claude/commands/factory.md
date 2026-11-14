---
description: Compare docs/FACTORY.md au dépôt et liste ce qui a changé ou manque (sans rien modifier)
---

Vérifie que la carte de la software factory, `docs/FACTORY.md`, décrit toujours la réalité du dépôt. Réponds en français, en mots simples : le mainteneur débute.

## 1. Relire les sources

Lis en entier, sans rien modifier :

- `AGENTS.md` et `CLAUDE.md` ;
- tout `.claude/` : `settings.json`, `commands/`, `agents/`, `skills/` (note les dossiers absents ou vides) ; ne lis jamais `settings.local.json` ni aucun fichier `.env*` ;
- tout `.github/` : `workflows/*.yml` (déclencheurs `on:`, noms des jobs, ce qu'ils font), `ISSUE_TEMPLATE/`, `pull_request_template.md`, et `dependabot.yml` s'il existe ;
- `docs/decisions/README.md`, puis chaque ADR qui touche la chaîne de travail (Git, PR, merge, versions, CI, tests, factory) ;
- `docs/FACTORY.md`, `docs/factory/` et `docs/factory.html`.

Tu peux aussi regarder l'état GitHub en lecture seule (`gh issue view 103`, `gh api repos/MarioHit/mialigo/issues/103/sub_issues`) pour la feuille de route.

## 2. Comparer

Pour chaque partie de `docs/FACTORY.md`, cherche les écarts :

- **Parcours (diagramme Mermaid et tableaux d'étapes)** : une étape, un check ou un workflow existe sans être décrit, ou l'inverse ; un acteur (Claude, GitHub Action, mainteneur), une entrée, une sortie ou un fichier de configuration a changé.
- **Aide-mémoire** : un fichier ou dossier ajouté, supprimé ou vide/non vide (par exemple un premier agent dans `.claude/agents/`).
- **Règles** : une règle d'`AGENTS.md` (merge, version, statut du Project) contredit ou complète ce qui est écrit.
- **ADR** : une ADR récente sur la chaîne n'est pas citée ; un lien pointe vers un fichier qui n'existe plus.
- **Feuille de route** : statut des étapes #104 à #109 (issue fermée, fiche `docs/factory/NN-*.md` présente ou non).
- **Cohérence** avec `docs/factory.html` (étapes et statuts).

## 3. Rendre compte

Présente un tableau : **Section** | **Ce que dit FACTORY.md** | **Ce que montre le dépôt** | **Correction proposée**, puis la liste de ce qui est à jour. S'il n'y a aucun écart, dis-le clairement.

## 4. Attendre l'accord

**Ne modifie aucun fichier à ce stade.** Demande au mainteneur quelles corrections appliquer. Seulement après son accord explicite : suis les règles d'`AGENTS.md` (issue, branche `docs/<n>-…` depuis `origin/pre-prod`, ligne `Interne` dans `CHANGELOG.md`, version), applique les corrections choisies, montre le diff, et ouvre la PR vers `pre-prod`.
