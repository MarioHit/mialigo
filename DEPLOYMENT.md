# 🚀 Déploiement — Mialigo

Mialigo est déployé sur **Vercel** en rendu côté serveur (SSR), avec **Supabase** pour l'authentification et la base de données. Le domaine `www.mialigo.com` est géré chez OVH et pointe vers Vercel.

> L'ancien déploiement statique sur GitHub Pages (`output: "export"`, dossier `out/`) a été abandonné : les pages utilisateurs dynamiques (`/<username>`) et la route `/auth/callback` nécessitent un serveur. La mise en place initiale de Vercel et des DNS OVH est archivée dans [`docs/archive/VERCEL-DEPLOYMENT.md`](docs/archive/VERCEL-DEPLOYMENT.md) (utile seulement pour une réinstallation complète).

## Environnements

| Environnement  | Branche              | URL                                            | Déployé quand                                    |
| -------------- | -------------------- | ---------------------------------------------- | ------------------------------------------------ |
| Production     | `main`               | `https://www.mialigo.com`                      | merge de la PR de mise en prod par le mainteneur |
| Pré-production | `pre-prod`           | `https://pp.mialigo.com` (protégée par Vercel) | merge d'une PR dans `pre-prod`                   |
| Preview        | chaque branche de PR | `https://*.vercel.app`                         | chaque push sur une PR                           |

## Circuit de mise en production

Le circuit complet (issue, PR, checks, merge, tag) est décrit dans [`docs/FACTORY.md`](docs/FACTORY.md). Pour le déploiement :

1. Une PR est mergée dans `pre-prod` : le workflow `release-pr.yml` crée ou complète la PR `pre-prod` → `main`.
2. **Avant de merger cette PR de mise en prod : exécuter sur la base de production, dans le SQL Editor de Supabase, chaque migration `supabase-*.sql` qu'elle apporte** (signalée par « ⚠️ Migration SQL » dans la description des PR). Sinon le nouveau code s'appuie sur des colonnes ou contraintes absentes.
3. Le mainteneur merge la PR de mise en prod (« Create a merge commit ») : Vercel redéploie la production en ~2 minutes et `version-tag.yml` crée le tag `vX.Y.Z`.
4. Dérouler les vérifications « Après déploiement » ci-dessous.

## Base de données

- **Nouvelle base** (projet de test, nouvelle installation) : exécuter [`supabase-auth-clean.sql`](supabase-auth-clean.sql), le schéma complet à jour. ⛔ Il supprime et recrée les tables : **jamais sur la production**.
- **Production** : uniquement les migrations non destructives `supabase-*.sql`, dans l'ordre listé en tête de `supabase-auth-clean.sql`.

## Configuration

### Vercel

- `vercel.json` : framework `nextjs`, build `npm run build`, sortie `.next`.
- `next.config.ts` : pas d'`output: "export"` (SSR natif), `images.unoptimized: true`.

### Supabase

- Modèles d'email (inscription et connexion) : [`docs/mail-template-login.md`](docs/mail-template-login.md). Les liens utilisent `token_hash`, validé par `/auth/callback` (fonctionne d'un appareil ou d'un navigateur à l'autre).
- Authentication → URL Configuration : voir la checklist, section 2.

### Domaine

- Vercel (Settings → Domains) : `www.mialigo.com`.
- OVH (Zone DNS) : CNAME `www` → `cname.vercel-dns.com`.

## Checklist

À vérifier avant et après chaque mise en prod touchant l'authentification, Supabase ou le domaine.

### 1. Variables d'environnement Vercel

Settings → Environment Variables. Chaque variable doit être cochée pour **les 3 environnements** (Production, Preview, Development) :

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Symptôme si oublié : erreur de build `supabaseUrl is required`.

### 2. Redirect URLs Supabase (Authentication → URL Configuration)

