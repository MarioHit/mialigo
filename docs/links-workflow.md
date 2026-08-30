# Workflow Gestion des Liens & Profil Dashboard

Ce document décrit le cycle de vie des données (création, mise à jour, suppression de liens et édition du profil) depuis l'interface d'administration `/dashboard`.

---

## 1. Description des actions

1. **Mise à jour du profil :**
   - L'utilisateur met à jour son `username`, `name` ou `bio`.
   - La requête utilise `upsert` avec vérification RLS (`auth.uid() = id`).
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
    Browser->>SupaDB: UPSERT INTO public.users (id, username, name, bio)
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
