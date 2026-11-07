# ADR-0013 : Sous-pages du dashboard sous un layout client partagé (`DashboardShell`)

- **Statut** : Acceptée
- **Date** : 2026-11-07
- **Issue / PR** : #17
- **Découle de** : —
- **Remplace** : —
- **Liée à** : —

## Contexte

`app/dashboard/page.tsx` faisait plus de 560 lignes (session, profil, liens, en-tête) et chaque nouvelle fonctionnalité prévue (#15, #16, #18, #19, #21…) devait s'y ajouter, avec des conflits de merge assurés entre PR parallèles. L'issue #17 demande des sous-pages (`/dashboard/profil`, `/dashboard/blocs`, `/dashboard/apparence`) avec un layout commun (vérification de session, navigation).

Contraintes : la session Supabase est lue côté navigateur (`supabaseClient`, cookies) et il n'y a ni middleware ni proxy ; les écritures sont protégées par la RLS. Le magic link renvoie vers `/dashboard` (`?next=/dashboard`), URL déjà autorisée dans Supabase.

## Options envisagées

1. **Layout serveur + composant client `DashboardShell`** : le layout garde les métadonnées (`noindex`) et rend un composant client qui vérifie la session, charge le profil, affiche l'en-tête et les onglets, et partage `user` / `profile` / `reloadProfile()` par un contexte React. *Pour* : une seule vérification de session, conservée pendant la navigation entre onglets ; les sous-pages ne contiennent que leur formulaire. *Contre* : la vérification reste côté client (écran de chargement, puis redirection vers `/login`).
2. **Chaque sous-page vérifie la session elle-même.** *Pour* : pages indépendantes. *Contre* : code dupliqué, nouvelle requête de session à chaque changement d'onglet, en-tête à répéter.
3. **Vérification côté serveur** (`proxy.ts` ou layout serveur avec `createSupabaseServerClient`) avant tout rendu. *Pour* : pas de flash de chargement, redirection immédiate. *Contre* : change le modèle d'authentification (aujourd'hui entièrement client + RLS), à concevoir et tester à part ; hors du périmètre d'un découpage sans changement de comportement.

## Décision et raison

Option **1**.

- Elle découpe le fichier sans changer le comportement : même vérification de session, mêmes requêtes, mêmes messages.
- Le contexte évite de recharger la session et le profil à chaque onglet (2).
- La vérification côté serveur (3) reste possible plus tard : elle remplacerait l'effet de `DashboardShell` sans toucher aux sous-pages.

Détails :

- `/dashboard` redirige vers `/dashboard/profil`, pour garder l'URL du magic link.
- L'onglet des liens s'appelle « Liens » mais vit à `/dashboard/blocs`, l'URL prévue pour les blocs de #16.
- `/dashboard/apparence` n'est pas créée tant qu'elle n'a pas de contenu : elle arrivera avec les thèmes (#19).

## Conséquences

- Une nouvelle sous-page = un dossier sous `app/dashboard/` + une entrée dans `tabs` de `dashboard-shell.tsx` ; elle lit la session avec `useDashboard()`.
- Le profil est chargé une fois par le shell ; une page qui le modifie appelle `reloadProfile()` pour mettre à jour l'en-tête (« Voir ma page »).
- À revoir si l'authentification passe côté serveur (option 3).
