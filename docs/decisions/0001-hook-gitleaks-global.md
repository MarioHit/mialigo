# ADR-0001 : Hook gitleaks global avec chaînage des hooks locaux

- **Statut** : Acceptée
- **Date** : 2026-11-06
- **Issue / PR** : #34 / #35
- **Découle de** : —
- **Remplace** : —
- **Liée à** : [ADR-0003](0003-env-local.md), [ADR-0004](0004-regles-git-pr-pre-prod.md)

## Contexte

Des agents vont committer à la place d'un humain (software factory). Un secret commité dans un dépôt **public** est compromis même si le commit est retiré ensuite. Il faut donc bloquer les secrets **avant** le commit, sur tous les dépôts du VPS, et pas seulement sur Mialigo.

Contraintes : ne pas casser les hooks propres à chaque dépôt, ne rien exiger de projet par projet, et avoir un filet si le contrôle local est contourné.

## Options envisagées

1. **Framework `pre-commit` (Python)** : un `.pre-commit-config.yaml` par dépôt. *Pour* : standard, versionné. *Contre* : une installation par dépôt (`pre-commit install`), oubliable ; ajoute Python.
2. **husky (Node)** : *Pour* : versionné avec le projet. *Contre* : uniquement pour les projets JS, et à configurer dans chaque dépôt.
3. **`init.templateDir`** : copie un hook dans chaque `git init` / `git clone`. *Pour* : simple. *Contre* : ne couvre **pas** les dépôts existants, et les copies divergent ensuite.
4. **CI seule** (GitHub Actions) : *Pour* : impossible à contourner localement. *Contre* : le secret est déjà poussé, donc public, quand la CI le détecte.
5. **`core.hooksPath` global + chaînage** : un seul dossier de hooks pour tous les dépôts ; chaque hook relaie ensuite vers le hook local du dépôt.

## Décision et raison

**Option 5, plus la CI de l'option 4 comme filet.**

- `~/.config/git/hooks/pre-commit` lance `gitleaks git --pre-commit --staged --redact`, puis exécute `.git/hooks/pre-commit` du dépôt s'il existe.
- Les autres hooks (`commit-msg`, `pre-push`, …) sont des liens vers un relais `_chain`, qui exécute le hook local du même nom. Sans ce relais, `core.hooksPath` **désactiverait** silencieusement les hooks locaux de tous les dépôts.
- Si gitleaks est absent, le commit est **refusé** (*fail closed*) plutôt qu'accepté sans contrôle.
- `.github/workflows/gitleaks.yml` scanne chaque PR et chaque push vers `main` / `pre-prod`.

C'est la seule option qui couvre d'un coup les dépôts existants et futurs, sans réglage par projet, tout en gardant leurs hooks. Les options 1 et 2 dépendent d'une étape manuelle par dépôt. L'option 3 ignore l'existant. L'option 4 arrive trop tard si on l'utilise seule.

Installation : gitleaks v8.30.1 dans `/usr/local/bin`, somme sha256 vérifiée avec le `checksums.txt` de la release.

## Conséquences

- Testé : un commit contenant un faux jeton est bloqué ; un commit sain passe, et les hooks locaux `pre-commit` / `commit-msg` sont bien exécutés.
- Les faux positifs vérifiés vont dans `.gitleaksignore` (deux à ce jour : un en-tête JWT générique dans des exemples de doc).
- `git commit --no-verify` contourne le hook : c'est interdit par [ADR-0004](0004-regles-git-pr-pre-prod.md), et la CI reste le filet.
- Un dépôt qui définit son propre `core.hooksPath` local (husky) **passe outre** le hook global : il faut y ajouter gitleaks dans son propre hook.
- La configuration est propre à la machine et non versionnée : un autre poste ou un runner d'agents doit la reproduire (à scripter si on multiplie les machines).
