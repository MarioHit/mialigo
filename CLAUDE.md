# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build (also the only type-check gate besides `npx tsc --noEmit`)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`); runs on every PR (`.github/workflows/lint.yml`) and must stay at zero errors (`next build` no longer lints)
- `npm run check-env` — creates `.env.local` from `.env.example` if missing and lists (names only) the variables still unset

Node 24.x (`engines` in `package.json`, same major as Vercel; installed via nvm on the VPS). There is no test suite. Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Secrets

- Never read, print or edit `.env*` files (only `.env.example`, which holds placeholder values); `.claude/settings.json` denies it. Use `npm run check-env` to know what is missing.
- A global gitleaks `pre-commit` hook blocks commits containing secrets, and `.github/workflows/gitleaks.yml` scans every PR. Verified false positives go in `.gitleaksignore`; never bypass with `--no-verify`.

## What this is

Mialigo is a multi-user "link in bio" service (`mialigo.com/<username>`): passwordless magic-link signup/login, a dashboard to edit profile and links, and public SSR profile pages. Stack: Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase (Auth + Postgres with RLS). UI text, code comments and log messages are in French.

Production runs SSR on Vercel (`vercel.json`); the GitHub Actions workflows are `.github/workflows/gitleaks.yml` (secret scan), `.github/workflows/lint.yml` (`npm run lint`), `.github/workflows/release-pr.yml` (opens/updates the `pre-prod` → `main` release PR after each merge into `pre-prod`) and `.github/workflows/version-tag.yml` (creates the `vX.Y.Z` tag from `package.json` on each push to `main`), and there is no static export. Deployment docs: `DEPLOYMENT.md` (overview), `VERCEL-DEPLOYMENT.md` (initial setup), `DEPLOYMENT-CHECKLIST.md`. `docs/features.md` and the `docs/*-workflow.md` files (with sequence diagrams) are the up-to-date description of features and flows. `docs/decisions/` holds the ADRs (why things are done this way, and which options were rejected): read them before revisiting a past choice.

## Architecture

### Three Supabase clients in `lib/` — pick the right one

- `lib/supabase-auth.ts` — `supabaseClient` (browser, `@supabase/ssr` `createBrowserClient`, cookie-based session). Used by all `"use client"` pages: `/login`, `/signup`, `/dashboard`, and the public page's session check.
- `lib/supabase-server.ts` — `createSupabaseServerClient()` (server, reads/writes cookies via `next/headers`). Used by `app/auth/callback/route.ts` to establish the session.
- `lib/supabase.ts` — plain anonymous `createClient`, no session. Used by the server component `app/[username]/page.tsx` for public reads. Also holds the `User` / `Link` TS interfaces.

### Auth flow

- `/signup` checks username availability against `public.users`, then calls `signInWithOtp` with `username`/`name` in user metadata. `/login` calls `signInWithOtp` with `shouldCreateUser: false`.
- Email links land on `app/auth/callback/route.ts`, which handles both `token_hash`+`type` (`verifyOtp`, works cross-device/browser) and PKCE `code` (`exchangeCodeForSession`), then upserts a `public.users` row if missing (fallback in case the DB trigger hasn't run) and redirects to `next` (default `/dashboard`). The email template config is in `docs/mail-template-login.md` / `MAGIC-LINK-SETUP.md`.
- There is no middleware/proxy: the dashboard layout renders the client component `app/dashboard/dashboard-shell.tsx`, which checks `getSession()` and `router.push("/login")` itself, loads the profile and blocks, shares them (`user`, `profile`, `reloadProfile()`, `blocks`, `reloadBlocks()`, draft setters) with the sub-pages through `useDashboard()`, and renders the live preview from saved data plus unsaved drafts. `/dashboard` redirects to `/dashboard/profil`; links are edited on `/dashboard/blocs`. Authorization for writes relies entirely on Supabase RLS (`auth.uid() = id` / `= user_id`).

### Data model

`supabase-auth-clean.sql` is the current schema (destructive: drops and recreates tables — never run it on prod; prod changes ship as separate non-destructive `supabase-*.sql` scripts, mirrored into the clean schema and listed in order in its header).

`public.users` uses **column-level SELECT grants** (`supabase-fix-email-exposure.sql`): RLS lets everyone read every row, so `email` is hidden by not granting it to `anon`/`authenticated`. Consequences: always `select("id, username, …")` with explicit columns (never `select("*")`), never `.upsert()` on `users` (ON CONFLICT DO UPDATE needs read access to `email`) — use `.insert()` / `.update()` — and every new `users` column needs its own `GRANT SELECT (col) ON public.users TO anon, authenticated`. `public.users.id` references `auth.users(id)`; a `handle_new_user()` trigger creates the profile on signup. `users.avatar_url` / `users.banner_url` hold public URLs of images in the public Storage bucket `avatars` (`supabase-avatars.sql`, ADR-0016): each user writes only under `<auth.uid()>/`; uploads are resized in the browser (`app/dashboard/profil/profile-images.tsx`) and Gravatar/GitHub imports are copied there by the server action `app/dashboard/profil/actions.ts` (the email never leaves the session). `public.links` holds the page's **blocks** (ADR-0017, `supabase-blocks.sql`): `user_id`, `type` (CHECK list, `'link'` for now), `data` jsonb, `size` (`small`/`wide`/`large`), plus `title`, `url`, `icon` (Font Awesome class string) used by `link` blocks and a quoted `"order"` column. Read it with `BLOCK_COLUMNS` / `toBlocks()` from `lib/blocks.ts`; a new block type means extending `BLOCK_TYPES`, the `links_type_check` constraint (new migration) and the registry in `components/blocks/registry.tsx`. `components/profile-view.tsx` renders a page (header + blocks) for both `/<username>` and the dashboard's live preview. Blocks are laid out in a 2-column CSS grid (`BlockList`, sizes `small` 1×1 / `wide` 2×1 / `large` 2×2, default `wide`) and reordered in `/dashboard/blocs` with `@dnd-kit`, saved in one call to the `reorder_blocks(ids uuid[])` RPC (ADR-0018, `supabase-reorder-blocks.sql`). `supabase-schema.sql` is the older pre-auth schema.

### Routing and pages

- `app/[username]/page.tsx` — `force-dynamic` server component; redirects uppercase usernames to lowercase, `notFound()` if missing, then renders `user-page-client.tsx`. Static routes (`/login`, `/dashboard`, `/cgu`, …) take precedence over the dynamic segment, so a new top-level route effectively reserves that username.
- Legal pages (`cgu`, `confidentialite`, `mentions-legales`, `contact`, `suppression-compte`) share `app/legal-page.tsx`.
- Icons: Font Awesome 6.4 loaded from CDN in `app/layout.tsx`; links store the class string. `lib/social-networks.ts` is the catalog of networks and icon variants used by `app/dashboard/social-network-picker.tsx`.
- Theme: `app/theme-toggle.tsx` (rendered in the root layout) persists light/dark in `localStorage`; colors are CSS variables in `app/globals.css`.

### Logging convention

Files define a local `debug()` helper that only `console.log`s outside production; messages are tagged (`[Signup]`, `[Login]`, `[Auth/Callback]`, `[Dashboard]`, `[UserPage]`). Keep logs free of emails, user IDs, and tokens (recent commits scrubbed these). Errors use `console.error` / `console.warn` unconditionally.
