/* AURELLE – checkout (demo only, nothing is sent anywhere). */
(function () {
  "use strict";
  var S = window.Shop;
  var NBSP = S.NBSP;
  var root = document.getElementById("checkout");
  var done = false;
  var selected = SHIPPING[0].id;

  var RULES = {
    email: { empty: "Vnesite e-poštni naslov.", test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Vnesite veljaven e-poštni naslov."; } },
    first: { empty: "Vnesite ime." },
    last: { empty: "Vnesite priimek." },
    street: { empty: "Vnesite ulico in hišno številko." },
    zip: { empty: "Vnesite poštno številko.", test: function (v) { return /^\d{4}$/.test(v) ? "" : "Poštna številka ima 4 števke."; } },
    city: { empty: "Vnesite kraj." }
  };

  function field(name, label, opts) {
    opts = opts || {};
    return (
      '<div class="field' + (opts.wide ? " field--wide" : "") + '">' +
      '<label for="f-' + name + '">' + label + "</label>" +
      '<input id="f-' + name + '" name="' + name + '" type="' + (opts.type || "text") + '"' +
      (opts.auto ? ' autocomplete="' + opts.auto + '"' : "") +
      (opts.inputmode ? ' inputmode="' + opts.inputmode + '"' : "") +
      ' aria-describedby="err-' + name + '">' +
      '<p class="field__error" id="err-' + name + '" hidden></p></div>'
    );
  }

  function summaryHTML() {
    return S.lines().map(function (l) {
      return (
        '<li class="line line--sum"><div class="line__media media"><img src="' + S.esc(l.p.image) + '" alt="" loading="lazy"></div>' +
        '<div class="line__info"><p class="line__name">' + S.esc(l.p.name) + '</p><p class="muted">' + l.label + " · " + l.qty + NBSP + "×" + NBSP + S.unitHTML(l) + "</p></div>" +
        '<p class="line__total">' + S.money(l.total) + "</p></li>"
      );
    }).join("");
  }

  function free() { return S.subtotal() >= FREE_SHIPPING_FROM; }

  function renderShipping() {
    document.getElementById("ship-choices").innerHTML = SHIPPING.map(function (s) {
      return (
        '<label class="choice"><input type="radio" name="ship" value="' + s.id + '"' + (s.id === selected ? " checked" : "") + ">" +
        "<span>" + s.name + '<small class="muted">' + s.note + "</small></span>" +
        '<span class="choice__price">' + (free() ? "Brezplačno" : S.money(s.price)) + "</span></label>"
      );
    }).join("");
  }

  function renderTotals() {
    var sub = S.subtotal();
    var ship = SHIPPING.filter(function (s) { return s.id === selected; })[0];
    var shipCost = free() ? 0 : ship.price;
    document.getElementById("sum-lines").innerHTML = summaryHTML();
    document.getElementById("totals").innerHTML =
      '<div class="sum"><span>Vmesni seštevek</span><span>' + S.money(sub) + "</span></div>" +
      '<div class="sum"><span>Dostava</span><span>' + (shipCost ? S.money(shipCost) : "Brezplačno") + "</span></div>" +
      '<div class="sum sum--total"><span>Skupaj</span><strong>' + S.money(sub + shipCost) + "</strong></div>" +
      '<p class="muted small">Cena vključuje DDV.</p>';
  }

  function setError(id, text) {
    var err = document.getElementById("err-" + id);
    var input = document.getElementById(id === "terms" ? "f-terms" : "f-" + id);
    err.hidden = !text;
    err.textContent = text || "";
    if (input) input.setAttribute("aria-invalid", text ? "true" : "false");
    return !text;
  }

  function render() {
    if (!S.lines().length) {
      root.innerHTML =
        '<div class="notfound"><h1>Blagajna</h1><p class="muted">Košarica je prazna.</p>' +
        '<a class="btn" href="index.html#products">Nazaj na dišave</a></div>';
      return;
    }

    root.innerHTML =
      '<h1 class="page-title">Blagajna</h1>' +
      '<p class="demo-note">Demo trgovina: naročila se ne oddajo in plačilo se ne izvede.</p>' +
      '<div class="co">' +
      '<form class="co__form" id="co-form" novalidate>' +
      '<fieldset><legend>Kontakt</legend><div class="fields">' +
      field("email", "E-poštni naslov", { type: "email", auto: "email", wide: true }) +
      '<div class="field field--wide"><label for="f-phone">Telefon (neobvezno)</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>' +
      "</div></fieldset>" +
      '<fieldset><legend>Naslov za dostavo</legend><div class="fields">' +
      field("first", "Ime", { auto: "given-name" }) + field("last", "Priimek", { auto: "family-name" }) +
      field("street", "Ulica in hišna številka", { auto: "street-address", wide: true }) +
      field("zip", "Poštna številka", { auto: "postal-code", inputmode: "numeric" }) + field("city", "Kraj", { auto: "address-level2" }) +
      '<div class="field field--wide"><label for="f-country">Država</label><select id="f-country" name="country" autocomplete="country-name"><option>Slovenija</option></select></div>' +
      "</div></fieldset>" +
      '<fieldset><legend>Dostava</legend><div class="choices" id="ship-choices"></div></fieldset>' +
      '<fieldset><legend>Plačilo</legend>' +
      '<p class="muted small">Plačilo je v demo različici le označevalec mesta. Podatkov kartice ne zbiramo.</p>' +
      '<div class="choices">' +
      '<label class="choice"><input type="radio" name="pay" value="card" checked><span>Plačilna kartica</span></label>' +
      '<label class="choice"><input type="radio" name="pay" value="cod"><span>Plačilo po povzetju</span></label>' +
      '<label class="choice"><input type="radio" name="pay" value="bank"><span>Bančno nakazilo</span></label>' +
      "</div></fieldset>" +
      '<div class="terms"><label class="check"><input type="checkbox" id="f-terms" name="terms" aria-describedby="err-terms">' +
      '<span>Strinjam se s <a href="pogoji.html" target="_blank" rel="noopener">splošnimi pogoji</a> in <a href="zasebnost.html" target="_blank" rel="noopener">politiko zasebnosti</a></span></label>' +
      '<p class="field__error" id="err-terms" hidden></p></div>' +
      '<button type="submit" class="btn btn--full is-disabled" id="co-submit" aria-disabled="true">Oddaj naročilo</button>' +
      "</form>" +
      '<aside class="co__sum" aria-labelledby="sum-title"><h2 id="sum-title">Povzetek naročila</h2>' +
      '<ul class="lines" id="sum-lines"></ul>' +
      '<div class="totals" id="totals"></div>' +
      '<p class="muted small">Vzorec 2' + NBSP + "ml je dodan brezplačno.</p>" +
      "</aside></div>";

    renderShipping();
    renderTotals();

    var form = document.getElementById("co-form");
    var submit = document.getElementById("co-submit");
    var terms = document.getElementById("f-terms");

    document.getElementById("ship-choices").addEventListener("change", function (e) { selected = e.target.value; renderTotals(); });

    terms.addEventListener("change", function () {
      submit.classList.toggle("is-disabled", !terms.checked);
      submit.setAttribute("aria-disabled", terms.checked ? "false" : "true");
      if (terms.checked) setError("terms", "");
    });
    form.addEventListener("input", function (e) {
      var n = e.target.name;
      if (RULES[n]) setError(n, "");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(RULES).forEach(function (n) {
        var v = form.elements[n].value.trim();
        var msg = !v ? RULES[n].empty : (RULES[n].test ? RULES[n].test(v) : "");
        if (!setError(n, msg) && !firstBad) firstBad = form.elements[n];
      });
      if (!setError("terms", terms.checked ? "" : "Za oddajo naročila se morate strinjati s splošnimi pogoji.") && !firstBad) firstBad = terms;
      if (firstBad) { firstBad.focus(); return; }

      var order = "AU-" + String(Math.floor(100000 + Math.random() * 900000));
      var email = form.elements.email.value;
      done = true;
      S.clearCart();
      root.innerHTML =
        '<div class="notfound"><h1>Hvala za naročilo</h1>' +
        "<p>Številka naročila: <strong>" + order + "</strong></p>" +
        '<p class="muted">To je demo, zato naročila nismo oddali. Potrditve ne bomo poslali na ' + S.esc(email) + ".</p>" +
        '<a class="btn" href="index.html">Nazaj na začetno stran</a></div>';
      window.scrollTo(0, 0);
    });
  }

  // Keep the order summary in sync when the cart drawer is used on this page.
  S.onCartChange(function () {
    if (done) return;
    if (!S.lines().length) { render(); return; }
    if (document.getElementById("totals")) { renderShipping(); renderTotals(); }
  });

  render();
})();
