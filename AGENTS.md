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

- Every piece of work starts from a GitHub issue. If none exists, create it first. Name the branch `<type>/<issue>-<slug>` (e.g. `docs/36-adr`) and put `Closes #<issue>` in the PR description.
- As soon as you start working on an issue (before creating its branch), move it to **In progress** in the GitHub Project « Mialigo » (see `docs/decisions/0007-in-progress-debut-travail.md`): find the item with `gh project item-list 17 --owner MarioHit` (if the issue is missing, add it with `gh project item-add 17 --owner MarioHit --url <issue-url>`), then `gh project item-edit --project-id PVT_kwHOAOWs6c4BqaRS --id <item> --field-id PVTSSF_lAHOAOWs6c4BqaRSzhoxh2k --single-select-option-id 47fc9ee4`. Full cycle: Backlog → In progress (work starts) → In review (merged into `pre-prod`) → Done (closed on `main`).
- Every significant technical choice, and every option deliberately set aside, gets an ADR in `docs/decisions/`: copy `0000-modele.md` to the next number, list the options considered, and add it to the index in `docs/decisions/README.md`. The PR description cites the ADRs it adds or supersedes. Never rewrite an accepted ADR to change its decision: write a new one that supersedes it.

## Changelog and versions

See `docs/decisions/0010-versionnage-semver-tags.md`.

- Every PR except version PRs (see below) adds at least one line to `CHANGELOG.md`, under `## [Unreleased]` and the right category: `Ajouté`, `Modifié`, `Obsolète`, `Supprimé`, `Corrigé`, `Sécurité`, or `Interne` for changes with no visible effect on the site. Write it in French **for the user**: what changes for them, in plain words, without file names, code or jargon. End it with the issue number, `([#<issue>])`, and add the matching `[#<issue>]: https://github.com/MarioHit/mialigo/issues/<issue>` link at the bottom of the file.
- Every production release gets a [semantic version](https://semver.org/). While the version is `0.x`: bump MINOR if `Unreleased` has at least one `Ajouté`, `Modifié`, `Supprimé` or `Obsolète` line, otherwise PATCH. Moving to `1.0.0` is the maintainer's decision.
- **Before** the maintainer merges the release PR (`pre-prod` → `main`), open a version PR to `pre-prod` (its own issue, branch `release/<issue>-v<X.Y.Z>`) that:
  1. renames `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD` (the planned release date) and adds an empty `## [Unreleased]` above it;
  2. updates the links at the bottom: `[Unreleased]: https://github.com/MarioHit/mialigo/compare/vX.Y.Z...HEAD` and `[X.Y.Z]: https://github.com/MarioHit/mialigo/compare/v<previous>...vX.Y.Z`;
  3. sets the version with `npm version X.Y.Z --no-git-tag-version` (updates `package.json` and `package-lock.json`).

  A version PR adds no line of its own to `Unreleased`: its job is to turn `Unreleased` into the new version section.

  Until the version PR is merged, `release-pr.yml` keeps the release PR in **draft** (same version in `package.json` on `pre-prod` and `main`, see `docs/decisions/0014-garde-fou-version.md`) and turns it back to ready once the version changes. A release PR in draft means: open the version PR. Never mark it ready by hand.
- Never create the version tag by hand: on every push to `main`, the workflow `.github/workflows/version-tag.yml` reads the version from `package.json` and creates the annotated tag `vX.Y.Z` if it does not exist yet (see `docs/decisions/0011-tag-version-automatique.md`). After a release, check that it succeeded: `gh run list --workflow version-tag.yml --limit 1`, then `git ls-remote --tags origin vX.Y.Z`. Never move, delete or force-push an existing tag.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
