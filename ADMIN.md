# Editing your site (the `/admin` content manager)

Your storefront now has a built-in, no-code editor at **`/admin`** (e.g.
`https://your-site.onrender.com/admin/`). You log in with GitHub, edit
products, prices, homepage/About/Journal text and images through simple forms,
and hit **Publish**. Publishing saves the change to GitHub, and Render
redeploys automatically — your change is live in about a minute.

It's built on [Sveltia CMS](https://github.com/sveltia/sveltia-cms). There's a
**one-time setup** (about 15 minutes) to switch the login on. After that, you
just visit `/admin` and edit.

---

## What you can edit

| Section in `/admin` | Controls |
| --- | --- |
| **Products** | Every product: name, maker, collection, category, price, sale price, badges, colours, sizes, photos, and the "why / who for / sizing / gift" blurbs. Add, remove and reorder items. |
| **Collections** | The five collections — name, tagline, description and photo. |
| **Journal** | Journal articles — title, category, excerpt, date, and the body (with subheadings and quotes). |
| **Site & page text** | The announcement bar, the whole homepage's wording and hero image, the About/Our Story page, the Journal page intro, and the footer. |

Images you add through the editor are stored in `assets/img/uploads/`.

---

## One-time setup (do this once)

The editor needs a way to log you into GitHub. That's two free pieces: a GitHub
"OAuth App" (the permission) and a tiny Cloudflare Worker (the login relay).

### Step 1 — Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (link: <https://github.com/settings/developers>).
2. Fill in:
   - **Application name:** `Bield CMS` (anything).
   - **Homepage URL:** your site, e.g. `https://your-site.onrender.com`.
   - **Authorization callback URL:** `https://bield-cms-auth.YOUR-SUBDOMAIN.workers.dev/callback`
     — you'll get the real address in Step 2; you can come back and fix it.
3. Click **Register application**.
4. Note the **Client ID**, then **Generate a new client secret** and note that
   too. (Treat the secret like a password.)

### Step 2 — Deploy the login relay (Cloudflare Worker)

This is a ready-made worker; you don't write any code.

1. Create a free account at <https://dash.cloudflare.com> if you don't have one.
2. Follow the "Deploy to Cloudflare" button and instructions here:
   <https://github.com/sveltia/sveltia-cms-auth> (it deploys the worker for you).
3. In the Worker's **Settings → Variables**, add:
   - `GITHUB_CLIENT_ID` = the Client ID from Step 1
   - `GITHUB_CLIENT_SECRET` = the Client Secret from Step 1
   - `ALLOWED_DOMAINS` = your site domain, e.g. `your-site.onrender.com`
     (add `*.onrender.com` while testing if you like).
4. Copy the Worker's URL — it looks like
   `https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev`.
5. Go back to your GitHub OAuth App (Step 1) and set the **callback URL** to
   that Worker URL **+ `/callback`**.

### Step 3 — Point the editor at your relay

Edit **`admin/config.yml`** in this repo (you can do it on GitHub directly):

```yaml
backend:
  name: github
  repo: tindalla83/Test
  branch: claude/quirky-clarke-2g6ub8   # ← the branch Render deploys (see below)
  base_url: https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev   # ← your Worker URL
```

- **`base_url`** — paste your Worker URL from Step 2 (no `/callback` here).
- **`branch`** — must be the branch Render publishes. Right now that's
  `claude/quirky-clarke-2g6ub8`. If you later merge everything into `main` and
  point Render at `main`, change this one line to `main`.

Commit that change. That's it — the setup is done.

---

## Everyday use

1. Go to **`https://your-site.onrender.com/admin/`**.
2. Click **Sign in with GitHub** and authorise (first time only).
3. Pick a section, make your changes.
4. Click **Publish** (top of the editor).
5. Wait ~1 minute for Render to redeploy, then refresh your site.

### Tips

- **Prices** are just numbers (e.g. `129`). Add a **"Was price"** to show a
  strike-through sale price and a Sale badge.
- **Photos:** use the image button on any photo field to upload. Landscape
  photos ~1600px wide work best; the site handles the sizing.
- **Article body:** type normally. Start a line with `## ` for a subheading and
  `> ` for a pulled quote.
- **Slugs** (the `slug`/`id` fields) form the web address of a product,
  collection or article — changing one changes its link, so avoid editing them
  after launch.
- Every publish is an ordinary GitHub commit, so nothing is ever lost — you can
  see the history (and undo) in the repository if needed.

## Troubleshooting

- **"Failed to authenticate" / login popup closes:** the callback URL on the
  GitHub OAuth App must exactly equal your Worker URL + `/callback`, and your
  domain must be in the Worker's `ALLOWED_DOMAINS`.
- **Edits don't appear on the site:** check `branch` in `admin/config.yml`
  matches the branch Render deploys, and give Render a minute to rebuild.
- **Can't see the editor at all:** make sure you're visiting `/admin/` (with the
  trailing slash).
