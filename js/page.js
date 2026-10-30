/* AURELLE – small helpers for the static content pages (contact form demo). */
(function () {
  "use strict";
  var form = document.getElementById("contact");
  if (!form) return;
  var msg = document.getElementById("contact-msg");

  function setError(name, text) {
    var input = form.elements[name];
    var err = document.getElementById("err-c-" + (name === "message" ? "msg" : name));
    err.hidden = !text;
    err.textContent = text || "";
    input.setAttribute("aria-invalid", text ? "true" : "false");
    return !text;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements.email.value.trim();
    var ok = true;
    ok = setError("name", form.elements.name.value.trim() ? "" : "Vnesite ime.") && ok;
    ok = setError("email", !email ? "Vnesite e-poštni naslov." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Vnesite veljaven e-poštni naslov.") && ok;
    ok = setError("message", form.elements.message.value.trim() ? "" : "Vnesite sporočilo.") && ok;
    if (!ok) { msg.textContent = ""; return; }
    msg.textContent = "Hvala za sporočilo. To je demo, zato ga nismo poslali.";
    form.reset();
  });
  form.addEventListener("input", function (e) {
    var n = e.target.name;
    if (n) setError(n, "");
  });
})();
