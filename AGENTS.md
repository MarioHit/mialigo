## Git rules

These rules live outside the `nextjs-agent-rules` block below on purpose: `next dev` rewrites everything between its markers.

- You may create work branches (start them from `origin/pre-prod`), commit on them, and push them (`git push -u origin <branch>`).
- `main` and `pre-prod` change only through merged pull requests: never commit on them and never push to them directly, even if explicitly requested in a later message.
- Never use `git push --force` (including `-f` and `--force-with-lease`), `git reset --hard`, or `--no-verify` (commit or push).
- Pull requests target `pre-prod`.
- You may merge a PR into `pre-prod` only when **all** its checks have completed and passed: run `gh pr checks <n> --watch` first, and do not merge if any check is failing, pending or cancelled. Merge with `gh pr merge <n> --merge`; never use `--admin` or `--auto` (the ruleset only requires `Scan des secrets`, so `--auto` would merge without waiting for the other checks, such as Vercel).
- Never merge a PR into `main`, even if explicitly requested in a later message: the maintainer does it.
- Right after merging a PR into `pre-prod` (see `docs/decisions/0005-apres-merge-pre-prod.md` and `docs/decisions/0008-pr-mise-en-prod-automatique.md`):
  1. **Release PR**: the workflow `.github/workflows/release-pr.yml` creates the PR `pre-prod` → `main`, or appends the merged PR's description to the one already open (whoever merged). Check it: `gh run list --workflow release-pr.yml --limit 1`, then `gh pr list --base main --head pre-prod --state open` must show a PR whose description contains `<!-- release-pr:<n> -->` for the PR you merged. Only if the workflow failed, do it by hand (`gh pr create --base main --head pre-prod`, or `gh pr edit` on the **open** one) with the same content, and say so. Never edit a release PR that is already merged or closed.
  2. **Project status**: move the issue to **In review** in the GitHub Project « Mialigo » (`gh project item-list 17 --owner MarioHit` to find the item, then `gh project item-edit --project-id PVT_kwHOAOWs6c4BqaRS --id <item> --field-id PVTSSF_lAHOAOWs6c4BqaRSzhoxh2k --single-select-option-id df73e18b`). Done is set by GitHub when the issue closes on `main`.

## Workflow rules

