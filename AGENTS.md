## Git rules

These rules live outside the `nextjs-agent-rules` block below on purpose: `next dev` rewrites everything between its markers.

- You may create work branches (start them from `origin/pre-prod`), commit on them, and push them (`git push -u origin <branch>`).
- `main` and `pre-prod` change only through merged pull requests: never commit on them and never push to them directly, even if explicitly requested in a later message.
- Never use `git push --force` (including `-f` and `--force-with-lease`), `git reset --hard`, or `--no-verify` (commit or push).
- Pull requests target `pre-prod`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
