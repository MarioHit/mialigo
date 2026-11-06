# 🚀 Guide de Déploiement — Mialigo

Mialigo est déployé sur **Vercel** en rendu côté serveur (SSR), avec **Supabase** pour l'authentification et la base de données. Le domaine `www.mialigo.com` est géré chez OVH et pointe vers Vercel.

> L'ancien déploiement statique sur GitHub Pages (`output: "export"`, dossier `out/`, workflow GitHub Actions) a été abandonné : les pages utilisateurs dynamiques (`/<username>`) et la route `/auth/callback` nécessitent un serveur.

## 📚 Documents associés

| Document                                               | Contenu                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| [`VERCEL-DEPLOYMENT.md`](VERCEL-DEPLOYMENT.md)         | Mise en place initiale : import du projet Vercel, domaine, DNS OVH   |
| [`DEPLOYMENT-CHECKLIST.md`](DEPLOYMENT-CHECKLIST.md)   | Vérifications avant/après chaque déploiement (env, Supabase, DNS)    |
| [`SUPABASE-SETUP.md`](SUPABASE-SETUP.md)               | Configuration du projet Supabase                                     |
| [`MAGIC-LINK-SETUP.md`](MAGIC-LINK-SETUP.md)           | Configuration du magic link et du template d'email                   |

## ⚙️ Configuration

### Vercel

- `vercel.json` : framework `nextjs`, build `npm run build`, sortie `.next`
- `next.config.ts` : pas d'`output: "export"` (SSR natif), `images.unoptimized: true`
- Variables d'environnement (Settings → Environment Variables, pour Production, Preview et Development) :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase

- Schéma : exécuter [`supabase-auth-clean.sql`](supabase-auth-clean.sql) dans le SQL Editor. ⚠️ Ce script supprime et recrée les tables `users` et `links`.
- Authentication → URL Configuration :
  - **Site URL** : `https://www.mialigo.com`
  - **Redirect URLs** : les liens magiques redirigent vers `<origine>/auth/callback?next=/dashboard`, donc chaque origine utilisée (localhost, production, previews `*.vercel.app`) doit y être autorisée.

### Domaine

- Vercel (Settings → Domains) : `www.mialigo.com`
- OVH (Zone DNS) : CNAME `www` → `cname.vercel-dns.com`

## 🔄 Déployer

1. Vérifier le build en local (reproduit les erreurs de build Vercel) :

   ```bash
   npm run build
   npm run lint
   ```

2. Pousser la branche sur GitHub et ouvrir une Pull Request : Vercel crée un **déploiement de preview** avec sa propre URL.
3. Merger dans la branche de production : Vercel redéploie automatiquement la production en ~2 minutes.
4. Dérouler les vérifications de la section « Après déploiement » de [`DEPLOYMENT-CHECKLIST.md`](DEPLOYMENT-CHECKLIST.md).

## 🐛 Dépannage

| Symptôme                                                    | Cause probable                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Erreur de build `supabaseUrl is required`                   | Variables d'environnement absentes dans Vercel pour cet environnement           |
| Le magic link redirige vers `localhost:3000`                | Site URL ou Redirect URLs Supabase mal configurées                              |
| « Le lien de connexion est invalide ou a expiré » sur `/login` | Lien déjà utilisé ou expiré, ou URL de callback non autorisée dans Supabase   |
| `/<username>` affiche une 404 pour un utilisateur existant  | Profil absent de `public.users` ou policy RLS de lecture publique manquante     |
| Le domaine ne répond pas                                    | Propagation DNS en cours (5 à 30 min) ou CNAME OVH incorrect                    |

Logs : onglet **Logs** du projet Vercel (les logs `debug()` ne s'affichent qu'en développement ; seuls `console.error` / `console.warn` apparaissent en production).
