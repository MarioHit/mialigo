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
| [0005](0005-apres-merge-pre-prod.md) | Après un merge vers `pre-prod` : PR vers `main` et issue « In review » | Acceptée | 2026-11-07 |
| [0006](0006-merge-commit-seulement.md) | Seul le merge commit est autorisé sur `main` et `pre-prod` | Acceptée | 2026-11-07 |
| [0007](0007-in-progress-debut-travail.md) | L'issue passe à « In progress » dès le début du travail | Acceptée | 2026-11-07 |
