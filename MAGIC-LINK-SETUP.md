# 🔐 Configuration de l'authentification Magic Link

Ce guide explique comment configurer l'authentification par magic link (lien magique) avec Supabase.

---

## 📦 Étape 1 : Installer les dépendances

```powershell
npm install @supabase/ssr
```

---

## 🗄️ Étape 2 : Configurer la base de données Supabase

### 2.1 Exécuter le script SQL

1. Allez dans **Supabase Dashboard** → votre projet → **SQL Editor**
2. Créez une nouvelle query
3. Copiez-collez le contenu du fichier `supabase-auth-config.sql`
4. Cliquez sur **Run** (ou F5)

Ce script va :

- ✅ Modifier la table `users` pour la lier à Supabase Auth
- ✅ Créer un trigger pour auto-créer un profil à l'inscription
- ✅ Activer Row Level Security (RLS) pour sécuriser les données
- ✅ Créer les politiques d'accès

### 2.2 Vérifier la configuration

Dans **Authentication** → **Settings** :

- ✅ **Enable Email Confirmations** : Désactivé (pour les magic links simples)
- ✅ **Mailer Settings** : Configuré (Supabase fournit un service email par défaut)

---

## 📧 Étape 3 : Configurer les emails (optionnel)

Par défaut, Supabase envoie les emails depuis `noreply@mail.app.supabase.io`.

### Pour personnaliser (production) :

1. **Authentication** → **Email Templates** → **Magic Link**
2. Personnalisez le message d'email
3. Utilisez votre propre SMTP dans **Settings** → **SMTP Settings** (Gmail, SendGrid, etc.)

**Template email par défaut :**

```html
<h2>Connexion à Mialigo</h2>
<p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
<p><a href="{{ .ConfirmationURL }}">Se connecter</a></p>
```

---

## 🌐 Étape 4 : Configurer les URLs de redirection

Dans **Authentication** → **URL Configuration** :

1. **Site URL** : `https://www.mialigo.com` (ou `http://localhost:3000` en dev)
2. **Redirect URLs** : Ajoutez :
   ```
   http://localhost:3000/dashboard
   https://www.mialigo.com/dashboard
   https://mialigo.vercel.app/dashboard
   ```

---

## 🧪 Étape 5 : Tester localement

### 5.1 Démarrer le serveur

```powershell
npm run dev
```

### 5.2 Tester le flux

1. Allez sur **http://localhost:3000/login**
2. Entrez votre email
3. Cliquez sur **"Recevoir le lien magique"**
4. Vérifiez votre boîte email
5. Cliquez sur le lien → vous devriez être connecté et redirigé vers `/dashboard`

### 5.3 Modifier votre profil

1. Dans le dashboard, modifiez :
   - **Username** : votre identifiant unique (ex: `mario`)
   - **Nom** : votre nom d'affichage
   - **Bio** : votre description

2. Ajoutez des liens :
   - **Titre** : Instagram
   - **URL** : https://www.instagram.com/votre_compte
   - **Icône** : `fa-brands fa-instagram`

3. Cliquez sur **"Ajouter"**

### 5.4 Voir votre page publique

Cliquez sur **"🔗 Voir ma page"** ou allez sur `http://localhost:3000/votre-username`

---

## 🔒 Sécurité - Row Level Security (RLS)

Les politiques RLS garantissent que :

✅ **Tout le monde** peut voir les profils publics (`/mario`, `/gilbert`)  
✅ **Seul le propriétaire** peut modifier son profil et ses liens  
❌ **Personne d'autre** ne peut modifier vos données

### Politiques appliquées :

```sql
-- Users : lecture publique, modification par propriétaire uniquement
CREATE POLICY "Public profiles viewable" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Links : lecture publique, gestion par propriétaire uniquement
CREATE POLICY "Public links viewable" ON links FOR SELECT USING (true);
CREATE POLICY "Users manage own links" ON links FOR ALL USING (auth.uid() = user_id);
```

---

## 🚀 Déploiement sur Vercel

### 6.1 Commiter les changements

```powershell
git add .
git commit -m "Add magic link authentication"
git push origin init_next
```

### 6.2 Vérifier les variables d'environnement

Dans **Vercel → Settings → Environment Variables**, vérifiez que vous avez :

- `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)

### 6.3 Configurer les URLs dans Supabase

Dans **Supabase → Authentication → URL Configuration**, ajoutez :

```
https://www.mialigo.com/dashboard
https://mialigo.vercel.app/dashboard
```

---

## ✅ Flux complet utilisateur

1. **Inscription/Connexion**
   - Utilisateur va sur `/login`
   - Entre son email
   - Reçoit un email avec un lien magique
   - Clique sur le lien

2. **Première connexion (auto-création de compte)**
   - Trigger Supabase crée automatiquement un profil
   - Username par défaut = partie avant @ de l'email
   - Redirigé vers `/dashboard`

3. **Configuration du profil**
   - Modifie son username (doit être unique)
   - Personnalise son nom et sa bio
   - Ajoute ses liens (réseaux sociaux, sites, etc.)

4. **Partage**
   - Sa page publique est accessible sur `mialigo.com/username`
   - Peut partager ce lien sur Instagram, TikTok, etc.

5. **Gestion continue**
   - Peut se reconnecter à tout moment via magic link
   - Modifier/supprimer ses liens depuis le dashboard

---

## 🎨 Personnalisations futures

Vous pouvez ajouter :

- **Avatar** : Upload d'image de profil
- **Thèmes** : Couleurs personnalisées par utilisateur
- **Analytics** : Nombre de clics par lien
- **Drag & Drop** : Réorganiser les liens
- **Domaine personnalisé** : `john.mialigo.com`
- **QR Code** : Générer un QR code de la page

---

## 🆘 Dépannage

### Le magic link ne fonctionne pas ?

1. Vérifiez les spams
2. Vérifiez que l'URL de redirection est autorisée dans Supabase
3. Consultez les logs dans **Supabase → Logs → Auth Logs**

### Erreur "User already registered" ?

C'est normal ! L'utilisateur existe déjà, il peut juste se reconnecter avec le même email.

### Les liens ne s'affichent pas sur la page publique ?

Vérifiez que :

- Les politiques RLS sont bien créées
- Les liens ont le bon `user_id`
- Le profil `username` correspond à l'URL

---

## 📚 Ressources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Magic Links Guide](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Font Awesome Icons](https://fontawesome.com/icons)
