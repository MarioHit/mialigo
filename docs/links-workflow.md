# Workflow Gestion des Liens & Profil Dashboard

Ce document décrit le cycle de vie des données (création, mise à jour, suppression de liens et édition du profil) depuis l'interface d'administration `/dashboard`.

Organisation du dashboard :

- `/dashboard` redirige vers `/dashboard/profil` (c'est l'URL d'arrivée du magic link).
- `app/dashboard/layout.tsx` enveloppe toutes les sous-pages dans `DashboardShell` (`app/dashboard/dashboard-shell.tsx`, composant client) : vérification de session (sinon `/login`), chargement du profil, en-tête (« Voir ma page », déconnexion) et onglets. Les sous-pages lisent `user`, `profile` et `reloadProfile()` avec `useDashboard()`.
- `/dashboard/profil` (`app/dashboard/profil/page.tsx`) : pseudo, nom affiché, bio, et le bloc « Photo et bannière » (`profile-images.tsx`, action serveur `actions.ts`).
- `/dashboard/blocs` (`app/dashboard/blocs/page.tsx`) : liste, ajout, modification et suppression des liens.

---

## 1. Description des actions

1. **Mise à jour du profil :**
   - L'utilisateur met à jour son `username`, `name` ou `bio`.
   - La requête utilise `update` (ou `insert` si le profil est absent) avec vérification RLS (`auth.uid() = id`). Pas d'`upsert` : il exigerait de lire la colonne `email`, non exposée via l'API.
2. **Ajout d'un nouveau lien :**
   - L'utilisateur sélectionne un titre, une URL et une icône de réseau social.
   - Insertion dans `public.links` avec calcul automatique de l'ordre d'affichage.
3. **Édition / Suppression d'un lien :**
   - Modification directe ou suppression sécurisée protégée par RLS (`auth.uid() = user_id`).

---

## 2. Diagramme de Séquence UML

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant Browser as Navigateur (Client)
    participant SupaDB as Supabase PostgreSQL

    Note over User, SupaDB: Cas 1 : Sauvegarde / Modification du Profil
    User->>Browser: Modifie username / name / bio + Clic "Enregistrer"
    Browser->>SupaDB: UPDATE public.users SET username, name, bio WHERE id = user.id
    Note over SupaDB: RLS Check: auth.uid() == id
    SupaDB-->>Browser: 200 OK (Profil mis à jour)
    Browser-->>User: Notification "Profil mis à jour"

    Note over User, SupaDB: Cas 2 : Ajout d'un Lien
    User->>Browser: Remplit Titre, URL, Icône + Clic "Ajouter"
    Browser->>SupaDB: INSERT INTO public.links (user_id, title, url, icon, order)
    Note over SupaDB: RLS Check: auth.uid() == user_id
    alt RLS Autorisé
        SupaDB-->>Browser: 201 Created (Nouvel enregistrement)
        Browser->>SupaDB: loadLinks(user.id) -> SELECT * FROM public.links
        SupaDB-->>Browser: Liste actualisée
        Browser-->>User: Nouveau lien affiché
    else RLS Refusé
        SupaDB-->>Browser: 403 Forbidden
        Browser-->>User: Message d'erreur
    end

    Note over User, SupaDB: Cas 3 : Suppression d'un Lien
    User->>Browser: Clic sur l'icône de corbeille
    Browser->>SupaDB: DELETE FROM public.links WHERE id = linkId
    SupaDB-->>Browser: 200 OK
    Browser->>SupaDB: loadLinks(user.id)
    SupaDB-->>Browser: Liste actualisée sans le lien
```

---

## 3. Logs de diagnostic associés

- `[Dashboard] 💾 Sauvegarde du profil... { id, username, name, bio }`
- `[Dashboard] ✅ Profil sauvegardé / mis à jour avec succès.`
- `[Dashboard] ➕ Ajout d'un nouveau lien... { title, url, icon, order }`
- `[Dashboard] ✅ Lien ajouté avec succès.`
- `[Dashboard] 🗑️ Suppression du lien ID: "<linkId>"`
- `[Dashboard] 💾 Mise à jour du lien ID: "<linkId>"`

---

## Photo de profil et bannière

Voir [ADR-0016](decisions/0016-photo-profil-banniere-storage.md). Images dans le bucket Supabase Storage public `avatars`, un dossier par utilisateur (`<id>/avatar-<horodatage>.webp`, `<id>/banner-…`), URL publiques dans `users.avatar_url` / `users.banner_url` (script `supabase-avatars.sql`).

- **Envoi** : recadrage centré et redimensionnement dans le navigateur (avatar 400 × 400, bannière 1500 × 500, WebP), envoi direct au bucket, mise à jour du profil, puis suppression de l'ancien fichier.
- **Gravatar / GitHub** : action serveur `importAvatar` ; l'email n'est lu que dans la session, l'empreinte SHA-256 n'est envoyée qu'à Gravatar, l'image est copiée dans le bucket.
- **Suppression** : `avatar_url` / `banner_url` à `NULL`, puis suppression du fichier.

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant Browser as Navigateur (Client)
    participant Action as Action serveur (Vercel)
    participant Ext as Gravatar / GitHub
    participant Storage as Supabase Storage
    participant SupaDB as Supabase PostgreSQL

    Note over User, SupaDB: Cas 1 : Envoi d'une image
    User->>Browser: Choisit un fichier
    Browser->>Browser: Recadrage + redimensionnement (canvas, WebP)
    Browser->>Storage: upload avatars/<id>/avatar-<ts>.webp
    Note over Storage: Policy : dossier = auth.uid()
    Browser->>SupaDB: UPDATE users SET avatar_url WHERE id = user.id
    Browser->>Storage: remove(ancien fichier)

    Note over User, SupaDB: Cas 2 : Import Gravatar ou GitHub
    User->>Browser: « Utiliser mon Gravatar » / pseudo GitHub
    Browser->>Action: importAvatar(source, pseudo)
    Action->>Action: getUser() (session) ; SHA-256 de l'email pour Gravatar
    Action->>Ext: GET image (d=404 / size=400)
    Ext-->>Action: image ou 404
    Action->>Storage: upload avatars/<id>/avatar-<ts>.<ext> (session utilisateur)
    Action->>SupaDB: UPDATE users SET avatar_url
    Action->>Storage: remove(ancien fichier)
    Action-->>Browser: { ok, avatarUrl } ou { ok: false, error }
```

