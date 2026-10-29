/* AURELLE – checkout (demo only, nothing is sent anywhere). */
(function () {
  "use strict";
  var S = window.Shop;
  var NBSP = S.NBSP;
  var root = document.getElementById("checkout");

  function field(name, label, opts) {
    opts = opts || {};
    return (
      '<div class="field' + (opts.wide ? " field--wide" : "") + '">' +
      '<label for="f-' + name + '">' + label + "</label>" +
      '<input id="f-' + name + '" name="' + name + '" type="' + (opts.type || "text") + '"' +
      (opts.auto ? ' autocomplete="' + opts.auto + '"' : "") +
      (opts.optional ? "" : " required") + "></div>"
    );
  }

  function render() {
    var ls = S.lines();
    if (!ls.length) {
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
      field("phone", "Telefon", { type: "tel", auto: "tel", wide: true, optional: true }) +
      "</div></fieldset>" +
      '<fieldset><legend>Naslov za dostavo</legend><div class="fields">' +
      field("first", "Ime", { auto: "given-name" }) + field("last", "Priimek", { auto: "family-name" }) +
      field("street", "Ulica in hišna številka", { auto: "street-address", wide: true }) +
      field("zip", "Poštna številka", { auto: "postal-code" }) + field("city", "Kraj", { auto: "address-level2" }) +
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
      '<p class="form-error" id="co-error" role="alert"></p>' +
      '<button type="submit" class="btn btn--full">Oddaj naročilo</button>' +
      "</form>" +
      '<aside class="co__sum" aria-labelledby="sum-title"><h2 id="sum-title">Povzetek naročila</h2>' +
      '<ul class="lines">' + ls.map(function (l) {
        return (
          '<li class="line line--sum"><div class="line__media media"><img src="' + S.esc(l.p.image) + '" alt="" loading="lazy"></div>' +
          '<div class="line__info"><p class="line__name">' + S.esc(l.p.name) + '</p><p class="muted">' + l.size + NBSP + "ml · " + l.qty + NBSP + "×" + NBSP + S.money(l.unit) + "</p></div>" +
          '<p class="line__total">' + S.money(l.total) + "</p></li>"
        );
      }).join("") + "</ul>" +
      '<div class="totals" id="totals"></div>' +
      '<p class="muted small">Vzorec 2' + NBSP + "ml je dodan brezplačno.</p>" +
      "</aside></div>";

    var sub = S.subtotal();
    var free = sub >= FREE_SHIPPING_FROM;
    var selected = SHIPPING[0].id;

    var choices = document.getElementById("ship-choices");
    choices.innerHTML = SHIPPING.map(function (s, i) {
      return (
        '<label class="choice"><input type="radio" name="ship" value="' + s.id + '"' + (i === 0 ? " checked" : "") + ">" +
        "<span>" + s.name + '<small class="muted">' + s.note + "</small></span>" +
        '<span class="choice__price">' + (free ? "Brezplačno" : S.money(s.price)) + "</span></label>"
      );
    }).join("");

    function totals() {
      var ship = SHIPPING.filter(function (s) { return s.id === selected; })[0];
      var shipCost = free ? 0 : ship.price;
      document.getElementById("totals").innerHTML =
        '<div class="sum"><span>Vmesni seštevek</span><span>' + S.money(sub) + "</span></div>" +
        '<div class="sum"><span>Dostava</span><span>' + (shipCost ? S.money(shipCost) : "Brezplačno") + "</span></div>" +
        '<div class="sum sum--total"><span>Skupaj</span><strong>' + S.money(sub + shipCost) + "</strong></div>" +
        '<p class="muted small">Cena vključuje DDV.</p>';
    }
    choices.addEventListener("change", function (e) { selected = e.target.value; totals(); });
    totals();

    var form = document.getElementById("co-form");
    var err = document.getElementById("co-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        err.textContent = "Izpolnite vsa obvezna polja.";
        form.reportValidity();
        return;
      }
      var order = "AU-" + String(Math.floor(100000 + Math.random() * 900000));
      var email = form.elements.email.value;
      S.clearCart();
      root.innerHTML =
        '<div class="notfound"><h1>Hvala za naročilo</h1>' +
        "<p>Številka naročila: <strong>" + order + "</strong></p>" +
        '<p class="muted">To je demo, zato naročila nismo oddali. Potrditev ne bomo poslali na ' + S.esc(email) + ".</p>" +
        '<a class="btn" href="index.html">Nazaj na začetno stran</a></div>';
      window.scrollTo(0, 0);
    });
  }

  render();
})();
