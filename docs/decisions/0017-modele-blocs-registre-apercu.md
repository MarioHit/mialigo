# ADR-0017 : Les liens deviennent des blocs typés (colonnes `type` / `data` / `size`), rendus par un registre et un aperçu partagé

- **Statut** : Acceptée
- **Date** : 2026-11-08
- **Issue / PR** : #16
- **Découle de** : [ADR-0013](0013-dashboard-sous-pages-shell-client.md)
- **Remplace** : —
- **Liée à** : [ADR-0016](0016-photo-profil-banniere-storage.md)

## Contexte

La page publique ne sait afficher qu'une chose : des liens (`public.links` : `title`, `url`, `icon`, `"order"`). Les issues suivantes ajoutent d'autres contenus et de la mise en forme : grille et tailles (#18), thèmes (#19), blocs portfolio (#22), ressources (#24), statistiques par bloc (#27). Le dashboard n'a aucun aperçu : il faut enregistrer puis ouvrir sa page pour voir le résultat. Contraintes : la base de prod contient déjà des liens, et les migrations doivent rester non destructives.

## Options envisagées

**Stockage**

1. **Ajouter `type`, `data` (jsonb) et `size` à `links`**, en gardant `title` / `url` / `icon` comme colonnes du bloc `link`. *Pour* : migration instantanée, les liens existants deviennent des blocs `link` par défaut, sans copie ; l'ordre et la RLS restent les mêmes ; une seule requête pour toute la page. *Contre* : le nom de table `links` ne dit plus tout ; les champs propres aux autres types sont en jsonb (validés par l'application).
2. **Nouvelle table `blocks`**, avec migration des liens. *Contre* : copie de données en prod, double écriture ou coupure pendant la bascule, RLS et policies à dupliquer.
3. **Une table par type** (`links`, `images`, `videos`…). *Contre* : l'ordre d'affichage s'étale sur plusieurs tables, une requête par type, réordonnancement (#18) compliqué.

**Rendu**

1. **Registre `type → composant`** (`components/blocks/registry.tsx`) typé `Record<BlockType, …>` : TypeScript signale un type sans composant. *Pour* : ajouter un type = un composant + une ligne.
2. **`switch` dans la page publique.** *Contre* : grossit à chaque type, et devrait être recopié dans l'aperçu.

**Aperçu en direct**

1. **Composant `ProfileView` partagé** par `/<pseudo>` et une colonne d'aperçu dans `DashboardShell`. Les sous-pages poussent leurs modifications non enregistrées (brouillons) dans le contexte du shell. *Pour* : exactement le même rendu, mis à jour à chaque frappe, sans requête.
2. **`<iframe>` de la vraie page.** *Contre* : ne montre que ce qui est enregistré, se recharge à chaque sauvegarde.

## Décision et raison

- **Stockage, option 1** (`supabase-blocks.sql`) : `type` (défaut `'link'`, CHECK sur la liste des types), `data` jsonb (défaut `{}`, CHECK objet), `size` (`small` / `wide` / `large`, défaut `small`, pour #18). Ajout de colonnes avec défaut constant : instantané en PostgreSQL ≥ 11, aucune ligne réécrite. Un nouveau type de bloc étend `links_type_check` dans sa propre migration.
- **Rendu, option 1** : `lib/blocks.ts` (types, colonnes lues, `toBlocks()` qui écarte un type inconnu au lieu de planter), `components/blocks/` (un composant par type, `LinkCard` pour `link`), `components/profile-view.tsx` (en-tête + blocs). Le survol des cartes passe en CSS (`.block-card`) : les composants n'ont plus besoin d'être des composants client.
- **Aperçu, option 1** : le shell charge les blocs avec le profil, les expose (`blocks`, `reloadBlocks`) et affiche l'aperçu (colonne fixe sur grand écran, bouton « Voir l'aperçu » sur mobile). L'aperçu est `inert` : on le regarde, ses liens ne s'ouvrent pas.

## Conséquences

- `supabase-blocks.sql` doit être exécuté en prod **avant** le déploiement (le code lit `type`, `data`, `size`).
- Les lectures de `links` se font en colonnes explicites (`BLOCK_COLUMNS`), plus de `select("*")`.
- `lib/blocks.ts`, la contrainte `links_type_check` et le registre doivent rester synchronisés à chaque nouveau type.
- La table garde le nom `links` ; la renommer en `blocks` ferait l'objet d'un ADR et d'une migration dédiés si le besoin apparaît.
- L'aperçu ne reprend pas les boutons fixes de la page (« Accueil », « Modifier ») ni le thème personnalisé à venir (#19), qui devra lui aussi passer par `ProfileView`.
