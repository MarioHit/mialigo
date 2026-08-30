# Workflow Connexion Utilisateur Existant (`/login`)

Ce document décrit le flux de connexion pour un utilisateur déjà inscrit, utilisant l'envoi d'un lien magique sécurisé sans mot de passe.

---

## 1. Description des étapes

1. **Saisie de l'email (`/login`) :**
   - L'utilisateur renseigne uniquement son adresse email.
   - `signInWithOtp` est appelé avec `shouldCreateUser: false` pour interdire la création d'un compte fantôme sans pseudo.
2. **Génération et expédition du lien magique :**
   - Supabase Auth vérifie l'existence de l'utilisateur.
   - Si l'utilisateur n'existe pas, un message d'erreur invite l'utilisateur à créer son compte via `/signup`.
   - Si l'utilisateur existe, l'email est envoyé avec le lien de redirection vers `/auth/callback?next=/dashboard`.
3. **Validation & Initialisation de la session (`/auth/callback`) :**
   - Le lien est cliqué sur n'importe quel navigateur / appareil.
   - La route serveur échange le jeton et pose les cookies sécurisés.
4. **Redirection vers le Dashboard (`/dashboard`) :**
   - Les données et liens de l'utilisateur sont immédiatement chargés.

---

## 2. Diagramme de Séquence UML

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant Browser as Navigateur (Client)
    participant Vercel as Vercel (/auth/callback)
    participant SupaAuth as Supabase Auth
    participant SupaDB as Supabase PostgreSQL

    User->>Browser: Saisie email sur /login
    Browser->>SupaAuth: signInWithOtp({ email, shouldCreateUser: false, redirectTo: /auth/callback })
    alt Utilisateur inconnu
        SupaAuth-->>Browser: Erreur: User not found
        Browser-->>User: "Aucun compte associé à cet email. Veuillez d'abord créer un compte."
    else Utilisateur existant
        SupaAuth-->>User: Envoi Email contenant le lien magique
        User->>Vercel: Clic lien email -> GET /auth/callback?code=XYZ
        Vercel->>SupaAuth: exchangeCodeForSession(code)
        SupaAuth-->>Vercel: Session validée + Cookies HTTP
        Vercel-->>Browser: HTTP 302 vers /dashboard + Set-Cookie
        Browser->>SupaDB: loadProfile() -> SELECT * FROM public.users
        SupaDB-->>Browser: Données utilisateur
        Browser->>SupaDB: loadLinks() -> SELECT * FROM public.links
        SupaDB-->>Browser: Liste des liens
        Browser-->>User: Affiche Dashboard prêt
    end
```

---

## 3. Logs de diagnostic associés

- `[Login] 🔍 Vérification de la session active...`
- `[Login] 🚀 Demande de lien magique pour l'email: "<email>"`
- `[Login] ✅ Magic link de connexion envoyé avec succès à "<email>"`
- `[Login] ⚠️ Utilisateur non trouvé pour "<email>". Doit passer par /signup.`
- `[Auth/Callback] ✅ Session PKCE échangée avec succès: { id, email }`
