# Checklist de déploiement — Mialigo

À vérifier avant/après chaque déploiement impliquant l'auth, Supabase ou le domaine.

## 1. Variables d'environnement Vercel

Settings → Environment Variables. Chaque variable doit être cochée pour **les 3 environnements** (Production, Preview, Development) :

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Symptôme si oublié : erreur de build `supabaseUrl is required`.

## 2. Redirect URLs Supabase (Authentication → URL Configuration)

- [ ] **Site URL** = `https://www.mialigo.com`
- [ ] **Redirect URLs** contient toutes ces lignes :
  - `http://localhost:3000/dashboard`
  - `https://www.mialigo.com/dashboard`
  - `https://mialigo.vercel.app/dashboard`
  - `https://*.vercel.app/dashboard` (wildcard pour les previews, URL dynamique à chaque déploiement)

Symptôme si mal configuré : le magic link redirige vers `localhost:3000` même en preview/prod.

## 3. DNS OVH

- [ ] Enregistrement CNAME `www` → `cname.vercel-dns.com`
- [ ] Domaine ajouté dans Vercel (Settings → Domains) avec statut "Valid Configuration"
- [ ] Certificat SSL généré automatiquement par Vercel (peut prendre quelques minutes après validation DNS)

## 4. Base de données Supabase

- [ ] RLS activé sur `users` et `links`
- [ ] Trigger `handle_new_user` actif (vérifier dans Database → Triggers)
- [ ] Policies : lecture publique (SELECT `true`), écriture réservée au propriétaire (`auth.uid() = id` / `auth.uid() = user_id`)

## 5. Avant de pousser du code

- [ ] `npm run build` en local passe sans erreur (reproduit fidèlement les erreurs de build Vercel)
- [ ] Pas de secret en dur dans le code (toujours via `process.env`)

## 6. Après déploiement

- [ ] Tester `/login` → réception du magic link → redirection correcte vers `/dashboard`
- [ ] Tester une page publique existante (`/mario`) et une inexistante (`/xyz123` → doit afficher 404)
- [ ] Tester une URL en majuscules (`/MARIO` → doit rediriger vers `/mario`)
