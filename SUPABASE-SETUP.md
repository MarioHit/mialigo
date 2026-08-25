# 🗄️ Configuration Supabase - Phase 2

## ✅ Ce qui a été fait

- ✅ Package `@supabase/supabase-js` installé (v2.112.4)
- ✅ Client Supabase créé dans `lib/supabase.ts`
- ✅ Variables d'environnement configurées dans `.env.local`
- ✅ Schéma SQL prêt dans `supabase-schema.sql`
- ✅ Types TypeScript pour User et Link

## 🚀 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un compte (gratuit)
4. Créez un nouveau projet :
   - **Name**: `mialigo`
   - **Database Password**: Choisissez un mot de passe fort (sauvegardez-le !)
   - **Region**: Choisissez le plus proche de vous

⏳ **Attendez 1-2 minutes** que le projet soit créé.

### 2. Récupérer les Clés API

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez ces deux valeurs :
   - **Project URL** (commence par `https://...supabase.co`)
   - **anon/public key** (longue clé commençant par `eyJ...`)

### 3. Configurer les Variables d'Environnement

Ouvrez `.env.local` et remplacez :

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-ici
```

**Exemple :**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Créer les Tables dans Supabase

1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Copiez tout le contenu de `supabase-schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **Run** (en bas à droite)

✅ Vous devriez voir : "Success. No rows returned"

### 5. Vérifier les Données

1. Allez dans **Table Editor**
2. Vous devriez voir 2 tables :
   - `users` (avec Mario)
   - `links` (avec 3 liens de Mario)

### 6. Redémarrer le Serveur Dev

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

## 📊 Structure de la Base de Données

### Table `users`

```sql
id         | UUID    | PK
username   | TEXT    | UNIQUE (ex: "mario")
name       | TEXT    | Nom affiché (ex: "Mario")
bio        | TEXT    | Description
created_at | TIMESTAMP
```

### Table `links`

```sql
id         | UUID    | PK
user_id    | UUID    | FK → users(id)
title      | TEXT    | Titre du lien (ex: "Instagram")
url        | TEXT    | URL complète
icon       | TEXT    | Classe FontAwesome (ex: "fa-brands fa-instagram")
order      | INTEGER | Ordre d'affichage
created_at | TIMESTAMP
```

## 🔐 Sécurité (RLS)

- **Row Level Security** activé
- Politique : Lecture publique pour tous
- Les modifications nécessitent une authentification (Phase 3)

## 🧪 Test

Une fois configuré, testez :

```
http://localhost:3000/mario
```

Les données devraient maintenant venir de Supabase ! 🎉

## 📝 Prochaines Étapes (Phase 3)

1. Modifier `app/[username]/page.tsx` pour fetch depuis Supabase
2. Ajouter un système d'authentification
3. Créer un dashboard pour éditer ses liens

---

**Questions ?** Vérifiez que :

- ✅ Les variables d'environnement sont correctes
- ✅ Les tables ont été créées
- ✅ Mario est bien dans la table `users`
