/* AURELLE – product page (product.html?id=01). */
(function () {
  "use strict";
  var S = window.Shop;
  var NBSP = S.NBSP;
  var root = document.getElementById("product");

  var raw = new URLSearchParams(location.search).get("id") || "";
  var id = raw.length === 1 ? "0" + raw : raw;
  var p = S.find(id);

  if (!p) {
    document.title = "Izdelek ni najden – AURELLE";
    root.innerHTML =
      '<div class="notfound"><h1>Izdelek ni najden</h1><p class="muted">Te dišave ne najdemo.</p>' +
      '<a class="btn" href="index.html#products">Vse dišave</a></div>';
    return;
  }

  document.title = p.name.toUpperCase() + " – AURELLE";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", p.name + ": " + p.description.split(".")[0] + ".");

  var size = DEFAULT_SIZE;
  var qty = 1;

  // Only images that belong to this product: packshot, lifestyle (optional file),
  // secondImage (optional) and, for the pink Bela svila only, the size comparison.
  var optional = [{ src: S.lifestyleSrc(p), alt: "Dišava " + p.name + " v ambientu" }];
  if (p.secondImage) optional.push({ src: p.secondImage, alt: "Steklenica dišave " + p.name + " na kamniti plošči" });

  Promise.all(optional.map(function (o) { return S.probe(o.src); })).then(function (found) {
    var gallery = [{ src: p.image, alt: "Steklenica dišave " + p.name + ", AURELLE Eau de Parfum" }];
    optional.forEach(function (o, i) { if (found[i]) gallery.push(o); });
    if (p.id === "01") gallery.push({ src: "images/sizes.jpg", alt: "Steklenice AURELLE v velikostih 30, 50 in 100 ml, ena ob drugi" });
    render(gallery);
  });

  /* ---------- size guide: bottles drawn to scale (14 px per cm) ---------- */

  var PX_CM = 14;
  var BOTTLE_W_CM = { 30: 4.2, 50: 5, 100: 5.9 };

  function cm(n) { return String(n).replace(".", ","); }

  function sizeGuideSVG() {
    var ground = 214, x = 14, out = "";
    SIZES.forEach(function (sz) {
      var h = SIZE_INFO[sz].height * PX_CM, w = BOTTLE_W_CM[sz] * PX_CM;
      var capH = h * 0.2, capW = w * 0.46, bodyY = ground - h + capH, bodyH = h - capH;
      var cx = x + w / 2;
      out +=
        '<g class="sg__item" data-size="' + sz + '">' +
        '<rect class="sg__cap" x="' + (cx - capW / 2) + '" y="' + (ground - h) + '" width="' + capW + '" height="' + capH + '"/>' +
        '<rect class="sg__body" x="' + x + '" y="' + bodyY + '" width="' + w + '" height="' + bodyH + '"/>' +
        '<rect class="sg__liq" x="' + (x + w * 0.1) + '" y="' + (bodyY + bodyH * 0.1) + '" width="' + (w * 0.8) + '" height="' + (bodyH * 0.62) + '"/>' +
        '<rect class="sg__label" x="' + (cx - w * 0.17) + '" y="' + (bodyY + bodyH * 0.26) + '" width="' + (w * 0.34) + '" height="' + (w * 0.34) + '"/>' +
        '<text class="sg__txt" x="' + cx + '" y="' + (ground + 20) + '" text-anchor="middle">' + sz + " ml</text>" +
        '<text class="sg__sub" x="' + cx + '" y="' + (ground + 35) + '" text-anchor="middle">' + cm(SIZE_INFO[sz].height) + " cm</text></g>";
      x += w + 26;
    });
    var cardW = 5.4 * PX_CM, cardH = 8.56 * PX_CM;
    out += '<g class="sg__ref"><rect x="' + x + '" y="' + (ground - cardH) + '" width="' + cardW + '" height="' + cardH + '" rx="3"/>' +
      '<text class="sg__sub" x="' + (x + cardW / 2) + '" y="' + (ground + 20) + '" text-anchor="middle">kartica</text>' +
      '<text class="sg__sub" x="' + (x + cardW / 2) + '" y="' + (ground + 35) + '" text-anchor="middle">8,6 cm</text></g>';
    var width = x + cardW + 14;
    return '<svg class="sg" viewBox="0 0 ' + Math.round(width) + ' 252" role="img" aria-label="Velikosti steklenic 30, 50 in 100 ml v primerjavi s kreditno kartico">' +
      '<line class="sg__ground" x1="0" y1="' + ground + '" x2="' + Math.round(width) + '" y2="' + ground + '"/>' + out + "</svg>";
  }

  /* ---------- reviews ---------- */

  function fmtReviewDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? (+m[3]) + ". " + (+m[2]) + ". " + m[1] : "";
  }

  function reviewsHTML() {
    var list = REVIEWS[p.id] || [];
    var summary = S.ratingFor(p.id);
    return (
      '<section class="reviews" id="reviews" aria-labelledby="rev-title"><h2 id="rev-title">Mnenja</h2>' +
      (list.length
        ? '<p class="reviews__sum">' + S.ratingHTML(p.id) + "</p>" +
          '<ul class="reviews__list">' + list.map(function (r) {
            return '<li class="review"><p class="review__head"><span class="stars" aria-hidden="true">' + S.starsHTML(r.rating) + '</span><span class="sr-only">Ocena ' + r.rating + ' od 5</span> <strong>' + S.esc(r.name) + '</strong> <span class="muted">' + fmtReviewDate(r.date) + "</span></p>" +
              "<p>" + S.esc(r.text) + "</p></li>";
          }).join("") + "</ul>"
        : '<p class="reviews__empty">Ta dišava še nima mnenj. Bodi prvi/a, ki jo oceni.</p>') +
      '<button type="button" class="btn btn--outline" id="rev-open" aria-expanded="false" aria-controls="rev-form">Napiši mnenje</button>' +
      '<form class="rform" id="rev-form" novalidate hidden>' +
      '<fieldset class="rform__stars"><legend>Ocena</legend><div class="rform__row">' +
      [1, 2, 3, 4, 5].map(function (n) {
        return '<label class="rstar"><input type="radio" name="rating" value="' + n + '"><span class="sr-only">' + n + " od 5</span>" + S.starsHTML(0).split("</svg>")[0] + "</svg></label>";
      }).join("") + '</div><p class="field__error" id="err-rating" hidden></p></fieldset>' +
      '<div class="field"><label for="rev-name">Ime</label><input id="rev-name" name="name" type="text" autocomplete="given-name" aria-describedby="err-rev-name"><p class="field__error" id="err-rev-name" hidden></p></div>' +
      '<div class="field"><label for="rev-text">Mnenje</label><textarea id="rev-text" name="text" rows="5" aria-describedby="err-rev-text"></textarea><p class="field__error" id="err-rev-text" hidden></p></div>' +
      '<button type="submit" class="btn">Oddaj mnenje</button></form>' +
      '<p class="reviews__thanks" id="rev-thanks" role="status"></p></section>'
    );
  }

  function render(gallery) {
    var rows = [["Vrh", p.notes.top], ["Srce", p.notes.heart], ["Baza", p.notes.base]];
    // Same gender first, then the rest; never the current product.
    var others = PRODUCTS.filter(function (x) { return x !== p; });
    var related = others.filter(function (x) { return x.gender === p.gender; })
      .concat(others.filter(function (x) { return x.gender !== p.gender; }))
      .slice(0, 4);
    var multi = gallery.length > 1;

    root.innerHTML =
      '<nav class="crumbs" aria-label="Drobtinice"><a href="index.html">Domov</a><span aria-hidden="true">/</span><a href="index.html#products">Dišave</a><span aria-hidden="true">/</span><span aria-current="page">' + S.esc(p.name) + "</span></nav>" +
      '<div class="pdp">' +
      '<div class="pdp__gallery">' +
      '<div class="media pdp__main"><img id="main-img" src="' + S.esc(gallery[0].src) + '" alt="' + S.esc(gallery[0].alt) + '" width="1400" height="1400" fetchpriority="high">' +
      (multi
        ? '<button type="button" class="gal-arrow gal-arrow--prev" data-dir="-1" aria-label="Prejšnja slika"><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M8 1 1.5 8 8 15"/></svg></button>' +
          '<button type="button" class="gal-arrow gal-arrow--next" data-dir="1" aria-label="Naslednja slika"><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 1l6.5 7L1 15"/></svg></button>'
        : "") +
      "</div>" +
      (multi
        ? '<ul class="pdp__thumbs">' + gallery.map(function (g, i) {
            return '<li><button type="button" class="thumb media" data-i="' + i + '" aria-label="Prikaži sliko ' + (i + 1) + ' od ' + gallery.length + '" aria-current="' + (i === 0) + '"><img src="' + S.esc(g.src) + '" alt="" loading="lazy"></button></li>';
          }).join("") + "</ul>"
        : "") +
      "</div>" +
      '<div class="pdp__info">' +
      '<p class="eyebrow">' + S.esc(p.family) + " · " + S.GENDER_LABEL[p.gender] + "</p>" +
      '<h1 class="pdp__name">' + S.esc(p.name) + "</h1>" +
      (S.ratingFor(p.id) ? '<p class="pdp__rating"><a href="#reviews">' + S.ratingHTML(p.id) + "</a></p>" : "") +
      '<p class="muted pdp__sub">Eau de Parfum · 18' + NBSP + "% dišavnih olj</p>" +
      '<p class="specs"><span><span class="specs__k">Obstojnost</span> ' + S.esc(p.longevity.replace(" ", NBSP)) + '</span><span class="specs__dot" aria-hidden="true">·</span><span><span class="specs__k">Sled</span> ' + S.esc(p.sillage) + "</span></p>" +
      '<div class="price price--lg" id="price" aria-live="polite">' + S.priceHTML(p, size) + "</div>" +
      '<p class="label">Velikost</p>' + S.sizesHTML(size, p.name) +
      '<button type="button" class="sizelink" id="sg-open" aria-expanded="false" aria-controls="sg-panel">Kako velike so steklenice?</button>' +
      '<div class="sizeguide" id="sg-panel" hidden>' + sizeGuideSVG() + '<p class="muted small">Višine so približne.</p></div>' +
      '<div class="buy"><div class="qty qty--lg" role="group" aria-label="Količina">' +
      '<button type="button" id="q-dec" aria-label="Zmanjšaj količino">−</button><span id="q-val" aria-live="polite">1</span>' +
      '<button type="button" id="q-inc" aria-label="Povečaj količino">+</button></div></div>' +
      '<button type="button" class="btn btn--full" id="add">V košarico</button>' +
      '<p class="pdp__gift muted small">' + S.GIFT_ICON.replace('width="26" height="26"', 'width="20" height="20"') + "<span>Darilno pakiranje s kartico je na voljo v košarici.</span></p>" +
      S.deliveryHTML() +
      S.payBadgesHTML() +
      '<p class="muted small pdp__sample">Vzorec 2' + NBSP + "ml ob vsakem nakupu.</p>" +
      '<p class="pdp__desc">' + S.esc(p.description) + "</p>" +
      '<dl class="notes">' + rows.map(function (r) {
        return "<div><dt>" + r[0] + "</dt><dd>" + S.esc(r[1]) + "</dd></div>";
      }).join("") + "</dl>" +
      '<p class="pdp__quiz"><a href="kviz.html">Nisi prepričan/a? Reši kviz v 30 sekundah →</a></p>' +
      '<div class="acc">' +
      '<details><summary>Kako se dišava razvija</summary><div class="pyramid-mini">' +
      '<div><h3>Vrh</h3><p class="muted">0–15' + NBSP + "min</p><p>Prvi vtis. Lahke, sveže note, ki se odprejo najprej.</p></div>" +
      '<div><h3>Srce</h3><p class="muted">15' + NBSP + "min – 3" + NBSP + "h</p><p>Jedro dišave in njen značaj.</p></div>" +
      '<div><h3>Baza</h3><p class="muted">3' + NBSP + "h in več</p><p>Topla sled, ki ostane na koži.</p></div></div></details>" +
      '<details><summary>Opis izdelka</summary><div><p>Eau de Parfum, 18' + NBSP + "% dišavnih olj, izdelano v Sloveniji.</p>" +
      "<p>Družina: " + S.esc(p.family.toLowerCase()) + ". Na voljo v velikostih 30, 50 in 100" + NBSP + "ml.</p></div></details>" +
      '<details><summary>Dostava in vračila</summary><div><p>Dostava v 1–2 delovnih dneh. Brezplačna dostava nad ' + FREE_SHIPPING_FROM + NBSP + "€.</p>" +
      "<p>" + S.esc(RETURNS_TEXT) + "</p></div></details>" +
      '<details><summary>Sestavine</summary><div><p>' + S.esc(p.inci) + '</p><p class="muted small">Primer seznama – točen seznam bo dodan ob prejemu podatkov proizvajalca.</p></div></details>' +
      "</div></div></div>" +
      reviewsHTML() +
      '<section class="related" aria-labelledby="rel-title"><h2 id="rel-title">Morda ti bo všeč</h2><div class="grid" id="related"></div></section>' +
      '<div class="stickybuy" id="stickybuy" aria-hidden="true"><div class="stickybuy__info"><span class="stickybuy__price" id="sb-price"></span><span class="muted small" id="sb-size"></span></div>' +
      '<button type="button" class="btn" id="sb-add" tabindex="-1">V košarico</button></div>';

    var priceEl = document.getElementById("price");
    var qEl = document.getElementById("q-val");
    var sbPrice = document.getElementById("sb-price");
    var sbSize = document.getElementById("sb-size");

    function syncSticky() {
      sbPrice.textContent = S.money(S.price(p, size).final);
      sbSize.textContent = size + NBSP + "ml";
    }
    syncSticky();

    S.bindSizes(root.querySelector(".sizes"), function (s) {
      size = s;
      S.swap(priceEl, S.priceHTML(p, size));
      syncSticky();
      syncGuide();
    });

    // size guide panel: highlight the selected size
    var sgPanel = document.getElementById("sg-panel");
    function syncGuide() {
      sgPanel.querySelectorAll(".sg__item").forEach(function (g) {
        g.classList.toggle("is-selected", parseInt(g.getAttribute("data-size"), 10) === size);
      });
    }
    syncGuide();
    var sgBtn = document.getElementById("sg-open");
    sgBtn.addEventListener("click", function () {
      var open = sgPanel.hidden;
      sgPanel.hidden = !open;
      sgBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.getElementById("q-dec").addEventListener("click", function () { qty = Math.max(1, qty - 1); qEl.textContent = qty; });
    document.getElementById("q-inc").addEventListener("click", function () { qty = Math.min(99, qty + 1); qEl.textContent = qty; });
    function add() { S.addItem(p.id, size, qty); }
    document.getElementById("add").addEventListener("click", add);
    document.getElementById("sb-add").addEventListener("click", add);

    /* gallery: thumbnails, arrows, swipe */
    var mainImg = document.getElementById("main-img");
    var thumbs = root.querySelectorAll(".thumb");
    var cur = 0;
    function go(i) {
      cur = (i + gallery.length) % gallery.length;
      thumbs.forEach(function (t, k) { t.setAttribute("aria-current", k === cur ? "true" : "false"); });
      mainImg.classList.add("is-swapping");
      setTimeout(function () {
        mainImg.src = gallery[cur].src;
        mainImg.alt = gallery[cur].alt;
        mainImg.classList.remove("is-swapping");
      }, S.reduceMotion ? 0 : 200);
    }
    if (multi) {
      root.querySelector(".pdp__thumbs").addEventListener("click", function (e) {
        var b = e.target.closest(".thumb");
        if (b) go(parseInt(b.getAttribute("data-i"), 10));
      });
    }
    root.querySelectorAll(".gal-arrow").forEach(function (b) {
      b.addEventListener("click", function () { go(cur + parseInt(b.getAttribute("data-dir"), 10)); });
    });
    var x0 = null;
    var stage = root.querySelector(".pdp__main");
    stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40 && gallery.length > 1) go(cur + (dx < 0 ? 1 : -1));
    });

    /* sticky buy bar on phones, shown once the main button has scrolled out of view */
    var bar = document.getElementById("stickybuy");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        var show = !e.isIntersecting && e.boundingClientRect.top < 0;
        bar.classList.toggle("is-visible", show);
        bar.setAttribute("aria-hidden", show ? "false" : "true");
        document.getElementById("sb-add").tabIndex = show ? 0 : -1;
      }).observe(document.getElementById("add"));
    }

    // review form (demo: nothing is stored or displayed)
    var rForm = document.getElementById("rev-form");
    var rOpen = document.getElementById("rev-open");
    var rThanks = document.getElementById("rev-thanks");
    rOpen.addEventListener("click", function () {
      var open = rForm.hidden;
      rForm.hidden = !open;
      rOpen.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) rForm.querySelector("input[name=rating]").focus();
    });
    rForm.addEventListener("change", function (e) {
      if (e.target.name !== "rating") return;
      var v = parseInt(e.target.value, 10);
      rForm.querySelectorAll(".rstar").forEach(function (l, i) { l.classList.toggle("is-on", i < v); });
      showErr("rating", "");
    });
    function showErr(id, msg) {
      var el = document.getElementById("err-" + id);
      el.hidden = !msg; el.textContent = msg || "";
      return !msg;
    }
    rForm.addEventListener("input", function (e) { if (e.target.name === "name") showErr("rev-name", ""); if (e.target.name === "text") showErr("rev-text", ""); });
    rForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ok = showErr("rating", rForm.querySelector("input[name=rating]:checked") ? "" : "Izberite oceno.") && ok;
      ok = showErr("rev-name", rForm.elements.name.value.trim() ? "" : "Vnesite ime.") && ok;
      ok = showErr("rev-text", rForm.elements.text.value.trim() ? "" : "Napišite mnenje.") && ok;
      if (!ok) return;
      rForm.hidden = true;
      rOpen.hidden = true;
      rThanks.textContent = "Hvala! Mnenje bo objavljeno po pregledu.";
    });

    var relEl = document.getElementById("related");
    related.forEach(function (r) { relEl.appendChild(S.createCard(r)); });
  }
})();
