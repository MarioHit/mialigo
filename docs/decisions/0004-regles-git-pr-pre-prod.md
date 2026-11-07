# ADR-0004 : Règles Git : PR obligatoire vers `pre-prod`

- **Statut** : Acceptée
- **Date** : 2026-11-06 (règles de merge ajoutées le 2026-11-07)
- **Issue / PR** : #34 / #35, #36 / #37
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0001](0001-hook-gitleaks-global.md)

## Contexte

`main` est déployée en production par Vercel à chaque push. `pre-prod` sert de branche d'intégration. Des agents vont créer des branches, committer et pousser.

Les anciennes règles d'`AGENTS.md` posaient deux problèmes :
- elles étaient ambiguës : seule la lecture était explicitement autorisée sur `main`, et rien n'était dit pour les autres branches ;
- elles étaient placées **dans le bloc `nextjs-agent-rules`**, que `next dev` réécrit : elles auraient été effacées.

## Options envisagées

1. **Trunk-based** (push direct sur `main`) : *Pour* : rapide. *Contre* : chaque push part en production, sans relecture. Inacceptable avec des agents.
2. **PR directe vers `main`** : *Pour* : une étape de moins. *Contre* : aucune intégration avant la prod ; `pre-prod` deviendrait inutile.
3. **git-flow complet** (`develop`, `release/*`, `hotfix/*`) : *Pour* : très structuré. *Contre* : trop lourd pour un projet de cette taille.
4. **Branche de travail → PR vers `pre-prod` → PR `pre-prod` → `main`** : déjà la pratique réelle du dépôt (#12 et #32 vers `pre-prod`, puis #13 et #33 vers `main`).

Qui merge les PR :

- **a. Les agents ne mergent jamais.** *Pour* : contrôle humain total. *Contre* : chaque PR attend le mainteneur, même pour l'intégration ; la factory ne tourne pas sans lui.
- **b. Les agents mergent partout dès que les checks passent.** *Pour* : autonomie maximale. *Contre* : la production serait alimentée sans aucun regard humain.
- **c. Les agents mergent vers `pre-prod` si tous les checks passent ; seul le mainteneur merge vers `main`.**

## Décision et raison

**Option 4 pour le flux, option c pour les merges, écrites dans `AGENTS.md` hors du bloc géré par Next.js :**

- créer des branches de travail depuis `origin/pre-prod`, committer et pousser dessus : **autorisé** ;
- `main` et `pre-prod` ne changent que par des PR mergées : jamais de commit ni de push direct, même sur demande ultérieure ;
- interdits : `push --force` (y compris `-f` et `--force-with-lease`), `reset --hard`, `--no-verify` ;
- les PR ciblent `pre-prod` ;
- un agent peut merger une PR vers `pre-prod` uniquement quand **tous** ses checks sont terminés et verts (`gh pr checks <n> --watch`, rien en échec, en attente ou annulé), avec `gh pr merge <n> --merge`. `--admin` et `--auto` sont interdits ;
- un agent ne merge **jamais** une PR vers `main`, même sur demande ultérieure : c'est le mainteneur qui le fait.

Cette option officialise un flux qui fonctionne déjà et place une relecture humaine avant la production. Les agents restent productifs (ils poussent leurs branches) sans pouvoir déployer. L'interdiction de `--force-with-lease` évite toute réécriture d'un historique déjà publié : on corrige par un nouveau commit. L'interdiction de `--no-verify` protège le hook gitleaks ([ADR-0001](0001-hook-gitleaks-global.md)).

Pour les merges, l'option c laisse les agents boucler leur travail jusqu'à l'intégration, ce qui écarte l'option a. Le passage en production reste une décision humaine, ce qui écarte l'option b : `pre-prod` → `main` est le seul point de contrôle humain obligatoire. `--auto` est interdit parce que le ruleset n'exige aucun check : GitHub mergerait immédiatement, sans attendre la CI. `--admin` contournerait les règles.

## Conséquences

- Une branche créée depuis `origin/pre-prod` la **suit** par défaut : un `git push` sans argument partirait vers `pre-prod`. Il faut faire `git branch --unset-upstream` juste après la création, puis `git push -u origin <branche>`.
- `Closes #n` dans une PR vers `pre-prod` ne relie pas l'issue tout de suite (GitHub ne le fait que pour la branche par défaut). L'issue se ferme quand le code arrive sur `main` (constaté avec #14).
- Les règles sont **appliquées par GitHub**, pas seulement écrites : le ruleset « one main » (id `26663337`, actif) cible `refs/heads/main` et `refs/heads/pre-prod`, sans aucun acteur autorisé à le contourner (vérifié avec `gh api repos/MarioHit/mialigo/rulesets/26663337` le 2026-11-07). Il impose :
  - `pull_request` : tout changement passe par une PR, aucun push direct ;
  - `non_fast_forward` : pas de push forcé ;
  - `deletion` : les branches ne peuvent pas être supprimées.
- Limites restantes du ruleset, à traiter dans un ADR ultérieur :
  - **aucun check n'est obligatoire** : la condition « tous les checks passent » ne repose que sur l'agent qui exécute `gh pr checks` avant de merger. Piste : ajouter la règle `required_status_checks` (« Scan des secrets », Vercel) au ruleset, pour que GitHub la fasse respecter lui-même ;
  - **0 approbation requise, et un ruleset commun aux deux branches** : techniquement, un agent qui utilise le compte `gh` du mainteneur **peut** merger vers `main`. Seule la règle d'`AGENTS.md` l'en empêche. Piste : un ruleset propre à `main` qui exige une approbation, ou un compte GitHub distinct pour les agents, sans droit de merger vers `main`.
- Vérifié : Next.js considère le bloc `nextjs-agent-rules` comme à jour, il ne réécrit donc plus `AGENTS.md`.
