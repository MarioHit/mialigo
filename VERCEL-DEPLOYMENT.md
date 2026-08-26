# 🚀 Déploiement sur Vercel avec domaine OVH

## ✅ Préparation effectuée

- `next.config.ts` : Configuration pour Vercel (suppression de `output: "export"`)
- `app/[username]/page.tsx` : Support des routes dynamiques (suppression de `dynamicParams = false`)
- `vercel.json` : Configuration de build Vercel

---

## 📋 Étape 1 : Déployer sur Vercel

### 1.1 Créer un compte Vercel

1. Allez sur **https://vercel.com/signup**
2. Connectez-vous avec votre compte **GitHub**
3. Autorisez Vercel à accéder à vos repos

### 1.2 Importer le projet

1. Sur le dashboard Vercel : https://vercel.com/new
2. Cliquez sur **"Import Git Repository"**
3. Sélectionnez **`MarioHit/mialigo`**
4. Cliquez sur **"Import"**

### 1.3 Configurer les variables d'environnement

**IMPORTANT** : Avant de déployer, ajoutez vos secrets Supabase :

1. Dans la page d'import, descendez jusqu'à **"Environment Variables"**
2. Ajoutez :
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://dhfgudmfmpriiskksgbi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (votre clé complète)
   ```
3. Cliquez sur **"Deploy"**

### 1.4 Attendre le déploiement

- Le build prend ~2 minutes
- Vercel vous donnera une URL temporaire : `https://mialigo-xxx.vercel.app`
- Testez cette URL pour vérifier que tout fonctionne

---

## 🌐 Étape 2 : Configurer le domaine personnalisé dans Vercel

1. Dans votre projet Vercel, allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine :
   - `www.mialigo.com`
   - `mialigo.com` (optionnel, pour rediriger vers www)
3. Vercel vous donnera des **enregistrements DNS à configurer**

**Vous verrez quelque chose comme :**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 Étape 3 : Configurer les DNS chez OVH

### 3.1 Se connecter à OVH

1. Allez sur **https://www.ovh.com/manager/**
2. Connectez-vous avec votre compte OVH
3. Dans le menu, allez dans **"Noms de domaine"**
4. Cliquez sur **"mialigo.com"**

### 3.2 Accéder à la zone DNS

1. Cliquez sur l'onglet **"Zone DNS"**
2. Vous verrez tous les enregistrements actuels

### 3.3 Modifier l'enregistrement CNAME pour `www`

**Option A : Si un enregistrement CNAME `www` existe déjà**

1. Cliquez sur les **3 points** à droite de l'enregistrement `www`
2. Cliquez sur **"Modifier l'entrée"**
3. Changez la **Cible** pour : `cname.vercel-dns.com`
4. Cliquez sur **"Suivant"** puis **"Valider"**

**Option B : Si aucun enregistrement `www` n'existe**

1. Cliquez sur **"Ajouter une entrée"**
2. Sélectionnez **"CNAME"**
3. Remplissez :
   - **Sous-domaine** : `www`
   - **Cible** : `cname.vercel-dns.com`
   - **TTL** : Laissez par défaut (3600)
4. Cliquez sur **"Suivant"** puis **"Valider"**

### 3.4 (Optionnel) Rediriger `mialigo.com` vers `www.mialigo.com`

Pour que `mialigo.com` redirige vers `www.mialigo.com` :

1. Dans la zone DNS OVH, trouvez l'enregistrement **A** pour `@` (domaine racine)
2. Supprimez-le ou modifiez-le pour pointer vers l'IP de Vercel : `76.76.21.21`
3. Ou utilisez Vercel pour gérer la redirection automatiquement

**Alternative simple :** Laissez Vercel gérer tout et configurez uniquement `www`

### 3.5 Attendre la propagation DNS

- Les changements DNS prennent **5 à 30 minutes** pour se propager
- Parfois jusqu'à 24h dans le pire des cas

---

## ✅ Étape 4 : Vérifier le déploiement

1. Attendez 10-15 minutes après avoir modifié les DNS chez OVH
2. Testez **https://www.mialigo.com**
3. Vérifiez que :
   - ✅ Le certificat SSL est actif (cadenas vert)
   - ✅ `/mario` affiche la page de Mario
   - ✅ `/gilbert` affiche la page de Gilbert
   - ✅ `/test123` affiche la page 404

---

## 🔄 Déploiements futurs

**Automatique sur chaque push :**

- Commitez vos changements : `git add .` + `git commit -m "..."`
- Pushez sur GitHub : `git push origin init_next`
- Vercel redéploie automatiquement en ~2 minutes !

**Preview deployments :**

- Chaque branche a sa propre URL de preview
- Parfait pour tester avant de merger sur `init_next`

---

## 📊 Comparaison GitHub Pages vs Vercel

| Fonctionnalité             | GitHub Pages      | Vercel               |
| -------------------------- | ----------------- | -------------------- |
| Static Export              | ✅ Oui            | ✅ Oui               |
| Server-Side Rendering      | ❌ Non            | ✅ Oui               |
| API Routes                 | ❌ Non            | ✅ Oui               |
| Nouvelles pages dynamiques | ❌ Rebuild requis | ✅ Automatique       |
| Certificat SSL             | ✅ Automatique    | ✅ Automatique       |
| CDN Global                 | ✅ Oui            | ✅ Oui (plus rapide) |
| Preview Deployments        | ❌ Non            | ✅ Oui               |
| Edge Functions             | ❌ Non            | ✅ Oui               |

---

## 🎯 Prochaines étapes

Maintenant que vous êtes sur Vercel, vous pouvez :

1. ✅ **Ajouter l'authentification Supabase** (login/signup)
2. ✅ **Créer un dashboard** pour gérer profils et liens
3. ✅ **Activer ISR** (Incremental Static Regeneration) pour mettre à jour les pages toutes les X minutes
4. ✅ **Ajouter des API Routes** pour des fonctionnalités avancées

---

## 🆘 Dépannage

**Le domaine ne fonctionne pas après 30 minutes ?**

- Vérifiez les DNS chez OVH : https://www.ovh.com/manager/
- Vérifiez dans Vercel que le domaine est bien configuré
- Testez avec `nslookup www.mialigo.com` dans PowerShell

**Erreur de build sur Vercel ?**

- Vérifiez que les variables d'environnement sont bien configurées
- Consultez les logs de build dans l'interface Vercel

**Les pages utilisateurs ne s'affichent pas ?**

- Vérifiez que Supabase est accessible depuis Vercel
- Vérifiez que les tables `users` et `links` contiennent des données
