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

Everything on screen follows the current Mallory **design system (v3)** — a
one-stop men's shop *and community*: kit, knowledge and good company for men who
want to get out there and lead, with gift buyers a welcome second audience.

- **Palette** — `ink #232220` (structure, logo, primary buttons), `charcoal
  #4A4640` (body), `bark #6B5E52` (muted), `oatmeal #F5EFE3` (ground) and `sand
  #E8DAC0` (panels) carry ~85% of every screen. Accents: `campfire #A8461F` (the
  one CTA colour — add-to-basket, sale, links), `ember #D9774A` (decoration
  only), `ochre #D9A33B` (New badges, stars), `moss #5C6B3C` (Fellside / outdoors)
  and `lake #35586A` (Journal / knowledge). No more than two accents per screen.
  Tokens are custom properties at the top of `styles.css`.
- **Type** — Fraunces for headlines (SemiBold, sentence case, axes
  `"SOFT" 100, "WONK" 0`), Figtree for body and UI, IBM Plex Mono for small
  uppercase labels and product codes.
- **Shape** — square-edged: 2px radius on buttons, inputs and cards; square
  photography and packaging; pill radius reserved for collection tags.
- **Voice** — warm not macho, knowledgeable not technical, wry not silly, honest
  not salesy. British spelling throughout.
- **Logo** — the real design-system SVGs in `assets/img/`: `mallory-horizontal.svg`
  (header), `mallory-stacked-reversed.svg` (footer, oatmeal on ink),
  `mallory-mark.svg` (the Lakeland ridge mark, favicon) and `mallory-rider.svg`
  (the vintage-scrambler rider, used for the community sections).

### Imagery

The site ships with **no stock photography**. Product, collection and journal
images are drawn as on-brand SVG (line-mark motifs on natural textures) by the
`MALLORY.art.*` helpers in `data.js`, using the design-system palette. The logos
are the genuine brand SVGs exported from the design system.

**To use real product photos:** drop image files into `assets/img/products/` and
add an `images` array to that product in `assets/js/data.js` — one path per
colour, in the same order as its `colorNames`. Products with an `images` array
show the photo everywhere (cards, gallery, thumbnails, basket); products without
one keep the generated art, so you can switch over one at a time. Full
instructions and the recommended 4:5 / wool-white format are in
[`assets/img/products/README.md`](assets/img/products/README.md).

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

## Before launch

- Run UKIPO/EUIPO searches for "Mallory" in the relevant classes and get IP
  clearance before trading.
- Swap the generative SVG artwork for real photography (real people in British
  landscapes; product shots on wool-white or natural textures).
- Replace placeholder contact details, legal/footer links and the demo checkout.
