# Journal des modifications

Toutes les évolutions notables de Mialigo sont consignées dans ce fichier, écrites pour les utilisateurs du service.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/). Chaque version correspond à une mise en production : même numéro dans `package.json`, tag Git `vX.Y.Z` sur le merge vers `main`. Les catégories sont celles de Keep a Changelog (Ajouté, Modifié, Obsolète, Supprimé, Corrigé, Sécurité), plus « Interne » pour les changements sans effet visible sur le site (voir [ADR-0010](docs/decisions/0010-versionnage-semver-tags.md)).

## [Unreleased]

## [0.1.1] - 2026-11-07

### Interne

- Chaque mise en production porte désormais un numéro de version, repris dans ce journal. ([#57])

## [0.1.0] - 2026-11-07

### Ajouté

- Version initiale.
- Page publique de chaque utilisateur à l'adresse `mialigo.com/<pseudo>`, avec sa bio et ses liens ; une adresse en majuscules renvoie vers la même page en minuscules.
- Inscription sans mot de passe : on choisit son pseudo, puis on reçoit un lien de connexion par email. Certains pseudos sont réservés (pages du site, comptes officiels).
- Connexion par lien magique, qui fonctionne même si l'email est ouvert sur un autre appareil ou un autre navigateur.
- Tableau de bord pour modifier son pseudo, son nom et sa bio, et pour ajouter, modifier ou supprimer ses liens.
- Choix du réseau social pour chaque lien, avec son icône (Instagram, YouTube, TikTok, GitHub…).
- Thème clair ou sombre, mémorisé d'une visite à l'autre.
- Profils bien présentés dans les moteurs de recherche et lors d'un partage sur les réseaux sociaux.
- Pages légales : conditions générales d'utilisation, politique de confidentialité, mentions légales, contact et suppression de compte.
- Les adresses email des utilisateurs ne sont jamais visibles publiquement.

[Unreleased]: https://github.com/MarioHit/mialigo/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/MarioHit/mialigo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MarioHit/mialigo/tree/v0.1.0
[#57]: https://github.com/MarioHit/mialigo/issues/57
