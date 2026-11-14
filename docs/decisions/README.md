# Décisions d'architecture (ADR)

Chaque choix technique important, ou option volontairement écartée, est consigné ici sous forme d'ADR (*Architecture Decision Record*). Le but : savoir **pourquoi** le projet est fait ainsi, et ne pas rouvrir un débat déjà tranché sans élément nouveau.

## Écrire un ADR

1. Copier [`0000-modele.md`](0000-modele.md) en `NNNN-titre-court.md` (numéro suivant, sur 4 chiffres).
2. Remplir chaque section, **options écartées comprises**.
3. Ajouter une ligne dans l'index ci-dessous.
4. Citer l'ADR dans la description de la PR.

Un ADR « Acceptée » n'est plus modifié sur le fond. Pour changer de décision, on écrit un nouvel ADR qui le **remplace** ; l'ancien passe au statut « Remplacée par ADR-XXXX ». Corriger une coquille ou un lien reste possible.

## Index

| N° | Décision | Statut | Date |
|---|---|---|---|
| [0001](0001-hook-gitleaks-global.md) | Hook gitleaks global avec chaînage des hooks locaux | Acceptée | 2026-11-06 |
| [0002](0002-nvm-node-24.md) | nvm et Node 24 sur le VPS, plutôt que Docker (pour l'instant) | Acceptée | 2026-11-06 |
| [0003](0003-env-local.md) | `.env.local` comme fichier d'environnement local | Acceptée | 2026-11-06 |
| [0004](0004-regles-git-pr-pre-prod.md) | Règles Git : PR obligatoire vers `pre-prod` | Acceptée | 2026-11-06 |
| [0005](0005-apres-merge-pre-prod.md) | Après un merge vers `pre-prod` : PR vers `main` et issue « In review » | Acceptée, en partie remplacée par 0008 | 2026-11-07 |
| [0006](0006-merge-commit-seulement.md) | Seul le merge commit est autorisé sur `main` et `pre-prod` | Acceptée | 2026-11-07 |
| [0007](0007-in-progress-debut-travail.md) | L'issue passe à « In progress » dès le début du travail | Acceptée | 2026-11-07 |
| [0008](0008-pr-mise-en-prod-automatique.md) | La PR de mise en prod est créée par GitHub Actions | Acceptée | 2026-11-07 |
| [0009](0009-changelog-keep-a-changelog.md) | Un `CHANGELOG.md` au format Keep a Changelog, alimenté par chaque PR | Remplacée par 0010 | 2026-11-07 |
| [0010](0010-versionnage-semver-tags.md) | Versions SemVer, `package.json` et tag Git à chaque mise en prod | Acceptée, en partie remplacée par 0011 et 0015 | 2026-11-07 |
| [0011](0011-tag-version-automatique.md) | Le tag de version est posé par GitHub Actions à chaque push sur `main` | Acceptée | 2026-11-07 |
| [0012](0012-lint-dans-les-pr.md) | `npm run lint` dans un workflow GitHub Actions sur chaque PR | Acceptée | 2026-11-07 |
| [0013](0013-dashboard-sous-pages-shell-client.md) | Sous-pages du dashboard sous un layout client partagé (`DashboardShell`) | Acceptée | 2026-11-07 |
| [0014](0014-garde-fou-version.md) | La PR de mise en prod reste en brouillon tant que la version n'a pas changé | Remplacée par 0015 | 2026-11-07 |
| [0015](0015-version-par-pr.md) | Chaque PR met à jour la version et le CHANGELOG elle-même | Acceptée | 2026-11-07 |
| [0016](0016-photo-profil-banniere-storage.md) | Photo de profil et bannière dans Supabase Storage, Gravatar et GitHub copiés à l'import | Acceptée | 2026-11-07 |
| [0017](0017-modele-blocs-registre-apercu.md) | Les liens deviennent des blocs typés, rendus par un registre et un aperçu partagé | Acceptée | 2026-11-08 |
| [0018](0018-drag-drop-dnd-kit-grille-bento.md) | Réorganisation par drag & drop avec `@dnd-kit` et grille « bento » en CSS Grid | Acceptée, en partie remplacée par 0019 | 2026-11-08 |
| [0019](0019-reorganiser-sur-la-page-publique.md) | Modifier la disposition de ses blocs (ordre, taille, position) directement sur sa page publique | Acceptée | 2026-11-08 |
| [0020](0020-themes-de-page.md) | Thèmes de page en variables CSS, stockés dans `users.theme` (jsonb validé par CHECK) | Acceptée | 2026-11-08 |
| [0022](0022-disposition-nid-abeille-bulles.md) | Dispositions nid d'abeille et bulles, réglage du thème rendu en CSS | Acceptée | 2026-11-08 |
| [0023](0023-software-factory.md) | Software factory sur GitHub, construite étape par étape | Acceptée | 2026-11-08 |
| [0024](0024-carte-factory-commande.md) | Carte de la factory dans `docs/FACTORY.md`, tenue à jour par une règle et la commande `/factory` | Acceptée | 2026-11-14 |
| [0025](0025-etapes-interchangeables.md) | Étapes de la factory définies par leurs entrées et sorties, exécutants interchangeables | Acceptée | 2026-11-14 |
| [0026](0026-commande-story.md) | Commande `/story` pour préparer les issues, sans rien créer sans accord | Acceptée | 2026-11-14 |
