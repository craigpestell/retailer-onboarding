# Start Your Store: BC setup guide

Step-by-step onboarding checklist for a new retailer setting up an online store in British Columbia. Phase 1: static guide, progress saved in the browser (localStorage), no login.

## Run

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

## Edit the content

Each step is a Markdown file in `content/bc/`, ordered by filename prefix (`01-…`, `02-…`).
Frontmatter: `title`, `summary`, `time`, `cost`, optional `linkLabel`/`linkUrl`, and `checklist` (list of tasks).
The body is Markdown. Reordering or editing checklist items resets those items' saved ticks, because progress is keyed by step slug and item position.

## Before sharing

Rules, fees and links were written from general knowledge and have **not** been verified against the official sites. Check every fee, link and threshold (BC Registry, CRA, eTaxBC, municipal licence) and have an accountant review.

## Roadmap

- Phase 2: login (magic link), database-backed progress, saved BN/GST/PST numbers
- Phase 3: filing-deadline reminders, reseller-account unlock on ultralove.ca, other provinces as templates
