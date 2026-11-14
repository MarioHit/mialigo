# Mialigo — All your links in one place

> Building in public 🚀

Mialigo is a link-in-bio service: anyone can sign up, claim a page at `mialigo.com/<username>`, and manage their links from a dashboard. Live at **https://www.mialigo.com**.

## ✨ Features

- 🔐 **Passwordless auth** — sign up and log in with a magic link (Supabase Auth)
- 🧑 **Public profile pages** — server-rendered at `/<username>`, uppercase URLs redirect to lowercase
- 🖼️ **Profile** — username, name, bio, profile photo and banner (upload, Gravatar or GitHub import)
- 🧱 **Blocks** — links as blocks in three sizes, reordered by drag and drop, from the dashboard or directly on your own page (« Personnaliser »)
- 🎨 **Page themes** — four styles (Classique, Verre, Minimal, Néon), accent color, corner radius, and three layouts (grid, honeycomb, bubbles)
- 🔗 **Social network picker** — Font Awesome icons for Instagram, YouTube, TikTok, GitHub and more
- 🌓 **Dark/Light mode** with localStorage persistence
- 📄 **Legal pages** — terms, privacy, legal notice, contact, account deletion

See [`docs/features.md`](docs/features.md) for the full feature list and roadmap, the `docs/*-workflow.md` files for sequence diagrams of the signup, login and link-management flows, and [`CHANGELOG.md`](CHANGELOG.md) for what changed in each version.

## 📦 Tech Stack

- **Next.js** 16 (App Router, SSR)
- **React** 19
- **Supabase** — Auth + PostgreSQL with Row Level Security
- **Tailwind CSS** 4
- **TypeScript** 5
- **Font Awesome** 6.4
- Hosted on **Vercel**

## 🚀 Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your Supabase project credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. Set up the database by running [`supabase-auth-clean.sql`](supabase-auth-clean.sql) in the Supabase SQL editor. ⚠️ It drops and recreates the `users` and `links` tables, so don't run it on a database with data you want to keep (production only receives the non-destructive `supabase-*.sql` migrations). Configure the auth redirect URLs and email templates as described in [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`docs/mail-template-login.md`](docs/mail-template-login.md).

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## 🛠️ Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## 🌐 Deployment (Vercel)

The app is deployed on Vercel with server-side rendering (configured in `vercel.json`).

- Vercel deploys `main` to production and `pre-prod` to the staging site; every pull request gets a preview URL.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's **Settings → Environment Variables**.
- The custom domain `www.mialigo.com` is managed in Vercel (**Settings → Domains**), with DNS at OVH pointing `www` to `cname.vercel-dns.com`.
- Add your production URL to the Supabase Auth redirect URLs so magic links land on `/auth/callback`.

Environments, release process, checklist and troubleshooting are in [`DEPLOYMENT.md`](DEPLOYMENT.md); the development workflow (issues, PRs, checks, releases) is in [`docs/FACTORY.md`](docs/FACTORY.md).

## 📄 License

MIT License — feel free to use this for your own link page!

---

Made with ❤️ by Mario
