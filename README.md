# Start Your Store: BC setup guide

Step-by-step onboarding checklist for a new retailer setting up an online store in British Columbia. Anonymous visitors: progress saved in the browser (localStorage), nothing sent to a server.
Optional account (magic-link email login): progress saved to Postgres and synced across devices. Ticks already in the browser are merged into the account on first sign-in.

## Run

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

In Claude Code cloud sessions, `.claude/hooks/session-start.sh` installs dependencies, starts a local Postgres, writes a `.env.local` for it (if none exists) and runs the migrations. Government sites are blocked from the cloud, so guide screenshots are captured on a local machine.

## Edit the content

Each region has a folder of steps, `content/<code>/` (`bc`, `on`, …). The home page lists every province, territory and state from `research/queue.json`; a region becomes a live guide as soon as its `content/<code>/` folder exists, and stays "coming soon" until then. Routes are `/<code>` and `/<code>/steps/<slug>`.

To add a region, run the three agents in `.claude/agents/` in order. Each commits on its own branch for you to review and merge:

1. `jurisdiction-researcher` researches the next `pending` region from official sources into `research/jurisdictions/<id>.md` and marks it `researched`.
2. `guide-editor` writes `content/<code>/` from that research in the house style, marks it `done`, and checks it. Ask it to "review" to audit every live guide for consistency instead.
3. `guide-screenshotter` writes the region's capture scripts and checks each annotated image against its caption. Cloud sessions can't reach most government sites, so captures may need running locally.

`npm run content:check` (optionally `-- <code>`) checks frontmatter, checklist style, numbering, step cross-references and the screenshot manifest.

Checklist ticks for BC keep their original unprefixed ids (`pst:2`); other regions are prefixed (`on:hst:1`). The business details page is BC-only for now.

Step screenshots are per region: capture scripts live in `guides/capture/<code>/`, images in `public/guides/<code>/<step>/`, and each `guides/manifest.json` entry carries a `region`. Run one with `npm run guides:capture guides/capture/<code>/<step>.mts`.

Each step is a Markdown file, ordered by filename prefix (`01-…`, `02-…`).
Frontmatter: `title`, `summary`, `time`, `cost`, optional `linkLabel`/`linkUrl`, and `checklist` (list of tasks).
The body is Markdown. Reordering or editing checklist items resets those items' saved ticks, because progress is keyed by step slug and item position.

## Before sharing

Rules, fees and links were written from general knowledge and have **not** been verified against the official sites. Check every fee, link and threshold (BC Registry, CRA, eTaxBC, municipal licence) and have an accountant review.

## Accounts setup (Phase 2)

Copy `.env.example` to `.env.local` and fill it in. For local dev only `DATABASE_URL` is needed:
without `RESEND_API_KEY` the sign-in link is printed in the dev server console, and Turnstile is skipped.

    createdb retailer_onboarding_dev
    npm run db:migrate

Production needs: `DATABASE_URL` (e.g. Neon via Vercel Marketplace; run `npm run db:migrate` against it),
`RESEND_API_KEY` + `EMAIL_FROM` (verified sending domain), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`
(production fails closed without Turnstile), `ADMIN_EMAIL` (only this account can open `/admin`), and `APP_URL`.

Notes: sign-in tokens are hashed, single use and expire in 15 minutes; the link opens a confirm page so email scanners
can't consume it. Sign-in requests are rate limited (3 per email per 15 min, 10 per IP per hour). State-changing API calls
require a same-origin `Origin` header. Account deletion cascades to sessions and progress.

## Roadmap

- Phase 3: filing-deadline reminders, reseller-account unlock on ultralove.ca, other provinces as templates
