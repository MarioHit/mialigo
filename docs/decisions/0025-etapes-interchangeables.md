# ADR-0025 : Étapes de la factory définies par leurs entrées et sorties, exécutants interchangeables

- **Statut** : Acceptée
- **Date** : 2026-11-14
- **Issue / PR** : #118
- **Découle de** : [ADR-0023](0023-software-factory.md), [ADR-0024](0024-carte-factory-commande.md)
- **Remplace** : —
- **Liée à** : [ADR-0006](0006-merge-commit-seulement.md), [ADR-0011](0011-tag-version-automatique.md)

## Contexte

La carte de la factory (`docs/FACTORY.md`) décrivait chaque étape par **qui** la fait (« Claude », « GitHub Action », « toi »). En pratique, le même travail change de mains : le mainteneur écrit parfois l'issue lui-même, parfois avec Claude ; une étape faite par Claude aujourd'hui pourra être automatisée demain, ou reprise à la main un jour où Claude n'est pas disponible. Deux étapes n'apparaissaient pas du tout alors qu'elles conditionnent la qualité : la **préparation de l'issue** (passer d'une idée brute à une issue « prête », rôle de Product Owner) et le **développement** lui-même (entre la branche et la PR). Ce sont aussi les deux étapes que le mainteneur veut outiller par des commandes Claude Code (`/story`, `/ship`).

## Options envisagées

1. **Chaque étape définie par son entrée et sa sortie attendue**, avec la liste des exécutants possibles (mainteneur, Claude, GitHub Action) et celui d'aujourd'hui ; quelques garde-fous réservent une étape à un exécutant. _Pour_ : on peut confier, reprendre ou automatiser une étape sans toucher au reste ; la sortie attendue sert de critère de réussite vérifiable ; l'outillage (`/story`, `/ship`) s'ajoute sans changer la chaîne. _Contre_ : il faut décrire précisément chaque sortie.
2. **Chaque étape attachée à un exécutant fixe** (ce qui était écrit). _Pour_ : simple à lire. _Contre_ : la carte devient fausse dès qu'on change de façon de faire ; elle n'aide pas à décider quoi automatiser.
3. **Tout confier à un seul exécutant** (Claude de bout en bout, ou des Actions partout). _Contre_ : supprime les validations humaines voulues (merge dans `main`, test sur la preview) ; dépendance à un seul outil.

## Décision et raison

Option 1. Une étape est **réussie quand sa sortie respecte ce qui est attendu, quel que soit l'exécutant**, et l'étape suivante ne s'appuie que sur cette sortie (comme un contrat entre postes d'une chaîne). L'option 2 est écartée parce qu'elle décrit une habitude, pas un contrat ; l'option 3 parce qu'elle retire les contrôles humains et crée une dépendance.

Garde-fous, qui priment sur l'interchangeabilité :

- le **merge dans `main`** reste au mainteneur seul (AGENTS.md, ADR-0006) ;
- le **tag de version** reste au workflow seul (ADR-0011) ;
- le **merge dans `pre-prod`** n'est jamais confié à un merge automatique (`--auto`), qui n'attendrait pas tous les checks.

Deux étapes sont ajoutées au parcours :

- **Préparation de l'issue** (rôle PO), avant l'issue. Entrée : une idée ou un besoin brut. Sortie : une issue qui respecte la Definition of Ready.
- **Développement**, entre la branche et la PR. Entrée : l'issue prête. Sortie : le code, la ligne du CHANGELOG, la version, et un court rapport (ce qui a été fait, comment c'est vérifié, ce qui a été supposé), repris dans la description de la PR.

La feuille de route gagne deux étapes juste après le cadre : la commande `/story` (préparation) et la commande `/ship` (développement), à créer plus tard. Les étapes suivantes sont renumérotées (CI qualité devient l'étape 4, l'observabilité l'étape 8).

## Conséquences

- `docs/FACTORY.md` et `docs/factory.html` donnent pour chaque étape : entrée, sortie attendue, exécutants possibles, exécutant actuel, configuration.
- Le parcours compte 10 étapes et la feuille de route 8. L'ADR-0023 (6 étapes) n'est pas réécrite : la présente ADR la complète.
- Les fiches d'étape suivent la nouvelle numérotation (`04-…` pour la CI qualité, etc.) ; les titres et critères des issues #105 à #109 sont mis à jour en conséquence.
- Le « court rapport » de développement n'a pas encore de section dédiée dans le modèle de PR : il va dans « Ce qui change » et « Comment tester ». La commande `/ship` pourra ajouter une section « Hypothèses » au modèle.
- À réviser si un garde-fou doit évoluer (par exemple un merge automatique dans `pre-prod` le jour où tous les checks seront obligatoires dans le ruleset).
