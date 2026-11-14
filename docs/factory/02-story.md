# Étape 2 : la commande /story (préparation de l'issue, rôle PO)

- **Issue** : [#127](https://github.com/MarioHit/mialigo/issues/127) (epic [#103](https://github.com/MarioHit/mialigo/issues/103))
- **ADR** : [ADR-0026](../decisions/0026-commande-story.md)
- **Statut** : en cours ; en place une fois la PR de mise en prod mergée dans `main`

## a. Avant : ce qui se passait

- **La préparation dépendait de la conversation du moment.** Le mainteneur décrivait son idée, et Claude posait plus ou moins de questions selon les jours.
- **L'idée réelle pouvait ne pas être écrite.** Exemple : la #20 (« forme des blocs ») ne disait pas qu'il s'agissait d'une disposition globale en nid d'abeille ou en bulles ; la PR #97 a donc implémenté autre chose, et il a fallu une nouvelle issue (#98) et une maquette.
- **Rien ne garantissait la recherche de doublons**, le découpage d'une idée trop grosse, ni le contrôle de la Definition of Ready avant de créer l'issue.
- **Les labels de priorité étaient souvent oubliés** : la priorité était écrite dans le texte de l'issue, mais pas en label (#115, #118, #127…).
- **Le mainteneur devait se souvenir des règles** : modèles, DoR, Project, epic, « blocked by ».

## b. Ce qui change

### Dans le processus

1. Le mainteneur tape **`/story`** suivi de son idée en vrac, dans Claude Code.
2. Claude **lit le contexte** (DoR, modèles d'issue, fonctionnalités existantes) et **cherche les doublons** dans les issues ouvertes et fermées ; si l'idée existe déjà, il propose de compléter l'issue existante.
3. Il pose **au plus 4 questions à choix**, avec sa recommandation, seulement sur ce qu'il ne peut pas déduire.
4. Si l'idée est trop grosse, il propose une **epic et ses sous-issues** ; si elle est visuelle, une **maquette HTML** à valider.
5. Il présente le **brouillon** avec les sections exactes du modèle, les labels (dont la priorité), l'epic et les blocages, un **contrôle de la DoR critère par critère** et la liste de ce qu'il a supposé.
6. **Seulement après l'accord** du mainteneur, il crée l'issue, la range en Backlog, la rattache à son epic et à ses blocages, puis la relit.

### Impacts

- **Pour le mainteneur** : une commande à taper au lieu de se souvenir des règles ; quelques questions à choix ; une validation avant création. Il peut toujours écrire une issue à la main.
- **Pour les agents / développeurs** : la démarche est écrite dans `.claude/commands/story.md` ; elle s'arrête à l'issue prête (pas de code, pas de branche).
- **Sur les outils et la CI** : un fichier de commande, une ADR, cette fiche. Aucun check en plus, aucun coût.
- **Limites** :
  - la commande est une consigne pour Claude, pas un contrôle automatique : une Action qui vérifie la forme de l'issue reste possible plus tard ;
  - le nom du dépôt et l'option Backlog y sont écrits en dur, à centraliser avec la factory portable (#128) ;
  - elle ne fonctionne que dans Claude Code.

## c. Après : le résultat

- Chaque issue préparée avec `/story` respecte la Definition of Ready, avec sa priorité en label et ses liens.
- Pas de doublon créé par mégarde, pas d'issue trop grosse, pas de changement visuel sans maquette.
- Rien n'est créé sans l'accord du mainteneur.

**Pour vérifier soi-même** :

1. Dans Claude Code, taper `/story` suivi d'une idée : Claude pose ses questions, puis montre un brouillon et le tableau de la DoR, sans rien créer.
2. Répondre « oui » : l'issue apparaît dans le Project en Backlog, avec son label de priorité.
