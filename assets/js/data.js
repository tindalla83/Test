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

  /* ---- Colourway swatches (drawn from the Bield landscape palette) ---- */
  var COLOURS = {
    "Slate": "#3E4548",
    "Peat": "#4A3B2E",
    "Bracken": "#9A5B2E",
    "Lichen": "#8D9478",
    "Bottle": "#2C3B33",
    "Oxblood": "#6B2F2A",
    "Limestone": "#E8E4DC",
    "Oat": "#D8CBB0",
    "Ecru": "#E4DECB",
    "Charcoal": "#33363A",
    "Tan": "#B98A5E",
    "Stone": "#9A958A",
    "Gorse": "#D9A317"
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
    var c = product.colors && product.colors.length ? product.colors[Math.min(variant, product.colors.length - 1)] : colour("Slate");
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

  /* ======================= COLLECTIONS (categories) ======================= */
  var collections = [
    { slug: "outerwear", name: "Outerwear", tagline: "For weather that stays", desc: "Waxed cotton, waxed canvas and taped shells. The layer between you and four days of rain.", scene: { sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33", accent: "#9A5B2E" } },
    { slug: "knitwear", name: "Knitwear", tagline: "Yorkshire worsted", desc: "Crews, half-zips and ganseys, spun and knitted in the north. Warm, not bulky.", scene: { sky: "#2C3B33", mid: "#8D9478", fore: "#2C3B33", accent: "#8D9478" } },
    { slug: "boots", name: "Boots", tagline: "Welted, not glued", desc: "Goodyear-welted leather from Northampton. Stitched so they can be resoled, again and again.", scene: { sky: "#4A3B2E", mid: "#6B2F2A", fore: "#2C3B33", accent: "#9A5B2E" } },
    { slug: "goods", name: "Goods", tagline: "Steel, leather, wool", desc: "Bags, knives, flasks and the small things. Sheffield steel, bridle leather, enamel.", scene: { sky: "#3E4548", mid: "#8D9478", fore: "#2C3B33", accent: "#9A5B2E" } }
  ];

  /* ======================= PRODUCTS ======================= */
  // Naming follows northern landscape words (mostly Old Norse). Copy is
  // specification first, understated, one adjective at most, no exclamation.
  var pid = 0;
  function P(o) {
    pid++;
    o.id = o.id || ("p" + pid);
    o.code = o.code || ("BLD-" + String(100 + pid));
    o.badges = o.badges || [];
    o.sizes = o.sizes || ["One size"];
    o.colors = (o.colorNames || ["Slate"]).map(colour);
    return o;
  }

  // To use a real photo instead of the generated artwork, add an `images` array
  // (one path per colour, same order as `colorNames`). See
  // assets/img/products/README.md. Products without `images` keep the generated art.
  var products = [
    /* ---------------- OUTERWEAR ---------------- */
    P({ name: "The Bield Waxed Smock", maker: "Waxed cotton · Lancashire", collection: "outerwear", category: "Outerwear", icon: "jacket", price: 285, colorNames: ["Peat", "Bracken", "Slate"], images: ["assets/img/products/91842_Flint_and_Tinder_Waxed_Harrington_Jacket_Olive_01_PXLZ.avif"], sizes: ["S", "M", "L", "XL", "XXL"],
      why: "18oz waxed cotton, cut a little long in the body, with a storm flap that actually closes. It will mark and fade, which is the point. Reproof it once a year and it will outlive you.", whoFor: "Four days of rain.", sizing: "Runs true; room for a jumper underneath.", origin: "Woven and waxed in Lancashire.", etym: "Bield — a shelter; the lee of a drystone wall on open fell." }),
    P({ name: "Ghyll Waterproof Smock", maker: "3-layer · Cumbria", collection: "outerwear", category: "Outerwear", icon: "waterproof", price: 245, badges: ["new"], colorNames: ["Bottle", "Slate", "Bracken"], sizes: ["S", "M", "L", "XL"],
      why: "A three-layer waterproof with taped seams and a wired hood. It keeps the rain off and still breathes on the climb. Pull-on, so there is one less zip to fail.", whoFor: "The day it does not stop.", sizing: "Athletic; room for a mid-layer.", origin: "Cut and taped in Cumbria.", etym: "Ghyll — a steep, wooded stream." }),
    P({ name: "Clough Waxed Jacket", maker: "Waxed cotton · Lancashire", collection: "outerwear", category: "Outerwear", icon: "jacket", price: 265, colorNames: ["Peat", "Slate", "Bottle"], sizes: ["S", "M", "L", "XL", "XXL"],
      why: "Heavier waxed cotton with a corduroy collar and a poacher's pocket. Built for standing about in weather, not for moving fast. Studs, not a zip.", whoFor: "Gates, dogs, touchlines.", sizing: "Generous; a true country cut.", origin: "Made in Lancashire.", etym: "Clough — a steep ravine." }),
    P({ name: "Force Mountain Shell", maker: "3-layer · UK", collection: "outerwear", category: "Outerwear", icon: "waterproof", price: 320, oldPrice: 360, badges: ["sale"], colorNames: ["Slate", "Bottle"], sizes: ["S", "M", "L", "XL"],
      why: "A stripped-back shell: three-layer fabric, pit zips, one chest pocket, a hood that fits over a hat. Nothing on it you would not use on a bad day.", whoFor: "The top, in winter.", sizing: "Regular; sized for layers.", origin: "Made in the UK.", etym: "Force — a waterfall." }),
    P({ name: "Intake Moleskin Overshirt", maker: "Moleskin · Yorkshire", collection: "outerwear", category: "Outerwear", icon: "overshirt", price: 135, badges: ["new"], colorNames: ["Lichen", "Peat", "Slate", "Ecru"], sizes: ["S", "M", "L", "XL"],
      why: "A brushed moleskin overshirt that works as a light jacket. Wear it under the Bield in December or on its own in October. Two chest pockets, horn buttons.", whoFor: "The in-between months.", sizing: "Room for a shirt beneath.", origin: "Cut and sewn in Yorkshire.", etym: "Intake — fell land taken in from the moor." }),

    /* ---------------- KNITWEAR ---------------- */
    P({ name: "Rigg Crew", maker: "Worsted wool · Yorkshire", collection: "knitwear", category: "Knitwear", icon: "jumper", price: 145, colorNames: ["Lichen", "Peat", "Oat", "Slate"], sizes: ["S", "M", "L", "XL"],
      why: "Worsted wool, knitted in Yorkshire, in a plain crew that goes under a coat or over a shirt. Warm without the bulk, and it holds its shape.", whoFor: "Most days, most of the year.", sizing: "Classic fit.", origin: "Spun and knitted in Yorkshire.", etym: "Rigg — a ridge." }),
    P({ name: "Rigg Half-Zip", maker: "Worsted wool · Yorkshire", collection: "knitwear", category: "Knitwear", icon: "fleece", price: 165, colorNames: ["Bottle", "Slate", "Oat"], sizes: ["S", "M", "L", "XL"],
      why: "The same Yorkshire worsted with a collar that stands up against the wind and a zip you can open when the pub is too warm.", whoFor: "The car, the fell, the bar.", sizing: "Classic fit.", origin: "Knitted in Yorkshire.", etym: "Rigg — a ridge." }),
    P({ name: "Rigg Gansey", maker: "Guernsey wool · Yorkshire coast", collection: "knitwear", category: "Knitwear", icon: "jumper", price: 185, badges: ["last-few"], colorNames: ["Slate", "Bottle", "Peat"], sizes: ["S", "M", "L", "XL"],
      why: "A five-gauge gansey, knitted tight enough to turn a shower, in the pattern the east-coast boats wore. Heavy, honest and slow to make.", whoFor: "Cold work, cold water.", sizing: "Traditional; a close fit.", origin: "Knitted on the Yorkshire coast.", etym: "Rigg — a ridge." }),

    /* ---------------- BOOTS ---------------- */
    P({ name: "Scar Derby Boot", maker: "Leather · Northampton", collection: "boots", category: "Boots", icon: "boot", price: 320, colorNames: ["Tan", "Peat", "Charcoal"], sizes: ["7", "8", "9", "10", "11", "12"],
      why: "Goodyear-welted in Northampton on a commando sole. Stitched, not glued, so the sole can be replaced for as long as you own them. Full-grain leather that takes a wax.", whoFor: "Mud, cobbles, years.", sizing: "Take your usual size; a roomy last.", origin: "Made in Northampton.", etym: "Scar — a bare rock outcrop." }),
    P({ name: "Scar Chelsea Boot", maker: "Leather · Northampton", collection: "boots", category: "Boots", icon: "boot", price: 295, colorNames: ["Peat", "Charcoal", "Tan"], sizes: ["7", "8", "9", "10", "11", "12"],
      why: "A plain leather Chelsea on the same welted sole. Pulls on, cleans up, resoles. The one boot that works with waxed cotton and a jacket both.", whoFor: "Town and country.", sizing: "Standard fit.", origin: "Made in Northampton.", etym: "Scar — a bare rock outcrop." }),

    /* ---------------- GOODS ---------------- */
    P({ name: "Howe Waxed Holdall", maker: "Waxed canvas · Cheshire", collection: "goods", category: "Bags", icon: "holdall", price: 220, colorNames: ["Peat", "Slate"],
      why: "Waxed canvas and bridle leather, big enough for a long weekend and small enough for the overhead locker. The handles will darken where you hold them.", whoFor: "Two nights away.", sizing: "42 litres.", origin: "Cut and sewn in Cheshire.", etym: "Howe — a hill, or a burial mound." }),
    P({ name: "Howe Card Wallet", maker: "Bridle leather · UK", collection: "goods", category: "Leather", icon: "wallet", price: 55, colorNames: ["Peat", "Tan", "Charcoal"],
      why: "English bridle leather, six cards and a folded note. It stiffens, then it softens, then it is yours. No lining to come away.", whoFor: "Every day.", sizing: "Six cards plus notes.", origin: "Made in the UK.", etym: "Howe — a hill, or a burial mound." }),
    P({ name: "Sheffield Pocket Knife", maker: "Carbon steel · Sheffield", collection: "goods", category: "Tools", icon: "knife", price: 68, colorNames: ["Charcoal", "Tan"],
      why: "A single carbon-steel blade with a rosewood scale, ground in Sheffield. It takes an edge, holds it, and sharpens on a stone in a minute. It will develop a patina; leave it.", whoFor: "String, apples, splinters.", sizing: "9cm closed.", origin: "Made in Sheffield.", etym: "Sheffield — cutlers by charter since 1624." }),
    P({ name: "Enamel Flask, 1 litre", maker: "Vitreous enamel · UK", collection: "goods", category: "Gear", icon: "flask", price: 42, colorNames: ["Bottle", "Bracken", "Slate"],
      why: "Keeps a brew hot from the car to the top and most of the way back. Enamel over steel, so it will chip at the rim, and that is fine. A wide neck you can actually clean.", whoFor: "Early starts.", sizing: "1 litre.", origin: "Enamelled in the UK.", etym: "" }),
    P({ name: "Beck Waxed Cap", maker: "Waxed cotton · UK", collection: "goods", category: "Accessories", icon: "cap", price: 38, colorNames: ["Peat", "Lichen", "Slate"], sizes: ["S/M", "L/XL"],
      why: "A waxed cotton cap with a stiff peak that keeps the drizzle off your glasses. Unlined, so it packs flat into a pocket and dries on a radiator.", whoFor: "Dog walks in the wet.", sizing: "Two sizes.", origin: "Made in the UK.", etym: "Beck — a stream." }),
    P({ name: "Fell Boot Socks, three pairs", maker: "Merino · Yorkshire", collection: "goods", category: "Accessories", icon: "socks", price: 26, colorNames: ["Lichen", "Slate", "Oat"], sizes: ["6–8", "9–11", "12–13"],
      why: "Merino-and-nylon boot socks, cushioned underfoot, ribbed to stay up. Knitted in Yorkshire. Three pairs, because you will want them.", whoFor: "Inside the Scar boot.", sizing: "Three foot sizes.", origin: "Knitted in Yorkshire.", etym: "" }),
    P({ name: "Dales Work Gloves", maker: "Deerskin · UK", collection: "goods", category: "Accessories", icon: "gloves", price: 48, colorNames: ["Peat", "Charcoal"], sizes: ["S", "M", "L", "XL"],
      why: "Deerskin palms, a wool back and a short knitted cuff. Enough to grip a wet gate and still feel the latch. They mould to your hand and stay soft.", whoFor: "Walls, logs, gates.", sizing: "Snug at first; they give.", origin: "Made in the UK.", etym: "" }),
    P({ name: "Enamel Mug", maker: "Vitreous enamel · UK", collection: "goods", category: "Home", icon: "mug", price: 16, colorNames: ["Bottle", "Bracken", "Slate"],
      why: "Half a pint of tea, no handle to snap and no plastic to taste. It lives in the boot of the car and it will chip before it breaks.", whoFor: "The tailgate.", sizing: "300ml.", origin: "Enamelled in the UK.", etym: "" })
  ];

  // stable id from the product name
  products.forEach(function (p) {
    p.id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });

  /* ======================= JOURNAL ======================= */
  var articles = [
    { id: "six-flasks-ennerdale", cat: "Kit Tests", title: "Six flasks, one wet weekend in Ennerdale", excerpt: "We filled six with boiling water and left them out overnight. One still poured a hot brew at lunch the next day. Two leaked.", read: "6 min", date: "12 Sep 2026", motif: "flask",
      body: [
        "It rained the whole time, which was the point. We wanted to know which flask still poured a hot drink after a night out, so we filled six at nine on Friday, left them on a wall by the bothy, and checked them through the next day.",
        { h: "The test" },
        "Each started at 96°C. We read them at 7am, ten hours later, and again at lunch on the top. No insulation on the test — the flasks stood in the open, in the weather, as they would on a real day out.",
        { q: "The winner still poured tea you would want to drink, twelve hours after we filled it." },
        "The enamel-lined litre flask held 68°C at the twelve-hour mark and survived being knocked off the wall onto slate. Two vacuum flasks leaked from the seal within the hour. One is now a plant pot.",
        { h: "What we would buy" },
        "Buy one good flask and keep it. Ours is in Goods. It will dent and it will be fine."
      ] },
    { id: "why-we-shoot-in-bad-weather", cat: "Field Notes", title: "Why we shoot in bad weather on purpose", excerpt: "Everyone else waits for June. We think the flat grey light is the honest one — and it is available every day of the year.", read: "4 min", date: "5 Sep 2026", motif: "waterproof",
      body: [
        "Most outdoor brands shoot in a narrow window either side of midsummer, chasing low golden sun. Northern England gets that maybe fifteen days a year. The rest of the time it is overcast, and that is the weather the kit is actually for.",
        "So we shoot the overcast. Flat light gives even skin, saturated wet colour and no blown-out sky. Rain on waxed cotton photographs better than sun on it.",
        { q: "A white featureless sky in the top of the frame is not a mistake. It reads as air." },
        "It is also the commercially sensible move. A library shot in real weather works in November, which is when people are actually buying a coat."
      ] },
    { id: "waxed-cotton-care", cat: "Field Notes", title: "How to re-wax a jacket, and why", excerpt: "A waxed jacket is a fifteen-year jacket if you look after it. Twenty minutes, a tin of wax and a warm afternoon.", read: "5 min", date: "28 Aug 2026", motif: "jacket",
      body: [
        "A waxed cotton jacket is not meant to look new. It is meant to look like yours. Every couple of years the wax wears thin at the cuffs and shoulders, water stops beading and starts soaking in. That is your cue.",
        { h: "You will need" },
        "A tin of wax, a hairdryer or a warm room, a clean cloth, and an afternoon you do not mind smelling faintly of a saddlery.",
        { q: "Warm the wax, warm the jacket, work it in with a cloth, then hang it somewhere warm overnight." },
        "Do the seams and high-wear areas twice. By morning it will have soaked in, and the jacket is good for another few winters. A jacket you can mend is a jacket you keep."
      ] },
    { id: "meet-the-maker-northampton", cat: "Makers", title: "The bootmaker: a welted sole in Northampton", excerpt: "Stitched, not glued. A small team welts boots on the same benches their fathers did, and will resole them for as long as you own them.", read: "7 min", date: "20 Aug 2026", motif: "boot",
      body: [
        "You hear the workshop before you see it: the tap of a hammer, the hiss of a press, a radio under all of it. This is Goodyear welting, done the way it has been done in Northampton for a century and a half.",
        { h: "Made to be mended" },
        "The welt is the whole argument. Because the sole is stitched to the upper, not glued, it can be taken off and replaced. A pair resoled every few years outlasts almost everything else you own.",
        { q: "We would rather sell you one pair for twenty years than four pairs for five." },
        "That is why the Scar boot costs what it costs, and why it is the last boot on this list you will need to buy."
      ] },
    { id: "meet-the-maker-yorkshire-wool", cat: "Makers", title: "The mill: worsted spun and knitted in Yorkshire", excerpt: "The wool for the Rigg is spun a few miles from where it is knitted. Dust in the light, looms older than the people running them.", read: "6 min", date: "14 Aug 2026", motif: "jumper",
      body: [
        "The advantage a northern brand has over an American one is simple: the things it sells are still made a couple of hours up the road. The wool for our knitwear is spun and knitted within the same county.",
        { h: "Worsted, not woollen" },
        "Worsted yarn is combed so the fibres lie parallel, which makes a smoother, harder-wearing cloth than a soft woollen spin. It is why the Rigg holds its shape and does not pill in a season.",
        { q: "Buy the jumper your grandfather would recognise, made where he would recognise it." },
        "Each shoot with a maker is a supplier we can name, a story worth telling, and a reason the kit is worth the money."
      ] },
    { id: "the-words-on-the-labels", cat: "Field Notes", title: "The words on the labels", excerpt: "Bield, Ghyll, Rigg, Scar, Force. The product names are northern landscape words, most of them Old Norse. Here is what they mean.", read: "3 min", date: "1 Aug 2026", motif: "waterproof",
      body: [
        "The kit is named after the ground it is for. Most of the words are Old Norse, left behind by the people who farmed these fells a thousand years ago, and still on the maps today.",
        { h: "A short glossary" },
        "A bield is a shelter — the drystone lee where sheep stand out of the wind. A ghyll is a steep wooded stream, a rigg is a ridge, a scar is a bare rock outcrop, a force is a waterfall, a howe is a hill or a burial mound.",
        { q: "Learn the words and the map starts to read like a description of the weather." },
        "Every product page carries its one-line etymology. It is free, it is true, and it teaches the vocabulary without a brand-story page nobody reads."
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
