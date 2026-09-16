# Mallory

A storefront for **Mallory** — the UK's one-stop shop for men who like the
outdoors, good kit and things made to last, and the easiest place to buy a gift
they'll actually use. Built to the [Mallory brand guidelines](#brand): a curated
men's lifestyle store with gifting at its heart, in the format of a modern
content-led shop like Huckberry — but entirely its own look, copy and imagery.

Plain **HTML, CSS and vanilla JavaScript**. No build step, no dependencies, no
framework. Designed to be hosted on [Render](https://render.com) as a static
site.

## Running it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## What's here

| Page | File | Notes |
| --- | --- | --- |
| Home | `index.html` | Hero, collections, most-gifted, gift finder promo, bestsellers, journal |
| Shop | `shop.html` | Filter by collection, category, price and gift-ready; sort; search (`?q=`) |
| Collection | `collection.html?c=graft` | One of the five collections |
| Product | `product.html?id=…` | Gallery, colour/size options, gift note, add to basket |
| Gift finder | `gift-finder.html` | Three-tap flow: who → what he's like → budget |
| Journal | `journal.html` | Editorial index |
| Article | `article.html?id=…` | Journal story |
| Our story | `about.html` | Brand story and values |
| Basket | `cart.html` | Line items, quantities, free-delivery progress, gift wrap |
| Wishlist | `wishlist.html` | Saved products (per browser) |
| Account | `account.html` | Sign-in shell (needs a backend to go live) |
| Not found | `404.html` | Served by Render for unknown routes |

### File layout

```
index.html, shop.html, …     Page shells (each sets <body data-page="…">)
assets/css/styles.css        Design system — palette tokens at the top
assets/js/data.js            Catalogue data + on-brand generative SVG artwork
assets/js/store.js           Header/footer, cart, wishlist and page rendering
assets/img/favicon.svg       Ridge-line mark
render.yaml                  Render static-site blueprint
```

The header, footer and every product/collection view are rendered by
`store.js`, which routes on the `data-page` attribute. Catalogue content lives in
`assets/js/data.js` — edit the `products`, `collections` and `articles` arrays
there to change what the shop sells.

## <a name="brand"></a>Brand

Everything on screen follows the Mallory brand guidelines:

- **Palette** — Fell Green `#2F3E34`, Bothy Cream `#F2EBDD`, Bracken `#A5652B`,
  Slate `#4A5157`, Bilberry `#4B3A5A`, Wool White. Roughly 60% cream, 30% green
  and slate, 10% bracken and bilberry. Defined as custom properties at the top of
  `styles.css`.
- **Type** — Playfair Display (headlines), Inter (body/UI), Space Mono (labels
  and product codes).
- **Voice** — warm not macho, honest not salesy, British spelling throughout.
- **Logo** — spaced serif "MALLORY" wordmark with a mountain-ridge line mark,
  locked up as "MALLORY · Est. 2026 · Carlisle".

### Imagery

The site ships with **no stock photography**. Product, collection and journal
images are drawn as on-brand SVG (line-mark motifs on natural textures) by the
`MALLORY.art.*` helpers in `data.js`. When you have real photography, replace
those helper calls (or swap the returned SVG for `<img>` tags) — the layout is
built to take real images at the same aspect ratios.

## Going live as a real shop

The basket is fully working client-side (stored in `localStorage`), but
**checkout is a demo** — taking payment needs a backend or a hosted checkout.
Two clean options for a static site on Render:

1. **[Snipcart](https://snipcart.com)** — add its script and a public API key,
   then tag the "Add to basket" buttons with `data-item-*` attributes. Works
   without a server.
2. **[Stripe](https://stripe.com)** — use Stripe Checkout with a small serverless
   function (Render supports this) to create sessions.

Accounts, order tracking and the newsletter form are likewise front-end shells
ready to point at your provider (e.g. Mailchimp/Klaviyo for the newsletter).

## Deploying to Render

1. Push this repository to GitHub.
2. In Render, choose **New + → Blueprint** and select the repo — it reads
   `render.yaml` and provisions the static site.
   *Or* choose **New + → Static Site**, leave the **Build Command** blank and set
   the **Publish Directory** to `.`.
3. Add your custom domain in the Render dashboard, then update the `og:url` and
   `canonical` tags in `index.html`.

## Before launch (from the brand guidelines)

- Run UKIPO/EUIPO searches for "Mallory" in classes 25, 35 and 18 and get IP
  clearance. Don't describe Mallory as "the UK Huckberry" in marketing.
- Use the George Mallory quote as a theme only — no image, signature or implied
  family endorsement (subject to a legal check).
- Replace placeholder contact details, legal/footer links and the demo checkout.
