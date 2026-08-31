# Documentation des Fonctionnalités — Mialigo

Ce document répertorie l'ensemble des fonctionnalités du projet Mialigo, leur statut, leur architecture technique et les guides associés.

---

## 📌 Sommaire des Fonctionnalités

| Fonctionnalité                   | Statut           | Documentation / Workflow                                                | Description                                                                                                        |
| :------------------------------- | :--------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Inscription par Magic Link**   | ✅ En production | [auth-workflow.md](auth-workflow.md)                                    | Création de compte avec réservation de pseudo unique `mialigo.com/<pseudo>` et lien magique sécurisé.              |
| **Connexion sans mot de passe**  | ✅ En production | [login-workflow.md](login-workflow.md)                                  | Authentification par email direct sans mot de passe (Magic Link Server-Side PKCE).                                 |
| **Gestion du Profil & Liens**    | ✅ En production | [links-workflow.md](links-workflow.md)                                  | Dashboard d'administration : modification du pseudo/nom/bio, ajout, édition et suppression de liens.               |
| **Pages Publiques Utilisateurs** | ✅ En production | [app/[username]/page.tsx](../app/[username]/page.tsx)                   | Rendu dynamique SSR (`mialigo.com/<username>`), redirection auto des majuscules (`/MARIO` $\rightarrow$ `/mario`). |
| **Sélecteur de Réseaux Sociaux** | ✅ En production | [social-network-picker.tsx](../app/dashboard/social-network-picker.tsx) | Détection et attribution automatique des icônes Font Awesome (Instagram, YouTube, TikTok, GitHub, etc.).           |
| **Thème Clair / Sombre**         | ✅ En production | [theme-toggle.tsx](../app/theme-toggle.tsx)                             | Persistance du choix utilisateur dans le `localStorage` avec synchronisation inter-onglets.                        |
| **Pages Légales**                | ✅ En production | `app/cgu`, `app/confidentialite`, `app/mentions-legales`, `app/contact` | Conformité RGPD et conditions générales d'utilisation.                                                             |

---

## 🛠️ Historique des Mises à Jour & Nouvelles Fonctionnalités

### Version 1.2.0 (Août 2026) — Authentification Server-Side & Logs de Diagnostic

- **Séparation `/signup` et `/login` :** parcours utilisateur dédié pour garantir la réservation du pseudo avant la création du compte.
- **Support Cross-Browser du Magic Link :** route serveur `app/auth/callback/route.ts` permettant d'ouvrir le lien reçu par email depuis n'importe quel navigateur ou smartphone.
- **Journalisation détaillée (Console Logs) :** ajout de logs tagués (`[Signup]`, `[Login]`, `[Auth/Callback]`, `[Dashboard]`, `[UserPage]`) pour suivre en temps réel chaque étape du flux.
- **Auto-guérison du profil Dashboard :** mécanisme de pré-remplissage et d'`upsert` sécurisé si le trigger de base de données n'avait pas encore créé le profil.

### Version 1.1.0 — Migration Vercel & Supabase

- Remplacement du build statique GitHub Pages par le SSR Next.js sur Vercel.
- Intégration de PostgreSQL et des règles de sécurité Row Level Security (RLS).
- Normalisation et redirection systématique des URLs en minuscules.

### Version 1.0.0 — Scaffolding initial

- Structure Next.js App Router, Tailwind CSS 4, intégration Font Awesome et composants de base.

---

## 🗺️ Fonctionnalités à venir (Roadmap)

- [ ] **Upload d'avatar / Photo de profil :** stockage des images dans Supabase Storage.
- [ ] **Drag & Drop pour les liens :** réorganisation intuitive de l'ordre d'affichage des liens.
- [ ] **Statistiques & Analytics :** compteur de clics par lien et visites globales du profil.
- [ ] **Personnalisation de thèmes :** choix de palettes de couleurs personnalisées par utilisateur.
- [ ] **Générateur de QR Code :** téléchargement d'un QR code dirigeant vers `mialigo.com/<username>`.
