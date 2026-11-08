# ADR-0016 : Photo de profil et bannière dans Supabase Storage, Gravatar et GitHub copiés à l'import

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #15
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0013](0013-dashboard-sous-pages-shell-client.md)

## Contexte

Chaque page doit pouvoir afficher une photo de profil et une bannière (#15) : envoi depuis le dashboard, repli sur Gravatar, import depuis GitHub. Contraintes :

- l'email des utilisateurs ne doit jamais être exposé (#14 : droits de lecture par colonne sur `public.users`) ;
- l'app n'a que la clé `anon` : pas de clé `service_role`, donc le serveur ne peut lire l'email d'un utilisateur que dans **sa propre session** ;
- Vercel limite le corps des requêtes envoyées à une fonction serveur, et `next.config.ts` désactive l'optimisation d'images (`images.unoptimized`).

## Options envisagées

**Stockage**

1. **Supabase Storage**, bucket public `avatars`, un dossier par utilisateur (`<id>/…`) protégé par des policies sur `auth.uid()`. *Pour* : déjà dans la stack, mêmes règles que la RLS, URL publique servie par le CDN. *Contre* : fichiers à nettoyer à la suppression d'un compte.
2. **URL externe saisie par l'utilisateur.** *Contre* : images qui disparaissent, pistage des visiteurs par l'hébergeur, contenu non maîtrisé.
3. **Vercel Blob ou autre service.** *Contre* : un service et un secret de plus.

**Redimensionnement**

1. **Dans le navigateur** (canvas, recadrage centré, WebP) avant l'envoi direct au bucket. *Pour* : fichiers légers, métadonnées EXIF (position GPS) supprimées, aucune fonction serveur traversée par l'image. *Contre* : dépend du navigateur (repli PNG sans encodeur WebP).
2. **Sur le serveur** (`sharp`). *Contre* : l'image passe par une fonction Vercel (limite de taille), dépendance native.

**Gravatar**

1. **Afficher `gravatar.com/avatar/<empreinte>` sur la page publique** quand il n'y a pas d'image. *Contre* : il faudrait l'email de chaque visiteur affiché (clé `service_role`) ou stocker l'empreinte en base ; l'empreinte d'un email, publique dans le HTML, se retrouve par dictionnaire, et chaque visite est signalée à Gravatar.
2. **Bouton « Utiliser mon Gravatar »** : une action serveur lit l'email dans la session, calcule l'empreinte SHA-256, récupère l'image et la **copie** dans le bucket. *Pour* : l'empreinte ne quitte le serveur que vers Gravatar et n'est jamais stockée ni publiée. *Contre* : pas de repli automatique, l'utilisateur doit cliquer.

**GitHub** : même principe, `github.com/<pseudo>.png` récupéré par une action serveur (pas de CORS, pseudo validé) et copié dans le bucket, plutôt que pointé directement.

## Décision et raison

- **Supabase Storage** (option 1) : un bucket public `avatars` limité à 2 Mo et aux formats WebP, JPEG, PNG et GIF ; chaque utilisateur n'écrit que dans son dossier. Les URL publiques sont stockées dans `users.avatar_url` et `users.banner_url`, ouvertes en lecture par colonne comme les autres (#14). Script : `supabase-avatars.sql`.
- **Redimensionnement dans le navigateur** : avatar 400 × 400, bannière 1500 × 500. L'image ne traverse pas Vercel.
- **Gravatar et GitHub copiés à l'import** (option 2), par l'action serveur `app/dashboard/profil/actions.ts`, avec la session de l'utilisateur : les policies Storage et la RLS s'appliquent comme depuis le navigateur. Le « repli Gravatar » de l'issue devient un bouton : un repli automatique imposait de publier une empreinte de l'email.
- Un nom de fichier unique par envoi (`<id>/avatar-<horodatage>.webp`) évite les problèmes de cache ; l'ancien fichier est supprimé après la mise à jour du profil.

## Conséquences

- Le script `supabase-avatars.sql` doit être exécuté en production **avant** le déploiement du code (les lectures de profil demandent les nouvelles colonnes).
- La suppression d'un compte (`auth.users` → `public.users` en cascade) ne supprime pas les fichiers du bucket : à faire à la main lors d'une demande de suppression, ou automatiser plus tard.
- Une image GitHub ou Gravatar importée ne suit pas les changements faits ensuite chez eux : il faut réimporter.
- Si un repli Gravatar automatique devient nécessaire, il demandera une clé `service_role` côté serveur et un nouvel ADR.
