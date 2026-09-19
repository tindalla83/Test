/* ==========================================================================
   Bield — storefront behaviour
   Header/footer injection, cart (localStorage), and per-page rendering.
   Pages declare their role with <body data-page="…">.
   ========================================================================== */

(function () {
  "use strict";
  var M = window.BIELD;
  var money = M.money;

  /* ---------------- tiny helpers ---------------- */
  function h(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ---------------- UI icons ---------------- */
  var I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7S9 3 7 5s0 2 5 2zM12 7s3-4 5-2-0 2-5 2z"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C4 10 12 4 20 4c0 10-8 16-16 16zM4 20c4-6 8-8 12-9"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9-9 9z" opacity="0"/><path d="M4 4h7l9 9-7 7-9-9V4z"/><circle cx="8" cy="8" r="1.3"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19l6-9 3 4 3-5 6 10z"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 20l4-9M12 3a6 6 0 013 11c-2 1-4 0-4 0"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10a4 4 0 11-3-3.9M14 8a5 5 0 004 2"/></svg>'
  };

  /* ---------------- persona / budget maps for gift finder ---------------- */
  var GF_WHO = [
    { key: "partner", label: "Partner", sub: "Husband or boyfriend", icon: "heart" },
    { key: "dad", label: "Dad", sub: "Or father-in-law", icon: "mountain" },
    { key: "son", label: "Son", sub: "Grown-up sons", icon: "user" },
    { key: "brother", label: "Brother", sub: "Or brother-in-law", icon: "user" },
    { key: "friend", label: "A mate", sub: "Groomsmen, teammates", icon: "gift" }
  ];

  /* =========================================================================
     CART
     ========================================================================= */
  var Cart = {
    key: "bield.cart.v1",
    items: [],
    load: function () { try { this.items = JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { this.items = []; } },
    save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch (e) {} this.sync(); },
    lineId: function (id, size, color) { return id + "|" + (size || "") + "|" + (color || ""); },
    add: function (id, size, color, qty) {
      qty = qty || 1;
      var lid = this.lineId(id, size, color);
      var found = this.items.filter(function (i) { return i.lid === lid; })[0];
      if (found) found.qty += qty; else this.items.push({ lid: lid, id: id, size: size, color: color, qty: qty });
      this.save();
    },
    setQty: function (lid, qty) {
      this.items.forEach(function (i) { if (i.lid === lid) i.qty = Math.max(1, qty); });
      this.save();
    },
    remove: function (lid) { this.items = this.items.filter(function (i) { return i.lid !== lid; }); this.save(); },
    count: function () { return this.items.reduce(function (n, i) { return n + i.qty; }, 0); },
    subtotal: function () {
      return this.items.reduce(function (s, i) { var p = M.get(i.id); return s + (p ? p.price * i.qty : 0); }, 0);
    },
    sync: function () {
      var c = this.count();
      $$(".cart-count").forEach(function (b) { b.textContent = c; b.hidden = c === 0; });
      if (document.body.dataset.page === "cart") renderCart();
    }
  };

  /* =========================================================================
     WISHLIST (lightweight)
     ========================================================================= */
  var Wish = {
    key: "bield.wish.v1", ids: [],
    load: function () { try { this.ids = JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { this.ids = []; } },
    save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.ids)); } catch (e) {} },
    has: function (id) { return this.ids.indexOf(id) > -1; },
    toggle: function (id) { var i = this.ids.indexOf(id); if (i > -1) this.ids.splice(i, 1); else this.ids.push(id); this.save(); return this.has(id); }
  };

  /* =========================================================================
     TOAST
     ========================================================================= */
  function toast(msg, linkText, linkHref) {
    var host = $(".toast-wrap") || document.body.appendChild(h('<div class="toast-wrap" aria-live="polite"></div>'));
    var t = h('<div class="toast">' + I.check + '<span>' + esc(msg) + '</span>' +
      (linkText ? '<a href="' + linkHref + '">' + esc(linkText) + '</a>' : '') + '</div>');
    host.appendChild(t);
    setTimeout(function () { t.style.transition = "opacity .3s, transform .3s"; t.style.opacity = "0"; t.style.transform = "translateY(8px)"; setTimeout(function () { t.remove(); }, 320); }, 3200);
  }

  /* =========================================================================
     HEADER + FOOTER + DRAWER
     ========================================================================= */
  var NAV = [
    { label: "Shop", href: "shop.html" },
    { label: "Collections", href: "shop.html#collections" },
    { label: "Gifts", href: "gift-finder.html" },
    { label: "Journal", href: "journal.html" },
    { label: "Our Story", href: "about.html" }
  ];

  function brandMark(size) {
    size = size || 26;
    return '<svg class="brand__mark" width="' + (size + 14) + '" height="' + size + '" viewBox="0 0 40 26" fill="none" aria-hidden="true">' +
      '<path d="M2 22 L10 10 L15 16 L22 6 L28 14 L33 9 L38 15" stroke="var(--bracken)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M2 22 L38 22" stroke="var(--fell-green)" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/></svg>';
  }

  // Bield mark — a sheep bield drawn in plan (four wall-arms from a centre).
  // Inherits colour from currentColor so it works on any ground.
  var MARK = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<g fill="currentColor"><rect x="41" y="41" width="18" height="18"/><rect x="41" y="4" width="18" height="33"/>' +
    '<rect x="41" y="63" width="18" height="33"/><rect x="4" y="41" width="33" height="18"/><rect x="63" y="41" width="33" height="18"/></g></svg>';

  function injectHeader() {
    var current = (location.pathname.split("/").pop() || "index.html");
    var navLinks = NAV.map(function (n) {
      var active = n.href.split("#")[0] === current ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + active + '>' + n.label + '</a>';
    }).join("");

    var header = h(
      '<div>' +
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="topbar"><div class="container topbar__inner">' +
      '<span class="topbar__msg"><span class="topbar__dot"></span> Free UK delivery over £75 · free gift wrap on everything</span>' +
      '<a href="gift-finder.html" class="hide-sm">Find his gift in 3 taps →</a>' +
      '</div></div>' +
      '<header class="site-header"><div class="container site-header__inner">' +
      '<nav class="nav-primary" aria-label="Primary">' + navLinks + '</nav>' +
      '<button class="icon-btn nav-toggle" aria-label="Open menu" data-drawer-open>' + I.menu + '</button>' +
      '<a class="brand" href="index.html" aria-label="Bield home"><span class="brand__logo">' + MARK + '</span><span class="brand__word">Bield</span></a>' +
      '<div class="header-actions">' +
      '<button class="icon-btn" data-search-open aria-label="Search">' + I.search + '</button>' +
      '<a class="icon-btn hide-sm" href="wishlist.html" aria-label="Wishlist">' + I.heart + '</a>' +
      '<a class="icon-btn hide-sm" href="account.html" aria-label="Account">' + I.user + '</a>' +
      '<a class="icon-btn" href="cart.html" aria-label="Basket">' + I.bag + '<span class="cart-count" hidden>0</span></a>' +
      '</div></div></header>' +
      // search panel
      '<div class="search-panel" hidden></div>' +
      // mobile drawer
      '<div class="drawer-backdrop" data-drawer-close></div>' +
      '<aside class="drawer" aria-label="Menu"><div class="drawer__head">' +
      '<span class="drawer__title">Menu</span><button class="icon-btn" data-drawer-close aria-label="Close menu">' + I.close + '</button></div>' +
      '<div class="drawer__body"><nav class="drawer-nav">' +
      NAV.map(function (n) { return '<a href="' + n.href + '">' + n.label + '</a>'; }).join("") +
      '<div class="sub">Collections</div>' +
      M.collections.map(function (c) { return '<a href="collection.html?c=' + c.slug + '" style="font-size:17px">' + c.name + '</a>'; }).join("") +
      '<div class="sub" style="margin-top:8px"></div>' +
      '<a href="wishlist.html" style="font-size:17px">Wishlist</a><a href="account.html" style="font-size:17px">Account</a>' +
      '</nav></div><div class="drawer__foot"><a class="btn btn--accent btn--block" href="gift-finder.html">' + I.gift + ' Find a gift</a></div></aside>' +
      '</div>'
    );
    document.body.insertBefore(header, document.body.firstChild);
    wireHeader();
  }

  function wireHeader() {
    var backdrop = $(".drawer-backdrop"), drawer = $(".drawer");
    function open() { drawer.classList.add("open"); backdrop.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { drawer.classList.remove("open"); backdrop.classList.remove("open"); document.body.style.overflow = ""; }
    $$("[data-drawer-open]").forEach(function (b) { b.addEventListener("click", open); });
    $$("[data-drawer-close]").forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); closeSearch(); } });

    // search
    var panel = $(".search-panel");
    $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", function () { panel.hidden ? openSearch() : closeSearch(); }); });
    function openSearch() {
      panel.hidden = false;
      panel.innerHTML = '<div class="container" style="padding-block:20px 28px">' +
        '<form class="search-form" role="search"><div class="search-input-wrap">' + I.search +
        '<input type="search" name="q" placeholder="Search jackets, gifts, flasks…" autocomplete="off" aria-label="Search products">' +
        '<button class="icon-btn" type="button" data-search-open aria-label="Close search">' + I.close + '</button></div>' +
        '<div class="search-results"></div></form></div>';
      var input = $("input", panel); input.focus();
      $("[data-search-open]", panel).addEventListener("click", closeSearch);
      input.addEventListener("input", function () { renderSearch(input.value, $(".search-results", panel)); });
      $(".search-form", panel).addEventListener("submit", function (e) { e.preventDefault(); location.href = "shop.html?q=" + encodeURIComponent(input.value); });
      renderSearch("", $(".search-results", panel));
    }
    function closeSearch() { panel.hidden = true; panel.innerHTML = ""; }
    window.__closeSearch = closeSearch;
  }
  function closeSearch() { if (window.__closeSearch) window.__closeSearch(); }

  function renderSearch(q, host) {
    q = (q || "").trim().toLowerCase();
    var res = q ? M.products.filter(function (p) {
      return (p.name + " " + p.maker + " " + p.category + " " + p.collection).toLowerCase().indexOf(q) > -1;
    }).slice(0, 6) : M.products.filter(function (p) { return p.badges.indexOf("most-gifted") > -1 || p.badges.indexOf("bestseller") > -1; }).slice(0, 4);
    host.innerHTML =
      '<p class="search-label">' + (q ? (res.length + ' result' + (res.length === 1 ? '' : 's')) : 'Most wanted') + '</p>' +
      (res.length ? '<div class="search-grid">' + res.map(function (p) {
        return '<a class="search-hit" href="product.html?id=' + p.id + '"><span class="search-hit__img">' + M.art.media(p, 0) + '</span>' +
          '<span><b>' + esc(p.name) + '</b><i>' + esc(p.maker) + ' · ' + money(p.price) + '</i></span></a>';
      }).join("") + '</div>' : '<p class="search-empty">No matches. Try the <a href="gift-finder.html">gift finder</a>.</p>');
  }

  function injectFooter() {
    var footer = h(
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand"><a class="brand brand--footer" href="index.html"><span class="brand__logo">' + MARK + '</span><span class="brand__word">Bield</span></a>' +
      '<p>The UK’s one-stop men’s shop and community: kit, knowledge and good company for men who want to get out there and lead.</p>' +
      '<div class="footer-social">' +
      '<a href="#" aria-label="Instagram">' + I.insta + '</a>' +
      '<a href="#" aria-label="Pinterest">' + I.pin + '</a>' +
      '<a href="#" aria-label="YouTube">' + I.yt + '</a>' +
      '<a href="#" aria-label="TikTok">' + I.tiktok + '</a>' +
      '</div></div>' +
      '<div class="footer-col"><h4>Shop</h4>' +
      M.collections.map(function (c) { return '<a href="collection.html?c=' + c.slug + '">' + c.name + '</a>'; }).join("") +
      '<a href="shop.html">All products</a></div>' +
      '<div class="footer-col"><h4>Community</h4>' +
      '<a href="journal.html">The Journal</a><a href="gift-finder.html">Gift finder</a>' +
      '<a href="collection.html?c=the-crate">Gift crates</a><a href="#">Route guides</a><a href="#">Events &amp; meet-ups</a></div>' +
      '<div class="footer-col"><h4>Help</h4>' +
      '<a href="#">Delivery &amp; returns</a><a href="#">Size &amp; fit</a><a href="#">Free size swaps</a>' +
      '<a href="#">Gift wrap &amp; cards</a><a href="about.html">Our story</a></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Bield. Kit, knowledge and good company.</span>' +
      '<span><a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Cookies</a></span></div>' +
      '</div></footer>'
    );
    document.body.appendChild(footer);
  }

  /* =========================================================================
     REUSABLE RENDER BITS
     ========================================================================= */
  function badgeHtml(p) {
    var out = [];
    if (p.badges.indexOf("sale") > -1) out.push('<span class="badge badge--sale">Save ' + money(p.oldPrice - p.price) + '</span>');
    if (p.badges.indexOf("new") > -1) out.push('<span class="badge badge--new">Just in</span>');
    if (p.badges.indexOf("most-gifted") > -1) out.push('<span class="badge badge--gift">Most gifted</span>');
    else if (p.badges.indexOf("gift") > -1) out.push('<span class="badge badge--gift">Gift ready</span>');
    if (p.badges.indexOf("bestseller") > -1 && p.badges.indexOf("sale") < 0) out.push('<span class="badge">Bestseller</span>');
    return out.length ? '<div class="card__badges">' + out.join("") + '</div>' : "";
  }

  function productCard(p) {
    var swatches = p.colors.slice(0, 5).map(function (c) { return '<span class="swatch" title="' + esc(c.name) + '" style="background:' + c.hex + '"></span>'; }).join("");
    var priceHtml = p.oldPrice
      ? '<span class="price">' + money(p.price) + '</span> <span class="price price--old">' + money(p.oldPrice) + '</span>'
      : '<span class="price">' + money(p.price) + '</span>';
    var on = Wish.has(p.id) ? " is-on" : "";
    return '<article class="card">' +
      '<div class="card__media">' + badgeHtml(p) +
      '<button class="card__wish' + on + '" data-wish="' + p.id + '" aria-label="Save to wishlist">' + (Wish.has(p.id) ? I.heartFill : I.heart) + '</button>' +
      '<a href="product.html?id=' + p.id + '" aria-label="' + esc(p.name) + '">' + M.art.media(p, 0) + '</a>' +
      '<div class="card__quick"><button class="btn btn--light btn--sm btn--block" data-add="' + p.id + '">Add to basket</button></div>' +
      '</div>' +
      '<span class="card__maker">' + esc(p.maker) + '</span>' +
      '<h3 class="card__name"><a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="card__meta">' + priceHtml + '</div>' +
      (swatches ? '<div class="card__swatches">' + swatches + '</div>' : "") +
      '</article>';
  }

  function grid(products, cls) {
    return '<div class="product-grid ' + (cls || "") + '">' + products.map(productCard).join("") + '</div>';
  }

  // delegate add-to-basket + wishlist clicks globally
  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var p = M.get(add.getAttribute("data-add"));
      if (p) {
        Cart.add(p.id, p.sizes && p.sizes[0], p.colors[0] && p.colors[0].name, 1);
        toast(p.name + " added to your basket", "View basket", "cart.html");
      }
      return;
    }
    var w = e.target.closest("[data-wish]");
    if (w) {
      var id = w.getAttribute("data-wish");
      var on = Wish.toggle(id);
      w.classList.toggle("is-on", on);
      w.innerHTML = on ? I.heartFill : I.heart;
      toast(on ? "Saved to your wishlist" : "Removed from wishlist");
    }
  });

  function articleCard(a) {
    return '<a class="article-card" href="article.html?id=' + a.id + '">' +
      '<div class="article-card__media">' + M.art.editorial({ base: pickBase(a.cat), motif: a.motif, id: a.id.length }) + '</div>' +
      '<span class="article-card__cat">' + esc(a.cat) + '</span>' +
      '<h3>' + esc(a.title) + '</h3><p>' + esc(a.excerpt) + '</p>' +
      '<span class="article-card__meta">' + esc(a.date) + ' · ' + esc(a.read) + ' read</span></a>';
  }
  function pickBase(cat) {
    var map = { "Kit Tests": "#4A3B2E", "Gift Guides": "#6B2F2A", "Field Notes": "#3E4548", "Maker Stories": "#2C3B33", "Adventures": "#8D9478" };
    return map[cat] || "#3E4548";
  }

  /* =========================================================================
     PAGE: HOME
     ========================================================================= */
  function renderHome() {
    var main = $("#main");
    var newest = M.products.filter(function (p) { return p.badges.indexOf("new") > -1; });
    var gifted = M.products.filter(function (p) { return p.badges.indexOf("most-gifted") > -1 || p.badges.indexOf("gift") > -1; }).slice(0, 4);
    var best = M.products.filter(function (p) { return p.badges.indexOf("bestseller") > -1; }).slice(0, 4);

    main.innerHTML =
      // HERO
      '<section class="hero"><div class="hero__media">' + M.art.scene({ sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33", accent: "#9A5B2E", id: "hero" }) + '</div><div class="hero__scrim"></div>' +
      '<div class="container hero__inner"><p class="eyebrow eyebrow--light">Kit · Knowledge · Good company</p>' +
      '<h1>Good kit, good company.</h1>' +
      '<p>The UK’s one-stop men’s shop and community — the kit, the know-how and the good company to get you out there and leading. Chosen by people who’ve actually used it.</p>' +
      '<div class="hero__cta"><a class="btn btn--accent" href="shop.html">Shop the range ' + I.arrow + '</a>' +
      '<a class="btn btn--light" href="gift-finder.html">Find a gift</a></div></div></section>' +

      // ASSURANCE
      '<section class="assurance"><div class="container"><div class="assurance__grid">' +
      assure(I.gift, "Free gift wrap", "On everything, with a handwritten card") +
      assure(I.truck, "Free UK delivery", "On orders over £75, next-day option") +
      assure(I.swap, "Free size swaps", "Not sure of his size? Send it back free") +
      assure(I.leaf, "Made to last", "Chosen to be used for years, not weeks") +
      '</div></div></section>' +

      // COLLECTIONS
      '<section class="section" id="collections"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">Shop by the man</p><h2>Five collections, one shop</h2></div>' +
      '<a class="link-more" href="shop.html">All products ' + I.arrow + '</a></div>' +
      '<div class="tiles">' + M.collections.map(function (c, i) {
        var wide = i === 0 ? " tile--wide" : "";
        return '<a class="tile' + wide + '" href="collection.html?c=' + c.slug + '">' +
          '<div class="tile__media">' + M.art.scene(Object.assign({ id: c.slug }, c.scene)) + '</div><div class="tile__scrim"></div>' +
          '<div class="tile__body"><span class="tile__kicker">' + esc(c.tagline) + '</span>' +
          '<h3 class="tile__title">' + esc(c.name) + '</h3><p class="tile__desc">' + esc(c.desc) + '</p>' +
          '<span class="tile__cta">Explore ' + I.arrow + '</span></div></a>';
      }).join("") + '</div></div></section>' +

      // MOST GIFTED
      '<section class="section section--tight" style="background:var(--bothy-cream-2)"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">For the man who wants nothing</p><h2>Most gifted</h2></div>' +
      '<a class="link-more" href="shop.html?gift=1">More gift ideas ' + I.arrow + '</a></div>' +
      grid(gifted) + '</div></section>' +

      // GIFT BAND
      '<section class="section"><div class="container"><div class="giftband"><div class="giftband__inner">' +
      '<div><p class="eyebrow eyebrow--light">Not sure what to get?</p><h2>His gift, in three taps.</h2>' +
      '<p>Tell us who he is, what he’s like and your budget. We’ll do the hard bit — then wrap it and post it with a card.</p>' +
      '<a class="btn btn--light" href="gift-finder.html" style="margin-top:8px">Start the gift finder ' + I.arrow + '</a></div>' +
      '<div class="giftfinder-mini"><div class="gf-mini-card">' + I.gift + '<b>Who’s it for?</b><span>Partner, dad, son, brother or a mate</span></div>' +
      '<div class="gf-mini-card">' + I.mountain + '<b>What’s he like?</b><span>Grafter, walker, gent, weekender</span></div>' +
      '<div class="gf-mini-card">' + I.tag + '<b>Your budget?</b><span>Under £25, £50, £100 — or treat him</span></div>' +
      '</div></div></div></div></section>' +

      // BESTSELLERS
      '<section class="section section--tight"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">Tried and trusted</p><h2>This season’s bestsellers</h2></div>' +
      '<a class="link-more" href="shop.html">Shop all ' + I.arrow + '</a></div>' +
      grid(best) + '</div></section>' +

      // JUST IN
      (newest.length ? '<section class="section section--tight" style="background:var(--bothy-cream-2)"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">Fresh off the fell</p><h2>Just in</h2></div>' +
      '<a class="link-more" href="shop.html?sort=new">See what’s new ' + I.arrow + '</a></div>' +
      grid(newest) + '</div></section>' : "") +

      // COMMUNITY (more than a shop)
      '<section class="section" style="background:var(--sand)"><div class="container"><div class="split">' +
      '<div class="split__media" style="background:var(--oatmeal);display:grid;place-items:center;box-shadow:none;border:1px solid var(--line);padding:12%">' +
      '<img src="assets/img/bield-mark.svg" alt="The Bield mark — a sheep bield drawn in plan" style="width:74%;height:auto"></div>' +
      '<div><p class="eyebrow">Kit, knowledge &amp; good company</p><h2>More than a shop</h2>' +
      '<p class="lede">Bield is a community as much as a shop — route guides, honest kit tests, meet-ups and good company for men who want to get out there and lead.</p>' +
      '<p>We give you the know-how first: how to re-wax a jacket, plan a first wild swim, or pack for a night on the fells. Everything is chosen and explained by people who’ve actually used it.</p>' +
      '<a class="btn btn--ghost" href="about.html">Our story ' + I.arrow + '</a></div>' +
      '</div></div></section>' +

      // JOURNAL
      '<section class="section section--tight"><div class="container">' +
      '<div class="section-head"><div><p class="eyebrow">The Journal</p><h2>Kit tests, trail guides &amp; maker stories</h2></div>' +
      '<a class="link-more" href="journal.html">Read the Journal ' + I.arrow + '</a></div>' +
      '<div class="journal-grid">' + M.articles.slice(0, 3).map(articleCard).join("") + '</div></div></section>' +

      newsletterSection();
    mountNewsletter();
  }
  function assure(icon, title, sub) { return '<div class="assurance__item">' + icon + '<div><b>' + title + '</b><span>' + sub + '</span></div></div>'; }

  /* =========================================================================
     PAGE: SHOP
     ========================================================================= */
  function renderShop() {
    var main = $("#main");
    var state = {
      collections: [], categories: [], price: null, gift: param("gift") === "1",
      sort: param("sort") || "featured", q: (param("q") || "").toLowerCase(), search: (param("q") || "")
    };
    var preC = param("c"); if (preC) state.collections.push(preC);

    var allCats = uniq(M.products.map(function (p) { return p.category; }));
    var priceBands = [{ k: "0-30", label: "Under £30", t: function (p) { return p.price < 30; } },
      { k: "30-60", label: "£30–£60", t: function (p) { return p.price >= 30 && p.price < 60; } },
      { k: "60-120", label: "£60–£120", t: function (p) { return p.price >= 60 && p.price < 120; } },
      { k: "120+", label: "£120 and up", t: function (p) { return p.price >= 120; } }];

    main.innerHTML =
      '<section class="page-hero"><div class="page-hero__media">' + M.art.scene({ id: "shop", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33" }) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <span>Shop</span></div>' +
      '<h1>' + (state.search ? "Search “" + esc(state.search) + "”" : "The whole shop") + '</h1>' +
      '<p>Curated kit across clothing, gear, gifts and grooming — every piece chosen by people who’ve used it.</p></div></section>' +
      '<section class="section"><div class="container"><div class="shop-layout">' +
      '<aside class="filters" id="filters"><div class="drawer__head" style="display:none"></div>' +
      filterGroup("Collection", M.collections.map(function (c) { return { k: c.slug, label: c.name, group: "collections", checked: state.collections.indexOf(c.slug) > -1 }; })) +
      filterGroup("Category", allCats.map(function (c) { return { k: c, label: c, group: "categories" }; })) +
      filterGroupRadio("Price", priceBands.map(function (b) { return { k: b.k, label: b.label }; })) +
      '<label class="filter-opt" style="margin-top:14px"><input type="checkbox" data-gift ' + (state.gift ? "checked" : "") + '> Gift ready only</label>' +
      '</aside>' +
      '<div><div class="shop-toolbar">' +
      '<button class="btn btn--ghost btn--sm filter-toggle" data-filter-toggle>Filters</button>' +
      '<span class="result-count"></span>' +
      '<select class="select" data-sort>' +
      opt("featured", "Featured", state.sort) + opt("new", "Newest", state.sort) +
      opt("price-asc", "Price: low to high", state.sort) + opt("price-desc", "Price: high to low", state.sort) +
      opt("name", "A–Z", state.sort) + '</select></div>' +
      '<div class="active-filters"></div><div id="shop-results"></div></div>' +
      '</div></div></section>' + newsletterSection();

    mountNewsletter();
    // mobile filter toggle
    $("[data-filter-toggle]").addEventListener("click", function () { $("#filters").classList.toggle("open"); });

    function apply() {
      var list = M.products.slice();
      if (state.q) list = list.filter(function (p) { return (p.name + " " + p.maker + " " + p.category + " " + p.collection).toLowerCase().indexOf(state.q) > -1; });
      if (state.collections.length) list = list.filter(function (p) { return state.collections.indexOf(p.collection) > -1; });
      if (state.categories.length) list = list.filter(function (p) { return state.categories.indexOf(p.category) > -1; });
      if (state.gift) list = list.filter(function (p) { return p.badges.indexOf("gift") > -1 || p.badges.indexOf("most-gifted") > -1 || p.collection === "the-crate"; });
      if (state.price) { var band = priceBands.filter(function (b) { return b.k === state.price; })[0]; if (band) list = list.filter(band.t); }
      // sort
      if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
      else if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
      else if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else if (state.sort === "new") list.sort(function (a, b) { return (b.badges.indexOf("new") > -1) - (a.badges.indexOf("new") > -1); });

      $(".result-count").textContent = list.length + " product" + (list.length === 1 ? "" : "s");
      $("#shop-results").innerHTML = list.length ? grid(list) : '<div class="empty-state"><p>Nothing matches those filters.</p><a class="btn btn--ghost" href="shop.html">Clear filters</a></div>';
      renderChips();
    }
    function renderChips() {
      var chips = [];
      state.collections.forEach(function (s) { var c = M.collection(s); chips.push(chip(c ? c.name : s, function () { state.collections = state.collections.filter(function (x) { return x !== s; }); syncInputs(); apply(); })); });
      state.categories.forEach(function (s) { chips.push(chip(s, function () { state.categories = state.categories.filter(function (x) { return x !== s; }); syncInputs(); apply(); })); });
      if (state.price) chips.push(chip(priceBands.filter(function (b) { return b.k === state.price; })[0].label, function () { state.price = null; syncInputs(); apply(); }));
      if (state.gift) chips.push(chip("Gift ready", function () { state.gift = false; syncInputs(); apply(); }));
      if (state.q) chips.push(chip("“" + state.search + "”", function () { state.q = ""; state.search = ""; apply(); }));
      var host = $(".active-filters");
      host.innerHTML = "";
      chips.forEach(function (c) { host.appendChild(c); });
      if (chips.length > 1) { var clr = h('<button class="chip" style="background:transparent;text-decoration:underline">Clear all</button>'); clr.addEventListener("click", function () { state.collections = []; state.categories = []; state.price = null; state.gift = false; state.q = ""; state.search = ""; syncInputs(); apply(); }); host.appendChild(clr); }
    }
    function chip(label, onRemove) { var c = h('<span class="chip">' + esc(label) + ' <button aria-label="Remove">×</button></span>'); c.querySelector("button").addEventListener("click", onRemove); return c; }
    function syncInputs() {
      $$("input[data-group='collections']").forEach(function (i) { i.checked = state.collections.indexOf(i.value) > -1; });
      $$("input[data-group='categories']").forEach(function (i) { i.checked = state.categories.indexOf(i.value) > -1; });
      $$("input[name='price']").forEach(function (i) { i.checked = i.value === state.price; });
      $("[data-gift]").checked = state.gift;
    }
    // wire filters
    $$("input[data-group]").forEach(function (i) {
      i.addEventListener("change", function () {
        var g = i.getAttribute("data-group");
        if (i.checked) state[g].push(i.value); else state[g] = state[g].filter(function (x) { return x !== i.value; });
        apply();
      });
    });
    $$("input[name='price']").forEach(function (i) { i.addEventListener("change", function () { state.price = i.checked ? i.value : null; apply(); }); });
    $("[data-gift]").addEventListener("change", function (e) { state.gift = e.target.checked; apply(); });
    $("[data-sort]").addEventListener("change", function (e) { state.sort = e.target.value; apply(); });

    apply();

    function filterGroup(title, opts) {
      return '<div class="filter-group"><h3>' + title + '</h3>' + opts.map(function (o) {
        var count = M.products.filter(function (p) { return o.group === "collections" ? p.collection === o.k : p.category === o.k; }).length;
        return '<label class="filter-opt"><input type="checkbox" data-group="' + o.group + '" value="' + o.k + '"' + (o.checked ? " checked" : "") + '> ' + esc(o.label) + '<span class="count">' + count + '</span></label>';
      }).join("") + '</div>';
    }
    function filterGroupRadio(title, opts) {
      return '<div class="filter-group"><h3>' + title + '</h3>' + opts.map(function (o) {
        return '<label class="filter-opt"><input type="radio" name="price" value="' + o.k + '"> ' + esc(o.label) + '</label>';
      }).join("") + '</div>';
    }
  }
  function opt(v, label, cur) { return '<option value="' + v + '"' + (v === cur ? " selected" : "") + '>' + label + '</option>'; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  /* =========================================================================
     PAGE: COLLECTION
     ========================================================================= */
  function renderCollection() {
    var slug = param("c");
    var c = M.collection(slug);
    var main = $("#main");
    if (!c) { main.innerHTML = notFound("We couldn’t find that collection."); return; }
    var list = M.byCollection(slug);
    main.innerHTML =
      '<section class="page-hero"><div class="page-hero__media">' + M.art.scene(Object.assign({ id: c.slug }, c.scene)) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>' + esc(c.name) + '</span></div>' +
      '<p class="eyebrow eyebrow--light">' + esc(c.tagline) + '</p><h1>' + esc(c.name) + '</h1><p>' + esc(c.desc) + '</p></div></section>' +
      '<section class="section"><div class="container">' +
      '<div class="shop-toolbar"><span class="result-count">' + list.length + ' products</span></div>' +
      grid(list) +
      '</div></section>' +
      // cross-sell to gift finder
      '<section class="section section--tight" style="background:var(--bothy-cream-2)"><div class="container center">' +
      '<p class="eyebrow">Buying for someone?</p><h2 style="font-size:clamp(24px,3.4vw,34px);margin-bottom:12px">Let us pick from ' + esc(c.name) + '</h2>' +
      '<a class="btn btn--accent" href="gift-finder.html">Try the gift finder ' + I.arrow + '</a></div></section>' +
      newsletterSection();
    mountNewsletter();
  }

  /* =========================================================================
     PAGE: PRODUCT
     ========================================================================= */
  function renderProduct() {
    var p = M.get(param("id"));
    var main = $("#main");
    if (!p) { main.innerHTML = notFound("We couldn’t find that product."); return; }
    document.title = p.name + " — Bield";
    var variants = p.images && p.images.length ? p.images.length : Math.max(p.colors.length, 3);
    var sel = { size: null, color: p.colors[0] && p.colors[0].name, qty: 1, img: 0 };
    var stars = "★★★★★";

    main.innerHTML =
      '<section class="section"><div class="container">' +
      '<div class="breadcrumb breadcrumb--dark"><a href="index.html">Home</a> / <a href="collection.html?c=' + p.collection + '">' + esc(M.collection(p.collection).name) + '</a> / <span>' + esc(p.name) + '</span></div>' +
      '<div class="pdp" style="margin-top:20px">' +
      '<div class="pdp__gallery"><div class="pdp__main' + (p.images && p.images.length ? ' pdp__main--photo' : '') + '" id="pdp-main">' + M.art.media(p, 0) + '</div>' +
      '<div class="pdp__thumbs" id="pdp-thumbs">' +
      Array.apply(null, { length: variants }).map(function (_, i) { return '<button class="pdp__thumb' + (i === 0 ? " is-active" : "") + '" data-img="' + i + '">' + M.art.media(p, i) + '</button>'; }).join("") +
      '</div></div>' +
      '<div class="pdp__info">' +
      '<span class="pdp__maker">' + esc(p.maker) + '</span>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<div class="pdp__price">' + (p.oldPrice ? '<span class="price">' + money(p.price) + '</span><span class="price price--old">' + money(p.oldPrice) + '</span>' : '<span class="price">' + money(p.price) + '</span>') +
      '<span class="rating"><span class="stars">' + stars + '</span> ' + p.rating.toFixed(1) + ' (' + p.reviews + ')</span></div>' +
      '<p class="pdp__pitch">' + esc(p.why) + '</p>' +
      // colour options
      (p.colors.length > 1 ? '<div class="opt-row"><div class="opt-row__label"><span>Colour: <b id="sel-color">' + esc(sel.color) + '</b></span></div>' +
        '<div class="opts" id="color-opts">' + p.colors.map(function (c, i) { return '<button class="opt opt--color' + (i === 0 ? " is-active" : "") + '" title="' + esc(c.name) + '" data-color="' + esc(c.name) + '" style="background:' + c.hex + '"></button>'; }).join("") + '</div></div>' : "") +
      // size options
      (p.sizes && !(p.sizes.length === 1 && p.sizes[0] === "One size") ?
        '<div class="opt-row"><div class="opt-row__label"><span>Size: <b id="sel-size">Choose</b></span><a href="#" data-size-guide>Size &amp; fit</a></div>' +
        '<div class="opts" id="size-opts">' + p.sizes.map(function (s) { return '<button class="opt" data-size="' + esc(s) + '">' + esc(s) + '</button>'; }).join("") + '</div></div>' :
        '<input type="hidden" id="one-size" value="One size">') +
      // sizing help
      '<p style="font-size:14px;color:var(--slate)"><b>Fit:</b> ' + esc(p.sizing) + '</p>' +
      // buy row
      '<div class="buy-row"><div class="qty"><button data-q="-1" aria-label="Decrease">−</button><input type="number" id="qty" value="1" min="1" aria-label="Quantity"><button data-q="1" aria-label="Increase">+</button></div>' +
      '<button class="btn btn--accent" style="flex:1" id="add-btn">Add to basket — ' + money(p.price) + '</button></div>' +
      '<button class="btn btn--ghost btn--block" id="wish-btn">' + (Wish.has(p.id) ? I.heartFill + " Saved" : I.heart + " Save to wishlist") + '</button>' +
      // gift note
      '<div class="gift-note">' + I.gift + '<span><b>A gift?</b> Add free wrap and a handwritten card at checkout. We never put prices in the parcel, and size swaps are free.</span></div>' +
      // accordions
      '<div class="pdp__accordion">' +
      acc("Why it’s good", '<p>' + esc(p.why) + '</p><p><b>Who it’s for:</b> ' + esc(p.whoFor) + '</p>', true) +
      acc("Great gift because…", '<p>' + esc(p.giftBecause) + '</p>') +
      acc("Details", '<dl class="spec-list"><div><dt>Maker</dt><dd>' + esc(p.maker) + '</dd></div><div><dt>Collection</dt><dd>' + esc(M.collection(p.collection).name) + '</dd></div><div><dt>Category</dt><dd>' + esc(p.category) + '</dd></div><div><dt>Product code</dt><dd>' + esc(p.code) + '</dd></div></dl>') +
      acc("Delivery &amp; returns", '<p>Free UK delivery over £75, or £4.95 below. Next-day available. Free returns and size swaps within 30 days — extended to 31 January over Christmas.</p>') +
      '</div>' +
      '</div></div></div></section>' +
      // related
      '<section class="section section--tight" style="background:var(--bothy-cream-2)"><div class="container">' +
      '<div class="section-head"><h2>More from ' + esc(M.collection(p.collection).name) + '</h2><a class="link-more" href="collection.html?c=' + p.collection + '">Shop all ' + I.arrow + '</a></div>' +
      grid(M.byCollection(p.collection).filter(function (x) { return x.id !== p.id; }).slice(0, 4)) +
      '</div></section>' + newsletterSection();
    mountNewsletter();

    // gallery
    $$("#pdp-thumbs .pdp__thumb").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#pdp-thumbs .pdp__thumb").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        $("#pdp-main").innerHTML = M.art.media(p, +b.getAttribute("data-img"));
      });
    });
    // colour
    $$("#color-opts .opt").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#color-opts .opt").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); sel.color = b.getAttribute("data-color");
        $("#sel-color").textContent = sel.color;
        // reflect colour on main image (find variant index)
        var idx = p.colors.map(function (c) { return c.name; }).indexOf(sel.color);
        if (idx > -1) { $("#pdp-main").innerHTML = M.art.media(p, idx); $$("#pdp-thumbs .pdp__thumb").forEach(function (x, i) { x.classList.toggle("is-active", i === idx); }); }
      });
    });
    // size
    $$("#size-opts .opt").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#size-opts .opt").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); sel.size = b.getAttribute("data-size"); $("#sel-size").textContent = sel.size;
      });
    });
    // qty
    $$("[data-q]").forEach(function (b) { b.addEventListener("click", function () { var inp = $("#qty"); inp.value = Math.max(1, (+inp.value) + (+b.getAttribute("data-q"))); }); });
    // add
    $("#add-btn").addEventListener("click", function () {
      var needSize = $("#size-opts");
      if (needSize && !sel.size) { toast("Please choose a size first"); $("#size-opts").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      var size = sel.size || ($("#one-size") ? "One size" : null);
      Cart.add(p.id, size, sel.color, Math.max(1, +$("#qty").value));
      toast(p.name + " added to your basket", "View basket", "cart.html");
    });
    // wish
    $("#wish-btn").addEventListener("click", function () {
      var on = Wish.toggle(p.id);
      this.innerHTML = on ? I.heartFill + " Saved" : I.heart + " Save to wishlist";
      toast(on ? "Saved to your wishlist" : "Removed from wishlist");
    });
    $("[data-size-guide]") && $("[data-size-guide]").addEventListener("click", function (e) { e.preventDefault(); toast("Most men take a medium — free swaps if not"); });
    // accordion
    $$(".acc__head").forEach(function (b) { b.addEventListener("click", function () { b.parentElement.classList.toggle("open"); }); });
  }
  function acc(title, body, open) {
    return '<div class="acc' + (open ? " open" : "") + '"><button class="acc__head">' + title + I.plus + '</button><div class="acc__body">' + body + '</div></div>';
  }

  /* =========================================================================
     PAGE: GIFT FINDER
     ========================================================================= */
  function renderGiftFinder() {
    var main = $("#main");
    var choice = { who: null, collection: null, budget: null };
    var budgets = [
      { k: "25", label: "Under £25", t: function (p) { return p.price < 25; } },
      { k: "50", label: "Under £50", t: function (p) { return p.price < 50; } },
      { k: "100", label: "Under £100", t: function (p) { return p.price < 100; } },
      { k: "treat", label: "Treat him", t: function (p) { return p.price >= 100; } }
    ];

    main.innerHTML =
      '<section class="page-hero" style="padding-block:clamp(40px,6vw,72px)"><div class="page-hero__media">' + M.art.scene({ id: "gf", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33", accent: "#9A5B2E" }) + '</div>' +
      '<div class="container page-hero__inner center mx-auto"><p class="eyebrow eyebrow--light">The gift finder</p>' +
      '<h1>His gift, in three taps</h1><p class="mx-auto" style="margin-inline:auto">He says he doesn’t want anything. He does. Answer three quick questions and we’ll find it — then wrap it with a card.</p></div></section>' +
      '<section class="section"><div class="container">' +
      '<div class="gf-progress"><span class="done"></span><span></span><span></span></div>' +
      // step 1
      '<div class="gf-step active" data-step="1"><h2 class="center" style="font-size:clamp(24px,3.4vw,34px);margin-bottom:8px">Who’s it for?</h2>' +
      '<p class="center" style="color:var(--ink-soft);margin-bottom:28px">Pick the man you’re buying for.</p>' +
      '<div class="gf-options">' + GF_WHO.map(function (w) { return gfOption("who", w.key, w.label, w.sub, w.icon); }).join("") + '</div></div>' +
      // step 2
      '<div class="gf-step" data-step="2"><h2 class="center" style="font-size:clamp(24px,3.4vw,34px);margin-bottom:8px">What’s he like?</h2>' +
      '<p class="center" style="color:var(--ink-soft);margin-bottom:28px">Choose the closest fit — you don’t have to be exact.</p>' +
      '<div class="gf-options">' + M.collections.map(function (c) { return gfOption("collection", c.slug, c.name, c.tagline, collIcon(c.slug)); }).join("") + '</div>' +
      '<p class="center" style="margin-top:24px"><button class="link-more" data-back>← Back</button></p></div>' +
      // step 3
      '<div class="gf-step" data-step="3"><h2 class="center" style="font-size:clamp(24px,3.4vw,34px);margin-bottom:8px">What’s your budget?</h2>' +
      '<p class="center" style="color:var(--ink-soft);margin-bottom:28px">No pressure — there’s something good at every level.</p>' +
      '<div class="gf-options">' + budgets.map(function (b) { return gfOption("budget", b.k, b.label, "", "tag"); }).join("") + '</div>' +
      '<p class="center" style="margin-top:24px"><button class="link-more" data-back>← Back</button></p></div>' +
      // results
      '<div class="gf-step" data-step="4"><div id="gf-results"></div></div>' +
      '</div></section>' + newsletterSection();
    mountNewsletter();

    var step = 1;
    function go(n) {
      step = n;
      $$(".gf-step").forEach(function (s) { s.classList.toggle("active", +s.getAttribute("data-step") === n); });
      $$(".gf-progress span").forEach(function (s, i) { s.classList.toggle("done", i < n); });
      window.scrollTo({ top: $(".gf-progress").offsetTop - 90, behavior: "smooth" });
    }
    $$(".gf-option").forEach(function (b) {
      b.addEventListener("click", function () {
        var field = b.getAttribute("data-field"), val = b.getAttribute("data-value");
        choice[field] = val;
        if (field === "who") go(2);
        else if (field === "collection") go(3);
        else { results(); go(4); }
      });
    });
    $$("[data-back]").forEach(function (b) { b.addEventListener("click", function () { go(Math.max(1, step - 1)); }); });

    function results() {
      var list = M.products.slice();
      if (choice.collection) {
        var favour = list.filter(function (p) { return p.collection === choice.collection; });
        var rest = list.filter(function (p) { return p.collection !== choice.collection; });
        list = favour.concat(rest);
      }
      var band = budgets.filter(function (b) { return b.k === choice.budget; })[0];
      var matched = list.filter(band.t);
      // prefer gift-ready and chosen collection
      matched.sort(function (a, b) {
        var ag = (a.collection === choice.collection ? 2 : 0) + (a.badges.indexOf("gift") > -1 || a.badges.indexOf("most-gifted") > -1 ? 1 : 0);
        var bg = (b.collection === choice.collection ? 2 : 0) + (b.badges.indexOf("gift") > -1 || b.badges.indexOf("most-gifted") > -1 ? 1 : 0);
        return bg - ag;
      });
      matched = matched.slice(0, 8);
      var whoLabel = (GF_WHO.filter(function (w) { return w.key === choice.who; })[0] || {}).label || "him";
      var collLabel = M.collection(choice.collection) ? M.collection(choice.collection).name : "";
      $("#gf-results").innerHTML =
        '<div class="center" style="margin-bottom:32px"><p class="eyebrow">Your picks</p>' +
        '<h2 style="font-size:clamp(26px,3.6vw,38px)">' + matched.length + ' ideas for your ' + esc(whoLabel.toLowerCase()) + '</h2>' +
        '<p style="color:var(--ink-soft)">' + esc(collLabel) + ' · ' + esc(band.label) + ' · all wrappable with a handwritten card</p>' +
        '<p style="margin-top:14px"><button class="btn btn--ghost btn--sm" data-restart>Start again</button></p></div>' +
        (matched.length ? grid(matched) : '<div class="empty-state"><p>Nothing in that exact budget — try nudging it up.</p><button class="btn btn--ghost" data-restart>Start again</button></div>');
      $$("[data-restart]").forEach(function (b) { b.addEventListener("click", function () { choice = { who: null, collection: null, budget: null }; go(1); }); });
    }

    function gfOption(field, val, label, sub, icon) {
      return '<button class="gf-option" data-field="' + field + '" data-value="' + val + '">' + (I[icon] || I.gift) +
        '<b>' + esc(label) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</button>';
    }
  }
  function collIcon(slug) { return { graft: "mountain", fellside: "mountain", "sunday-best": "user", "off-shift": "gift", "the-crate": "gift" }[slug] || "gift"; }

  /* =========================================================================
     PAGE: JOURNAL + ARTICLE
     ========================================================================= */
  function renderJournal() {
    var main = $("#main");
    var feature = M.articles[0];
    main.innerHTML =
      '<section class="page-hero"><div class="page-hero__media">' + M.art.scene({ id: "journal", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33" }) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <span>Journal</span></div>' +
      '<h1>The Journal</h1><p>Trail guides, honest kit tests and the makers behind the shop — the stories that help you choose well.</p></div></section>' +
      // feature
      '<section class="section"><div class="container"><a class="split" href="article.html?id=' + feature.id + '" style="text-decoration:none">' +
      '<div class="split__media">' + M.art.editorial({ base: pickBase(feature.cat), motif: feature.motif, id: 99 }) + '</div>' +
      '<div><span class="article-card__cat">' + esc(feature.cat) + '</span>' +
      '<h2 style="font-size:clamp(28px,4vw,44px);margin:10px 0 12px">' + esc(feature.title) + '</h2>' +
      '<p class="lede">' + esc(feature.excerpt) + '</p>' +
      '<span class="article-card__meta">' + esc(feature.date) + ' · ' + esc(feature.read) + ' read</span></div></a></div></section>' +
      '<section class="section section--tight"><div class="container"><div class="journal-grid">' +
      M.articles.slice(1).map(articleCard).join("") + '</div></div></section>' + newsletterSection();
    mountNewsletter();
  }

  function renderArticle() {
    var a = M.getArticle(param("id"));
    var main = $("#main");
    if (!a) { main.innerHTML = notFound("We couldn’t find that article."); return; }
    document.title = a.title + " — Bield Journal";
    var body = a.body.map(function (b) {
      if (typeof b === "string") return "<p>" + esc(b) + "</p>";
      if (b.h) return "<h2>" + esc(b.h) + "</h2>";
      if (b.q) return "<blockquote>" + esc(b.q) + "</blockquote>";
      return "";
    }).join("");
    main.innerHTML =
      '<article><section class="section" style="padding-bottom:0"><div class="container" style="max-width:820px">' +
      '<div class="breadcrumb breadcrumb--dark"><a href="index.html">Home</a> / <a href="journal.html">Journal</a> / <span>' + esc(a.cat) + '</span></div>' +
      '<p class="eyebrow" style="margin-top:14px">' + esc(a.cat) + '</p>' +
      '<h1 style="font-size:clamp(30px,5vw,52px);max-width:20ch">' + esc(a.title) + '</h1>' +
      '<p class="article-card__meta" style="margin-top:14px">' + esc(a.date) + ' · ' + esc(a.read) + ' read</p></div></section>' +
      '<section class="section" style="padding-top:32px"><div class="container"><figure style="max-width:960px;margin:0 auto 40px"><div style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--line);aspect-ratio:16/9">' + M.art.editorial({ base: pickBase(a.cat), motif: a.motif, id: 88 }) + '</div></figure>' +
      '<div class="prose">' + body + '</div></div></section>' +
      // more from journal
      '<section class="section section--tight" style="background:var(--bothy-cream-2)"><div class="container">' +
      '<div class="section-head"><h2>More from the Journal</h2><a class="link-more" href="journal.html">All stories ' + I.arrow + '</a></div>' +
      '<div class="journal-grid">' + M.articles.filter(function (x) { return x.id !== a.id; }).slice(0, 3).map(articleCard).join("") + '</div></div></section>' +
      '</article>' + newsletterSection();
    mountNewsletter();
  }

  /* =========================================================================
     PAGE: ABOUT
     ========================================================================= */
  function renderAbout() {
    var main = $("#main");
    main.innerHTML =
      '<section class="page-hero"><div class="page-hero__media">' + M.art.scene({ id: "about", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33", accent: "#9A5B2E" }) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <span>Our Story</span></div>' +
      '<p class="eyebrow eyebrow--light">Kit, knowledge &amp; good company</p><h1>More than a shop</h1>' +
      '<p>We give men the kit, the know-how and the good company to get out there and lead.</p></div></section>' +
      '<section class="section"><div class="container"><div class="prose">' +
      '<p>Bield is the UK’s one-stop men’s shop and community: kit, knowledge and good company for men who want to get out there and lead. A bield is a Cumbrian word for shelter — the drystone wall or hollow on a fellside where you get out of the weather. It names exactly what we are: somewhere to stop, take stock and set off better equipped.</p>' +
      '<blockquote>Kit is only half of it. The know-how and the good company are what actually get you out the door.</blockquote>' +
      '<p>So we lead with knowledge: honest kit tests, route guides and plain-English advice from people who’ve actually used the gear. Gift buyers are a welcome second audience, and everything can be wrapped with a handwritten card — but the man, and getting him out there, comes first.</p>' +
      '</div></div></section>' +
      '<section class="section" style="background:var(--sand)"><div class="container"><div class="split">' +
      '<div class="split__media" style="background:var(--oatmeal);display:grid;place-items:center;box-shadow:none;border:1px solid var(--line);padding:12%">' +
      '<img src="assets/img/bield-mark.svg" alt="The Bield mark — a sheep bield drawn in plan" style="width:74%;height:auto"></div>' +
      '<div><p class="eyebrow">The community</p><h2>Good company, out there</h2>' +
      '<p class="lede">Route guides, meet-ups, kit tests and a Journal worth reading — Bield is the people as much as the products.</p>' +
      '<p>It’s there in the mark, too: a sheep bield drawn in plan — four short wall arms from a centre, so there’s a lee whatever way the wind comes. Everything points back to getting out there together.</p>' +
      '<a class="btn btn--ghost" href="journal.html">Into the Journal ' + I.arrow + '</a></div>' +
      '</div></div></section>' +
      '<section class="section section--tight"><div class="container">' +
      '<div class="section-head center" style="justify-content:center"><div><p class="eyebrow">How we talk</p><h2>What we stand for</h2></div></div>' +
      '<div class="grid-3">' +
      valueCard(I.heart, "Warm, not macho", "We talk like a well-travelled friend, never like a kit-list bore.") +
      valueCard(I.mountain, "Knowledgeable, not technical", "Why it’s good, in one plain sentence. No jargon, no stacked adjectives.") +
      valueCard(I.gift, "Wry, not silly", "Dry northern humour, used lightly. No “LAST CHANCE!!!”.") +
      valueCard(I.check, "Honest, not salesy", "Real reviews, clear sizing, no fake countdowns. Ever.") +
      valueCard(I.leaf, "Made to last", "Quality over quantity. One great jacket beats three average ones.") +
      valueCard(I.user, "Good company", "A community, not a mailing list — get out there, and bring someone.") +
      '</div></div></section>' +
      '<section class="section" style="background:var(--sand)"><div class="container"><div class="split split--reverse">' +
      '<div class="split__media">' + M.art.scene({ id: "curation", sky: "#4A3B2E", mid: "#8D9478", fore: "#2C3B33", accent: "#9A5B2E" }) + '</div>' +
      '<div><p class="eyebrow">Curation, not clutter</p><h2>If we wouldn’t use it, it doesn’t go in</h2>' +
      '<p class="lede">We favour British and independent makers wherever the quality allows, from Borders knitwear to Cumbrian bootmakers.</p>' +
      '<p>Every product page answers the same four questions: why it’s good, who it’s for, how it fits, and — for the gift buyer — why it makes a great gift. Plain, useful English throughout.</p>' +
      '<a class="btn btn--ghost" href="shop.html">Shop the range ' + I.arrow + '</a></div>' +
      '</div></div></section>' + newsletterSection();
    mountNewsletter();
  }
  function valueCard(icon, title, body) { return '<div class="value-card">' + icon + '<h3>' + title + '</h3><p>' + esc(body) + '</p></div>'; }

  /* =========================================================================
     PAGE: CART
     ========================================================================= */
  function renderCart() {
    var main = $("#main");
    var host = main; // full re-render
    var items = Cart.items.map(function (i) { return { line: i, p: M.get(i.id) }; }).filter(function (x) { return x.p; });
    var sub = Cart.subtotal();
    var threshold = 75;
    var toFree = Math.max(0, threshold - sub);
    var shipping = sub >= threshold || sub === 0 ? 0 : 4.95;

    if (!items.length) {
      host.innerHTML = '<section class="section"><div class="container"><div class="empty-state" style="padding:80px 20px">' +
        '<p class="eyebrow">Your basket</p><h1 style="font-size:clamp(28px,4vw,40px);margin:8px 0 16px">Nothing in here yet</h1>' +
        '<p style="max-width:40ch;margin:0 auto 22px">Have a look round the shop, or let us find a gift for you.</p>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn--accent" href="shop.html">Shop the range</a><a class="btn btn--ghost" href="gift-finder.html">Find a gift</a></div>' +
        '</div></div></section>';
      return;
    }

    host.innerHTML =
      '<section class="section"><div class="container">' +
      '<div class="breadcrumb breadcrumb--dark"><a href="index.html">Home</a> / <span>Basket</span></div>' +
      '<h1 style="font-size:clamp(28px,4vw,42px);margin:10px 0 24px">Your basket</h1>' +
      '<div class="cart-layout"><div>' +
      items.map(function (x) {
        var p = x.p, l = x.line;
        var opts = [l.color, l.size].filter(function (v) { return v && v !== "One size"; }).join(" · ");
        return '<div class="cart-line"><a class="cart-line__media" href="product.html?id=' + p.id + '">' + M.art.media(p, Math.max(0, p.colors.map(function (c) { return c.name; }).indexOf(l.color))) + '</a>' +
          '<div><div class="cart-line__name">' + esc(p.name) + '</div><div class="cart-line__opts">' + esc(p.maker) + (opts ? " · " + esc(opts) : "") + '</div>' +
          '<div class="qty" style="width:fit-content"><button data-cq="-1" data-lid="' + l.lid + '">−</button><input type="number" value="' + l.qty + '" min="1" data-lidq="' + l.lid + '" aria-label="Quantity"><button data-cq="1" data-lid="' + l.lid + '">+</button></div>' +
          '<button class="cart-line__remove" data-remove="' + l.lid + '" style="margin-top:10px">Remove</button></div>' +
          '<div class="cart-line__price">' + money(p.price * l.qty) + '</div></div>';
      }).join("") +
      '<a class="link-more" href="shop.html" style="display:inline-block;margin-top:20px">← Continue shopping</a>' +
      '</div>' +
      // summary
      '<aside class="summary"><h2>Order summary</h2>' +
      '<div class="summary__row"><span>Subtotal</span><span>' + money(sub) + '</span></div>' +
      '<div class="summary__row"><span>Delivery</span><span>' + (shipping === 0 ? "Free" : money(shipping)) + '</span></div>' +
      (toFree > 0 ? '<div style="margin:10px 0 4px"><div class="ship-bar"><span style="width:' + Math.min(100, (sub / threshold) * 100) + '%"></span></div>' +
        '<p style="font-size:12px;color:var(--ink-soft);margin:6px 0 0">Add ' + money(toFree) + ' for free UK delivery</p></div>' :
        '<p style="font-size:12px;color:var(--fell-green);margin:6px 0 0">' + I.check.replace("24 24", "24 24") + ' You’ve unlocked free delivery</p>') +
      '<div class="summary__row summary__row--total"><span>Total</span><span>' + money(sub + shipping) + '</span></div>' +
      '<label class="filter-opt" style="margin:16px 0 4px"><input type="checkbox" id="gift-wrap"> This is a gift — add free wrap &amp; a card</label>' +
      '<button class="btn btn--accent btn--block" id="checkout" style="margin-top:12px">Checkout</button>' +
      '<p style="font-size:12px;color:var(--ink-soft);text-align:center;margin-top:12px">Free size swaps · no prices in the parcel</p>' +
      '</aside></div></div></section>';

    $$("[data-cq]").forEach(function (b) { b.addEventListener("click", function () { var lid = b.getAttribute("data-lid"); var it = Cart.items.filter(function (i) { return i.lid === lid; })[0]; if (it) Cart.setQty(lid, it.qty + (+b.getAttribute("data-cq"))); }); });
    $$("[data-lidq]").forEach(function (inp) { inp.addEventListener("change", function () { Cart.setQty(inp.getAttribute("data-lidq"), Math.max(1, +inp.value)); }); });
    $$("[data-remove]").forEach(function (b) { b.addEventListener("click", function () { Cart.remove(b.getAttribute("data-remove")); toast("Removed from basket"); }); });
    $("#checkout").addEventListener("click", function () {
      toast("Checkout is a demo — connect Stripe or Snipcart to take payment. See the README.");
    });
  }

  /* =========================================================================
     PAGE: WISHLIST + ACCOUNT (light)
     ========================================================================= */
  function renderWishlist() {
    var main = $("#main");
    var items = Wish.ids.map(M.get).filter(Boolean);
    main.innerHTML =
      '<section class="page-hero" style="padding-block:clamp(40px,6vw,72px)"><div class="page-hero__media">' + M.art.scene({ id: "wish", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33" }) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <span>Wishlist</span></div>' +
      '<h1>Your wishlist</h1><p>Save the things he’d love. Share the list, or send it to whoever’s asking what to get you.</p></div></section>' +
      '<section class="section"><div class="container">' +
      (items.length ? grid(items) : '<div class="empty-state" style="padding:70px 20px"><p style="max-width:40ch;margin:0 auto 20px">Nothing saved yet. Tap the heart on anything you like the look of.</p><a class="btn btn--accent" href="shop.html">Browse the shop</a></div>') +
      '</div></section>' + newsletterSection();
    mountNewsletter();
  }
  function renderAccount() {
    var main = $("#main");
    main.innerHTML =
      '<section class="page-hero" style="padding-block:clamp(40px,6vw,72px)"><div class="page-hero__media">' + M.art.scene({ id: "acct", sky: "#3E4548", mid: "#4A3B2E", fore: "#2C3B33" }) + '</div>' +
      '<div class="container page-hero__inner"><div class="breadcrumb"><a href="index.html">Home</a> / <span>Account</span></div>' +
      '<h1>Your account</h1><p>Sign in to track orders, save wishlists and set gift reminders for the dates that matter.</p></div></section>' +
      '<section class="section"><div class="container" style="max-width:440px">' +
      '<form id="signin" class="stack" style="background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px">' +
      '<h2 style="font-size:24px">Sign in</h2>' +
      '<label class="field"><span>Email</span><input type="email" required placeholder="you@example.com"></label>' +
      '<label class="field"><span>Password</span><input type="password" required placeholder="••••••••"></label>' +
      '<button class="btn btn--accent btn--block" type="submit">Sign in</button>' +
      '<p style="font-size:13px;color:var(--ink-soft);text-align:center;margin:0">New here? <a href="#" style="color:var(--bracken)">Create an account</a> · accounts need a backend to go live.</p>' +
      '</form></div></section>' + newsletterSection();
    mountNewsletter();
    $("#signin").addEventListener("submit", function (e) { e.preventDefault(); toast("Accounts need a backend — wire up your auth provider to enable sign-in."); });
  }

  /* =========================================================================
     SHARED: NEWSLETTER
     ========================================================================= */
  function newsletterSection() {
    return '<section class="section newsletter"><div class="container"><div class="newsletter__inner">' +
      '<p class="eyebrow eyebrow--light">Field notes</p><h2>Good kit, worth knowing about</h2>' +
      '<p>A weekly note — trail guides, honest kit tests and the odd gift idea. No fake urgency, unsubscribe anytime.</p>' +
      '<form class="subscribe" id="newsletter-form"><input type="email" required placeholder="Your email address" aria-label="Email address">' +
      '<button class="btn btn--accent" type="submit">Subscribe</button></form>' +
      '<p class="form-note" id="newsletter-note">Prefer gift ideas only? You can pick that after you sign up.</p>' +
      '</div></div></section>';
  }
  function mountNewsletter() {
    var form = $("#newsletter-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $("#newsletter-note");
      note.textContent = "You’re on the list — welcome to Bield. Check your inbox to confirm.";
      note.className = "form-note form-note--ok";
      form.reset();
    });
  }

  function notFound(msg) {
    return '<section class="section"><div class="container"><div class="empty-state" style="padding:80px 20px">' +
      '<p class="eyebrow">Off the map</p><h1 style="font-size:clamp(28px,4vw,40px);margin:8px 0 14px">' + esc(msg) + '</h1>' +
      '<a class="btn btn--accent" href="shop.html">Back to the shop</a></div></div></section>';
  }

  /* =========================================================================
     BOOT
     ========================================================================= */
  var ROUTES = {
    home: renderHome, shop: renderShop, collection: renderCollection, product: renderProduct,
    "gift-finder": renderGiftFinder, journal: renderJournal, article: renderArticle,
    about: renderAbout, cart: renderCart, wishlist: renderWishlist, account: renderAccount
  };

  document.addEventListener("DOMContentLoaded", function () {
    Cart.load(); Wish.load();
    injectHeader();
    var page = document.body.dataset.page;
    if (ROUTES[page]) ROUTES[page]();
    injectFooter();
    Cart.sync();
  });
})();
