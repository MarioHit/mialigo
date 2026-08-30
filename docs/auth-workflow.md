# Workflow Inscription & Validation Magic Link

Ce document décrit le flux complet d'inscription d'un nouvel utilisateur, depuis la saisie du formulaire jusqu'à la création du profil et l'accès au tableau de bord.

---

## 1. Description des étapes

1. **Vérification du pseudo (`/signup`) :**
   - Le client saisit un pseudo (ex: `mialigo.com/mario`).
   - Vérification en temps réel dans `public.users` pour s'assurer de sa disponibilité.
2. **Demande de Magic Link :**
   - Le client envoie son email et ses métadonnées (`username`, `name`).
   - Supabase Auth génère un jeton sécurisé et expédie l'email avec un lien pointant vers `/auth/callback?next=/dashboard`.
3. **Validation & Création de session (`/auth/callback`) :**
   - Au clic sur le lien dans l'email, le serveur Next.js intercepte le `code` ou `token_hash`.
   - Échange avec Supabase pour créer la session et enregistrer les cookies HTTP sécurisés.
   - Création / synchronisation du profil dans `public.users`.
4. **Accès au Dashboard (`/dashboard`) :**
   - Redirection vers le tableau de bord avec les données utilisateur pré-remplies.

---

## 2. Diagramme de Séquence UML

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant Browser as Navigateur (Client)
    participant Vercel as Vercel (Next.js /auth/callback)
    participant SupaAuth as Supabase Auth
    participant SupaDB as Supabase PostgreSQL

    Note over User, Browser: 1. Demande d'inscription
    User->>Browser: Saisie email, username, name sur /signup
    Browser->>SupaDB: SELECT username FROM public.users (Vérification unicité)
    SupaDB-->>Browser: Pseudo disponible
    Browser->>SupaAuth: supabaseClient.auth.signInWithOtp({ email, redirectTo: /auth/callback })
    SupaAuth-->>User: Envoi Email contenant le lien magique
    Browser-->>User: Écran "Lien envoyé"

    Note over User, Vercel: 2. Clic sur l'email & échange de session
    User->>Vercel: Clic lien email -> GET /auth/callback?code=XYZ&next=/dashboard
    Vercel->>SupaAuth: createSupabaseServerClient().auth.exchangeCodeForSession(code)
    SupaAuth->>SupaDB: INSERT INTO auth.users (id, email)
    SupaDB->>SupaDB: Trigger handle_new_user() -> INSERT INTO public.users
    SupaAuth-->>Vercel: Tokens de session (Access/Refresh)
    Vercel-->>Browser: HTTP 302 Redirection vers /dashboard + Set-Cookie (session)

    Note over Browser, SupaDB: 3. Chargement du Dashboard
    Browser->>Browser: GET /dashboard
    Browser->>SupaAuth: supabaseClient.auth.getSession()
    SupaAuth-->>Browser: Session active (user.id)
    Browser->>SupaDB: SELECT * FROM public.users WHERE id = user.id
    SupaDB-->>Browser: { id, username, name, bio }
    Browser->>SupaDB: SELECT * FROM public.links WHERE user_id = user.id
    SupaDB-->>Browser: [ liens... ]
    Browser-->>User: Affiche Dashboard prérempli
```

---

## 3. Logs de diagnostic associés

- `[Signup] 🔍 Vérification de la disponibilité du pseudo: "<pseudo>"`
- `[Signup] ✅ Pseudo "<pseudo>" DISPONIBLE.` / `[Signup] ⚠️ Pseudo "<pseudo>" DÉJÀ PRIS`
- `[Signup] 🚀 Tentative d'inscription: { email, username, name }`
- `[Signup] ✅ Magic link d'inscription envoyé avec succès à: "<email>"`
- `[Auth/Callback] 📥 Requête reçue: { hasCode, hasTokenHash, next }`
- `[Auth/Callback] ✅ Session PKCE échangée avec succès: { id, email }`
- `[Auth/Callback] ✅ Profil public.users créé pour "<pseudo>"`
