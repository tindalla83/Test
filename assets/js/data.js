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
    knife: '<path d="M28 62l30-30a14 14 0 0112 12L40 74z"/><path d="M28 62l-4 8 8-4M52 38l6 6"/>'
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
  var collections = [
    { slug: "graft", name: "Graft", tagline: "The working man", desc: "Kit that earns its keep — workwear, boots and tools built to take a beating.", scene: { sky: "#4A3B2E", mid: "#8D9478", fore: "#2C3B33", accent: "#9A5B2E" } },
    { slug: "fellside", name: "Fellside", tagline: "The outdoor man", desc: "For the walker, fell runner and wild swimmer. Waterproofs, packs and trail kit.", scene: { sky: "#2C3B33", mid: "#8D9478", fore: "#2C3B33", accent: "#E8E4DC" } },
    { slug: "sunday-best", name: "Sunday Best", tagline: "The gentleman", desc: "Smart-casual things made well — knitwear, leather and a watch to keep.", scene: { sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33", accent: "#9A5B2E" } },
    { slug: "off-shift", name: "Off Shift", tagline: "The weekend man", desc: "Pub, football and the barbecue. Easy kit for time off.", scene: { sky: "#4C4E4C", mid: "#686A66", fore: "#191815", accent: "#B09A6B" } },
    { slug: "the-crate", name: "The Crate", tagline: "Gifting, sorted", desc: "Curated gift boxes, wrapped, carded and ready to give.", scene: { sky: "#232220", mid: "#4C4E4C", fore: "#191815", accent: "#C2907C" } }
  ];

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
  var products = [
    /* ---------------- GRAFT ---------------- */
    P({ name: "Ridgeway Waxed Work Jacket", maker: "Fenwick & Sons", collection: "graft", category: "Clothing", icon: "jacket", price: 129, badges: ["bestseller"], colorNames: ["Fell Green", "Peat", "Slate"], images: ["assets/img/products/91842_Flint_and_Tinder_Waxed_Harrington_Jacket_Olive_01_PXLZ.avif"], sizes: ["S", "M", "L", "XL", "XXL"],
      why: "Waxed cotton that shrugs off Lakeland drizzle and only looks better with age.", whoFor: "The man who's always outside fixing something.", sizing: "Runs true to size; size up for layers underneath.", giftBecause: "He'll wear it every weekend for the next ten years." }),
    P({ name: "Grafter Leather Work Boots", maker: "Cumbria Bootworks", collection: "graft", category: "Footwear", icon: "boot", price: 165, badges: ["most-gifted"], colorNames: ["Tan", "Peat", "Charcoal"], sizes: ["7", "8", "9", "10", "11", "12"],
      why: "Goodyear-welted and resoleable, so a scuff is never the end.", whoFor: "Anyone on their feet all day.", sizing: "Standard fit; take your usual size.", giftBecause: "A proper pair of boots he'd never buy himself." }),
    P({ name: "Ten-Tool Pocket Multi", maker: "Brindle Tools", collection: "graft", category: "Gear", icon: "multitool", price: 58, badges: ["new"], colorNames: ["Slate", "Fell Green"],
      why: "Ten tools that actually lock, in a brushed-steel body that lives in a pocket.", whoFor: "The fixer, the fettler, the camping dad.", sizing: "One size.", giftBecause: "The gift he'll use every single week." }),
    P({ name: "Site Flask 1L", maker: "Kelder", collection: "graft", category: "Gear", icon: "flask", price: 34, colorNames: ["Fell Green", "Bracken", "Charcoal"],
      why: "Keeps a brew hot for twelve hours, dents-and-all guaranteed for life.", whoFor: "Early starts and long shifts.", sizing: "1 litre.", giftBecause: "A daily reminder you were thinking of him." }),
    P({ name: "Waxed Canvas Tool Roll", maker: "Brindle Tools", collection: "graft", category: "Gear", icon: "crate", price: 45, colorNames: ["Oat", "Peat"],
      why: "Rolls flat, hangs on a nail, keeps chisels where they should be.", whoFor: "The tidy sort, or the one who should be.", sizing: "Fits 12 tools.", giftBecause: "Practical, handsome and personalisable." }),
    P({ name: "Suede Rigger Gloves", maker: "Hartside", collection: "graft", category: "Gear", icon: "gloves", price: 28, colorNames: ["Tan", "Charcoal"], sizes: ["M", "L", "XL"],
      why: "Split-suede palms that soften as they work.", whoFor: "Log-splitters and bonfire-builders.", sizing: "Snug at first; they give.", giftBecause: "A small, useful surprise in a stocking." }),

    /* ---------------- FELLSIDE ---------------- */
    P({ name: "Skiddaw 3-Layer Waterproof", maker: "Fellside Kit", collection: "fellside", category: "Clothing", icon: "waterproof", price: 189, oldPrice: 219, badges: ["sale", "bestseller"], colorNames: ["Storm Blue", "Fell Green", "Rust"], sizes: ["S", "M", "L", "XL"],
      why: "Fully taped seams and a proper hood — 20k waterproof, still breathes on the climb.", whoFor: "The hillwalker who checks the forecast and goes anyway.", sizing: "Athletic; room for a fleece.", giftBecause: "It'll get him out of the house in any weather." }),
    P({ name: "Blencathra Grid Fleece", maker: "Fellside Kit", collection: "fellside", category: "Clothing", icon: "fleece", price: 78, badges: ["most-gifted"], colorNames: ["Moss", "Slate", "Oat"], sizes: ["S", "M", "L", "XL"],
      why: "Grid-backed fleece that traps warmth without the bulk.", whoFor: "Layer-uppers and shed-dwellers alike.", sizing: "Regular fit.", giftBecause: "The mid-layer he'll live in from October to April." }),
    P({ name: "Wainwright 28L Daypack", maker: "Roam", collection: "fellside", category: "Gear", icon: "backpack", price: 95, colorNames: ["Fell Green", "Charcoal", "Rust"],
      why: "One good pack for a day on the tops — roll-top, hip belt, room for a flask.", whoFor: "Day-walkers and commuters.", sizing: "28 litres.", giftBecause: "Sized for exactly the adventures he keeps talking about." }),
    P({ name: "Fell Runner Headtorch 400", maker: "Lumen North", collection: "fellside", category: "Gear", icon: "torch", price: 42, badges: ["new"], colorNames: ["Charcoal", "Bracken"],
      why: "400 lumens, USB-C, light enough to forget you're wearing it.", whoFor: "Dark mornings and night descents.", sizing: "One size.", giftBecause: "Genuinely useful, and he won't have one this good." }),
    P({ name: "Merino Trail Socks (3 pack)", maker: "Wooler", collection: "fellside", category: "Clothing", icon: "socks", price: 24, colorNames: ["Moss", "Slate", "Oat"], sizes: ["S/M", "L/XL"],
      why: "Merino cushioning that won't blister or stink.", whoFor: "Every walker, ever.", sizing: "Two size bands.", giftBecause: "The gift men are secretly delighted by." }),
    P({ name: "Wild Swim Changing Robe", maker: "Coldwater Co.", collection: "fellside", category: "Gear", icon: "robe", price: 69, badges: ["bestseller"], colorNames: ["Storm Blue", "Fell Green", "Damson"], sizes: ["S/M", "L/XL"],
      why: "Sherpa-lined and windproof, for the shivery bit after a cold dip.", whoFor: "Wild swimmers and touchline parents.", sizing: "Generous; goes over clothes.", giftBecause: "For the dad who's discovered cold water and won't shut up about it." }),

    /* ---------------- SUNDAY BEST ---------------- */
    P({ name: "Lambswool Crew Jumper", maker: "Alderley Knitwear", collection: "sunday-best", category: "Clothing", icon: "jumper", price: 88, badges: ["most-gifted"], colorNames: ["Bilberry", "Moss", "Oat", "Slate"], sizes: ["S", "M", "L", "XL"],
      why: "Spun and knitted in the Scottish Borders from proper lambswool.", whoFor: "The man who's earned a nice jumper.", sizing: "Classic fit.", giftBecause: "Soft, smart and impossible to get wrong." }),
    P({ name: "Bridle Leather Card Wallet", maker: "Currier & Bell", collection: "sunday-best", category: "Accessories", icon: "wallet", price: 52, colorNames: ["Peat", "Tan", "Charcoal"],
      why: "English bridle leather that patinas beautifully; free monogram.", whoFor: "The overstuffed-wallet upgrader.", sizing: "Six cards plus notes.", giftBecause: "Small, personal and used every day." }),
    P({ name: "Explorer Field Watch", maker: "Dalefield Watch Co.", collection: "sunday-best", category: "Accessories", icon: "watch", price: 145, badges: ["bestseller"], colorNames: ["Fell Green", "Charcoal", "Storm Blue"],
      why: "A clean field watch on a waxed strap — 100m water resistant, quietly handsome.", whoFor: "The one who still likes to wear a watch.", sizing: "38mm case.", giftBecause: "A proper keepsake at a sensible price." }),
    P({ name: "Sandalwood Grooming Set", maker: "Hearth & Hollow", collection: "sunday-best", category: "Grooming", icon: "grooming", price: 46, badges: ["gift"], colorNames: ["Bracken"],
      why: "Face wash, balm and beard oil, all cedar and sandalwood, all UK-made.", whoFor: "The low-key groomer.", sizing: "Full-size trio.", giftBecause: "Boxed and ribboned, it looks like you tried." }),
    P({ name: "Waxed Holdall Weekender", maker: "Currier & Bell", collection: "sunday-best", category: "Accessories", icon: "holdall", price: 160, colorNames: ["Fell Green", "Peat"],
      why: "A weekend's worth of kit in waxed canvas and bridle leather.", whoFor: "Mini-break takers and stag-do survivors.", sizing: "40 litres.", giftBecause: "The bag that makes him plan a trip." }),

    /* ---------------- OFF SHIFT ---------------- */
    P({ name: "Terrace Waffle Overshirt", maker: "Off Shift", collection: "off-shift", category: "Clothing", icon: "overshirt", price: 74, badges: ["new"], colorNames: ["Rust", "Moss", "Slate", "Ecru"], sizes: ["S", "M", "L", "XL"],
      why: "Half shirt, half jacket — the thing he'll reach for every Saturday.", whoFor: "Pub gardens and dog walks.", sizing: "Relaxed fit.", giftBecause: "That easy, everyday layer he never gets round to buying." }),
    P({ name: "Hand-Warmer Enamel Tankard", maker: "Kelder", collection: "off-shift", category: "Home", icon: "tankard", price: 22, colorNames: ["Fell Green", "Bracken", "Storm Blue"],
      why: "Speckled enamel that holds a pint of tea by the fire.", whoFor: "Campervans and cold touchlines.", sizing: "500ml.", giftBecause: "Cheerful, useful and personalisable." }),
    P({ name: "Peated Whisky Tasting Set", maker: "Cask & Crag", collection: "off-shift", category: "Food & Drink", icon: "whisky", price: 48, badges: ["gift"], colorNames: ["Peat"],
      why: "Five island drams and tasting notes for a proper night in.", whoFor: "The armchair adventurer.", sizing: "5 × 30ml.", giftBecause: "An experience, not just a bottle." }),
    P({ name: "Cast Iron BBQ Branding Kit", maker: "Ember & Oak", collection: "off-shift", category: "Home", icon: "bbq", price: 39, colorNames: ["Charcoal"],
      why: "Sear, brand and swagger — cast iron tools that last a lifetime of summers.", whoFor: "The self-appointed grill master.", sizing: "3-piece.", giftBecause: "Plays straight to his favourite hobby." }),
    P({ name: "Pub Quiz Pocket Games", maker: "Gable Games", collection: "off-shift", category: "Home", icon: "games", price: 18, colorNames: ["Bilberry", "Bracken"],
      why: "Three pocket games for the pub, the tent or the passenger seat.", whoFor: "The good-company sort.", sizing: "Pocket-sized.", giftBecause: "A cracking little stocking filler." }),
    P({ name: "Cotton Twill Cap", maker: "Off Shift", collection: "off-shift", category: "Accessories", icon: "cap", price: 26, colorNames: ["Moss", "Rust", "Charcoal", "Storm Blue"],
      why: "A soft, unstructured cap that's better after a few washes.", whoFor: "Bad-hair-day walkers.", sizing: "Adjustable.", giftBecause: "Easy, safe and always worn." }),

    /* ---------------- THE CRATE ---------------- */
    P({ name: "The Fellside Crate", maker: "Bield", collection: "the-crate", category: "Gifts", icon: "crate", price: 95, badges: ["gift", "most-gifted"], colorNames: ["Fell Green"],
      why: "Merino socks, a hip flask, trail bars and an OS map, boxed and ribboned.", whoFor: "The walker who's hard to buy for.", sizing: "5-piece crate.", giftBecause: "A whole gift, wrapped and carded, in one click." }),
    P({ name: "The Gentleman's Crate", maker: "Bield", collection: "the-crate", category: "Gifts", icon: "crate", price: 110, badges: ["gift"], colorNames: ["Bilberry"],
      why: "Grooming trio, a card wallet and a dram, for the man who likes nice things.", whoFor: "Dads, husbands, best men.", sizing: "4-piece crate.", giftBecause: "Looks and feels expensive; you barely lifted a finger." }),
    P({ name: "The Working Man's Crate", maker: "Bield", collection: "the-crate", category: "Gifts", icon: "crate", price: 85, badges: ["gift"], colorNames: ["Bracken"],
      why: "A flask, work gloves, a multi-tool and a tin of hand balm.", whoFor: "The one who's always grafting.", sizing: "4-piece crate.", giftBecause: "Practical to the core, and properly presented." }),
    P({ name: "Build-Your-Own Crate", maker: "Bield", collection: "the-crate", category: "Gifts", icon: "crate", price: 45, badges: ["gift", "new"], colorNames: ["Oat"],
      why: "Pick the box, choose three to five bits, add a handwritten card.", whoFor: "When you know him best.", sizing: "From £45.", giftBecause: "As thoughtful as you make it — and we wrap it." }),
    P({ name: "The Wild Swimmer's Crate", maker: "Bield", collection: "the-crate", category: "Gifts", icon: "crate", price: 120, badges: ["gift", "new"], colorNames: ["Storm Blue"],
      why: "A changing robe, neoprene gloves, a flask and a tide almanac.", whoFor: "The cold-water convert.", sizing: "4-piece crate.", giftBecause: "Everything for the hobby he's obsessed with, in one box." })
  ];

  // give each product a stable id based on slug of name for nicer URLs
  products.forEach(function (p) {
    p.id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });

  /* ======================= JOURNAL ======================= */
  var articles = [
    { id: "six-flasks-blencathra", cat: "Kit Tests", title: "We tested six flasks on a wet weekend on Blencathra", excerpt: "One kept tea hot for a genuinely absurd length of time. Here's the one that won — and the two that leaked.", read: "6 min", date: "12 Sep 2026", motif: "flask",
      body: [
        "It rained, of course. That was rather the point. We wanted to know which flask still poured a hot brew after a night out on the fell, so we filled six with boiling water at nine on Friday evening, lashed them to the outside of our packs, and walked up Blencathra in the sort of drizzle the brand guidelines politely call 'on-brand'.",
        { h: "The test" },
        "Each flask started at 96°C. We measured again at 7am — ten hours later, after a cold, wet night in a bothy porch — and again at lunchtime on the summit.",
        { q: "The winner still poured tea you'd actually want to drink, twelve hours after we filled it." },
        "The Kelder Site Flask 1L was the clear winner. Twelve hours in, it was still handing out tea at a proper 68°C. It's also the one we'd trust to survive being dropped down a scree slope, which — full disclosure — happened.",
        { h: "What we'd buy" },
        "If you want one flask for one price, buy the Kelder. If you're buying for someone who takes their brew seriously, it's in The Working Man's Crate too."
      ] },
    { id: "gifts-for-the-man-who-wants-nothing", cat: "Gift Guides", title: "For the man who says he doesn't want anything", excerpt: "He does. He always does. A short, honest guide to the presents men pretend not to want and then use every day.", read: "4 min", date: "5 Sep 2026", motif: "crate",
      body: [
        "Every year, someone tells us their husband, dad or brother 'doesn't want anything'. And every year, that same man quietly buys himself the exact thing you might have got him. We've made a living out of this contradiction, so let us help.",
        { h: "The rule" },
        "Buy the upgrade he won't buy himself. Men are oddly reluctant to replace things that still technically work — the fraying wallet, the flask with the broken seal, the boots held together by optimism.",
        { q: "The best gift is the nicer version of the thing he already loves." },
        "Start with the wallet, the watch or the boots. If you're not sure, The Gentleman's Crate does the thinking for you, and it arrives wrapped."
      ] },
    { id: "waxed-cotton-care", cat: "Field Notes", title: "How to re-wax a jacket (and why you should)", excerpt: "A waxed jacket is a fifteen-year jacket if you look after it. It takes twenty minutes, a tin of wax and a warm afternoon.", read: "5 min", date: "28 Aug 2026", motif: "jacket",
      body: [
        "A waxed cotton jacket isn't meant to look new. It's meant to look like yours. But every couple of years the wax wears thin at the cuffs and shoulders, and water stops beading and starts soaking. That's your cue.",
        { h: "You'll need" },
        "A tin of wax, a hairdryer or a warm room, a clean cloth, and an afternoon you don't mind smelling faintly of a saddlery.",
        { q: "Warm the wax, warm the jacket, work it in with a cloth, then hang it somewhere warm overnight." },
        "Do the seams and high-wear areas twice. By morning it'll have soaked in, and your jacket will be good for another few winters of drizzle."
      ] },
    { id: "meet-the-maker-cumbria-bootworks", cat: "Maker Stories", title: "Meet the maker: Cumbria Bootworks", excerpt: "In a workshop outside Kendal, a small team still welts boots by hand — and will resole them for as long as you own them.", read: "7 min", date: "20 Aug 2026", motif: "boot",
      body: [
        "You can hear the workshop before you see it: the tap of a hammer, the hiss of a steam press, radio two under all of it. Cumbria Bootworks has made Goodyear-welted boots on the same benches for three generations.",
        { h: "Made to be mended" },
        "The welt is the whole point. Because the sole is stitched, not glued, it can be replaced — again and again. A pair of these boots, resoled every few years, will outlast almost everything else in the wardrobe.",
        { q: "We'd rather sell you one pair for twenty years than four pairs for five." },
        "It's exactly the sort of quiet, stubborn quality Bield was built to sell. Their Grafter boot is one of our most-gifted things, and we're not surprised."
      ] },
    { id: "first-wild-swim", cat: "Adventures", title: "Your first wild swim, without the drama", excerpt: "You don't need to be brave, or cold-adapted, or anything really. You need a friend, a flask and somewhere shallow to start.", read: "5 min", date: "14 Aug 2026", motif: "robe",
      body: [
        "Wild swimming has a bit of a reputation — ice baths, wet-suited hardcases, breathing techniques with names. Ignore all that. Your first swim should be gentle, shallow and short.",
        { h: "The kit" },
        "You genuinely need very little: a towel, a warm layer for after, and — the one real upgrade — a decent changing robe for the shivery bit. A flask of something hot helps more than you'd think.",
        { q: "Get in slowly, stay near the edge, get out before you stop enjoying it." },
        "That's it. Do that a few times through the summer and you'll understand why people won't stop banging on about it. We've a Wild Swimmer's Crate if you want it all in one box."
      ] },
    { id: "more-than-a-shop", cat: "Field Notes", title: "More than a shop: the idea behind Bield", excerpt: "Kit, knowledge and good company. A short note on why we're a community as much as a shop — and what that means for you.", read: "3 min", date: "1 Aug 2026", motif: "waterproof",
      body: [
        "Most shops sell you a thing and wave goodbye. We wanted to do the harder, better bit: give men the know-how and the good company to actually get out there and lead.",
        "So kit is only half of what we do. The other half is knowledge — honest tests, plain-English advice, route guides — and company: meet-ups, a Journal worth reading, and the sense that there's a group of you at it, not just a parcel on the doormat.",
        { q: "Kit is only half of it. The know-how and the good company are what get you out the door." },
        "That's the idea in our mark, too: a sheep bield drawn in plan. A bield is a Cumbrian word for shelter — the drystone wall on a fellside where you stop, take stock and set off better equipped. Everything in the shop is chosen and explained by people who've actually used it — and if you're buying it as a gift, we'll wrap it with a card."
      ] }
  ];

  /* attach convenience arrays and helpers */
  function byCollection(slug) { return products.filter(function (p) { return p.collection === slug; }); }
  function get(id) { return products.filter(function (p) { return p.id === id; })[0]; }
  function getArticle(id) { return articles.filter(function (a) { return a.id === id; })[0]; }
  function collection(slug) { return collections.filter(function (c) { return c.slug === slug; })[0]; }

  window.BIELD = {
    palette: PALETTE,
    colours: COLOURS,
    collections: collections,
    products: products,
    articles: articles,
    icons: ICONS,
    art: { product: productArt, media: productMedia, scene: scene, editorial: editorial, tint: tint },
    byCollection: byCollection,
    get: get,
    getArticle: getArticle,
    collection: collection,
    money: function (n) { return "£" + (Number(n) % 1 === 0 ? n : n.toFixed(2)); }
  };
})();
