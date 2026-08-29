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
