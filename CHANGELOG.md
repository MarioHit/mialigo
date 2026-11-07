# Journal des modifications

Toutes les évolutions notables de Mialigo sont consignées dans ce fichier, écrites pour les utilisateurs du service.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le projet n'a pas encore de numéro de version : chaque section porte la date de la mise en production (`AAAA-MM-JJ`, merge vers `main`). Les catégories sont celles de Keep a Changelog (Ajouté, Modifié, Obsolète, Supprimé, Corrigé, Sécurité), plus « Interne » pour les changements sans effet visible sur le site (voir [ADR-0009](docs/decisions/0009-changelog-keep-a-changelog.md)).

## [Non publié]

### Interne

- Un journal des modifications (ce fichier) résume désormais chaque mise en production en langage simple. ([#55])

## [2026-11-07]

### Interne

- Les secrets du projet (clés d'accès) sont mieux protégés : les assistants de développement ne peuvent plus les lire, et chaque modification est vérifiée pour qu'aucune clé ne soit publiée par erreur. ([#35], [#40])
- Les choix techniques du projet sont désormais expliqués et archivés, pour qu'ils restent compréhensibles dans le temps. ([#37], [#47])
- Le suivi des tâches et des mises en production est plus rigoureux : chaque changement est relu et suivi de son démarrage jusqu'à sa mise en ligne. ([#43], [#49], [#53])

## [2026-11-06]

### Ajouté

- Les profils Mialigo apparaissent mieux dans les moteurs de recherche : titre et description tirés du nom et de la bio, et aperçu soigné lors d'un partage sur les réseaux sociaux. ([#12])
- Certains pseudos sont réservés (noms de pages du site, comptes officiels) et ne peuvent plus être choisis à l'inscription ni dans le tableau de bord. ([#10])

### Corrigé

- Le pseudo et le nom choisis à l'inscription sont bien ceux qui apparaissent sur le profil. Si le pseudo vient d'être pris entre-temps, l'inscription aboutit quand même avec une variante (`-2`, `-3`…). ([#10])

### Sécurité

- Les adresses email des utilisateurs ne sont plus accessibles publiquement. ([#32])
- Plusieurs réglages de la base de données ont été renforcés suite à un audit de sécurité. ([#10])
- Le tableau de bord et les pages de connexion ne sont plus indexés par les moteurs de recherche. ([#12])

## [2026-08-31]

### Ajouté

- Inscription dédiée (`/signup`) : on choisit son pseudo avant de créer son compte. ([#8])
- Le lien de connexion reçu par email fonctionne même s'il est ouvert sur un autre appareil ou un autre navigateur. ([#8])

### Modifié

- Messages de diagnostic nettoyés : ils n'apparaissent plus en production et ne contiennent plus de données personnelles. ([#9])

## [2026-08-29]

### Ajouté

- Pages légales : conditions générales d'utilisation, politique de confidentialité, mentions légales, contact et suppression de compte. ([#7])

## [2026-08-28]

### Ajouté

- Choix du réseau social pour chaque lien, avec son icône (Instagram, YouTube, TikTok, GitHub…). ([#6])

## [2026-08-27]

### Ajouté

- Création de compte et connexion sans mot de passe, par lien magique envoyé par email. ([#4])
- Tableau de bord pour modifier son profil (nom, bio) et ses liens. ([#4])
- Thème clair ou sombre, mémorisé d'une visite à l'autre. ([#5])

## [2026-08-26]

### Ajouté

- Page publique de chaque utilisateur à l'adresse `mialigo.com/<pseudo>`, avec ses liens. ([#2], [#3])

## [2026-08-25]

### Ajouté

- Première mise en ligne du site Mialigo. ([#1])

[Non publié]: https://github.com/MarioHit/mialigo/compare/main...pre-prod
[2026-11-07]: https://github.com/MarioHit/mialigo/pull/51
[2026-11-06]: https://github.com/MarioHit/mialigo/pull/33
[2026-08-31]: https://github.com/MarioHit/mialigo/pull/9
[2026-08-29]: https://github.com/MarioHit/mialigo/pull/7
[2026-08-28]: https://github.com/MarioHit/mialigo/pull/6
[2026-08-27]: https://github.com/MarioHit/mialigo/pull/5
[2026-08-26]: https://github.com/MarioHit/mialigo/pull/3
[2026-08-25]: https://github.com/MarioHit/mialigo/pull/1
[#1]: https://github.com/MarioHit/mialigo/pull/1
[#2]: https://github.com/MarioHit/mialigo/pull/2
[#3]: https://github.com/MarioHit/mialigo/pull/3
[#4]: https://github.com/MarioHit/mialigo/pull/4
[#5]: https://github.com/MarioHit/mialigo/pull/5
[#6]: https://github.com/MarioHit/mialigo/pull/6
[#7]: https://github.com/MarioHit/mialigo/pull/7
[#8]: https://github.com/MarioHit/mialigo/pull/8
[#9]: https://github.com/MarioHit/mialigo/pull/9
[#10]: https://github.com/MarioHit/mialigo/pull/10
[#12]: https://github.com/MarioHit/mialigo/pull/12
[#32]: https://github.com/MarioHit/mialigo/pull/32
[#35]: https://github.com/MarioHit/mialigo/pull/35
[#37]: https://github.com/MarioHit/mialigo/pull/37
[#40]: https://github.com/MarioHit/mialigo/pull/40
[#43]: https://github.com/MarioHit/mialigo/pull/43
[#47]: https://github.com/MarioHit/mialigo/pull/47
[#49]: https://github.com/MarioHit/mialigo/pull/49
[#53]: https://github.com/MarioHit/mialigo/pull/53
[#55]: https://github.com/MarioHit/mialigo/pull/55
