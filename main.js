/* =========================================================
   Cvetličarna Rožmarin — main.js
   Vanilla JS, no dependencies, works from file://
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------
     PRICES — single source of truth for the price list.
     TODO: confirm prices with client
     ------------------------------------------------------- */
  var PRICES = [
    { name: "Šopek", from: "od 15 €" },
    { name: "Poročni šopek", from: "od 60 €" },
    { name: "Cvetlični aranžma", from: "od 25 €" },
    { name: "Žalni venec", from: "od 50 €" },
    { name: "Žalna ikebana", from: "od 35 €" },
    { name: "Sveče", from: "od 8 €" },
    { name: "Lončnica z darilnim ovojem", from: "od 12 €" },
    { name: "Dostava (Ptuj in okolica)", from: "od 5 €" }
  ];

  /* -------------------------------------------------------
     OPENING HOURS — editable constants.
     TODO: confirm opening hours with client
     (also update the <dl class="hours"> blocks in index.html
      and the openingHoursSpecification in the JSON-LD schema)
     ------------------------------------------------------- */
  var HOURS = {
    weekdays: "8:00–18:00", // Pon–Pet
    saturday: "8:00–12:00", // Sobota
    sunday: "zaprto"        // Nedelja
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderPrices();
    initHeader();
    initMobileNav();
    initScrollReveal();
    initGalleryLightbox();
    initContactForm();
    initParallax();
    setYear();

    if (!prefersReduced) {
      initPetals();
    }
  });

  /* ---------- Price list ---------- */
  function renderPrices() {
    var list = document.getElementById("priceList");
    if (!list) return;
    var html = "";
    for (var i = 0; i < PRICES.length; i++) {
      html +=
        '<li class="reveal"><span class="price-name">' +
        PRICES[i].name +
        '</span><span class="price-value">' +
        PRICES[i].from +
        "</span></li>";
    }
    list.innerHTML = html;
  }

  /* ---------- Sticky header background on scroll ---------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    var setOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Zapri meni" : "Odpri meni");
    };

    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal, [data-stagger]");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;

          if (el.hasAttribute("data-stagger")) {
            var kids = el.querySelectorAll(".reveal");
            kids.forEach(function (kid, idx) {
              setTimeout(function () {
                kid.classList.add("is-visible");
              }, idx * 90);
            });
          }
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ---------- Gallery lightbox ---------- */
  function initGalleryLightbox() {
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightboxImg");
    var closeBtn = document.getElementById("lightboxClose");
    var buttons = document.querySelectorAll(".gallery-item button");
    if (!lightbox || !lightboxImg) return;

    var lastFocused = null;

    var open = function (src, alt) {
      lightboxImg.setAttribute("src", src);
      lightboxImg.setAttribute("alt", alt || "");
      lightbox.hidden = false;
      lastFocused = document.activeElement;
      closeBtn.focus();
      document.body.style.overflow = "hidden";
    };

    var close = function () {
      lightbox.hidden = true;
      lightboxImg.setAttribute("src", "");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        open(btn.getAttribute("data-full"), img ? img.getAttribute("alt") : "");
      });
    });

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) close();
    });
  }

  /* ---------- Contact form (client-side only) ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var success = document.getElementById("formSuccess");
    if (!form) return;

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var setError = function (field, message) {
      var wrap = field.closest(".field");
      var errEl = wrap.querySelector(".field-error");
      wrap.classList.toggle("invalid", !!message);
      field.setAttribute("aria-invalid", message ? "true" : "false");
      errEl.textContent = message || "";
    };

    var validate = function () {
      var ok = true;
      var name = form.elements["name"];
      var email = form.elements["email"];
      var message = form.elements["message"];

      if (!name.value.trim()) { setError(name, "Prosimo, vpišite svoje ime."); ok = false; }
      else setError(name, "");

      if (!emailRe.test(email.value.trim())) { setError(email, "Vpišite veljaven e-poštni naslov."); ok = false; }
      else setError(email, "");

      if (message.value.trim().length < 10) { setError(message, "Sporočilo naj ima vsaj 10 znakov."); ok = false; }
      else setError(message, "");

      return ok;
    };

    form.addEventListener("submit", function (e) {
      // No backend yet — handle success in the browser.
      // To send for real, point the <form action> at Formspree and remove this preventDefault().
      e.preventDefault();
      if (!validate()) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      form.reset();
      if (success) {
        success.hidden = false;
        success.setAttribute("role", "status");
      }
    });

    form.addEventListener("input", function (e) {
      if (e.target.closest(".field.invalid")) validate();
    });
  }

  /* ---------- Light parallax on hero floral layers ---------- */
  function initParallax() {
    if (prefersReduced) return;
    var layers = document.querySelectorAll(".hero-art");
    if (!layers.length) return;
    var ticking = false;

    var update = function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        layers[0].style.transform = "translateY(" + y * 0.12 + "px)";
        if (layers[1]) layers[1].style.transform = "translateY(" + y * 0.2 + "px)";
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Drifting petal particles on <canvas> ---------- */
  function initPetals() {
    var canvas = document.getElementById("heroPetals");
    var hero = document.getElementById("hero");
    if (!canvas || !hero) return;
    var ctx = canvas.getContext("2d");

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var petals = [];
    var COUNT = window.innerWidth < 700 ? 12 : 20;
    var colors = ["#c98a8a", "#d9a7a0", "#e7c9bd", "#9db29b"];
    var running = true;

    function resize() {
      w = hero.offsetWidth;
      h = hero.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makePetal(initial) {
      var far = Math.random() < 0.4;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -20,
        size: (far ? 5 : 9) + Math.random() * 6,
        speed: (far ? 0.25 : 0.5) + Math.random() * 0.6,
        drift: -0.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        spin: (-0.5 + Math.random()) * 0.02,
        opacity: (far ? 0.12 : 0.28) + Math.random() * 0.18,
        color: colors[(Math.random() * colors.length) | 0],
        far: far
      };
    }

    function seed() {
      petals = [];
      for (var i = 0; i < COUNT; i++) petals.push(makePetal(true));
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      if (p.far) ctx.filter = "blur(1.5px)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.filter = "none";
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y * 0.02) * 0.3;
        p.angle += p.spin;
        if (p.y > h + 20) petals[i] = makePetal(false);
        drawPetal(p);
      }
      window.requestAnimationFrame(tick);
    }

    resize();
    seed();
    tick();

    window.addEventListener("resize", function () {
      resize();
      seed();
    });

    // Pause when hero scrolled out of view (saves battery)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
        if (running) tick();
      });
      io.observe(hero);
    }
  }

  /* ---------- Footer year ---------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }
})();
