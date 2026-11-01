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

  // Resolves true if an optional image exists. Positive answers are cached for the session.
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
        // Only found images are cached; a missing file is checked again next time.
        if (ok) {
          probeCache[src] = true;
          try { sessionStorage.setItem("aurelle-probe", JSON.stringify(probeCache)); } catch (e) { /* ignore */ }
        }
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

  // Lowest price of a product ("od ...") shown on cards: struck regular price first, then the new one.
  function fromPriceHTML(p) {
    var pr = price(p, SIZES[0]);
    var html = "";
    if (pr.promo) html += '<s class="card__old"><span class="sr-only">Redna cena </span>' + money(pr.base) + '</s><span class="sr-only"> Akcijska cena </span>';
    return html + '<span class="card__now">od' + NBSP + money(pr.final) + "</span>";
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
      (ratingFor(p.id) ? '<p class="card__rating">' + ratingHTML(p.id) + "</p>" : "") +
      '<p class="card__notes">' + firstNotes(p).map(esc).join(" · ") + "</p>" +
      '<p class="card__price">' + fromPriceHTML(p) + "</p>" +
      "</div>";
    el.querySelector(".quick").addEventListener("click", function () { addItem(p.id, DEFAULT_SIZE, 1); });
    // Hover image: product-XX-lifestyle.jpg if it exists, else secondImage. No file, no swap.
    var lifestyle = lifestyleSrc(p);
    probe(lifestyle).then(function (ok) {
      if (ok) return lifestyle;
      return p.secondImage ? probe(p.secondImage).then(function (has) { return has ? p.secondImage : null; }) : null;
    }).then(function (src) {
      if (!src) return;
      var img = new Image();
      img.className = "card__img card__img--alt";
      img.alt = ""; img.width = 800; img.height = 800; img.loading = "lazy"; img.decoding = "async";
      img.src = src;
      el.querySelector(".card__link").appendChild(img);
    });
    return el;
  }

  /* ---------- cart ---------- */

  var cart = [];
  var gift = { on: false, to: "", msg: "", from: "" };
  var giftListeners = [];
  var GIFT_MAX = { to: 40, msg: 220, from: 40 };
  loadState();

  // Storage format: { lines: [...], gift: {...} }. An older plain array of lines is still read.
  function loadState() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY));
      var lines = Array.isArray(raw) ? raw : (raw && raw.lines) || [];
      cart = lines.filter(function (l) {
        if (l.id === SAMPLE_SET.id) return l.qty > 0;
        return find(l.id) && SIZES.indexOf(l.size) !== -1 && l.qty > 0;
      });
      var g = (raw && !Array.isArray(raw) && raw.gift) || {};
      gift = {
        on: !!g.on,
        to: String(g.to || "").slice(0, GIFT_MAX.to),
        msg: String(g.msg || "").slice(0, GIFT_MAX.msg),
        from: String(g.from || "").slice(0, GIFT_MAX.from)
      };
    } catch (e) { cart = []; }
  }

  function persist() {
    try { localStorage.setItem(CART_KEY, JSON.stringify({ lines: cart, gift: gift })); } catch (e) { /* storage unavailable */ }
  }

  function saveCart() {
    persist();
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
        oldUnit: !isSet && PROMO && PROMO.active ? p.prices[l.size] : null,
        total: Math.round(unit * l.qty * 100) / 100
      };
    });
  }

  // "<struck regular price> new price" for a cart line.
  function unitHTML(l) {
    return (l.oldUnit ? '<s class="line__old">' + money(l.oldUnit) + "</s> " : "") + money(l.unit);
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
    gift = { on: false, to: "", msg: "", from: "" };
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

  /* ---------- gift wrap + personal card ---------- */

  function giftFee() {
    return gift.on && cart.length ? GIFT.price : 0;
  }

  function giftInfo() {
    return { on: gift.on && cart.length > 0, fee: giftFee(), to: gift.to, msg: gift.msg, from: gift.from };
  }

  function notifyGift() {
    syncGiftEditors();
    giftListeners.forEach(function (fn) { fn(); });
  }

  function setGiftOn(on) {
    gift.on = !!on;
    persist();
    renderCartFoot();
    notifyGift();
  }

  function setGiftText(field, value) {
    gift[field] = String(value).slice(0, GIFT_MAX[field]);
    persist();
    notifyGift();
  }

  var GIFT_ICON = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="10" width="20" height="13"/><rect x="2" y="7" width="22" height="3.5"/><path d="M13 7v16M13 7c-1-4-6-4.5-6-2s4 2 6 2zM13 7c1-4 6-4.5 6-2s-4 2-6 2z"/></svg>';

  // Checkbox row "Zapakiraj kot darilo" (cart drawer and checkout).
  function giftToggleHTML(id, withEditLink) {
    return (
      '<div class="giftrow"><div class="giftrow__media media">' + GIFT_ICON + "</div>" +
      '<div class="giftrow__text"><label class="check"><input type="checkbox" id="' + id + '" data-gift-toggle' + (gift.on ? " checked" : "") + ">" +
      "<span>Zapakiraj kot darilo (+" + money(GIFT.price) + ")</span></label>" +
      (withEditLink ? '<button type="button" class="link-btn giftedit" data-gift-edit' + (gift.on ? "" : " hidden") + ">Uredi kartico</button>" : "") +
      "</div></div>"
    );
  }

  // Gift card editor: three fields with a live card preview next to them (below on phones).
  function giftEditorHTML(prefix) {
    return (
      '<div class="gift" data-gift-editor>' +
      '<div class="gift__fields">' +
      '<div class="field"><label for="' + prefix + '-to">Za</label>' +
      '<input id="' + prefix + '-to" type="text" maxlength="' + GIFT_MAX.to + '" placeholder="Draga Maja," autocomplete="off" data-gift-field="to"></div>' +
      '<div class="field"><label for="' + prefix + '-msg">Sporočilo</label>' +
      '<textarea id="' + prefix + '-msg" rows="5" maxlength="' + GIFT_MAX.msg + '" placeholder="Vse najboljše za rojstni dan. Naj te ta vonj spominja na najin poletni večer." data-gift-field="msg"></textarea>' +
      '<p class="gift__count muted small" data-gift-count>0 / ' + GIFT_MAX.msg + "</p></div>" +
      '<div class="field"><label for="' + prefix + '-from">Od</label>' +
      '<input id="' + prefix + '-from" type="text" maxlength="' + GIFT_MAX.from + '" placeholder="Luka" autocomplete="off" data-gift-field="from"></div>' +
      "</div>" +
      '<div class="gift__preview">' +
      '<div class="gcard" role="img" aria-label="Predogled darilne kartice">' + logoHTML("gcard__logo", 14) +
      '<div class="gcard__body"><p class="gcard__to" data-gcard="to"></p><p class="gcard__msg" data-gcard="msg"></p><p class="gcard__from" data-gcard="from"></p></div></div>' +
      '<p class="gift__note muted small">Kartico natisnemo na kakovosten papir in jo priložimo v darilno škatlo. Cen v paketu ne bo.</p>' +
      "</div></div>"
    );
  }

  var GIFT_PLACEHOLDER = { to: "Draga Maja,", msg: "Vse najboljše za rojstni dan. Naj te ta vonj spominja na najin poletni večer.", from: "Luka" };

  // Scales the script text down until it fits inside the card.
  function fitCard(card) {
    var body = card.querySelector(".gcard__body");
    var w = card.clientWidth;
    if (!w) return;
    var len = gift.msg.length;
    var size = w * (len > 160 ? 0.07 : len > 100 ? 0.078 : 0.086);
    var min = Math.max(9, w * 0.04);
    body.style.fontSize = size + "px";
    while (body.scrollHeight > body.clientHeight + 1 && size > min) {
      size *= 0.94;
      body.style.fontSize = size + "px";
    }
  }

  function syncGiftEditors(source) {
    document.querySelectorAll("[data-gift-editor]").forEach(function (root) {
      ["to", "msg", "from"].forEach(function (f) {
        var input = root.querySelector('[data-gift-field="' + f + '"]');
        if (input !== source && input.value !== gift[f]) input.value = gift[f];
        var out = root.querySelector('[data-gcard="' + f + '"]');
        var empty = !gift[f].trim();
        out.textContent = (f === "from" ? "— " : "") + (empty ? GIFT_PLACEHOLDER[f] : gift[f]);
        out.classList.toggle("is-empty", empty);
      });
      root.querySelector("[data-gift-count]").textContent = gift.msg.length + " / " + GIFT_MAX.msg;
      fitCard(root.querySelector(".gcard"));
    });
    document.querySelectorAll("[data-gift-toggle]").forEach(function (cb) { cb.checked = gift.on; });
    document.querySelectorAll("[data-gift-panel]").forEach(function (panel) { panel.hidden = !gift.on; });
    document.querySelectorAll("[data-gift-edit]").forEach(function (b) { b.hidden = !gift.on; });
    document.querySelectorAll("[data-gift-editor]").forEach(function (root) {
      if (gift.on) fitCard(root.querySelector(".gcard"));
    });
  }

  // Wires the toggle and fields inside root (delegated, safe to call once per container).
  function bindGift(root) {
    root.addEventListener("input", function (e) {
      var f = e.target.getAttribute && e.target.getAttribute("data-gift-field");
      if (f) { gift[f] = e.target.value.slice(0, GIFT_MAX[f]); persist(); syncGiftEditors(e.target); giftListeners.forEach(function (fn) { fn(); }); }
    });
    root.addEventListener("change", function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute("data-gift-toggle")) setGiftOn(e.target.checked);
    });
  }

  /* ---------- delivery estimate, Christmas notice, payment badges, ratings ---------- */

  var WEEKDAYS = ["ned", "pon", "tor", "sre", "čet", "pet", "sob"];

  function addWorkingDays(date, n) {
    var d = new Date(date.getTime());
    while (n > 0) {
      d.setDate(d.getDate() + 1);
      var w = d.getDay();
      if (w !== 0 && w !== 6) n--;
    }
    return d;
  }

  function fmtDate(d) {
    return WEEKDAYS[d.getDay()] + ", " + d.getDate() + ". " + (d.getMonth() + 1) + ".";
  }

  // [earliest, latest] arrival date for an order placed at "now".
  function deliveryDates(now) {
    var ship = addWorkingDays(now || new Date(), DELIVERY.shipsInDays);
    return [addWorkingDays(ship, DELIVERY.minDays), addWorkingDays(ship, DELIVERY.maxDays)];
  }

  function christmasEnd() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((CHRISTMAS && CHRISTMAS.lastOrderDate) || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59) : null;
  }

  function christmasActive(now) {
    var end = christmasEnd();
    if (!end) return false;
    now = now || new Date();
    return now >= new Date(end.getFullYear(), 11, 1) && now <= end;
  }

  function christmasText() {
    var end = christmasEnd();
    return "Naroči do " + end.getDate() + ". " + (end.getMonth() + 1) + ". in paket prispe pred božičem.";
  }

  function deliveryHTML() {
    var d = deliveryDates();
    return (
      '<div class="delivery"><p>Naroči danes – prispe med <strong>' + fmtDate(d[0]).replace(/ /g, NBSP) + "</strong> in <strong>" + fmtDate(d[1]).replace(/ /g, NBSP) + "</strong></p>" +
      (christmasActive() ? '<p class="delivery__xmas">' + christmasText() + "</p>" : "") + "</div>"
    );
  }

  // Payment badges: 38 x 24 px inline SVG, no external requests.
  var APPLE_MARK = '<path transform="translate(6.5 6) scale(0.5)" fill="#111111" d="M16.4 12.7c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8s-1.7-.8-2.8-.8c-1.4 0-2.8.9-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.2zM14.3 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/>';
  var PAY_BADGES = [
    ["Visa", '<text x="19" y="16" text-anchor="middle" font-size="11" font-weight="800" font-style="italic" letter-spacing="0.3" fill="#1A1F71">VISA</text>'],
    ["Mastercard", '<circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/>' +
      '<path d="M19 6.1A7 7 0 0 1 19 17.9A7 7 0 0 1 19 6.1Z" fill="#FF5F00"/>'],
    ["PayPal", '<text x="19" y="15.5" text-anchor="middle" font-size="8.5" font-weight="800" font-style="italic"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text>'],
    ["Apple Pay", APPLE_MARK + '<text x="16.5" y="15.8" font-size="8.5" font-weight="700" fill="#111111">Pay</text>'],
    ["Google Pay", '<text x="6.5" y="16" font-size="10" font-weight="800" fill="#111111">G</text><text x="14.5" y="15.8" font-size="8.5" font-weight="700" fill="#111111">Pay</text>'],
    ["Plačilo po povzetju", '<text x="19" y="10.5" text-anchor="middle" font-size="6.6" font-weight="600" fill="#6F6760">Po</text><text x="19" y="18" text-anchor="middle" font-size="6.6" font-weight="600" fill="#6F6760">povzetju</text>']
  ];

  function payBadgesHTML() {
    return '<ul class="pay" aria-label="Načini plačila">' + PAY_BADGES.map(function (b) {
      return '<li><svg width="38" height="24" viewBox="0 0 38 24" role="img" aria-label="' + b[0] + '" font-family="Figtree, Arial, sans-serif">' +
        '<rect x="0.5" y="0.5" width="37" height="23" rx="4" fill="#FFFFFF" stroke="#E9DFD3"/>' + b[1] + "</svg></li>";
    }).join("") + "</ul>";
  }

  function ratingFor(id) {
    var r = REVIEWS[id];
    if (!r || !r.length) return null;
    var sum = r.reduce(function (a, x) { return a + x.rating; }, 0);
    return { avg: sum / r.length, count: r.length };
  }

  function starsHTML(value) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z" fill="' + (i <= Math.round(value) ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    }
    return out;
  }

  // Average rating next to the product name / on cards. Empty when there are no real reviews.
  function ratingHTML(id) {
    var r = ratingFor(id);
    if (!r) return "";
    var avg = (Math.round(r.avg * 10) / 10).toFixed(1).replace(".", ",");
    return '<span class="rating"><span class="stars" aria-hidden="true">' + starsHTML(r.avg) + "</span>" +
      '<span class="sr-only">Ocena ' + avg + " od 5, " + r.count + " mnenj</span>" +
      '<span aria-hidden="true">' + avg + ' <span class="muted">(' + r.count + ")</span></span></span>";
  }

  /* ---------- chrome: announcement, header, mobile menu, drawer, footer ---------- */

  var drawer, overlay, mmenu, lastFocus;

  function logoHTML(cls, h) {
    return '<img class="' + cls + '" src="images/logo-black.svg" alt="AURELLE" width="' + Math.round(h * 8.34) + '" height="' + h + '">';
  }

  function announceText() {
    var free = "Brezplačna dostava nad " + FREE_SHIPPING_FROM + NBSP + "€";
    var parts = [];
    if (PROMO && PROMO.active) {
      parts.push(PROMO.label + " −" + PROMO.percent + NBSP + "% na vse dišave do " + (PROMO.until || "1. 12.").replace(/ /g, NBSP), free);
    } else {
      parts.push(free, "Vzorec 2" + NBSP + "ml ob vsakem nakupu");
    }
    if (christmasActive()) parts.push(christmasText());
    return parts.join(" · ");
  }

  var NAV_LINKS = [
    ["Zanjo", "index.html?spol=zanjo#products", "zanjo"],
    ["Zanj", "index.html?spol=zanj#products", "zanj"],
    ["Vse dišave", "index.html#products", "all"],
    ["O nas", "o-nas.html", null]
  ];

  // The quiz link sits on the right side of the desktop header and in the mobile menu.
  var QUIZ_LINK = ["Najdi svojo dišavo", "kviz.html"];

  function navLinks(withQuiz) {
    var links = NAV_LINKS.map(function (l) {
      return '<a href="' + l[1] + '"' + (l[2] ? ' data-filter="' + l[2] + '"' : "") + ">" + l[0] + "</a>";
    });
    if (withQuiz) links.splice(3, 0, '<a href="' + QUIZ_LINK[1] + '">' + QUIZ_LINK[0] + "</a>");
    return links.join("");
  }

  // Footer social icons: inline SVG, URLs come from SOCIAL in products.js.
  var SOCIAL_ICONS = [
    ["instagram", "AURELLE na Instagramu", '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.5" fill="currentColor"/>'],
    ["tiktok", "AURELLE na TikToku", '<path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14 3.5c.3 2.6 2 4.4 4.8 4.6"/>'],
    ["facebook", "AURELLE na Facebooku", '<path d="M14 21v-8h2.8l.6-3.2H14V8c0-.9.4-1.5 1.6-1.5h1.8V3.7c-.4-.1-1.5-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2H8.2V13H11v8z"/>']
  ];

  function socialHTML() {
    return '<div class="social">' + SOCIAL_ICONS.map(function (i) {
      return '<a href="' + esc(SOCIAL[i[0]] || "#") + '" target="_blank" rel="noopener" aria-label="' + i[1] + '">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + i[2] + "</svg></a>";
    }).join("") + "</div>";
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
      '<a class="hlink" href="' + QUIZ_LINK[1] + '">' + QUIZ_LINK[0] + "</a>" +
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
      '<nav class="mmenu__nav" aria-label="Mobilna navigacija">' + navLinks(true) + "</nav></div>";

    // Full-screen sheet with the card editor (used by the cart drawer on phones).
    var sheet =
      '<div class="gsheet" id="gift-sheet" role="dialog" aria-modal="true" aria-label="Darilna kartica" hidden>' +
      '<div class="gsheet__top"><h2>Darilna kartica</h2><button type="button" class="link-btn" id="gift-sheet-close">Zapri</button></div>' +
      '<div class="gsheet__body">' + giftEditorHTML("gs") + "</div>" +
      '<div class="gsheet__foot"><button type="button" class="btn btn--full" id="gift-sheet-save">Shrani</button></div></div>';

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
      "<p>Eau de Parfum, izdelano v Sloveniji.</p>" + socialHTML() + "</div>" +
      '<nav aria-label="Trgovina"><h2>Trgovina</h2><ul>' +
      '<li><a href="index.html#products" data-filter="all">Vse dišave</a></li>' +
      '<li><a href="index.html?spol=zanjo#products" data-filter="zanjo">Zanjo</a></li>' +
      '<li><a href="index.html?spol=zanj#products" data-filter="zanj">Zanj</a></li>' +
      '<li><a href="index.html?spol=unisex#products" data-filter="unisex">Unisex</a></li>' +
      '<li><a href="kviz.html">Najdi svojo dišavo</a></li></ul></nav>' +
      '<nav aria-label="Pomoč"><h2>Pomoč</h2><ul>' +
      '<li><a href="dostava.html">Dostava</a></li><li><a href="vracila.html">Vračila</a></li>' +
      '<li><a href="pogosta-vprasanja.html">Pogosta vprašanja</a></li><li><a href="kontakt.html">Kontakt</a></li></ul></nav>' +
      '<nav aria-label="AURELLE"><h2>AURELLE</h2><ul>' +
      '<li><a href="o-nas.html">O nas</a></li><li><a href="pogoji.html">Splošni pogoji</a></li><li><a href="zasebnost.html">Zasebnost</a></li>' +
      '</ul></nav>' +
      "</div>" +
      '<div class="footer__meta">' +
      payBadgesHTML().replace('class="pay"', 'class="pay footer__pay"') +
      '<p class="footer__legal">AURELLE · ' + esc(COMPANY.name) + " · " + esc(COMPANY.address) + " · ID za DDV: " + esc(COMPANY.vat) + " · Matična št.: " + esc(COMPANY.reg) + "</p></div>" +
      '<p class="footer__copy">© 2026 AURELLE</p>' +
      "</div></footer>";

    document.body.insertAdjacentHTML("afterbegin", head);
    document.body.insertAdjacentHTML("beforeend", cartEl + sheet + foot);
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

  function renderCartFoot() {
    var foot = document.getElementById("cart-foot");
    if (!foot) return;
    if (!cart.length) {
      foot.innerHTML = '<a class="btn btn--outline btn--full" href="index.html#products" data-close-cart>Nadaljuj z nakupom</a>';
      return;
    }
    var sub = subtotal();
    var fee = giftFee();
    // Desktop: subtotal, gift fee and total. Phones: one compact "Skupaj" line (foot__total-m).
    foot.innerHTML =
      '<div class="foot__rows"><div class="sum"><span>Vmesni seštevek</span><strong>' + money(sub) + "</strong></div>" +
      (fee ? '<div class="sum"><span>Darilno pakiranje</span><span>' + money(fee) + "</span></div>" +
        '<div class="sum sum--total"><span>Skupaj</span><strong>' + money(sub + fee) + "</strong></div>" : "") + "</div>" +
      '<div class="sum sum--total foot__total-m"><span>Skupaj</span><strong>' + money(sub + fee) + "</strong></div>" +
      '<p class="muted small foot__note">Vzorec 2' + NBSP + "ml je dodan brezplačno. Dostava se izračuna na blagajni.</p>" +
      deliveryHTML() +
      '<a class="btn btn--full" href="checkout.html">Na blagajno</a>' +
      payBadgesHTML();
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
      } else {
        body.innerHTML = '<ul class="lines">' + ls.map(function (l) {
          var name = l.href
            ? '<a class="line__name" href="' + l.href + '">' + esc(l.p.name) + "</a>"
            : '<p class="line__name">' + esc(l.p.name) + "</p>";
          return (
            '<li class="line" data-id="' + l.id + '" data-size="' + l.size + '">' +
            '<div class="line__media media"><img src="' + esc(l.p.image) + '" alt="" loading="lazy"></div>' +
            '<div class="line__info">' + name +
            '<p class="muted">' + l.label + " · " + unitHTML(l) + "</p>" +
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
          '<button type="button" class="btn btn--outline btn--sm" data-add-set>Dodaj</button></div>') +
          giftToggleHTML("gift-toggle-cart", true) +
          '<div class="gift-panel" data-gift-panel' + (gift.on ? "" : " hidden") + ">" + giftEditorHTML("cg") + "</div>";
        syncGiftEditors();
      }
    }
    renderCartFoot();
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

    bindGift(drawer);
    var sheetEl = document.getElementById("gift-sheet");
    bindGift(sheetEl);
    function openSheet() {
      sheetEl.hidden = false;
      syncGiftEditors();
      // Focus the title (not a field) so the large preview stays in view until the user taps a field.
      var title = sheetEl.querySelector("h2");
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
    function closeSheet() {
      if (sheetEl.hidden) return;
      sheetEl.hidden = true;
      var edit = drawer.querySelector("[data-gift-edit]");
      if (edit && !edit.hidden) edit.focus();
    }
    document.getElementById("gift-sheet-close").addEventListener("click", closeSheet);
    document.getElementById("gift-sheet-save").addEventListener("click", closeSheet);
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-cart]")) { closeCart(); return; }
      if (e.target.closest("[data-add-set]")) { addItem(SAMPLE_SET.id, 0, 1); return; }
      if (e.target.closest("[data-gift-edit]")) { openSheet(); return; }
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
      if (e.key === "Escape" && !sheetEl.hidden) { closeSheet(); return; }
      if (e.key === "Escape" && !mmenu.hidden) { setMenu(false); return; }
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeCart(); return; }
      if (e.key !== "Tab") return;
      // Keep keyboard focus inside the open drawer.
      var f = drawer.querySelectorAll("a[href], button, input, textarea");
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
      if (window.innerWidth > 1200 && !mmenu.hidden) {
        mmenu.hidden = true; mmenu.classList.remove("is-open"); document.body.classList.remove("no-scroll");
      }
      clearTimeout(initChrome._t);
      initChrome._t = setTimeout(fitAnnounce, 150);
    });

    window.addEventListener("storage", function (e) {
      if (e.key === CART_KEY) { loadState(); renderCart(); }
    });

    // The gift card uses Pinyon Script: add the font link if a page lacks it, and load it early.
    if (!document.querySelector('link[href*="Pinyon"]')) {
      var fl = document.createElement("link");
      fl.rel = "stylesheet";
      fl.href = "https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap";
      document.head.appendChild(fl);
    }
    if (document.fonts && document.fonts.load) document.fonts.load('16px "Pinyon Script"');

    initSearch();
    renderCart();
    fitAnnounce();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitAnnounce(); syncGiftEditors(); });
    window.addEventListener("resize", function () { syncGiftEditors(); });

    // Fill [data-company="key"] placeholders on static pages with COMPANY values.
    document.querySelectorAll("[data-company]").forEach(function (el) {
      var v = COMPANY[el.getAttribute("data-company")];
      if (v) el.textContent = v;
    });
  }

  initChrome();

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
    unitHTML: unitHTML,
    subtotal: subtotal,
    shippingProgressHTML: shippingProgressHTML,
    giftInfo: giftInfo,
    giftToggleHTML: giftToggleHTML,
    giftEditorHTML: giftEditorHTML,
    bindGift: bindGift,
    syncGiftEditors: syncGiftEditors,
    onGiftChange: function (fn) { giftListeners.push(fn); },
    deliveryHTML: deliveryHTML,
    deliveryDates: deliveryDates,
    fmtDate: fmtDate,
    christmasActive: christmasActive,
    christmasText: christmasText,
    payBadgesHTML: payBadgesHTML,
    ratingFor: ratingFor,
    ratingHTML: ratingHTML,
    starsHTML: starsHTML,
    GIFT_ICON: GIFT_ICON,
    onCartChange: function (fn) { cartListeners.push(fn); }
  };
})();
