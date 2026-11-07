# Journal des modifications

Toutes les évolutions notables de Mialigo sont consignées dans ce fichier, écrites pour les utilisateurs du service.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/). Chaque version correspond à une mise en production : même numéro dans `package.json`, tag Git `vX.Y.Z` sur le merge vers `main`. Les catégories sont celles de Keep a Changelog (Ajouté, Modifié, Obsolète, Supprimé, Corrigé, Sécurité), plus « Interne » pour les changements sans effet visible sur le site (voir [ADR-0010](docs/decisions/0010-versionnage-semver-tags.md)).

## [Unreleased]

## [0.3.0] - 2026-11-07

### Modifié

- Le tableau de bord est organisé en onglets : « Profil » pour le pseudo, le nom et la bio, « Liens » pour gérer ses liens. ([#17])

## [0.2.0] - 2026-11-07

### Modifié

- Les apostrophes des pages légales et de plusieurs messages s'affichent avec la typographie française (’), et les liens entre ces pages s'ouvrent sans recharger le site. ([#29])

### Interne

- La qualité du code est vérifiée automatiquement à chaque modification proposée. ([#29])
- Une mise en production ne peut plus partir sans son numéro de version. ([#72])

## [0.1.2] - 2026-11-07

### Interne

- Les règles de rédaction de ce journal sont précisées pour les mises en production. ([#63])
- Le numéro de version est désormais attribué automatiquement à chaque mise en production. ([#66])

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

[Unreleased]: https://github.com/MarioHit/mialigo/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/MarioHit/mialigo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/MarioHit/mialigo/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/MarioHit/mialigo/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MarioHit/mialigo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MarioHit/mialigo/tree/v0.1.0
[#17]: https://github.com/MarioHit/mialigo/issues/17
[#29]: https://github.com/MarioHit/mialigo/issues/29
[#57]: https://github.com/MarioHit/mialigo/issues/57
[#63]: https://github.com/MarioHit/mialigo/issues/63
[#66]: https://github.com/MarioHit/mialigo/issues/66
[#72]: https://github.com/MarioHit/mialigo/issues/72
