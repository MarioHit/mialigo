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
  - `http://localhost:3000/auth/callback`
  - `https://www.mialigo.com/auth/callback`
  - `https://pp.mialigo.com/**` (préprod — format vérifié et fonctionnel ; attention au **point** entre `pp` et `mialigo`)
  - `https://mialigo.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (wildcard pour les previews, URL dynamique à chaque déploiement)

  Les pages `/login` et `/signup` envoient le magic link vers `<origine>/auth/callback?next=/dashboard` : c'est cette route serveur qui crée la session puis redirige vers `/dashboard`. Si Supabase refuse l'URL à cause du paramètre `?next=`, utiliser le suffixe `/auth/callback**`.

Symptôme si mal configuré : le magic link redirige vers la **Site URL** (`www.mialigo.com`, ou `localhost:3000` si c'est la Site URL) au lieu de l'environnement d'origine — Supabase remplace toute URL non autorisée par la Site URL. Après correction, redemander un nouveau lien : un lien déjà reçu garde l'ancienne adresse.

Préprod `pp.mialigo.com` : la protection Vercel (Settings → Deployment Protection) est active. Ouvrir le magic link dans un navigateur connecté à Vercel, sinon il s'arrête sur la page de connexion Vercel.

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
