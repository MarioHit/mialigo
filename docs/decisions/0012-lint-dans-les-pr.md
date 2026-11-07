# ADR-0012 : `npm run lint` dans un workflow GitHub Actions sur chaque PR

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #29
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0004](0004-regles-git-pr-pre-prod.md)

## Contexte

Le dépôt avait 45 erreurs ESLint (relevées pendant #11), corrigées dans #29. Rien ne lançait le lint : Next.js 16 ne l'exécute plus pendant `next build`, donc ni le build Vercel ni les checks des PR ne le vérifiaient, et la dette pouvait revenir sans que personne ne le voie. Les PR sont de plus en plus écrites par des agents, qui ne mergent que si tous les checks sont verts ([ADR-0004](0004-regles-git-pr-pre-prod.md)).

## Options envisagées

1. **Workflow GitHub Actions** (`npm ci` puis `npm run lint`) sur chaque PR et sur les pushes vers `pre-prod` et `main`. *Pour* : visible dans chaque PR, même environnement pour tous, s'ajoute aux checks que les agents attendent avant de merger. *Contre* : environ une minute de CI par PR.
2. **Lint dans le build Vercel** (`"build": "eslint && next build"`). *Pour* : pas de workflow de plus. *Contre* : un échec de lint bloquerait aussi les déploiements de preview, et les erreurs sont noyées dans les logs Vercel.
3. **Hook `pre-commit` local** (lint-staged, husky). *Pour* : retour immédiat. *Contre* : contournable, à installer sur chaque poste et VPS, et à chaîner avec le hook gitleaks global ([ADR-0001](0001-hook-gitleaks-global.md)) ; ne remplace pas une vérification en CI.
4. **Ne rien automatiser**, lancer `npm run lint` à la main. *Contre* : c'est ce qui a laissé s'accumuler 45 erreurs.

## Décision et raison

Option **1**, workflow `.github/workflows/lint.yml` (check « Lint »).

- C'est la seule option qui vérifie chaque PR à coup sûr, sans dépendre du poste de l'auteur (3, 4).
- Garder le lint hors du build (2) laisse les previews Vercel se déployer même si le lint échoue, ce qui aide à corriger.
- Avec la règle d'ADR-0004, un check « Lint » rouge suffit à empêcher un agent de merger.

## Conséquences

- Les PR doivent passer le lint ; les avertissements ne bloquent pas, seules les erreurs font échouer le check.
- Le check n'est pas encore **obligatoire** dans le ruleset (seul « Scan des secrets » l'est) : un merge manuel reste possible avec un lint rouge. Le rendre obligatoire est un réglage GitHub à faire par le mainteneur.
- Suivi possible : ajouter `npx tsc --noEmit` au même workflow pour vérifier les types sans dépendre du build Vercel (qui exige les variables Supabase).