- [ ] **Site URL** = `https://www.mialigo.com`
- [ ] **Redirect URLs** contient toutes ces lignes :
  - `http://localhost:3000/auth/callback`
  - `https://www.mialigo.com/auth/callback`
  - `https://pp.mialigo.com/**` (pré-production — format vérifié et fonctionnel ; attention au **point** entre `pp` et `mialigo`)
  - `https://mialigo.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (wildcard pour les previews, URL dynamique à chaque déploiement)

  Les pages `/login` et `/signup` envoient le magic link vers `<origine>/auth/callback?next=/dashboard` : c'est cette route serveur qui crée la session puis redirige vers `/dashboard`. Si Supabase refuse l'URL à cause du paramètre `?next=`, utiliser le suffixe `/auth/callback**`.

Symptôme si mal configuré : le magic link redirige vers la **Site URL** (`www.mialigo.com`, ou `localhost:3000` si c'est la Site URL) au lieu de l'environnement d'origine — Supabase remplace toute URL non autorisée par la Site URL. Après correction, redemander un nouveau lien : un lien déjà reçu garde l'ancienne adresse.

Pré-production `pp.mialigo.com` : la protection Vercel (Settings → Deployment Protection) est active. Ouvrir le magic link dans un navigateur connecté à Vercel, sinon il s'arrête sur la page de connexion Vercel.

### 3. DNS OVH

- [ ] Enregistrement CNAME `www` → `cname.vercel-dns.com`
- [ ] Domaine ajouté dans Vercel (Settings → Domains) avec statut « Valid Configuration »
- [ ] Certificat SSL généré automatiquement par Vercel (peut prendre quelques minutes après validation DNS)

### 4. Base de données Supabase

- [ ] Migrations SQL de la mise en prod exécutées sur la production **avant** le merge dans `main`
- [ ] RLS activé sur `users` et `links`
- [ ] Trigger `handle_new_user` actif (Database → Triggers)
- [ ] Policies : lecture publique (SELECT `true`), écriture réservée au propriétaire (`auth.uid() = id` / `auth.uid() = user_id`)
- [ ] La colonne `email` de `users` n'est pas lisible par `anon` / `authenticated` (droits par colonne, `supabase-fix-email-exposure.sql`)

### 5. Avant de pousser du code

- [ ] Les checks de la PR sont verts (Lint, Scan des secrets, build Vercel)
- [ ] Pas de secret en dur dans le code (toujours via `process.env`)

### 6. Après déploiement

- [ ] Tester `/login` → réception du magic link → redirection correcte vers `/dashboard`
- [ ] Tester une page publique existante (`/mario`) et une inexistante (`/xyz123` → doit afficher 404)
- [ ] Tester une URL en majuscules (`/MARIO` → doit rediriger vers `/mario`)
- [ ] Vérifier le tag : `gh run list --workflow version-tag.yml --limit 1`, puis `git ls-remote --tags origin vX.Y.Z`

## 🐛 Dépannage

| Symptôme                                                           | Cause probable                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Erreur de build `supabaseUrl is required`                          | Variables d'environnement absentes dans Vercel pour cet environnement       |
| Le magic link redirige vers `localhost:3000` ou vers la production | Site URL ou Redirect URLs Supabase mal configurées                          |
| « Le lien de connexion est invalide ou a expiré » sur `/login`     | Lien déjà utilisé ou expiré, ou URL de callback non autorisée dans Supabase |
| `/<username>` affiche une 404 pour un utilisateur existant         | Profil absent de `public.users` ou policy RLS de lecture publique manquante |
| Erreur sur une colonne ou une contrainte après une mise en prod    | Migration SQL de la version pas encore exécutée sur la production           |
| Le domaine ne répond pas                                           | Propagation DNS en cours (5 à 30 min) ou CNAME OVH incorrect                |

Logs : onglet **Logs** du projet Vercel (les logs `debug()` ne s'affichent qu'en développement ; seuls `console.error` / `console.warn` apparaissent en production).
