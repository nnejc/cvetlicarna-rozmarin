/* AURELLE – homepage: hero slider, product grid with filter, newsletter. */
(function () {
  "use strict";
  var S = window.Shop;
  var NBSP = S.NBSP;

  /* ---------- hero ---------- */

  var hero = document.getElementById("hero");
  var slides = HERO_SLIDES.filter(function (s) { return !s.promoOnly || PROMO.active; });
  var current = 0;
  var timer = null;
  var paused = false;

  hero.innerHTML =
    '<div class="hero__track">' +
    slides.map(function (s, i) {
      return (
        '<article class="slide' + (i === 0 ? " is-active" : "") + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " od " + slides.length + '">' +
        '<img class="slide__img" src="' + S.esc(s.image) + '" alt="' + S.esc(s.alt) + '" width="2000" height="1131" style="--pos:' + S.esc(s.focus || "right center") + ";--pos-m:" + S.esc(s.focusMobile || "70% center") + '"' +
        (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
        '<div class="slide__text"><div class="slide__copy">' +
        "<h2>" + S.esc(s.title) + "</h2><p>" + S.esc(s.text) + "</p>" +
        '<a class="btn" href="' + S.esc(s.href) + '" data-filter="' + s.filter + '">' + S.esc(s.button) + "</a>" +
        "</div></div></article>"
      );
    }).join("") +
    "</div>" +
    '<div class="hero__controls"><div class="hero__bars" role="group" aria-label="Izbira diapozitiva">' +
    slides.map(function (s, i) {
      return '<button type="button" class="bar' + (i === 0 ? " is-active" : "") + '" aria-label="Diapozitiv ' + (i + 1) + '" aria-current="' + (i === 0) + '"></button>';
    }).join("") +
    "</div>" +
    '<div class="hero__arrows">' +
    '<button type="button" class="arrow" data-dir="-1" aria-label="Prejšnji diapozitiv"><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M8 1 1.5 8 8 15"/></svg></button>' +
    '<button type="button" class="arrow" data-dir="1" aria-label="Naslednji diapozitiv"><svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 1l6.5 7L1 15"/></svg></button>' +
    "</div></div>";

  var slideEls = hero.querySelectorAll(".slide");
  var barEls = hero.querySelectorAll(".bar");

  function show(i) {
    current = (i + slides.length) % slides.length;
    slideEls.forEach(function (el, k) {
      var on = k === current;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
      el.querySelectorAll("a").forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    });
    barEls.forEach(function (el, k) {
      el.classList.toggle("is-active", k === current);
      el.setAttribute("aria-current", k === current ? "true" : "false");
    });
  }

  function start() {
    stop();
    if (S.reduceMotion || slides.length < 2) return;
    timer = setInterval(function () { if (!paused) show(current + 1); }, 6000);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  hero.addEventListener("mouseenter", function () { paused = true; });
  hero.addEventListener("mouseleave", function () { paused = false; });
  hero.addEventListener("focusin", function () { paused = true; });
  hero.addEventListener("focusout", function () { paused = false; });
  barEls.forEach(function (b, i) { b.addEventListener("click", function () { show(i); start(); }); });
  hero.querySelectorAll(".arrow").forEach(function (b) {
    b.addEventListener("click", function () { show(current + parseInt(b.getAttribute("data-dir"), 10)); start(); });
  });
  show(0);
  start();

  /* ---------- products + filter ---------- */

  var grid = document.getElementById("grid");
  var tabs = document.querySelectorAll(".tab");
  var VALID = ["all", "zanjo", "zanj", "unisex"];

  function setFilter(f, fromUser) {
    if (VALID.indexOf(f) === -1) f = "all";
    tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-filter") === f ? "true" : "false"); });
    grid.classList.add("is-swapping");
    setTimeout(function () {
      grid.innerHTML = "";
      PRODUCTS.filter(function (p) { return f === "all" || p.gender === f; })
        .forEach(function (p) { grid.appendChild(S.createCard(p)); });
      grid.classList.remove("is-swapping");
    }, fromUser && !S.reduceMotion ? 200 : 0);
    if (fromUser) {
      var url = f === "all" ? location.pathname : location.pathname + "?spol=" + f;
      try { history.replaceState(null, "", url + "#products"); } catch (e) { /* file:// quirks */ }
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setFilter(t.getAttribute("data-filter"), true); });
  });

  // Links pointing to a filtered list (hero buttons, nav, footer) work without a reload on this page.
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    setFilter(a.getAttribute("data-filter"), true);
    document.getElementById("products").scrollIntoView({ behavior: S.reduceMotion ? "auto" : "smooth" });
  });

  var initial = new URLSearchParams(location.search).get("spol") || "all";
  setFilter(initial, false);

  /* ---------- newsletter (demo) ---------- */

  var form = document.getElementById("newsletter");
  var msg = document.getElementById("newsletter-msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "Vnesite veljaven e-poštni naslov.";
      return;
    }
    msg.textContent = "Hvala. Kodo za 10" + NBSP + "% popusta smo poslali na " + email + ".";
    form.hidden = true;
  });
})();
