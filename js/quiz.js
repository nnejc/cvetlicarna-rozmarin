/* AURELLE – "Najdi svojo dišavo" quiz. Answers are scored against product.tags in products.js. */
(function () {
  "use strict";
  var S = window.Shop;
  var NBSP = S.NBSP;
  var root = document.getElementById("quiz");

  var QUESTIONS = [
    { id: "who", title: "Za koga iščeš dišavo?", answers: [
      ["zase-z", "Zase (ženska)"], ["zase-m", "Zase (moški)"], ["dar-njej", "Za darilo njej"], ["dar-njemu", "Za darilo njemu"], ["vseeno", "Vseeno mi je"]] },
    { id: "when", title: "Kdaj jo boš najraje nosil/a?", answers: [
      ["dan", "Vsak dan"], ["vecer", "Zvečer in ob posebnih priložnostih"], ["poletje", "Poleti in na dopustu"], ["zima", "Pozimi"]] },
    { id: "scent", title: "Kateri vonji te najbolj privlačijo?", hint: "Izberi do 2", multi: true, max: 2, answers: [
      ["cvetje", "Cvetje"], ["sadje", "Sadje in sladko"], ["les-dim", "Les, dim in začimbe"], ["sveze", "Sveže in morje"], ["zelena", "Zelena narava"]] },
    { id: "power", title: "Kako močna naj bo?", answers: [
      ["nezna", "Nežna, blizu kože"], ["zmerna", "Zmerna"], ["mocna", "Močna, da jo opazijo"]] }
  ];

  var FAMILY_TEXT = { "cvetje": "cvetje", "sadje": "sadje in sladke vonje", "les-dim": "les, dim in začimbe", "sveze": "sveže in morske vonje", "zelena": "zeleno naravo" };
  var WHEN_TEXT = { dan: "jo boš nosil/a vsak dan", vecer: "jo iščeš za večere in posebne priložnosti", poletje: "jo iščeš za poletje in dopust", zima: "jo iščeš za zimo" };
  var POWER_TEXT = { nezna: "želiš nežno dišavo blizu kože", zmerna: "želiš zmerno močno dišavo", mocna: "želiš močnejšo dišavo" };
  var POWER_ORDER = ["nezna", "zmerna", "mocna"];

  var step = 0;
  var answers = {};

  /* ---------- scoring ---------- */

  function score(p, a) {
    var t = p.tags, sc = 0, why = { fam: [] };
    var pref = { "zase-z": "zanjo", "dar-njej": "zanjo", "zase-m": "zanj", "dar-njemu": "zanj" }[a.who] || null;
    if (pref) {
      if (t.gender === pref) { sc += 4; } else if (t.gender === "unisex") { sc += 2; } else { return null; }
    }
    if (a.when && t.occasion.indexOf(a.when) !== -1) { sc += 3; why.when = a.when; }
    (a.scent || []).forEach(function (f) {
      if (t.families.indexOf(f) !== -1) { sc += 3; why.fam.push(f); }
    });
    if (a.power) {
      var d = Math.abs(POWER_ORDER.indexOf(t.intensity) - POWER_ORDER.indexOf(a.power));
      if (d === 0) { sc += 3; why.power = a.power; } else if (d === 1) { sc += 1; }
    }
    return { p: p, score: sc, why: why };
  }

  function reason(r) {
    var parts = [];
    if (answers.who === "dar-njej") parts.push("iščeš darilo za njo");
    if (answers.who === "dar-njemu") parts.push("iščeš darilo za njega");
    if (r.why.fam.length) parts.push("imaš rad/a " + r.why.fam.map(function (f) { return FAMILY_TEXT[f]; }).join(" ter "));
    if (r.why.when) parts.push(WHEN_TEXT[r.why.when]);
    if (r.why.power) parts.push(POWER_TEXT[r.why.power]);
    if (!parts.length) return "Ker se najbolje ujema z tvojimi odgovori.";
    var text = parts.length > 1 ? parts.slice(0, -1).join(", ") + " ter " + parts[parts.length - 1] : parts[0];
    return "Ker " + text + ".";
  }

  function ranked() {
    return PRODUCTS.map(function (p, i) { var r = score(p, answers); if (r) r.i = i; return r; })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score || a.i - b.i; });
  }

  /* ---------- screens ---------- */

  function progressHTML(n) {
    return '<div class="quiz__progress"><p class="quiz__count" aria-live="polite">' + (n + 1) + " / " + QUESTIONS.length + '</p>' +
      '<div class="quiz__line" role="presentation"><span style="width:' + (((n + 1) / QUESTIONS.length) * 100) + '%"></span></div></div>';
  }

  function renderQuestion() {
    var q = QUESTIONS[step];
    var chosen = answers[q.id] || (q.multi ? [] : null);
    root.innerHTML =
      progressHTML(step) +
      '<fieldset class="quiz__q"><legend><h1 class="quiz__title">' + q.title + "</h1>" +
      (q.hint ? '<span class="quiz__hint muted">' + q.hint + "</span>" : "") + "</legend>" +
      '<div class="quiz__answers' + (q.answers.length === 5 ? " quiz__answers--5" : "") + '">' +
      q.answers.map(function (a) {
        var on = q.multi ? chosen.indexOf(a[0]) !== -1 : chosen === a[0];
        return '<button type="button" class="qtile" data-v="' + a[0] + '" aria-pressed="' + on + '">' + a[1] + "</button>";
      }).join("") + "</div></fieldset>" +
      '<div class="quiz__nav">' +
      (step > 0 ? '<button type="button" class="link-btn" id="q-back">Nazaj</button>' : "<span></span>") +
      (q.multi ? '<button type="button" class="btn" id="q-next"' + (chosen.length ? "" : " disabled") + ">Naprej</button>" : "") +
      "</div>";

    root.querySelector(".quiz__answers").addEventListener("click", function (e) {
      var b = e.target.closest(".qtile");
      if (!b) return;
      var v = b.getAttribute("data-v");
      if (q.multi) {
        var cur = (answers[q.id] || []).slice();
        var i = cur.indexOf(v);
        if (i !== -1) cur.splice(i, 1); else { cur.push(v); if (cur.length > q.max) cur.shift(); }
        answers[q.id] = cur;
        root.querySelectorAll(".qtile").forEach(function (t) { t.setAttribute("aria-pressed", cur.indexOf(t.getAttribute("data-v")) !== -1 ? "true" : "false"); });
        root.querySelector("#q-next").disabled = !cur.length;
      } else {
        answers[q.id] = v;
        root.querySelectorAll(".qtile").forEach(function (t) { t.setAttribute("aria-pressed", t === b ? "true" : "false"); });
        setTimeout(next, S.reduceMotion ? 0 : 220);
      }
    });
    var back = root.querySelector("#q-back");
    if (back) back.addEventListener("click", function () { step--; renderQuestion(); focusTop(); });
    var nx = root.querySelector("#q-next");
    if (nx) nx.addEventListener("click", next);
  }

  function next() {
    if (step < QUESTIONS.length - 1) { step++; renderQuestion(); focusTop(); } else { renderResult(); focusTop(); }
  }

  function focusTop() {
    var h = root.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  function renderResult() {
    var list = ranked();
    var top = list.slice(0, 2), third = list[2];
    root.innerHTML =
      '<div class="quiz__result">' +
      '<h1 class="quiz__title">Tvoje dišave</h1>' +
      '<div class="quiz__top" id="quiz-top"></div>' +
      (third ? '<section class="quiz__third" aria-labelledby="third-title"><h2 id="third-title">Lahko ti bo všeč tudi</h2>' +
        '<a class="mini" href="product.html?id=' + third.p.id + '"><span class="mini__media media"><img src="' + S.esc(third.p.image) + '" alt="" loading="lazy"></span>' +
        '<span class="mini__text"><span class="eyebrow">' + S.esc(third.p.family) + '</span><span class="mini__name">' + S.esc(third.p.name) + '</span>' +
        '<span class="muted small">' + S.esc(reason(third)) + "</span></span></a></section>" : "") +
      '<section class="quiz__set" aria-labelledby="set-title"><div class="quiz__setimg media"><img src="' + S.esc(SAMPLE_SET.image) + '" alt="Set vzorcev AURELLE" loading="lazy"></div>' +
      '<div><h2 id="set-title">Še vedno ne veš?</h2><p>Preizkusi vseh ' + PRODUCTS.length + " v setu vzorcev za " + S.money(SAMPLE_SET.price) + '.</p>' +
      '<button type="button" class="btn" id="quiz-set">V košarico</button></div></section>' +
      '<p class="quiz__again"><button type="button" class="btn btn--outline" id="quiz-again">Ponovi kviz</button></p></div>';

    var holder = document.getElementById("quiz-top");
    top.forEach(function (r) {
      var card = S.createCard(r.p);
      var p = document.createElement("p");
      p.className = "quiz__reason";
      p.textContent = reason(r);
      card.querySelector(".card__body").appendChild(p);
      holder.appendChild(card);
    });
    document.getElementById("quiz-set").addEventListener("click", function () { S.addItem(SAMPLE_SET.id, 0, 1); });
    document.getElementById("quiz-again").addEventListener("click", function () { step = 0; answers = {}; renderQuestion(); focusTop(); });
  }

  // Exposed for tests: run the scoring without clicking through the screens.
  window.AurelleQuiz = { run: function (a) { answers = a; return ranked().map(function (r) { return r.p.name; }); } };

  renderQuestion();
})();
