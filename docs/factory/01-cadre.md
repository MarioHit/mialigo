# Étape 1 : le cadre (modèles d'issue et de PR, Definition of Ready / Done)

- **Issue** : [#104](https://github.com/MarioHit/mialigo/issues/104) (epic [#103](https://github.com/MarioHit/mialigo/issues/103))
- **ADR** : [ADR-0023](../decisions/0023-software-factory.md)
- **Statut** : en place une fois la PR de mise en prod mergée dans `main`

## a. Avant : ce qui se passait

- **Les issues étaient du texte libre.** Rien n'obligeait à écrire _pour qui_, _quoi_ et _pourquoi_, ni comment savoir que c'est fini. Exemple : pour la #20 (« forme des blocs »), l'idée réelle (une disposition globale en nid d'abeille ou en bulles) n'était pas écrite ; la PR #97 a implémenté une forme par bloc, qui ne correspondait pas, et il a fallu une nouvelle issue (#98) et une maquette.
- **On pouvait ouvrir une issue vierge**, sans aucune structure.
- **La checklist « terminé » n'existait que dans `AGENTS.md`**, lue par l'agent mais pas visible dans la PR. Le mainteneur devait se souvenir de tout vérifier. Exemple : la version 0.4.0 est partie en prod avec des lignes qui appartenaient à la version suivante (#85), parce que personne n'avait revérifié la version de `main` juste avant le merge.
- **La description des PR changeait d'une PR à l'autre** : la façon de tester sur la preview ou la présence d'une migration SQL n'étaient pas toujours indiquées.
- **Rien n'était réutilisable** pour un autre projet : les règles étaient dispersées.

## b. Ce qui change

### Dans le processus

1. **Créer une issue** : sur GitHub, « New issue » propose deux formulaires, **User story** (« En tant que… je veux… afin de… », critères « Étant donné / Quand / Alors », hors périmètre, dépendances, priorité P0–P4) ou **Bug** (étapes, attendu / obtenu, environnement). Les issues vierges sont désactivées.
2. **Avant de commencer** : on vérifie la _Definition of Ready_ (`docs/factory.md`) : critères écrits, tient dans une PR, priorité, maquette si c'est visuel.
3. **Ouvrir la PR** : la description se pré-remplit avec `Closes #`, « Ce qui change », « Comment tester sur la preview », un encart « Migration SQL » et la checklist _Definition of Done_ en 8 cases.
4. **Avant de merger** : le mainteneur relit la checklist cochée au lieu de tout se rappeler.
5. **Les agents** (Claude Code) créent leurs issues et PR avec `gh` en reprenant les mêmes sections (règle ajoutée dans `AGENTS.md`).

### Impacts

- **Pour le mainteneur** : 2 à 3 minutes de plus pour écrire une issue (les critères d'acceptation), mais moins d'allers-retours et de PR à refaire. Le test sur la preview suit les critères écrits.
- **Pour les agents / développeurs** : la description de PR suit le modèle et coche la DoD ; l'issue suit un des deux modèles, même créée en ligne de commande.
- **Sur les outils et la CI** : 4 fichiers dans `.github/` (3 modèles d'issue/config, 1 modèle de PR), `docs/factory.md`, cette fiche, `docs/factory.html`. Aucun check en plus, aucun coût.
- **Limites** :
  - les modèles ne s'activent qu'une fois sur `main` (pas sur la preview) ;
  - la checklist ne bloque rien d'elle-même : une case non cochée n'empêche pas le merge (les étapes 2 à 5 rendront la plupart des cases automatiques) ;
  - `gh issue create --body` contourne les formulaires : c'est la règle d'`AGENTS.md` qui garantit la structure.

## c. Après : le résultat

- Chaque issue dit qui, quoi, pourquoi, et comment savoir que c'est fini.
- Chaque PR montre la même checklist « terminé », donc aucune étape (CHANGELOG, version, ADR, migration, test sur la preview) n'est oubliée sans que ça se voie.
- La chaîne est décrite à un seul endroit (`docs/factory.md`), avec sa feuille de route, et se recopie dans un autre projet.

**Pour vérifier soi-même** (après la mise en prod) :

1. Sur GitHub, « Issues » → « New issue » : seuls « User story » et « Bug » sont proposés.
2. Ouvrir une PR de test vers `pre-prod` : la description est pré-remplie avec la checklist.
