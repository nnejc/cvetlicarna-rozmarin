/*
 * AURELLE – shared logic: formatting, prices, cart, header/footer, cart drawer, search, mobile menu.
 * Exposes everything the page scripts need as window.Shop.
 */
(function () {
  "use strict";

  var NBSP = " ";
  var CART_KEY = "aurelle-cart-v1";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GENDER_LABEL = { zanjo: "Zanjo", zanj: "Zanj", unisex: "Unisex" };
  var cartListeners = [];

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(n) {
    return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + NBSP + "€";
  }

  function find(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function firstNotes(p) {
    return ["top", "heart", "base"].map(function (k) {
      return p.notes[k].split(",")[0].trim();
    });
  }

  // Resolves true if an optional image exists. The answer is cached for the session,
  // so a missing file is requested at most once.
  var probeCache = {};
  try { probeCache = JSON.parse(sessionStorage.getItem("aurelle-probe")) || {}; } catch (e) { probeCache = {}; }
  var probePending = {};
  function probe(src) {
    if (src in probeCache) return Promise.resolve(probeCache[src]);
    if (probePending[src]) return probePending[src];
    probePending[src] = new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () {
        var ok = img.naturalWidth > 0;
        probeCache[src] = ok;
        try { sessionStorage.setItem("aurelle-probe", JSON.stringify(probeCache)); } catch (e) { /* ignore */ }
        resolve(ok);
      };
      img.src = src;
    });
    return probePending[src];
  }

  function lifestyleSrc(p) {
    return "images/product-" + p.id + "-lifestyle.jpg";
  }

  /* ---------- prices ---------- */

  function price(p, size) {
    var base = p.prices[size];
    var promo = !!(PROMO && PROMO.active);
    var final = promo ? promoPrice(base) : base;
    return { base: base, final: final, promo: promo, per100: (final / size) * 100 };
  }

  function priceHTML(p, size) {
    var pr = price(p, size);
    var old = pr.promo
      ? '<span class="sr-only">Redna cena </span><s class="price__old">' + money(pr.base) + '</s><span class="sr-only"> Akcijska cena </span>'
      : "";
    return (
      '<div class="price__row">' + old + '<span class="price__now">' + money(pr.final) + "</span></div>" +
      '<div class="price__unit">' + money(pr.per100) + " / 100" + NBSP + "ml</div>"
    );
  }

  // Lowest price of a product ("od ...") shown on cards.
  function fromPriceHTML(p) {
    var pr = price(p, SIZES[0]);
    var html = '<span class="card__now">od' + NBSP + money(pr.final) + "</span>";
    if (pr.promo) html += ' <s class="card__old"><span class="sr-only">Redna cena </span>od' + NBSP + money(pr.base) + "</s>";
    return html;
  }

  // Fades the old content out, swaps it and fades it back in.
  function swap(el, html) {
    if (reduceMotion) { el.innerHTML = html; return; }
    el.classList.add("is-swapping");
    clearTimeout(el._swapTimer);
    el._swapTimer = setTimeout(function () {
      el.innerHTML = html;
      el.classList.remove("is-swapping");
    }, 180);
  }

  function sizesHTML(selected, name) {
    return (
      '<div class="sizes" role="group" aria-label="Velikost: ' + esc(name) + '">' +
      SIZES.map(function (s) {
        return '<button type="button" class="sizes__btn" data-size="' + s + '" aria-pressed="' + (s === selected) + '">' + s + NBSP + "ml</button>";
      }).join("") +
      "</div>"
    );
  }

  function bindSizes(root, onChange) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".sizes__btn");
      if (!btn || !root.contains(btn)) return;
      var size = parseInt(btn.getAttribute("data-size"), 10);
      root.querySelectorAll(".sizes__btn").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      onChange(size);
    });
  }

  /* ---------- product card ---------- */

  function createCard(p) {
    var el = document.createElement("article");
    el.className = "card";
    var url = "product.html?id=" + p.id;
    var altSrc = p.secondImage || lifestyleSrc(p);
    el.innerHTML =
      '<div class="card__media media">' +
      '<a class="card__link" href="' + url + '" tabindex="-1" aria-hidden="true">' +
      '<img class="card__img" src="' + esc(p.image) + '" alt="" width="800" height="800" loading="lazy" decoding="async">' +
      "</a>" +
      '<button type="button" class="quick" aria-label="Hitri nakup: ' + esc(p.name) + ", " + DEFAULT_SIZE + ' ml">Hitri nakup · <span class="lc">' + DEFAULT_SIZE + NBSP + "ml</span></button>" +
      "</div>" +
      '<div class="card__body">' +
      '<p class="eyebrow">' + esc(p.family) + "</p>" +
      '<h3 class="card__name"><a href="' + url + '">' + esc(p.name) + "</a></h3>" +
      '<p class="card__notes">' + firstNotes(p).map(esc).join(" · ") + "</p>" +
      '<p class="card__price">' + fromPriceHTML(p) + "</p>" +
      "</div>";
    el.querySelector(".quick").addEventListener("click", function () { addItem(p.id, DEFAULT_SIZE, 1); });
    // Hover image: secondImage, or the optional lifestyle image when that file exists.
    probe(altSrc).then(function (ok) {
      if (!ok) return;
      var img = new Image();
      img.className = "card__img card__img--alt";
      img.alt = ""; img.width = 800; img.height = 800; img.loading = "lazy"; img.decoding = "async";
      img.src = altSrc;
      el.querySelector(".card__link").appendChild(img);
    });
    return el;
  }

  /* ---------- cart ---------- */

  var cart = loadCart();

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (l) {
        if (l.id === SAMPLE_SET.id) return l.qty > 0;
        return find(l.id) && SIZES.indexOf(l.size) !== -1 && l.qty > 0;
      });
    } catch (e) { return []; }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
    renderCart();
  }

  // Cart lines with everything needed to display them.
  function lines() {
    return cart.map(function (l) {
      var isSet = l.id === SAMPLE_SET.id;
      var p = isSet ? SAMPLE_SET : find(l.id);
      var unit = isSet ? SAMPLE_SET.price : price(p, l.size).final;
      return {
        id: l.id,
        size: l.size,
        qty: l.qty,
        p: p,
        isSet: isSet,
        label: isSet ? SAMPLE_SET.detail.replace(" ml", NBSP + "ml") : l.size + NBSP + "ml",
        href: isSet ? null : "product.html?id=" + l.id,
        unit: unit,
        total: Math.round(unit * l.qty * 100) / 100
      };
    });
  }

  function subtotal() {
    return Math.round(lines().reduce(function (a, l) { return a + l.total; }, 0) * 100) / 100;
  }

  function count() {
    return cart.reduce(function (a, l) { return a + l.qty; }, 0);
  }

  function hasSet() {
    return cart.some(function (l) { return l.id === SAMPLE_SET.id; });
  }

  function addItem(id, size, qty) {
    var line = cart.filter(function (l) { return l.id === id && l.size === size; })[0];
    if (line) line.qty = Math.min(99, line.qty + qty);
    else cart.push({ id: id, size: size, qty: Math.min(99, qty) });
    saveCart();
    openCart();
  }

  function changeQty(id, size, delta) {
    cart.forEach(function (l) {
      if (l.id === id && l.size === size) l.qty = Math.max(1, Math.min(99, l.qty + delta));
    });
    saveCart();
  }

  function removeItem(id, size) {
    cart = cart.filter(function (l) { return !(l.id === id && l.size === size); });
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function shippingProgressHTML(sub) {
    var left = Math.round((FREE_SHIPPING_FROM - sub) * 100) / 100;
    var pct = Math.min(100, (sub / FREE_SHIPPING_FROM) * 100);
    var text = left > 0 ? "Še " + money(left) + " do brezplačne dostave" : "Dostava je brezplačna";
    return (
      '<p class="ship__text">' + text + "</p>" +
      '<div class="ship__bar" role="presentation"><span style="width:' + pct + '%"></span></div>'
    );
  }

  /* ---------- chrome: announcement, header, mobile menu, drawer, footer ---------- */

  var drawer, overlay, mmenu, lastFocus;

  function logoHTML(cls, h) {
    return '<img class="' + cls + '" src="images/logo-black.svg" alt="AURELLE" width="' + Math.round(h * 8.34) + '" height="' + h + '">';
  }

  function announceText() {
    var free = "Brezplačna dostava nad 60" + NBSP + "€";
    if (PROMO && PROMO.active) {
      return PROMO.label + " −" + PROMO.percent + NBSP + "% na vse dišave do " + (PROMO.until || "1. 12.").replace(/ /g, NBSP) + " · " + free;
    }
    return free + " · Vzorec 2" + NBSP + "ml ob vsakem nakupu";
  }

  var NAV_LINKS = [
    ["Zanjo", "index.html?spol=zanjo#products", "zanjo"],
    ["Zanj", "index.html?spol=zanj#products", "zanj"],
    ["Vse dišave", "index.html#products", "all"],
    ["O nas", "o-nas.html", null]
  ];

  function navLinks(extraClass) {
    return NAV_LINKS.map(function (l) {
      return '<a href="' + l[1] + '"' + (l[2] ? ' data-filter="' + l[2] + '"' : "") + (extraClass ? ' class="' + extraClass + '"' : "") + ">" + l[0] + "</a>";
    }).join("");
  }

  function buildChrome() {
    var head =
      '<a class="skip" href="#main">Preskoči na vsebino</a>' +
      '<div class="announce"><p class="announce__text" id="announce"><span class="announce__run">' + announceText() + "</span></p></div>" +
      '<header class="header" id="header"><div class="header__in">' +
      '<div class="header__left">' +
      '<button type="button" class="hbtn nav-toggle" id="menu-open" aria-expanded="false" aria-controls="mobile-menu" aria-label="Meni">' +
      '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 1h22M0 7h22M0 13h22"/></svg></button>' +
      '<nav class="nav" id="main-nav" aria-label="Glavna navigacija">' + navLinks() + "</nav></div>" +
      '<a class="header__logo" href="index.html" aria-label="AURELLE, domov">' + logoHTML("logo", 28) + "</a>" +
      '<div class="header__right">' +
      '<button type="button" class="hbtn" id="search-toggle" aria-expanded="false" aria-controls="search-panel" aria-label="Iskanje">' +
      '<svg width="19" height="19" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M11.6 11.6 16.5 16.5"/></svg></button>' +
      '<button type="button" class="hbtn hbtn--cart" id="cart-toggle" aria-controls="cart" aria-expanded="false">' +
      '<span class="cart-label">Košarica <span id="cart-count">(0)</span></span>' +
      '<span class="cart-icon"><svg width="19" height="20" viewBox="0 0 19 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2.5 6.5h14l1 12.5h-16z"/><path d="M6 9V5a3.5 3.5 0 0 1 7 0v4"/></svg>' +
      '<span class="cart-badge" id="cart-badge" hidden>0</span><span class="sr-only">Košarica</span></span>' +
      "</button></div></div>" +
      '<div class="search" id="search-panel" hidden><div class="search__in">' +
      '<label class="sr-only" for="search-input">Išči dišave</label>' +
      '<input id="search-input" type="search" placeholder="Išči po imenu, noti ali družini" autocomplete="off">' +
      '<ul class="search__results" id="search-results"></ul></div></div>' +
      "</header>" +
      '<div class="mmenu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Meni" hidden>' +
      '<div class="mmenu__top">' + logoHTML("logo", 22) +
      '<button type="button" class="link-btn" id="menu-close">Zapri</button></div>' +
      '<nav class="mmenu__nav" aria-label="Mobilna navigacija">' + navLinks() + "</nav></div>";

    var cartEl =
      '<div class="overlay" id="overlay"></div>' +
      '<aside class="drawer" id="cart" role="dialog" aria-modal="true" aria-label="Košarica" aria-hidden="true">' +
      '<div class="drawer__head"><h2>Košarica</h2><button type="button" class="link-btn" id="cart-close">Zapri</button></div>' +
      '<div class="drawer__ship" id="cart-ship"></div>' +
      '<div class="drawer__body" id="cart-lines"></div>' +
      '<div class="drawer__foot" id="cart-foot"></div>' +
      "</aside>";

    var foot =
      '<footer class="footer"><div class="wrap">' +
      '<div class="footer__grid">' +
      '<div class="footer__brand">' + logoHTML("logo", 22) +
      "<p>Eau de Parfum, izdelano v Sloveniji.</p></div>" +
      '<nav aria-label="Trgovina"><h2>Trgovina</h2><ul>' +
      '<li><a href="index.html#products" data-filter="all">Vse dišave</a></li>' +
      '<li><a href="index.html?spol=zanjo#products" data-filter="zanjo">Zanjo</a></li>' +
      '<li><a href="index.html?spol=zanj#products" data-filter="zanj">Zanj</a></li>' +
      '<li><a href="index.html?spol=unisex#products" data-filter="unisex">Unisex</a></li></ul></nav>' +
      '<nav aria-label="Pomoč"><h2>Pomoč</h2><ul>' +
      '<li><a href="dostava.html">Dostava</a></li><li><a href="vracila.html">Vračila</a></li>' +
      '<li><a href="pogosta-vprasanja.html">Pogosta vprašanja</a></li><li><a href="kontakt.html">Kontakt</a></li></ul></nav>' +
      '<nav aria-label="AURELLE"><h2>AURELLE</h2><ul>' +
      '<li><a href="o-nas.html">O nas</a></li><li><a href="pogoji.html">Splošni pogoji</a></li><li><a href="zasebnost.html">Zasebnost</a></li></ul></nav>' +
      "</div>" +
      '<p class="footer__copy">© 2026 AURELLE</p>' +
      "</div></footer>";

    document.body.insertAdjacentHTML("afterbegin", head);
    document.body.insertAdjacentHTML("beforeend", cartEl + foot);
  }

  // Keeps the announcement on one line: marquee when it does not fit, ellipsis with reduced motion.
  function fitAnnounce() {
    var box = document.getElementById("announce");
    if (!box) return;
    var run = box.querySelector(".announce__run");
    box.classList.remove("is-marquee");
    box.innerHTML = '<span class="announce__run">' + announceText() + "</span>";
    run = box.querySelector(".announce__run");
    if (reduceMotion) return;
    if (box.scrollWidth > box.clientWidth + 1) {
      box.classList.add("is-marquee");
      box.innerHTML =
        '<span class="announce__track">' +
        '<span class="announce__run">' + announceText() + "</span>" +
        '<span class="announce__run" aria-hidden="true">' + announceText() + "</span></span>";
    }
  }

  function renderCart() {
    var n = count();
    var countEl = document.getElementById("cart-count");
    if (countEl) countEl.textContent = "(" + n + ")";
    var badge = document.getElementById("cart-badge");
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    var body = document.getElementById("cart-lines");
    if (body) {
      var ls = lines();
      var sub = subtotal();
      document.getElementById("cart-ship").innerHTML = ls.length ? shippingProgressHTML(sub) : "";

      if (!ls.length) {
        body.innerHTML = '<p class="drawer__empty">Košarica je prazna.</p>';
        document.getElementById("cart-foot").innerHTML =
          '<a class="btn btn--outline btn--full" href="index.html#products" data-close-cart>Nadaljuj z nakupom</a>';
      } else {
        body.innerHTML = '<ul class="lines">' + ls.map(function (l) {
          var name = l.href
            ? '<a class="line__name" href="' + l.href + '">' + esc(l.p.name) + "</a>"
            : '<p class="line__name">' + esc(l.p.name) + "</p>";
          return (
            '<li class="line" data-id="' + l.id + '" data-size="' + l.size + '">' +
            '<div class="line__media media"><img src="' + esc(l.p.image) + '" alt="" loading="lazy"></div>' +
            '<div class="line__info">' + name +
            '<p class="muted">' + l.label + " · " + money(l.unit) + "</p>" +
            '<div class="line__ctrl">' +
            '<div class="qty" role="group" aria-label="Količina">' +
            '<button type="button" data-act="dec" aria-label="Zmanjšaj količino">−</button>' +
            "<span>" + l.qty + "</span>" +
            '<button type="button" data-act="inc" aria-label="Povečaj količino">+</button></div>' +
            '<button type="button" class="link-btn" data-act="rm">Odstrani</button></div></div>' +
            '<p class="line__total">' + money(l.total) + "</p></li>"
          );
        }).join("") + "</ul>" +
        (hasSet() ? "" :
          '<div class="upsell"><div class="upsell__media media"><img src="' + esc(SAMPLE_SET.image) + '" alt="" loading="lazy"></div>' +
          '<p>Dodaj set vzorcev ' + SAMPLE_SET.detail.replace(" ml", NBSP + "ml") + " za " + money(SAMPLE_SET.price) + "</p>" +
          '<button type="button" class="btn btn--outline btn--sm" data-add-set>Dodaj</button></div>');

        document.getElementById("cart-foot").innerHTML =
          '<div class="sum"><span>Vmesni seštevek</span><strong>' + money(sub) + "</strong></div>" +
          '<p class="muted small">Vzorec 2' + NBSP + "ml je dodan brezplačno. Dostava se izračuna na blagajni.</p>" +
          '<a class="btn btn--full" href="checkout.html">Na blagajno</a>';
      }
    }
    cartListeners.forEach(function (fn) { fn(); });
  }

  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    document.getElementById("cart-close").focus();
  }

  function closeCart() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setMenu(open) {
    var opener = document.getElementById("menu-open");
    mmenu.hidden = !open;
    // next frame so the opacity transition runs
    requestAnimationFrame(function () { mmenu.classList.toggle("is-open", open); });
    opener.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("no-scroll", open);
    if (open) document.getElementById("menu-close").focus(); else opener.focus();
  }

  function initSearch() {
    var toggle = document.getElementById("search-toggle");
    var panel = document.getElementById("search-panel");
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) input.focus();
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ""; return; }
      var hits = PRODUCTS.filter(function (p) {
        var hay = [p.name, p.family, GENDER_LABEL[p.gender], p.notes.top, p.notes.heart, p.notes.base].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      results.innerHTML = hits.length
        ? hits.map(function (p) {
            return '<li><a href="product.html?id=' + p.id + '"><span class="search__name">' + esc(p.name) + '</span><span class="muted">' + esc(p.family) + "</span></a></li>";
          }).join("")
        : '<li class="muted">Ni zadetkov.</li>';
    }

    toggle.addEventListener("click", function () { setOpen(panel.hidden); });
    input.addEventListener("input", run);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
  }

  function initChrome() {
    buildChrome();
    drawer = document.getElementById("cart");
    overlay = document.getElementById("overlay");
    mmenu = document.getElementById("mobile-menu");

    document.getElementById("cart-toggle").addEventListener("click", openCart);
    document.getElementById("cart-close").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-cart]")) { closeCart(); return; }
      if (e.target.closest("[data-add-set]")) { addItem(SAMPLE_SET.id, 0, 1); return; }
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var line = btn.closest(".line");
      var id = line.getAttribute("data-id");
      var size = parseInt(line.getAttribute("data-size"), 10);
      var act = btn.getAttribute("data-act");
      if (act === "inc") changeQty(id, size, 1);
      else if (act === "dec") changeQty(id, size, -1);
      else removeItem(id, size);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mmenu.hidden) { setMenu(false); return; }
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeCart(); return; }
      if (e.key !== "Tab") return;
      // Keep keyboard focus inside the open drawer.
      var f = drawer.querySelectorAll("a[href], button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.getElementById("menu-open").addEventListener("click", function () { setMenu(true); });
    document.getElementById("menu-close").addEventListener("click", function () { setMenu(false); });
    mmenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        // close without moving focus: the link navigates or scrolls on its own
        mmenu.hidden = true; mmenu.classList.remove("is-open");
        document.getElementById("menu-open").setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && !mmenu.hidden) {
        mmenu.hidden = true; mmenu.classList.remove("is-open"); document.body.classList.remove("no-scroll");
      }
      clearTimeout(initChrome._t);
      initChrome._t = setTimeout(fitAnnounce, 150);
    });

    window.addEventListener("storage", function (e) {
      if (e.key === CART_KEY) { cart = loadCart(); renderCart(); }
    });

    initSearch();
    renderCart();
    fitAnnounce();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAnnounce);
  }

  initChrome();

  // about.jpg is optional: the markup defaults to a crop of hero-woman.jpg.
  var aboutImgs = document.querySelectorAll("img[data-about]");
  if (aboutImgs.length) {
    probe("images/about.jpg").then(function (ok) {
      if (!ok) return;
      aboutImgs.forEach(function (img) { img.src = "images/about.jpg"; img.classList.remove("is-crop"); });
    });
  }

  window.Shop = {
    NBSP: NBSP,
    reduceMotion: reduceMotion,
    GENDER_LABEL: GENDER_LABEL,
    esc: esc,
    money: money,
    find: find,
    probe: probe,
    lifestyleSrc: lifestyleSrc,
    price: price,
    priceHTML: priceHTML,
    swap: swap,
    sizesHTML: sizesHTML,
    bindSizes: bindSizes,
    createCard: createCard,
    addItem: addItem,
    clearCart: clearCart,
    lines: lines,
    subtotal: subtotal,
    shippingProgressHTML: shippingProgressHTML,
    onCartChange: function (fn) { cartListeners.push(fn); }
  };
})();
