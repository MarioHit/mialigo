<!-- Modèle de PR (software factory, docs/factory.md, ADR-0023). Cible : pre-prod. -->

Closes #

## Ce qui change

<!-- Pour l'utilisateur d'abord, en quelques lignes. -->

## Comment tester sur la preview Vercel

<!-- Un point par critère d'acceptation de l'issue. -->

- [ ] …

## ⚠️ Migration SQL

<!-- Supprimer cette section s'il n'y en a pas. Sinon : nom du script, et quand l'exécuter (avant / après le déploiement en prod). -->

## Definition of Done

- [ ] Les critères d'acceptation de l'issue sont tous vérifiés sur la preview
- [ ] `CHANGELOG.md` : une ligne pour l'utilisateur, avec `([#issue])` et son lien
- [ ] Version : `package.json` / `package-lock.json` (comparée à `main`, cf. AGENTS.md)
- [ ] ADR ajoutée ou remplacée si un choix technique a été fait (index à jour)
- [ ] Migration SQL non destructive, réexécutable, reportée dans `supabase-auth-clean.sql` (liste ordonnée de l'en-tête)
- [ ] Documentation à jour (`docs/`, `CLAUDE.md`)
- [ ] Aucun secret, aucun email dans le code, les logs ni la PR
- [ ] Tous les checks sont verts

ADR : <!-- ex. ADR-0022 ajoutée, ou « aucune » -->
