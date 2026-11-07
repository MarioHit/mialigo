# ADR-0006 : Seul le merge commit est autorisé sur `main` et `pre-prod`

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #46
- **Découle de** : [ADR-0004](0004-regles-git-pr-pre-prod.md)
- **Remplace** : —
- **Liée à** : [ADR-0005](0005-apres-merge-pre-prod.md)

## Contexte

Le flux d'[ADR-0004](0004-regles-git-pr-pre-prod.md) fait passer chaque changement par deux PR : une branche de travail vers `pre-prod`, puis `pre-prod` vers `main`. La deuxième ne fonctionne bien que si `main` reçoit **les mêmes commits** que `pre-prod`.

Le ruleset « one main » (id `26663337`) autorise trois méthodes de merge : `merge`, `squash` et `rebase`. Le 2026-11-07, la PR #42 (`pre-prod` → `main`) a été mergée en *squash* :
- `main` a reçu un commit unique (`2e2f265`) au lieu des commits de `pre-prod` ;
- les fichiers étaient identiques, mais Git considérait que `pre-prod` avait encore **4 commits d'avance** sur `main` ;
- la PR de mise en prod suivante les aurait de nouveau listés, et un correctif fait directement sur `main` aurait pu entrer en conflit avec `pre-prod`.

C'est la #45, mergée avec un commit de merge, qui a remis les historiques d'accord. Réaligner `pre-prod` sur `main` autrement aurait demandé un push forcé, interdit par ADR-0004 et bloqué par le ruleset.

## Options envisagées

1. **Ne rien changer, compter sur la discipline** (choisir « Create a merge commit » à la main) : *Pour* : aucun réglage. *Contre* : l'erreur s'est déjà produite (#42) ; le bouton propose les trois méthodes et retient le dernier choix.
2. **`rebase` seulement** : *Pour* : historique linéaire. *Contre* : GitHub réécrit les commits avec de nouveaux SHA, donc `pre-prod` → `main` diverge comme avec le squash.
3. **Squash autorisé vers `pre-prod`, merge seulement vers `main`** (deux rulesets distincts) : *Pour* : un commit par PR de travail dans `pre-prod`. *Contre* : deux rulesets à maintenir ; et les agents mergent déjà avec `gh pr merge --merge` (ADR-0004), donc aucun gain réel.
4. **`merge` seulement, sur `main` et `pre-prod`** : un seul ruleset, une seule méthode, la même partout.

## Décision et raison

**Option 4 : `allowed_merge_methods` = `["merge"]` dans la règle `pull_request` du ruleset « one main ».**

C'est la seule méthode qui garde `main` et `pre-prod` dans le même historique : un commit de merge contient les commits d'origine sans les réécrire. La rendre **obligatoire** retire l'erreur au lieu de demander de s'en souvenir (option 1). Les options 2 et 3 reproduisent la divergence, ou ajoutent un ruleset pour un bénéfice que les agents n'utilisent pas. Cette décision rejoint la règle d'`AGENTS.md`, qui impose déjà `gh pr merge <n> --merge`.

## Conséquences

- Les boutons « Squash and merge » et « Rebase and merge » ne sont plus utilisables vers `main` et `pre-prod` ; `gh pr merge --squash` ou `--rebase` sera refusé.
- Les commits des branches de travail arrivent tels quels dans `pre-prod`, puis dans `main` : leurs messages doivent rester propres (convention `type(portée): …`), car ils ne seront plus réunis en un seul.
- Une branche de travail créée après une mise en prod part toujours de `origin/pre-prod`, qui reste un ancêtre de `main` : pas de synchronisation `main` → `pre-prod` à faire, sauf si un changement arrive un jour directement sur `main`.
- L'historique passé n'est pas réécrit : le commit squash de #42 et la PR #44 (squash, aucun fichier modifié) restent sur `main`, sans effet sur le contenu.
- **Mise en œuvre** : modifier le ruleset (paramètres de la règle `pull_request`), puis vérifier avec `gh api repos/MarioHit/mialigo/rules/branches/main` et `.../pre-prod` que seul `merge` est autorisé.
- Si un ruleset propre à `main` est créé un jour (approbation obligatoire, cf. ADR-0004), il doit reprendre `allowed_merge_methods` = `["merge"]`.
