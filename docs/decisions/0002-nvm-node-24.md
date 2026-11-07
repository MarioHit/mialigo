# ADR-0002 : nvm et Node 24 sur le VPS, plutôt que Docker (pour l'instant)

- **Statut** : Acceptée
- **Date** : 2026-11-06
- **Issue / PR** : #34 / #35
- **Découle de** : —
- **Remplace** : —

## Contexte

Le VPS n'avait pas de Node.js : impossible de lancer `npm run build`, `lint` ou `check-env`. La production tourne sur Vercel en **Node 24.x**. Il faut un Node local de la **même version majeure**, installable sans `sudo`, et que les agents puissent utiliser.

## Options envisagées

1. **Paquet système** (apt / NodeSource) : *Pour* : simple. *Contre* : demande `sudo`, une seule version pour toute la machine, version de la distribution souvent en retard.
2. **Docker** (conteneur de dev / `docker compose`) : *Pour* : environnement identique partout, isolé, reproductible. *Contre* : plus lourd à mettre en place (volumes, `node_modules`, rechargement à chaud), lenteur des montages, et un environnement de plus à maintenir. Non nécessaire tant qu'il n'y a qu'un poste de dev et aucun service local.
3. **Volta / fnm / mise** : *Pour* : rapides, gèrent la version par projet. *Contre* : outils moins répandus que nvm, et aucun avantage décisif ici.
4. **nvm** : installé dans `~/.nvm`, sans `sudo`, plusieurs versions possibles.

## Décision et raison

**nvm (option 4), avec Node 24 LTS (v24.22.2) par défaut, et `"engines": { "node": "24.x" }` dans `package.json`.**

nvm répond aux deux contraintes (sans `sudo`, même version majeure que Vercel) avec un minimum de mise en place. `engines.node` fixe la version majeure **côté Vercel** aussi, ce qui garde dev et prod alignés ; `24.x` laisse passer les correctifs.

Docker est écarté **pour l'instant**, pas définitivement : son coût n'est pas justifié avec un seul environnement.

Sécurité de la chaîne d'approvisionnement : nvm **v0.40.8** plutôt que la v0.41.0, sortie deux jours plus tôt. Une release aussi récente n'a pas encore eu le temps d'être éprouvée. Le binaire Node est vérifié par nvm (« Checksums matched »).

## Conséquences

- `npm run build`, `lint` et `check-env` fonctionnent sur le VPS.
- nvm est chargé par `~/.bashrc` : un shell **non interactif** (script, agent) doit d'abord faire `. ~/.nvm/nvm.sh`, sinon `node` est introuvable (constaté pendant l'installation).
- Aucun `.nvmrc` pour l'instant : `nvm use` ne choisit pas la version tout seul dans le dossier. À ajouter si plusieurs versions cohabitent.
- **À réviser** (nouvel ADR qui remplacera celui-ci) si : plusieurs agents doivent tourner en parallèle de façon isolée, on adopte Supabase en local (sa CLI repose déjà sur Docker), ou plusieurs postes doivent avoir un environnement identique.