- The delivery chain (Definition of Ready / Done, issue and PR templates, roadmap) is described in `docs/FACTORY.md` (ADR-0023). Issues follow `.github/ISSUE_TEMPLATE/` (user story with acceptance criteria « Étant donné / Quand / Alors », or bug), also when created with `gh issue create --body`; PR descriptions follow `.github/pull_request_template.md` and tick its Definition of Done. A factory step PR (epic #103) also adds its step sheet `docs/factory/NN-<slug>.md` from `docs/factory/00-modele.md` (a. before, b. what changes in the process and its impacts, c. after) and updates the roadmap in `docs/FACTORY.md` and `docs/factory.html`.
- Any PR that changes how the factory works (workflows in `.github/`, issue/PR templates, `.claude/` settings, commands, agents or skills, or the rules in this file) also updates `docs/FACTORY.md` in the same PR (ADR-0024). The `/factory` command (`.claude/commands/factory.md`) compares that file with the repository and lists the gaps; it changes nothing without the maintainer's approval.
- Every piece of work starts from a GitHub issue. If none exists, create it first. Name the branch `<type>/<issue>-<slug>` (e.g. `docs/36-adr`) and put `Closes #<issue>` in the PR description.
- As soon as you start working on an issue (before creating its branch), move it to **In progress** in the GitHub Project « Mialigo » (see `docs/decisions/0007-in-progress-debut-travail.md`): find the item with `gh project item-list 17 --owner MarioHit` (if the issue is missing, add it with `gh project item-add 17 --owner MarioHit --url <issue-url>`), then `gh project item-edit --project-id PVT_kwHOAOWs6c4BqaRS --id <item> --field-id PVTSSF_lAHOAOWs6c4BqaRSzhoxh2k --single-select-option-id 47fc9ee4`. Full cycle: Backlog → In progress (work starts) → In review (merged into `pre-prod`) → Done (closed on `main`).
- After each fix for a review comment (Copilot or human), before pushing: re-read the whole modified passage, not just the changed words, and compare it with its source (the template, file, code or rule it describes), item by item. Always name the items you refer to (« the box "all checks are green" ») instead of giving their position (« the last two boxes »), which breaks silently when the source is reordered. Then reply to the comment with the fixing commit and resolve the thread.
- Every error found in review (Copilot or human) is logged in `docs/factory/lecons.md`, in the same PR as its fix: date, what happened, cause, PR, status. Statuses: « vue une fois » (first time), « récurrente » (the same error or cause comes back: complete the existing row instead of adding one, and propose a rule), « devenue une règle » (a written rule in this file, the PR template or the DoD now prevents it; cite it), « automatisée » (a check detects it; cite the check).
- Every significant technical choice, and every option deliberately set aside, gets an ADR in `docs/decisions/`: copy `0000-modele.md` to the next number, list the options considered, and add it to the index in `docs/decisions/README.md`. The PR description cites the ADRs it adds or supersedes. Never rewrite an accepted ADR to change its decision: write a new one that supersedes it.

## Changelog and versions

See `docs/decisions/0010-versionnage-semver-tags.md` and `docs/decisions/0015-version-par-pr.md`. There is no separate version PR: every PR updates the version itself.

- Every PR adds at least one line to `CHANGELOG.md`, in the right category: `Ajouté`, `Modifié`, `Obsolète`, `Supprimé`, `Corrigé`, `Sécurité`, or `Interne` for changes with no visible effect on the site. Write it in French **for the user**: what changes for them, in plain words, without file names, code or jargon. End it with the issue number, `([#<issue>])`, and add the matching `[#<issue>]: https://github.com/MarioHit/mialigo/issues/<issue>` link at the bottom of the file.
- Every PR also sets the [semantic version](https://semver.org/) of the next release. Compare the version in `package.json` on `main` (in production: `git show origin/main:package.json`) with the one on your branch (from `pre-prod`). While the version is `0.x`, your PR needs a MINOR bump if its line is `Ajouté`, `Modifié`, `Supprimé` or `Obsolète`, otherwise a PATCH bump. Moving to `1.0.0` is the maintainer's decision.
  1. **Same version as `main`** (nothing pending): bump from the `main` version, add a new `## [X.Y.Z] - YYYY-MM-DD` section (today's date) at the top of the changelog with your line, and the link `[X.Y.Z]: https://github.com/MarioHit/mialigo/compare/v<main version>...vX.Y.Z` at the bottom.
  2. **Already ahead of `main`** (another PR started the next version): add your line to that top section and set its date to today. If your PR needs MINOR and the pending version is only a PATCH of `main`, raise it to the next MINOR (`0.3.1` → `0.4.0`): rename the section and its link.
  3. Set `package.json` and `package-lock.json` with `npm version X.Y.Z --no-git-tag-version` whenever the version changes.
  4. If `pre-prod` moved while your PR was open (conflict on `package.json` or `CHANGELOG.md`), merge `origin/pre-prod` into your branch and redo steps 1–3 from the new state.
  5. Right before merging your PR into `pre-prod`, run `git fetch origin` and compare again with `git show origin/main:package.json`: if a release reached `main` while your PR was open (its version now equals your pending version, and its tag exists), your lines sit in a version already in production. Move them to a new section bumped from the new `main` version and redo step 3, before merging.
- Never create the version tag by hand: on every push to `main`, the workflow `.github/workflows/version-tag.yml` reads the version from `package.json` and creates the annotated tag `vX.Y.Z` if it does not exist yet (see `docs/decisions/0011-tag-version-automatique.md`). After a release, check that it succeeded: `gh run list --workflow version-tag.yml --limit 1`, then `git ls-remote --tags origin vX.Y.Z`. Never move, delete or force-push an existing tag.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
