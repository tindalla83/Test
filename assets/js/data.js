/* ==========================================================================
   Bield — data + generative artwork
   All catalogue data lives here. Product/collection imagery is drawn as
   on-brand SVG (line-mark motifs on natural textures) so the site ships with
   no stock photography. Swap BIELD.art.* for real photography when ready.
   ========================================================================== */

(function () {
  "use strict";

  // Bield brand assets v1 palette. Legacy keys (fellGreen, bothyCream, …) are
  // kept pointing at the new tokens so the SVG art helpers keep working.
  var PALETTE = {
    ink: "#3E4548",        // slate
    ink2: "#2C3B33",       // bottle (deep)
    charcoal: "#3E4548",   // slate
    bark: "#6A7073",       // muted text
    oatmeal: "#E8E4DC",    // limestone
    sand: "#DEDAD1",       // limestone-96
    woolWhite: "#F6F4EF",  // off-white (never pure white)
    campfire: "#9A5B2E",   // bracken (accent/CTA)
    ember: "#8D9478",      // lichen (decoration)
    ochre: "#9A5B2E",      // bracken (stamps/accents)
    moss: "#2C3B33",       // bottle (outdoor/community)
    lake: "#3E4548",       // slate (Journal/knowledge)
    gorse: "#D9A317",
    peat: "#4A3B2E",
    // legacy aliases
    fellGreen: "#3E4548",
    fellGreen2: "#2C3B33",
    bothyCream: "#E8E4DC",
    bothyCream2: "#DEDAD1",
    bracken: "#9A5B2E",
    slate: "#3E4548",
    bilberry: "#2C3B33"
  };

  /* ---- Colourway swatches (natural, British earthy tones) ---- */
  var COLOURS = {
    "Fell Green": "#2F3E34",
    "Bracken": "#A5652B",
    "Slate": "#4A5157",
    "Bilberry": "#4B3A5A",
    "Oat": "#D8CBB0",
    "Ecru": "#EDE6D6",
    "Charcoal": "#33363A",
    "Moss": "#5A6B4B",
    "Rust": "#9C4A2E",
    "Storm Blue": "#3E5568",
    "Tan": "#B98A5E",
    "Peat": "#4B3B2E",
    "Stone": "#9A958A",
    "Damson": "#5E3A4E"
  };
  function colour(name) { return { name: name, hex: COLOURS[name] || "#888" }; }

  /* ---- Line-mark motifs (100x100 viewBox, stroked) ---- */
  var ICONS = {
    jacket: '<path d="M35 22l-13 7-6 16 9 4 3-8v45h44V41l3 8 9-4-6-16-13-7-8 6-8-6z"/><path d="M43 22l8 8 8-8M51 30v54"/>',
    waterproof: '<path d="M34 22l-13 8-5 15 9 4 3-7v44h44V46l3 7 9-4-5-15-13-8-9 7-8-6z"/><path d="M42 22l9 8 8-8M42 40v10M60 40v10M42 58v10"/>',
    fleece: '<path d="M34 24l-12 7-5 14 8 4 3-7v42h46V42l3 7 8-4-5-14-12-7-9 6-8-5z"/><path d="M28 40v42M74 40v42M42 30v52M60 30v52"/>',
    jumper: '<path d="M35 26l-14 8v14l7-2v34h44V46l7 2V34l-14-8-8 7-8-7z"/><path d="M30 44l0 34M72 44l0 34M43 33l8 6 8-6"/>',
    boot: '<path d="M30 22h16v30l30 14v14H24V56l6-4V22z"/><path d="M30 40h16M30 52l16 8M24 66h52M40 22v18"/>',
    flask: '<path d="M40 20h22v10l-3 5v45H43V35l-3-5V20z"/><path d="M37 20h28M43 44h16M43 56h16M43 68h16"/>',
    torch: '<path d="M32 34h30v18a15 15 0 01-30 0V34z"/><path d="M62 40l14-6v34l-14-6M32 43h30"/>',
    backpack: '<path d="M30 34a21 21 0 0142 0v46H30V34z" /><path d="M42 24a9 9 0 0118 0M40 48h20v18H40zM40 80v-6M60 80v-6"/>',
    holdall: '<path d="M20 44h60v30H20z"/><path d="M40 44a11 11 0 0122 0M20 58h60M46 44v30M56 44v30"/>',
    watch: '<circle cx="50" cy="50" r="17"/><path d="M50 40v10l7 4M42 33l3-12h12l3 12M42 67l3 12h12l3-12"/>',
    wallet: '<rect x="24" y="34" width="52" height="32" rx="4"/><path d="M24 44h52M62 50a5 5 0 000 10h14V50z"/>',
    multitool: '<path d="M30 30l40 40M34 26l-6 6 6 6M70 74l6-6-6-6"/><path d="M40 60l-12 12M60 40l12-12M46 46l-8 8M62 38l4 4"/>',
    gloves: '<path d="M36 44V30a4 4 0 018 0v12M44 42V26a4 4 0 018 0v16M52 42V28a4 4 0 018 0v16M60 44V34a4 4 0 018 0v20a20 20 0 01-40 0v-8l-6-4a4 4 0 015-6l7 6"/>',
    socks: '<path d="M40 22h14v30l16 14a10 10 0 01-14 14l-22-20V22z"/><path d="M40 30h14M34 60l16 14"/>',
    mug: '<path d="M30 34h34v34a12 12 0 01-12 12H42a12 12 0 01-12-12V34z"/><path d="M64 42h8a8 8 0 010 16h-8M30 44h34"/>',
    tankard: '<path d="M32 30h30v50H32z"/><path d="M62 40h10a7 7 0 010 14h-10M32 42h30M40 30v50M52 30v50"/>',
    grooming: '<path d="M42 24h16v10l-3 4v42H45V38l-3-4V24z"/><path d="M39 24h22M45 50h10M45 62h10" /><path d="M50 20v4"/>',
    whisky: '<path d="M36 32h28l-4 20v20a6 6 0 01-6 6H46a6 6 0 01-6-6V52l-4-20z"/><path d="M40 52h20M44 62h12"/>',
    bbq: '<circle cx="50" cy="46" r="18"/><path d="M38 34l24 24M32 46h36M50 64v18M40 82h20"/>',
    games: '<rect x="28" y="40" width="44" height="30" rx="4" transform="rotate(-8 50 55)"/><circle cx="42" cy="52" r="2.5"/><circle cx="58" cy="60" r="2.5"/><circle cx="50" cy="56" r="2.5"/>',
    cap: '<path d="M22 60a28 20 0 0156 0z"/><path d="M22 60a28 22 0 0148-12M50 40a20 8 0 0120 8"/>',
    beanie: '<path d="M26 58a24 26 0 0148 0z"/><path d="M26 58h48v8H26z" /><path d="M38 34v22M50 30v26M62 34v22"/>',
    robe: '<path d="M32 24l-8 8 4 8 4-3v44h36V45l4 3 4-8-8-8-14 6-14-6z"/><path d="M46 24v54M40 30l6 4 6-4"/>',
    crate: '<rect x="24" y="36" width="52" height="40" rx="3"/><path d="M24 50h52M50 36v40M32 28l8 8M68 28l-8 8"/><path d="M40 60h20"/>',
    overshirt: '<path d="M34 24l-12 7v13l8-2v42h40V42l8 2V31l-12-7-8 6-8-6z"/><path d="M42 24l8 6 8-6M50 30v54M40 44h4M40 56h4M40 68h4"/>',
    knife: '<path d="M28 62l30-30a14 14 0 0112 12L40 74z"/><path d="M28 62l-4 8 8-4M52 38l6 6"/>',
    trousers: '<path d="M36 22h28l-2 56h-12l-2-34-2 34H38z"/><path d="M36 22h28M50 22v12"/>',
    tee: '<path d="M38 24l-14 8 5 11 9-4v39h24V39l9 4 5-11-14-8-8 7-8-7z"/><path d="M42 24l8 7 8-7"/>',
    coffee: '<path d="M34 30h32l-2 48H36z"/><path d="M34 30l4-8h24l4 8M44 46h12M44 58h12"/>',
    candle: '<rect x="40" y="42" width="20" height="38" rx="2"/><path d="M50 42v-6"/><path d="M50 24c4 3 4 8 0 10-4-2-4-7 0-10z"/>',
    sunglasses: '<path d="M22 42h56"/><path d="M26 42h18v8a9 9 0 01-18 0z"/><path d="M56 42h18v8a9 9 0 01-18 0z"/><path d="M44 46h12"/>',
    razor: '<path d="M46 20h8v30h-8z"/><path d="M40 50h20l-3 12H43z"/><path d="M40 55h20"/>',
    blanket: '<rect x="26" y="32" width="48" height="36" rx="3"/><path d="M26 42h48M26 58h48M42 32v36"/>',
    notebook: '<rect x="34" y="26" width="34" height="48" rx="2"/><path d="M42 26v48M48 40h14M48 52h14"/>',
    board: '<path d="M36 34h28v36a4 4 0 01-4 4H40a4 4 0 01-4-4z"/><circle cx="50" cy="28" r="4"/>',
    brush: '<rect x="42" y="22" width="16" height="16" rx="2"/><path d="M44 38l-2 40h16l-2-40"/>',
    pen: '<path d="M42 22h16v42l-8 14-8-14z"/><path d="M42 40h16M50 64v10"/>',
    key: '<circle cx="40" cy="40" r="12"/><path d="M40 40l30 30M64 64l6-6M56 56l6-6"/>'
  };

  /* ---- Textured background variants (subtle, natural) ---- */
  function bgTexture(id, base, ink) {
    return '<defs><pattern id="grain' + id + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">' +
      '<rect width="6" height="6" fill="' + base + '"/>' +
      '<circle cx="1" cy="1" r="0.5" fill="' + ink + '" opacity="0.06"/>' +
      '<circle cx="4" cy="4" r="0.5" fill="' + ink + '" opacity="0.05"/></pattern></defs>';
  }

  /* Product artwork: a "studio" placeholder — motif on a natural ground with an
     IBM Plex Mono product code stamp and a ridge mark. `variant` shifts framing. */
  function productArt(product, variant) {
    variant = variant || 0;
    var c = product.colors && product.colors.length ? product.colors[Math.min(variant, product.colors.length - 1)] : colour("Fell Green");
    var ground = variant % 2 === 0 ? PALETTE.woolWhite : PALETTE.bothyCream;
    var motif = ICONS[product.icon] || ICONS.crate;
    var id = product.id + "-" + variant;
    var code = (product.code || "ML-000");
    // choose ink tone with contrast against ground
    var ink = c.hex;
    return '<svg viewBox="0 0 100 125" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(product.name) + '">' +
      bgTexture(id, ground, "#3E4548") +
      '<rect width="100" height="125" fill="url(#grain' + id + ')"/>' +
      // soft vignette circle behind motif
      '<circle cx="50" cy="54" r="34" fill="' + tint(c.hex, 0.10) + '"/>' +
      '<g transform="translate(0 6)" fill="none" stroke="' + ink + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + motif + '</g>' +
      // ridge mark bottom-left (decorative → ember)
      '<path d="M10 112l7-8 5 4 6-7 5 5 6-6" fill="none" stroke="' + PALETTE.ember + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>' +
      // product code stamp (mono label → bark)
      '<text x="90" y="116" text-anchor="end" font-family="Archivo Narrow, sans-serif" font-size="5.2" letter-spacing="1" fill="' + PALETTE.bark + '">' + esc(code) + '</text>' +
      '</svg>';
  }

  /* Product media: a real photo when the product has one, else generated art.
     Give a product an `images: [...]` array (one path per colour/variant, in the
     same order as its colours) and those photos take over everywhere. */
  function productMedia(product, variant) {
    variant = variant || 0;
    var imgs = product.images;
    if (imgs && imgs.length) {
      var src = imgs[Math.min(variant, imgs.length - 1)];
      return '<img src="' + esc(src) + '" alt="' + esc(product.name) + '" loading="lazy">';
    }
    return productArt(product, variant);
  }

  /* Landscape scene for tiles / heroes — layered fells + sky wash. */
  function scene(opts) {
    opts = opts || {};
    var sky = opts.sky || PALETTE.fellGreen;
    var mid = opts.mid || PALETTE.slate;
    var fore = opts.fore || PALETTE.fellGreen2;
    var accent = opts.accent || PALETTE.ember;
    var id = opts.id || Math.floor(Math.random() * 9999);
    var sun = opts.sun !== false;
    return '<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">' +
      '<defs><linearGradient id="sky' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + tint(sky, 0.22) + '"/><stop offset="1" stop-color="' + sky + '"/></linearGradient>' +
      bgTexture(id, "transparent", "#000") + '</defs>' +
      '<rect width="160" height="200" fill="url(#sky' + id + ')"/>' +
      (sun ? '<circle cx="118" cy="52" r="20" fill="' + tint(accent, 0.35) + '" opacity="0.55"/>' : "") +
      // far ridge
      '<path d="M0 118 L28 96 L52 112 L78 84 L104 108 L132 88 L160 106 V200 H0 Z" fill="' + tint(mid, 0.12) + '"/>' +
      // mid ridge
      '<path d="M0 140 L34 118 L60 134 L92 110 L120 132 L160 118 V200 H0 Z" fill="' + mid + '" opacity="0.85"/>' +
      // fore ridge
      '<path d="M0 168 L40 150 L74 166 L110 146 L140 164 L160 156 V200 H0 Z" fill="' + fore + '"/>' +
      '<rect width="160" height="200" fill="url(#grain' + id + ')"/>' +
      '</svg>';
  }

  /* Editorial artwork for journal cards / articles. */
  function editorial(opts) {
    opts = opts || {};
    var base = opts.base || PALETTE.slate;
    var accent = opts.accent || PALETTE.ember;
    var motif = opts.motif ? (ICONS[opts.motif] || "") : "";
    var id = opts.id || Math.floor(Math.random() * 9999);
    return '<svg viewBox="0 0 160 107" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">' +
      '<defs><linearGradient id="ed' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + tint(base, 0.18) + '"/><stop offset="1" stop-color="' + base + '"/></linearGradient>' +
      bgTexture(id, "transparent", "#000") + '</defs>' +
      '<rect width="160" height="107" fill="url(#ed' + id + ')"/>' +
      '<path d="M0 70 L34 52 L60 66 L92 44 L120 62 L160 48 V107 H0 Z" fill="' + PALETTE.fellGreen2 + '" opacity="0.7"/>' +
      '<circle cx="128" cy="30" r="13" fill="' + tint(accent, 0.3) + '" opacity="0.6"/>' +
      (motif ? '<g transform="translate(46 22) scale(0.66)" fill="none" stroke="' + PALETTE.bothyCream + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">' + motif + '</g>' : "") +
      '<rect width="160" height="107" fill="url(#grain' + id + ')"/>' +
      '</svg>';
  }

  /* ---- small helpers ---- */
  function tint(hex, amt) {
    var c = hex.replace("#", "");
    var r = parseInt(c.substring(0, 2), 16), g = parseInt(c.substring(2, 4), 16), b = parseInt(c.substring(4, 6), 16);
    r = Math.round(r + (255 - r) * amt); g = Math.round(g + (255 - g) * amt); b = Math.round(b + (255 - b) * amt);
    return "#" + [r, g, b].map(function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ======================= COLLECTIONS ======================= */
  var collections = [];

  /* ======================= PRODUCTS ======================= */
  // helper to build a product tersely
  var pid = 0;
  function P(o) {
    pid++;
    o.id = o.id || ("p" + pid);
    o.code = o.code || ("ML-" + String(100 + pid));
    o.rating = o.rating || (4 + Math.round(Math.random() * 10) / 10);
    o.reviews = o.reviews || (8 + ((pid * 7) % 90));
    o.badges = o.badges || [];
    o.sizes = o.sizes || ["One size"];
    o.colors = (o.colorNames || ["Fell Green"]).map(colour);
    return o;
  }

  // To use a real photo instead of the generated artwork, add an `images` array
  // to a product: one path per colour, in the same order as `colorNames`.
  // e.g. images: ["assets/img/products/ridgeway-jacket-green.jpg", ...]
  // See assets/img/products/README.md. Any product without `images` keeps the
  // generated SVG art, so you can switch products over one at a time.
  var products = [];


  /* ======================= JOURNAL ======================= */
  var articles = [];

  /* attach convenience arrays and helpers */
  function byCollection(slug) { return products.filter(function (p) { return p.collection === slug; }); }
  function get(id) { return products.filter(function (p) { return p.id === id; })[0]; }
  function getArticle(id) { return articles.filter(function (a) { return a.id === id; })[0]; }
  function collection(slug) { return collections.filter(function (c) { return c.slug === slug; })[0]; }

  function slugify(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // Build the public API object. `products`, `collections`, `articles` and
  // `site` are filled in once the content JSON has loaded (see below).
  var BIELD = {
    palette: PALETTE,
    colours: COLOURS,
    collections: collections,
    products: products,
    articles: articles,
    site: {},
    icons: ICONS,
    art: { product: productArt, media: productMedia, scene: scene, editorial: editorial, tint: tint },
    byCollection: byCollection,
    get: get,
    getArticle: getArticle,
    collection: collection,
    money: function (n) { return "£" + (Number(n) % 1 === 0 ? n : n.toFixed(2)); }
  };
  window.BIELD = BIELD;

  // ---- Load editable content from /content/*.json ------------------------
  // The catalogue and copy live in JSON files the CMS (/admin) edits. We fetch
  // them, build the products through P() (adds ids, colours, ratings), and
  // resolve window.BIELD_READY so store.js can render once the data is in.
  function getJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("Failed to load " + path + " (" + r.status + ")");
      return r.json();
    });
  }

  window.BIELD_READY = Promise.all([
    getJSON("content/site.json"),
    getJSON("content/collections.json"),
    getJSON("content/products.json"),
    getJSON("content/articles.json")
  ]).then(function (res) {
    var site = res[0] || {};
    var colls = (res[1] && res[1].collections) || [];
    var rawProducts = (res[2] && res[2].products) || [];
    var arts = (res[3] && res[3].articles) || [];

    // rebuild the arrays in place so the closures above see the new data
    collections.length = 0;
    colls.forEach(function (c) { collections.push(c); });

    products.length = 0;
    rawProducts.forEach(function (o) {
      var p = P(o);
      p.id = slugify(p.name);
      products.push(p);
    });

    articles.length = 0;
    arts.forEach(function (a) { articles.push(a); });

    BIELD.site = site;
    return BIELD;
  }).catch(function (err) {
    console.error("Bield: could not load site content —", err);
    var main = document.getElementById("main");
    if (main) {
      main.innerHTML = '<div style="padding:48px 20px;max-width:640px;margin:0 auto;font-family:Georgia,serif">' +
        '<h1>Bield</h1><p>Sorry — the shop content couldn’t load. Please refresh, or check back shortly.</p></div>';
    }
    throw err;
  });
})();
