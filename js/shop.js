/*
 * AURELLE – shared logic: formatting, prices, cart, header/footer, cart drawer, search.
 * Exposes everything the page scripts need as window.Shop.
 */
(function () {
  "use strict";

  var NBSP = " ";
  var CART_KEY = "aurelle-cart-v1";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GENDER_LABEL = { zanjo: "Zanjo", zanj: "Zanj", unisex: "Unisex" };

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

  /* ---------- prices ---------- */

  function price(p, size) {
    var base = p.prices[size];
    var promo = !!(PROMO && PROMO.active);
    var final = promo ? Math.round(base * (100 - PROMO.percent)) / 100 : base;
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
    var size = DEFAULT_SIZE;
    var pr = price(p, size);
    var el = document.createElement("article");
    el.className = "card";
    var url = "product.html?id=" + p.id;
    var second = p.secondImage
      ? '<img class="card__img card__img--alt" src="' + esc(p.secondImage) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">'
      : "";
    var tag = pr.promo ? '<span class="tag">−' + PROMO.percent + NBSP + "%</span>" : "";
    el.innerHTML =
      '<a class="card__media media' + (p.secondImage ? " has-alt" : "") + '" href="' + url + '" tabindex="-1" aria-hidden="true">' +
      '<img class="card__img" src="' + esc(p.image) + '" alt="" width="800" height="800" loading="lazy" decoding="async">' +
      second + tag + "</a>" +
      '<div class="card__body">' +
      '<p class="eyebrow">' + esc(p.family) + "</p>" +
      '<h3 class="card__name"><a href="' + url + '">' + esc(p.name) + "</a></h3>" +
      '<p class="card__notes">' + firstNotes(p).map(esc).join(" · ") + "</p>" +
      sizesHTML(size, p.name) +
      '<div class="price" aria-live="polite">' + priceHTML(p, size) + "</div>" +
      '<button type="button" class="btn btn--full">V košarico</button>' +
      "</div>";

    // The image link is only a visual duplicate of the name link, so hide it from AT.
    var priceEl = el.querySelector(".price");
    bindSizes(el.querySelector(".sizes"), function (s) {
      size = s;
      swap(priceEl, priceHTML(p, size));
    });
    el.querySelector(".btn").addEventListener("click", function () { addItem(p.id, size, 1); });
    return el;
  }

  /* ---------- cart ---------- */

  var cart = loadCart();

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (l) {
        return find(l.id) && SIZES.indexOf(l.size) !== -1 && l.qty > 0;
      });
    } catch (e) { return []; }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
    renderCart();
  }

  function lines() {
    return cart.map(function (l) {
      var p = find(l.id);
      var pr = price(p, l.size);
      return { p: p, size: l.size, qty: l.qty, unit: pr.final, total: Math.round(pr.final * l.qty * 100) / 100 };
    });
  }

  function subtotal() {
    return Math.round(lines().reduce(function (a, l) { return a + l.total; }, 0) * 100) / 100;
  }

  function count() {
    return cart.reduce(function (a, l) { return a + l.qty; }, 0);
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

  /* ---------- chrome: header, search, drawer, footer ---------- */

  var drawer, overlay, lastFocus;

  function logoHTML(cls) {
    // If the logo file is missing, a typographic wordmark takes its place.
    return (
      '<img class="' + cls + '" src="images/logo-black.svg" alt="AURELLE" height="30" ' +
      "onerror=\"var s=document.createElement('span');s.className='wordmark';s.textContent='AURELLE';this.replaceWith(s)\">"
    );
  }

  function buildChrome() {
    var head =
      '<a class="skip" href="#main">Preskoči na vsebino</a>' +
      '<div class="announce"><p>Brezplačna dostava nad 60' + NBSP + "€ · Vzorec 2" + NBSP + "ml ob vsakem nakupu</p></div>" +
      '<header class="header" id="header"><div class="header__in">' +
      '<div class="header__left">' +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="main-nav">Meni</button>' +
      '<nav class="nav" id="main-nav" aria-label="Glavna navigacija">' +
      '<a href="index.html?spol=zanjo#products" data-filter="zanjo">Zanjo</a>' +
      '<a href="index.html?spol=zanj#products" data-filter="zanj">Zanj</a>' +
      '<a href="index.html#products" data-filter="all">Vse dišave</a>' +
      "</nav></div>" +
      '<a class="header__logo" href="index.html" aria-label="AURELLE, domov">' + logoHTML("logo") + "</a>" +
      '<div class="header__right">' +
      '<button type="button" class="hbtn" id="search-toggle" aria-expanded="false" aria-controls="search-panel" aria-label="Iskanje">' +
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M11.6 11.6 16.5 16.5"/></svg></button>' +
      '<button type="button" class="hbtn hbtn--text" id="cart-toggle" aria-controls="cart" aria-expanded="false">Košarica <span id="cart-count">(0)</span></button>' +
      "</div></div>" +
      '<div class="search" id="search-panel" hidden><div class="search__in">' +
      '<label class="sr-only" for="search-input">Išči dišave</label>' +
      '<input id="search-input" type="search" placeholder="Išči po imenu, noti ali družini" autocomplete="off">' +
      '<ul class="search__results" id="search-results"></ul></div></div>' +
      "</header>";

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
      '<div class="footer__brand">' + logoHTML("logo") +
      "<p>Eau de Parfum, izdelano v Sloveniji.</p></div>" +
      '<nav aria-label="Trgovina"><h2>Trgovina</h2><ul>' +
      '<li><a href="index.html#products" data-filter="all">Vse dišave</a></li>' +
      '<li><a href="index.html?spol=zanjo#products" data-filter="zanjo">Zanjo</a></li>' +
      '<li><a href="index.html?spol=zanj#products" data-filter="zanj">Zanj</a></li>' +
      '<li><a href="index.html?spol=unisex#products" data-filter="unisex">Unisex</a></li></ul></nav>' +
      '<nav aria-label="Pomoč"><h2>Pomoč</h2><ul>' +
      "<li><a href=\"#\">Dostava</a></li><li><a href=\"#\">Vračila</a></li><li><a href=\"#\">Pogosta vprašanja</a></li><li><a href=\"#\">Kontakt</a></li></ul></nav>" +
      '<nav aria-label="AURELLE"><h2>AURELLE</h2><ul>' +
      "<li><a href=\"#\">O nas</a></li><li><a href=\"#\">Splošni pogoji</a></li><li><a href=\"#\">Zasebnost</a></li></ul></nav>" +
      "</div>" +
      '<p class="footer__copy">© 2026 AURELLE</p>' +
      "</div></footer>";

    document.body.insertAdjacentHTML("afterbegin", head);
    document.body.insertAdjacentHTML("beforeend", cartEl + foot);
  }

  function renderCart() {
    var countEl = document.getElementById("cart-count");
    if (countEl) countEl.textContent = "(" + count() + ")";
    var body = document.getElementById("cart-lines");
    if (!body) return;
    var ls = lines();
    var sub = subtotal();

    document.getElementById("cart-ship").innerHTML = ls.length ? shippingProgressHTML(sub) : "";

    if (!ls.length) {
      body.innerHTML = '<p class="drawer__empty">Košarica je prazna.</p>';
      document.getElementById("cart-foot").innerHTML =
        '<a class="btn btn--outline btn--full" href="index.html#products" data-close-cart>Nadaljuj z nakupom</a>';
      return;
    }

    body.innerHTML = '<ul class="lines">' + ls.map(function (l) {
      return (
        '<li class="line" data-id="' + l.p.id + '" data-size="' + l.size + '">' +
        '<a class="line__media media" href="product.html?id=' + l.p.id + '" tabindex="-1" aria-hidden="true"><img src="' + esc(l.p.image) + '" alt="" loading="lazy"></a>' +
        '<div class="line__info">' +
        '<a class="line__name" href="product.html?id=' + l.p.id + '">' + esc(l.p.name) + "</a>" +
        '<p class="muted">' + l.size + NBSP + "ml · " + money(l.unit) + "</p>" +
        '<div class="line__ctrl">' +
        '<div class="qty" role="group" aria-label="Količina">' +
        '<button type="button" data-act="dec" aria-label="Zmanjšaj količino">−</button>' +
        "<span>" + l.qty + "</span>" +
        '<button type="button" data-act="inc" aria-label="Povečaj količino">+</button></div>' +
        '<button type="button" class="link-btn" data-act="rm">Odstrani</button></div></div>' +
        '<p class="line__total">' + money(l.total) + "</p></li>"
      );
    }).join("") + "</ul>";

    document.getElementById("cart-foot").innerHTML =
      '<div class="sum"><span>Vmesni seštevek</span><strong>' + money(sub) + "</strong></div>" +
      '<p class="muted small">Vzorec 2' + NBSP + "ml je dodan brezplačno. Dostava se izračuna na blagajni.</p>" +
      '<a class="btn btn--full" href="checkout.html">Na blagajno</a>';
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

    document.getElementById("cart-toggle").addEventListener("click", openCart);
    document.getElementById("cart-close").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-cart]")) { closeCart(); return; }
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

    var navToggle = document.querySelector(".nav-toggle");
    navToggle.addEventListener("click", function () {
      var open = document.getElementById("header").classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    window.addEventListener("storage", function (e) {
      if (e.key === CART_KEY) { cart = loadCart(); renderCart(); }
    });

    initSearch();
    renderCart();
  }

  initChrome();

  window.Shop = {
    NBSP: NBSP,
    reduceMotion: reduceMotion,
    GENDER_LABEL: GENDER_LABEL,
    esc: esc,
    money: money,
    find: find,
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
    onCartChange: function (fn) {
      var orig = renderCart;
      renderCart = function () { orig(); fn(); };
      fn();
    }
  };
})();
