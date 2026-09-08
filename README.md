# Cvetličarna Rožmarin — spletna stran

Statična enostranska predstavitvena stran za cvetličarno Rožmarin (Horvat Hermina s.p.),
Ptuj in Bukovci. Brez ogrodij, brez build koraka, brez zunanjih povezav — deluje tudi brez interneta.

## Datoteke

```
index.html      # celotna vsebina in struktura
styles.css      # oblikovanje
main.js         # animacije, meni, galerija, obrazec
assets/         # nadomestne slike (SVG) in Open Graph slika
```

Stran odprete tako, da dvokliknete `index.html` — deluje neposredno iz datotečnega sistema (`file://`).

---

## Kako zamenjati fotografije v galeriji

V mapi `assets/` so datoteke `gallery-1.svg` … `gallery-8.svg` — to so začasne nadomestne slike.

1. Pripravite prave fotografije (priporočeno: širina 800–1200 px, JPG ali WebP).
2. Poimenujte jih `gallery-1.jpg`, `gallery-2.jpg` … in jih skopirajte v mapo `assets/`.
3. V `index.html` poiščite razdelek `<!-- ============ GALERIJA ============ -->` in v vsakem
   `<li class="gallery-item">` zamenjajte končnico `.svg` z `.jpg` na **dveh mestih**:
   - `data-full="assets/gallery-1.svg"` → `data-full="assets/gallery-1.jpg"`
   - `src="assets/gallery-1.svg"` → `src="assets/gallery-1.jpg"`
4. Posodobite besedilo v `alt="…"`, da opisuje dejansko fotografijo (pomembno za dostopnost in SEO).

Slike so lahko različnih višin — postavitev (masonry) se samodejno prilagodi.

### Open Graph slika (predogled ob deljenju na družbenih omrežjih)

`assets/og-image.svg` je začasna. Nekatera omrežja ne prikažejo SVG.
Priporočljivo je izdelati `assets/og-image.jpg` v velikosti **1200 × 630 px** in v `index.html`
posodobiti vrstico `<meta property="og:image" content="assets/og-image.svg" />`.

---

## Kako spremeniti cene

Vse cene so na **enem mestu** — v datoteki `main.js`, na vrhu, v konstanti `PRICES`:

```js
var PRICES = [
  { name: "Šopek", from: "od 15 €" },
  { name: "Poročni šopek", from: "od 60 €" },
  ...
];
```

Uredite besedilo v `name` ali `from`, dodajte ali odstranite vrstice. Cenik na strani se osveži samodejno.
Vrstica je označena s komentarjem `// TODO: confirm prices with client`.

---

## Kako urediti odpiralni čas

Odpiralni čas je zapisan na **treh mestih** (poiščite komentar `TODO: confirm opening hours with client`):

1. **`main.js`** — konstanta `HOURS` (za morebitno prihodnjo uporabo v skriptu).
2. **`index.html`** — v razdelku `<!-- ============ KONTAKT ============ -->`, v vsaki
   `<dl class="hours">` za poslovalnico Ptuj in Bukovci.
3. **`index.html`** — v strukturiranih podatkih (`application/ld+json`), polje
   `openingHoursSpecification` (`opens` / `closes`).

Poskrbite, da so vsi trije zapisi usklajeni.

Prav tako preverite in po potrebi popravite naslov poslovalnice Bukovci
(hišna številka in poštna številka so označene s `TODO`).

---

## Kako povezati kontaktni obrazec (Formspree)

Trenutno obrazec deluje samo v brskalniku — po oddaji pokaže sporočilo o uspehu, a ne pošlje e-pošte.

Za pravo pošiljanje:

1. Ustvarite obrazec na [formspree.io](https://formspree.io) in kopirajte svoj endpoint (npr. `https://formspree.io/f/abcdwxyz`).
2. V `index.html` dopolnite oznako `<form>`:
   ```html
   <form class="contact-form" id="contactForm" action="https://formspree.io/f/abcdwxyz" method="POST" novalidate>
   ```
3. V `main.js`, v funkciji `initContactForm`, odstranite vrstico `e.preventDefault();`
   (validacija ostane; brskalnik nato odda obrazec na Formspree).

---

## Objava na GitHub Pages

1. Ustvarite repozitorij na GitHubu in vanj naložite vse datoteke (`index.html` mora biti v korenu).
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<uporabnik>/<repo>.git
   git push -u origin main
   ```
2. V repozitoriju odprite **Settings → Pages**.
3. Pod **Source** izberite vejo `main` in mapo `/ (root)`, shranite.
4. Čez minuto ali dve bo stran na `https://<uporabnik>.github.io/<repo>/`.

Vse poti v projektu so relativne, zato deluje tudi v podmapi.

---

## Kaj je še treba potrditi s stranko (TODO)

- Odpiralni čas (delavniki in sobota).
- Točen naslov poslovalnice Bukovci (hišna številka, poštna številka).
- Cene v ceniku so okvirne — potrditi dejanske izhodiščne cene.
- Prave fotografije za galerijo in Open Graph sliko.
- Google ocena (`4,8 ★`) — po potrebi posodobiti število ocen v strukturiranih podatkih.
