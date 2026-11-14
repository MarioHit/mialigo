---
description: Prépare une issue « prête » (Definition of Ready) à partir d'une idée en vrac, rôle PO ; ne crée rien sans accord
argument-hint: <idée ou besoin en vrac>
---

Tu joues le rôle de **PO** (Product Owner) pour l'étape 1 du parcours de `docs/FACTORY.md`, « Préparation de l'issue ». Réponds en français, en mots simples : le mainteneur débute.

- **Entrée** : l'idée ou le besoin brut du mainteneur : $ARGUMENTS
- **Sortie attendue** : une issue GitHub qui respecte la **Definition of Ready** de `docs/FACTORY.md`, rangée dans le GitHub Project en Backlog.

Si l'idée ci-dessus est vide, demande-la en une phrase et arrête-toi là.

## Interdits

- Pas de code, pas de branche, pas de commit, pas de passage en In progress : c'est l'étape suivante (`/ship`).
- **Rien n'est créé ni modifié sur GitHub sans l'accord explicite du mainteneur** sur le brouillon final (création d'issue, commentaire, modification d'une issue existante, labels, liens).
- Jamais d'email, de mot de passe, de clé ni de jeton dans une issue.

## 1. Comprendre le contexte (lecture seule)

Lis avant de poser la moindre question :

- `docs/FACTORY.md` : sections « Definition of Ready » et « 1. Préparation de l'issue » ;
- `.github/ISSUE_TEMPLATE/user-story.yml` et `bug.yml` : les sections exactes à produire ;
- `docs/features.md` : ce qui existe déjà et la feuille de route du produit ;
- `AGENTS.md` (Workflow rules) : labels, GitHub Project, liens entre issues ;
- au besoin, le code concerné, seulement pour vérifier qu'une idée est faisable ou ce qu'elle touche (base de données, migration, écran).

## 2. Chercher les doublons

Cherche les issues qui recoupent l'idée, avec plusieurs mots-clés :

```bash
gh issue list --state open --search "<mots-clés>" --limit 20 --json number,title,labels
gh issue list --state closed --search "<mots-clés>" --limit 10 --json number,title,closedAt
```

Si une issue ouverte couvre déjà le besoin, présente-la (numéro, titre, ce qui manque) et **propose de la compléter** plutôt que d'en créer une nouvelle. Si une issue fermée l'a déjà livré, dis-le. Laisse le mainteneur choisir.

## 3. Clarifier, avec le moins de questions possible

1. Décide s'il s'agit d'une **user story** (fonctionnalité, amélioration, outil) ou d'un **bug** (quelque chose ne marche pas comme prévu).
2. Liste ce que la Definition of Ready exige et que tu ne peux pas déduire : pour qui, quoi, pourquoi, ce qui est hors périmètre, priorité, dépendances ; pour un bug, les étapes, l'attendu, l'obtenu, l'environnement.
3. Pose **seulement** ces questions-là, en une fois (4 au maximum), avec l'outil de questions à choix. Pour chacune, propose des réponses concrètes et mets ta recommandation en premier. Ne demande jamais ce que le dépôt ou la conversation disent déjà.

## 4. Vérifier la taille et le visuel

- **Trop gros pour une PR** (plusieurs écrans, plusieurs migrations, des parties livrables séparément) : propose une **epic** et ses **sous-issues**, chacune utile seule, avec l'ordre et les dépendances.
- **Changement visuel important** (nouvel écran, nouvelle disposition) : propose une **maquette HTML**, publiée comme page privée pour que le mainteneur la voie. L'issue n'est pas prête tant qu'il ne l'a pas validée. La maquette sera commitée dans `docs/maquettes/` par la PR de développement ; l'issue donne son lien dans « Pistes techniques et maquettes ».

## 5. Rédiger le brouillon

Présente le brouillon complet, **exactement avec les sections du modèle**, nommées comme dans le modèle :

- **User story** (`user-story.yml`) : « User story » (En tant que… je veux… afin de…), « Critères d'acceptation » (une ligne « Étant donné…, quand…, alors… » par cas vérifiable sur la preview), « Hors périmètre », « Pistes techniques et maquettes » (données, migration SQL, maquette), « Dépend de », « Priorité ».
- **Bug** (`bug.yml`) : « Étapes pour reproduire », « Résultat attendu », « Résultat obtenu », « Où », « Appareil et navigateur ».

Indique aussi : le **titre**, les **labels** (`enhancement`, `bug` ou `tech`, plus la priorité `P0-sécurité` ou `P1` à `P4`), l'**epic** parente éventuelle et les issues qui la **bloquent** (« blocked by »).

Puis contrôle la Definition of Ready **critère par critère**, en nommant chaque critère (pas « le 3e ») :

| Critère de la Definition of Ready | ✅ / ❌ | Pourquoi |
| --------------------------------- | ------- | -------- |

Si un critère est ❌, corrige le brouillon ou pose la question qui manque, puis refais le contrôle. Termine par la liste de ce que tu as **supposé** sans que le mainteneur l'ait dit.

## 6. Attendre l'accord

Demande explicitement : « Je crée cette issue ? » (ou « Je complète l'issue #n ? »). Applique les changements demandés et représente le brouillon jusqu'à l'accord. Sans accord, ne crée rien.

## 7. Créer et ranger (après accord seulement)

1. Écris le corps dans un fichier temporaire, puis `gh issue create --title "…" --label "…" --body-file <fichier>` (ou `gh issue edit` / `gh issue comment` pour compléter une issue existante).
2. Ajoute l'issue au GitHub Project « Mialigo » en **Backlog**, avec les commandes et identifiants donnés dans `AGENTS.md` (Workflow rules ; option Backlog : `f75ad846`). Elle peut y être déjà, ajoutée automatiquement : cherche-la avec `gh project item-list` avant de l'ajouter.
3. Rattache-la à son epic : `gh api repos/MarioHit/mialigo/issues/<epic>/sub_issues -F sub_issue_id=<id numérique de l'issue>` (l'id s'obtient avec `gh api repos/MarioHit/mialigo/issues/<n> -q .id`).
4. Ajoute chaque blocage : `gh api repos/MarioHit/mialigo/issues/<n>/dependencies/blocked_by -F issue_id=<id numérique de l'issue bloquante>`.
5. Relis l'issue créée (`gh issue view <n>`) et vérifie titre, sections, labels, statut et liens ; corrige ce qui manque.
6. Rends compte en quelques lignes : le lien, le statut, l'epic, les blocages, et la prochaine étape (`/ship #<n>` quand le mainteneur veut la développer).
