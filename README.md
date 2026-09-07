# Viability consultancy website

A single-page marketing site for a specialist development viability consultancy.
Plain HTML, CSS and a little vanilla JavaScript — no build step, no dependencies.

## Running it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Files

```
index.html            All page content
assets/css/styles.css Styling (palette variables at the top of the file)
assets/js/main.js     Mobile menu, footer year, enquiry form handling
```

## What to change before going live

Anything in `[square brackets]` is a placeholder:

- **Practice name** — "Meridian Viability" appears in the `<title>`, header, footer and
  Open Graph tags. Search and replace.
- **Hero statistics** — the four `[000+]`-style figures. Use real numbers or delete the
  `.hero__stats` block entirely.
- **About section** — your name, qualifications, background, RICS registration,
  PI cover, and coverage area.
- **Contact details** — `hello@example.com` and `+44 (0)1234 567 890` appear in
  `index.html` (contact section and footer) and in `assets/js/main.js`.
- **Company registration** and the privacy notice / terms links in the footer.
- **Canonical and `og:url`** — set to your real domain.

## Enquiry form

There is no backend. On submit the form validates and then opens the visitor's mail
client with the details pre-filled. To take submissions properly, replace the submit
handler in `assets/js/main.js` with a `fetch()` POST to a form service (Formspree,
Netlify Forms, your own endpoint) and add a privacy notice covering how enquiries are stored.

## Colours

Defined as custom properties at the top of `assets/css/styles.css` — change `--navy`
and `--accent` to rebrand the whole site.

---

## House Type Valuation Tool

A small Node/Express app that gives developers AI-generated indicative selling-price
predictions for a list of house types on a development, using Claude with live web
search to research current new-build asking prices and recent second-hand sold prices
near the site. Linked from the marketing site's nav ("Valuation Tool").

### Running it

```sh
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm start               # or: node server.js
```

Then visit http://localhost:3000 (or `PORT` from `.env`, if set).

The server boots and serves the tool even without an API key — only a submitted
valuation request will fail, with a clear "Server is not configured with an Anthropic
API key" message, until `ANTHROPIC_API_KEY` is set.

### Files

```
server.js              Express app + POST /api/valuation (Claude + web search)
package.json           Dependencies (@anthropic-ai/sdk, express, dotenv)
.env.example           ANTHROPIC_API_KEY, optional MODEL and PORT
public/index.html      Tool UI (location + repeatable house type rows)
public/css/app.css     Tool styling, layered on assets/css/styles.css's palette
public/js/app.js       Form handling, fetch to /api/valuation, results rendering
```

### How it works

The developer enters a development location and one or more house types (name, sqft,
bedrooms, parking, typology). The backend validates the input, then sends a single
request to Claude with the web search tool enabled, asking it to research comparable
new-build asking prices and recent Land Registry / portal sold prices for each house
type, reconcile the two, and return strict JSON with a predicted price, price range,
£/sqft, confidence level, market summary and comparables per house type, plus an
overall area market overview. The model, request timeout and other defaults can be
tuned via `.env` (see `.env.example`).

**These are AI-generated indicative estimates, not a formal RICS valuation** — a
disclaimer to that effect is shown on the tool itself.

---

## Production SaaS (`valuation-saas/`)

A full, sellable hosted version of the tool lives in [`valuation-saas/`](valuation-saas/):
customer accounts and teams, Stripe subscriptions with per-plan usage quotas, saved
projects and valuation history, branded PDF export, and a platform-admin dashboard —
wrapping the same live web-search valuation engine. See
[`valuation-saas/README.md`](valuation-saas/README.md) for setup, Stripe wiring, deployment,
and the pre-launch checklist.
