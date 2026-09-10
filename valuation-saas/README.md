# House Type Valuer — SaaS (production path)

A hosted, sellable web app that gives housing developers AI-assisted selling-price
valuations for the house types on a proposed scheme, grounded in **live web research**
(new-build asking prices + recent second-hand sold prices near the site). Built to be
run as a subscription SaaS: you host one deployment, hold the Anthropic API key, and bill
customers a margin via Stripe.

This lives alongside the simpler single-file tool in the repo root; this folder
(`valuation-saas/`) is the multi-tenant product.

## What's included

- **Accounts & teams** — email/password sign-in, one company account per customer with
  multiple users and roles (`owner` / `admin` / `member`), seat limits per plan, invite links.
- **Stripe billing** — subscription Checkout, the customer billing portal, and webhook-driven
  plan/seat/quota enforcement. Plans: Trial (free), Starter, Pro.
- **Saved projects & history** — every scheme and each valuation run is stored and revisitable.
- **Usage limits** — per-plan monthly valuation quota, enforced server-side.
- **Branded PDF export** — a per-valuation report PDF (your company name in the header).
- **Platform admin dashboard** — an owner-of-the-SaaS view (you) of customers, usage and
  estimated MRR, gated to the emails in `PLATFORM_ADMIN_EMAILS`.
- **The valuation engine** — Claude (`claude-sonnet-5` by default) with the live web-search tool.

## Tech

Node + Express, SQLite (`better-sqlite3`, zero external DB to run), `express-session`,
`bcryptjs`, `stripe`, `pdfkit`. Static front end (no build step) in `public/`.

## Quick start (local)

```sh
cd valuation-saas
cp .env.example .env      # then edit it (see below)
npm install
npm start                  # http://localhost:4000
```

Minimum to run and generate real valuations:

- `SESSION_SECRET` — any long random string.
- `ANTHROPIC_API_KEY` — your key (you pay; you bill customers a margin).
- `PLATFORM_ADMIN_EMAILS` — your email, to unlock the Admin dashboard.

Without Stripe keys the app still runs — everyone is on the free Trial plan (3 valuations/mo).

## Wiring up Stripe (to actually charge)

1. Create a Stripe account and two recurring **Products/Prices** (Starter, Pro).
2. Put the secret key and the two Price IDs in `.env`
   (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`).
3. Set up the webhook so subscription changes sync back:
   - Local: `stripe listen --forward-to localhost:4000/webhooks/stripe` and copy the
     signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Production: add an endpoint `https://YOUR_DOMAIN/webhooks/stripe` for the events
     `checkout.session.completed`, `customer.subscription.created|updated|deleted`, and
     copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Set `APP_URL` to your public URL (used for Checkout redirects and invite links).

Prices shown on the marketing/billing pages are display copy in `src/plans.js`
(`priceLabel`, `quota`, `seats`) — keep them in step with your Stripe Prices.

## Deploy

Any host that runs a Node process with a **persistent volume** works (Render, Railway, Fly,
a VPS). The SQLite DB and sessions live under `DATA_DIR` — mount a volume there, or the data
is lost on every restart/redeploy.

### Deploy to Render (recommended, uses `render.yaml`)

1. Push this repo to GitHub (done if you're reading this on GitHub).
2. In Render → **New → Blueprint** → pick this repo. Render reads `valuation-saas/render.yaml`
   and provisions a web service **with a 1 GB persistent disk mounted at `/data`**.
   - The disk requires a **paid** instance type (the free tier has no persistent disk and
     sleeps) — Render will prompt you to choose one.
3. Render prompts for the secret env vars (marked `sync: false` in the blueprint). Paste:
   `ANTHROPIC_API_KEY`, `PLATFORM_ADMIN_EMAILS` (your email), and — when ready to charge —
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`.
   `SESSION_SECRET` is auto-generated; `MODEL`/`DATA_DIR`/`NODE_ENV` are preset.
4. Deploy. Once it's live, copy the service URL and set **`APP_URL`** to it (e.g.
   `https://house-type-valuer.onrender.com`), then redeploy so Stripe redirects and invite
   links use the right domain.
5. Add the Stripe webhook (see "Wiring up Stripe" above) pointing at
   `https://YOUR_APP_URL/webhooks/stripe`, and paste its signing secret into
   `STRIPE_WEBHOOK_SECRET`.

Health check: `GET /api/health` returns `{"anthropic":true,...}` once the key is set.

Railway/Fly/VPS work the same way — run `node src/server.js` (or the Docker image), set the
same env vars, and attach a persistent volume at `/data`.

### Docker

```sh
docker compose up --build      # reads env from your shell / .env
```

Set `NODE_ENV=production` (enables secure cookies — must be served over HTTPS) and point
a persistent volume at `/data`.

## How quotas work

Each plan includes N valuations per **calendar month** (`src/plans.js`). A run is blocked
with HTTP 402 once the month's quota is used; it resets on the 1st (UTC). Paid quotas apply
only while the Stripe subscription is `active`/`trialing`; otherwise the account falls back
to the Trial allowance.

## Project layout

```
src/
  server.js            Express wiring (Stripe webhook mounted raw, then JSON)
  config.js            Env → config
  db.js                SQLite schema + connection
  plans.js             Plan catalogue (quota, seats, Stripe price mapping)
  auth.js              Passwords, sessions, guards
  usage.js             Monthly quota + seat accounting
  valuation.js         Claude + live web-search engine
  pdf.js               Branded PDF report (pdfkit)
  billing.js           Stripe checkout / portal / webhook
  routes/*.routes.js   auth, projects, team, billing, admin
public/                Static front end (landing, auth, app, billing, team, admin)
```

## Cost & margin (set your pricing above this)

Each valuation is one Claude call with several web searches. Your cost per run depends on
the model and number of searches; measure a few real runs (watch `usage` on the API) and
price your plans so the included quota comfortably exceeds cost. `MODEL` is configurable —
`claude-sonnet-5` balances quality and cost; a cheaper model lowers cost per run.

## ⚠ Before you sell — this is software, not the whole business

- **It's an indicative estimate, not a valuation.** The UI and PDF say so. If you market it
  near "valuation", get advice on RICS/【regulatory positioning and your professional-indemnity
  cover — presenting AI output as a formal valuation carries real liability.
- **Terms of service & privacy policy** — you're storing customer accounts and personal data;
  you need a privacy policy and ToS (UK GDPR). Add links before launch.
- **Anthropic usage policy** — you are reselling access to Claude; review the commercial terms.
- **Email** — invites currently return a link to copy/paste; wire an email provider
  (SendGrid/Postmark/SES) to send invites, receipts and password resets for a real product.
- **Password reset** — not included in v1; add it before charging.
- **Backups** — back up the SQLite volume (or migrate to Postgres) before you have real customers.
- **Security** — run behind HTTPS, keep `SESSION_SECRET` secret, rotate the Anthropic key if leaked.
