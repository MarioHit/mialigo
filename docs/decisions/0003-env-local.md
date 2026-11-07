# ADR-0003 : `.env.local` comme fichier d'environnement local

- **Statut** : Acceptée
- **Date** : 2026-11-06 (note de mise en œuvre le 2026-11-07)
- **Issue / PR** : #34 / #35, #38
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0001](0001-hook-gitleaks-global.md)

## Contexte

L'application a besoin de `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`. En production, ces variables sont définies dans Vercel. En local, il faut un fichier que **ni Git ni les agents** ne doivent lire ou diffuser, et un moyen de savoir ce qui manque sans afficher de valeur.

Next.js charge plusieurs fichiers, par ordre de priorité : `.env.$(NODE_ENV).local`, `.env.local`, `.env.$(NODE_ENV)`, `.env`.

## Options envisagées

1. **`.env`** : *Pour* : nom le plus courant. *Contre* : dans la convention Next.js, `.env` sert aux valeurs par défaut **non secrètes**, qu'on peut versionner. Y mettre des secrets brouille cette distinction.
2. **`.env.development.local`** : *Pour* : limité au mode dev. *Contre* : ignoré par `next build` / `next start` en local, ce qui oblige à dupliquer.
3. **Gestionnaire de secrets** (Doppler, Infisical, etc.) : *Pour* : aucun fichier en clair. *Contre* : service et dépendance en plus, disproportionné pour deux variables.
4. **`.env.local`** : le fichier local prévu par Next.js pour les valeurs propres à une machine, chargé en dev comme en build.

## Décision et raison

**`.env.local` (option 4).** C'est la convention Next.js pour les secrets locaux : il est prioritaire sur `.env` et chargé en dev comme en build. C'est aussi le nom déjà utilisé par `CLAUDE.md` et les docs de déploiement.

Mise en œuvre :
- `.env.example`, versionné : les **noms** des variables, avec des valeurs bidon.
- `npm run check-env` : crée `.env.local` à partir de l'exemple s'il manque, puis liste **uniquement les noms** des variables absentes, vides ou encore à leur valeur bidon (code de sortie 1).
- `.gitignore` : `.env*` puis `!.env.example`.
- `.claude/settings.json` : interdit à Claude Code de lire ou modifier les `.env*`, sauf `.env.example`, avec des règles `Read(...)` et `Edit(...)` (voir la note ci-dessous sur `Write`).

## Conséquences

- Un agent sait ce qui manque (`check-env`) sans jamais voir de valeur.
- Next.js **ne charge pas** `.env.local` quand `NODE_ENV=test` : une future suite de tests devra utiliser `.env.test` / `.env.test.local`.
- Les règles `deny` sur Bash se contournent (`node -e`, `awk`…) : la protection côté agents reste partielle, à renforcer par un hook `PreToolUse` ou le sandbox.
- Toute nouvelle variable doit être ajoutée à `.env.example`, sinon `check-env` ne la signale pas.

## Note de mise en œuvre (2026-11-07, #38)

Les règles d'origine contenaient aussi 14 `deny` `Write(...)`, en plus des mêmes chemins en `Edit(...)`. `/status` et `claude doctor` les signalaient : *« Write(./.env) is not matched by file permission checks — only Edit(path) rules are. Use Edit(./.env) instead (Edit rules cover all file-editing tools) »*. Ces règles ne protégeaient donc rien par elles-mêmes : la protection venait déjà des `Edit(...)`.

Correctif : les `Write(...)` sont remplacées par `Edit(...)` avec les mêmes chemins. Les 14 existant déjà, il s'agit d'une suppression, sans doublon (50 → 36 règles). La décision ne change pas.

Vérifié :
- l'outil `Write` est toujours refusé sur `.env.local` et sur `app/.env.production` (aucun fichier créé) ;
- `claude doctor` sur l'ancienne version affiche les 14 avertissements ; sur la nouvelle, aucun.

Règle pour la suite : pour un chemin de fichier, écrire `Read(...)` et `Edit(...)`, jamais `Write(...)`. Vérifier avec `claude doctor` (section « Permission rules that may not work as written ») après chaque modification des règles.
