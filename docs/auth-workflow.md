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
    Browser->>SupaAuth: supabaseClient.auth.signInWithOtp({ email, data: { username, name }, emailRedirectTo: /auth/callback?next=/dashboard })
    SupaAuth-->>User: Envoi Email contenant le lien magique
    Browser-->>User: Écran "Lien envoyé"

    Note over User, Vercel: 2. Clic sur l'email & échange de session
    User->>Vercel: Clic lien email -> GET /auth/callback?next=/dashboard&token_hash=…&type=signup
    Vercel->>SupaAuth: createSupabaseServerClient().auth.verifyOtp({ token_hash, type })
    Note over Vercel, SupaAuth: Ancien format de lien (?code=…) : exchangeCodeForSession(code)
    SupaAuth->>SupaDB: INSERT INTO auth.users (id, email)
    SupaDB->>SupaDB: Trigger handle_new_user() -> INSERT INTO public.users
    SupaAuth-->>Vercel: Tokens de session (Access/Refresh)
    Vercel->>SupaDB: Profil public.users présent ? Sinon INSERT (secours si le trigger n'a pas tourné)
    Vercel-->>Browser: HTTP 302 Redirection vers /dashboard + Set-Cookie (session)

    Note over Browser, SupaDB: 3. Chargement du Dashboard
    Browser->>Browser: GET /dashboard -> redirection vers /dashboard/profil
    Browser->>SupaAuth: supabaseClient.auth.getSession() (dashboard-shell.tsx)
    SupaAuth-->>Browser: Session active (user.id)
    Browser->>SupaDB: SELECT id, username, name, bio, avatar_url, banner_url, theme FROM public.users WHERE id = user.id
    SupaDB-->>Browser: Profil (colonnes explicites : l'email n'est pas lisible)
    Browser->>SupaDB: SELECT BLOCK_COLUMNS FROM public.links WHERE user_id = user.id
    SupaDB-->>Browser: [ blocs... ]
    Browser-->>User: Affiche Dashboard prérempli
```

---

## 3. Logs de diagnostic associés

Les logs `debug()` n'apparaissent qu'en développement et ne contiennent ni email, ni identifiant, ni jeton.

- `[Signup] Vérification de la disponibilité du pseudo.`
- `[Signup] Pseudo disponible.` / `[Signup] Pseudo indisponible.` / `[Signup] Pseudo réservé.`
- `[Signup] Envoi de la demande de création de compte.`
- `[Signup] Lien de confirmation envoyé.`
- `[Auth/Callback] Requête reçue.`
- `[Auth/Callback] Validation du lien magique par token hash.` puis `[Auth/Callback] Lien magique validé.`
- `[Auth/Callback] Création du profil absent.` / `[Auth/Callback] Profil existant confirmé.`
- `[Auth/Callback] Authentification réussie, redirection en cours.`
