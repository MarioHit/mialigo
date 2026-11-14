# ADR-0026 : Commande /story pour préparer les issues, sans rien créer sans accord

- **Statut** : Acceptée
- **Date** : 2026-11-14
- **Issue / PR** : #127
- **Découle de** : [ADR-0023](0023-software-factory.md), [ADR-0025](0025-etapes-interchangeables.md)
- **Remplace** : —
- **Liée à** : [ADR-0024](0024-carte-factory-commande.md)

## Contexte

L'étape « Préparation de l'issue » (rôle PO) doit produire une issue qui respecte la Definition of Ready (ADR-0025). Jusqu'ici, elle dépendait de la conversation du moment : selon les jours, Claude posait plus ou moins de questions, oubliait de chercher une issue existante, ou créait l'issue sans montrer le brouillon. Le mainteneur, débutant, n'a pas à se souvenir de toutes les règles (modèles, DoR, labels de priorité, Project, epic, « blocked by »). L'erreur de la #20 (l'idée réelle n'était pas écrite, d'où la PR #97 à côté) montre ce que coûte une issue mal préparée.

## Options envisagées

1. **Une commande Claude Code `.claude/commands/story.md`** qui décrit la démarche pas à pas : lecture du contexte, recherche de doublons, questions à choix limitées, découpage, maquette, brouillon conforme au modèle, contrôle de la DoR critère par critère, création **seulement après accord**. _Pour_ : même démarche à chaque fois, versionnée dans le dépôt, le mainteneur garde la décision. _Contre_ : dépend de Claude Code ; une commande est une consigne, pas une garantie.
2. **Une skill** (`.claude/skills/`) que Claude charge seul quand il reconnaît une demande d'issue. _Pour_ : pas besoin de taper la commande. _Contre_ : déclenchement implicite, moins prévisible pour un débutant ; le mainteneur veut décider quand on prépare une issue.
3. **Un sous-agent** (`.claude/agents/`) dédié au rôle de PO. _Pour_ : contexte séparé. _Contre_ : il ne peut pas dialoguer directement avec le mainteneur (questions à choix, validation du brouillon), or c'est le cœur de l'étape.
4. **Une GitHub Action** qui vérifie la DoR à l'ouverture d'une issue. _Pour_ : automatique. _Contre_ : ne vérifie que la forme (champs remplis), pas la qualité du besoin ; garde l'idée pour plus tard, en complément.
5. **Création directe sans brouillon.** _Contre_ : contraire au principe « le mainteneur valide », et une issue créée à tort pollue le suivi.

## Décision et raison

Option 1. La commande est explicite (on la tape quand on veut), elle peut dialoguer, et elle se recopie avec la factory. L'option 2 est écartée pour son déclenchement implicite, la 3 parce que le dialogue est indispensable, la 4 parce qu'elle ne juge pas le fond (elle reste possible en complément), la 5 parce qu'elle retire la validation du mainteneur.

Règles retenues dans la commande :

- elle se lance seulement quand le mainteneur la tape : `disable-model-invocation: true` empêche Claude de la déclencher de lui-même ;
- elle ne code pas, ne crée pas de branche et ne passe rien en In progress (c'est l'étape `/ship`) ;
- rien n'est créé ou modifié sur GitHub sans accord explicite sur le brouillon final ;
- au plus 4 questions, à choix, avec une recommandation, et jamais ce que le dépôt dit déjà ;
- le brouillon reprend exactement les sections du modèle et nomme chaque critère de la DoR (leçon de la #119) ;
- la priorité devient un label (`P0-sécurité`, `P1` à `P4`), comme l'annonce le modèle d'issue.

## Conséquences

- La préparation d'une issue suit toujours la même démarche ; le mainteneur peut toujours écrire une issue à la main (ADR-0025).
- La commande lit les identifiants du GitHub Project dans `AGENTS.md` au lieu de les recopier ; le nom du dépôt y reste en dur, à centraliser avec la factory portable (#128).
- Les issues créées avant cette ADR n'avaient pas toujours leur label de priorité ; celles encore ouvertes de l'epic #103 sont complétées.
- À réviser si le mainteneur préfère un déclenchement automatique (skill) ou si une Action de contrôle de la DoR est ajoutée.
