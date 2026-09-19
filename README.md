# Bield

A storefront for **Bield** — a one-stop men's shop and community: kit,
knowledge and good company for men who want to get out there and lead, with
gift buyers a welcome second audience. Built to the
[Bield design system](#brand): earthy, muted and quietly confident, in the
format of a modern content-led shop — but entirely its own look, copy and
imagery. (A *bield* is a Cumbrian word for shelter — the drystone wall or
hollow on a fellside where you get out of the weather, take stock and set off
better equipped.)

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
assets/img/favicon.svg       Bield mark (bield-in-plan)
render.yaml                  Render static-site blueprint
```

The header, footer and every product/collection view are rendered by
`store.js`, which routes on the `data-page` attribute. Catalogue content lives in
`assets/js/data.js` — edit the `products`, `collections` and `articles` arrays
there to change what the shop sells.

## <a name="brand"></a>Brand

Everything on screen follows the **Bield brand assets v1 (Sep 2026)** — a
one-stop men's shop *and community*: kit, knowledge and good company for men who
want to get out there and lead, with gift buyers a welcome second audience.

- **Palette** — `slate #3E4548` (structure, body text, nav, primary buttons),
  `limestone #E8E4DC` (page ground) and `limestone-96 #DEDAD1` (cards, panels,
  fields) carry ~85% of every screen. Accents: `bracken #9A5B2E` (the signature
  colour — CTAs, hover, prices, stars), `peat #4A3B2E` (footers / deep panels),
  `lichen #8D9478` (secondary, dividers, "new" badges, decoration),
  `gorse #D9A317` (the one saturated hit — sale tags only, under 5%),
  `bottle #2C3B33` (deep sections) and `oxblood #6B2F2A` (rare editorial). Never
  pure white or black; no more than two accents per screen. Tokens are custom
  properties at the top of `styles.css` (internal names kept, brand names in
  comments).
- **Type** — Newsreader for display headlines (serif, weight 400, sentence
  case), Archivo for body/UI and component titles, Archivo Narrow for small
  uppercase labels and product codes.
- **Shape** — square-edged: 2px radius throughout; square photography and
  packaging; pill radius reserved for collection tags. No drop shadows —
  separation comes from a hairline border or a change of background.
- **Voice** — warm not macho, knowledgeable not technical, wry not silly, honest
  not salesy. British spelling throughout.
- **Logo** — the Bield mark is a *sheep bield drawn in plan*: a plus of five
  squares (four wall-arms from a centre), square ends, no outline. It's rendered
  inline from `currentColor` in `store.js` (so it inherits the section's colour)
  and saved as `assets/img/bield-mark.svg` / `favicon.svg`.

### Imagery

The site ships with **no stock photography**. Product, collection and journal
images are drawn as on-brand SVG (line-mark motifs on natural textures) by the
`BIELD.art.*` helpers in `data.js`, using the design-system palette. The logos
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

- Run UKIPO/EUIPO searches for "Bield" in classes 25, 35 and 18 and get IP
  clearance before trading. "Bield" is a dialect word used in Scotland as well
  as Cumbria, and at least one large Scottish organisation trades under it, so
  check carefully across classes and sectors.
- Swap the generative SVG artwork for real photography (real people in British
  landscapes; product shots on wool-white or natural textures).
- Replace placeholder contact details, legal/footer links and the demo checkout.
