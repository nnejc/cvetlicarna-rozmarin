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

  var gallery = [{ src: p.image, alt: "Steklenica dišave " + p.name + ", AURELLE Eau de Parfum" }];
  if (p.secondImage) gallery.push({ src: p.secondImage, alt: "Steklenica dišave " + p.name + " na kamniti plošči" });
  gallery.push({ src: "images/sizes.jpg", alt: "Steklenice AURELLE v velikostih 30, 50 in 100 ml, ena ob drugi" });

  var rows = [["Vrh", p.notes.top], ["Srce", p.notes.heart], ["Baza", p.notes.base]];

  var related = [];
  var idx = PRODUCTS.indexOf(p);
  for (var k = 1; related.length < 3 && k < PRODUCTS.length; k++) related.push(PRODUCTS[(idx + k) % PRODUCTS.length]);

  root.innerHTML =
    '<nav class="crumbs" aria-label="Drobtinice"><a href="index.html">Domov</a><span aria-hidden="true">/</span><a href="index.html#products">Dišave</a><span aria-hidden="true">/</span><span aria-current="page">' + S.esc(p.name) + "</span></nav>" +
    '<div class="pdp">' +
    '<div class="pdp__gallery">' +
    '<div class="media pdp__main"><img id="main-img" src="' + S.esc(gallery[0].src) + '" alt="' + S.esc(gallery[0].alt) + '" width="1400" height="1400" fetchpriority="high"></div>' +
    '<ul class="pdp__thumbs">' + gallery.map(function (g, i) {
      return '<li><button type="button" class="thumb media" data-i="' + i + '" aria-label="Prikaži sliko ' + (i + 1) + '" aria-current="' + (i === 0) + '"><img src="' + S.esc(g.src) + '" alt="" loading="lazy" onerror="this.closest(\'li\').remove()"></button></li>';
    }).join("") + "</ul></div>" +
    '<div class="pdp__info">' +
    '<p class="eyebrow">' + S.esc(p.family) + " · " + S.GENDER_LABEL[p.gender] + "</p>" +
    '<h1 class="pdp__name">' + S.esc(p.name) + "</h1>" +
    '<p class="muted pdp__sub">Eau de Parfum · 18' + NBSP + "% dišavnih olj</p>" +
    '<div class="price price--lg" id="price" aria-live="polite">' + S.priceHTML(p, size) + "</div>" +
    '<p class="label">Velikost</p>' + S.sizesHTML(size, p.name) +
    '<div class="buy"><div class="qty qty--lg" role="group" aria-label="Količina">' +
    '<button type="button" id="q-dec" aria-label="Zmanjšaj količino">−</button><span id="q-val" aria-live="polite">1</span>' +
    '<button type="button" id="q-inc" aria-label="Povečaj količino">+</button></div></div>' +
    '<button type="button" class="btn btn--full" id="add">V košarico</button>' +
    '<p class="muted small pdp__sample">Vzorec 2' + NBSP + "ml ob vsakem nakupu.</p>" +
    '<p class="pdp__desc">' + S.esc(p.description) + "</p>" +
    '<dl class="notes">' + rows.map(function (r) {
      return "<div><dt>" + r[0] + "</dt><dd>" + S.esc(r[1]) + "</dd></div>";
    }).join("") + "</dl>" +
    '<div class="acc">' +
    '<details><summary>Opis izdelka</summary><div><p>Eau de Parfum, 18' + NBSP + "% dišavnih olj, izdelano v Sloveniji.</p>" +
    "<p>Družina: " + S.esc(p.family.toLowerCase()) + ". Na voljo v velikostih 30, 50 in 100" + NBSP + "ml.</p></div></details>" +
    '<details><summary>Dostava in vračila</summary><div><p>Dostava v 1–2 delovnih dneh. Brezplačna dostava nad ' + FREE_SHIPPING_FROM + NBSP + "€.</p>" +
    "<p>Vračilo v 30 dneh po prejemu. Ob vsakem nakupu dodamo vzorec 2" + NBSP + "ml.</p></div></details>" +
    '<details><summary>Sestavine</summary><div><p>Alcohol denat., parfum, aqua</p></div></details>' +
    "</div></div></div>" +
    '<section class="related" aria-labelledby="rel-title"><h2 id="rel-title">Morda ti bo všeč</h2><div class="grid" id="related"></div></section>';

  var priceEl = document.getElementById("price");
  var qEl = document.getElementById("q-val");

  S.bindSizes(root.querySelector(".sizes"), function (s) {
    size = s;
    S.swap(priceEl, S.priceHTML(p, size));
  });

  document.getElementById("q-dec").addEventListener("click", function () { qty = Math.max(1, qty - 1); qEl.textContent = qty; });
  document.getElementById("q-inc").addEventListener("click", function () { qty = Math.min(99, qty + 1); qEl.textContent = qty; });
  document.getElementById("add").addEventListener("click", function () { S.addItem(p.id, size, qty); });

  var mainImg = document.getElementById("main-img");
  root.querySelector(".pdp__thumbs").addEventListener("click", function (e) {
    var b = e.target.closest(".thumb");
    if (!b) return;
    var g = gallery[parseInt(b.getAttribute("data-i"), 10)];
    root.querySelectorAll(".thumb").forEach(function (t) { t.setAttribute("aria-current", t === b ? "true" : "false"); });
    mainImg.classList.add("is-swapping");
    setTimeout(function () {
      mainImg.src = g.src;
      mainImg.alt = g.alt;
      mainImg.classList.remove("is-swapping");
    }, S.reduceMotion ? 0 : 200);
  });

  var relEl = document.getElementById("related");
  related.forEach(function (r) { relEl.appendChild(S.createCard(r)); });
})();
