# AURELLE – demo spletna trgovina

Statična demo trgovina za znamko dišav AURELLE. Samo HTML, CSS in vanilla JS, brez ogrodij in brez build koraka.

## Zagon

Odprite `index.html` v brskalniku ali v mapi projekta zaženite preprost strežnik:

```
python3 -m http.server 8000
```

in odprite `http://localhost:8000`.

## Datoteke

```
index.html       domača stran
product.html     stran izdelka (product.html?id=01)
checkout.html    blagajna (demo, brez pravega plačila)
o-nas.html, dostava.html, vracila.html, kontakt.html,
pogosta-vprasanja.html, pogoji.html, zasebnost.html   vsebinske strani
css/styles.css   oblikovanje
js/products.js   IZDELKI, CENE, AKCIJA, HERO SLIKE (tu urejate vsebino)
js/shop.js       košarica, glava, noga, iskanje
js/home.js       hero slider, filter, novičnik
js/product.js    stran izdelka
js/checkout.js   blagajna
js/page.js       kontaktni obrazec (demo)
images/          vse slike
```

## Kako urediti izdelke

Odprite `js/products.js`. Vsak izdelek je en objekt v seznamu `PRODUCTS`:

```js
{
  id: "01",                       // enolična številka, uporablja se v povezavi product.html?id=01
  name: "Bela svila",
  gender: "zanjo",                // "zanjo" | "zanj" | "unisex"
  family: "Cvetlično pudrasta",
  notes: { top: "...", heart: "...", base: "..." },
  description: "...",
  image: "images/product-01.jpg",
  secondImage: "images/travertine.jpg",   // neobvezno: slika ob prehodu z miško in v galeriji
  prices: { 30: 39, 50: 59, 100: 89 }
}
```

Nov izdelek dodate tako, da skopirate obstoječ objekt, spremenite `id` in vsebino ter dodate sliko v `images/`.
Izdelek odstranite tako, da izbrišete njegov objekt.

## Kako spremeniti cene

Vsak izdelek ima svoj `prices` objekt (cena v evrih za 30, 50 in 100 ml). Spremenite številke pri izdelku, ki ga želite.
Cena na 100 ml se izračuna samodejno.
Na karticah je prikazana najnižja cena ("od ..."), na strani izdelka pa cena izbrane velikosti.

Pri akciji se cena zaokroži navzgor na najbližjih X,90 € (59 € → 41,90 €, 39 € → 27,90 €, 89 € → 62,90 €).
Zaokroževanje je v funkciji `promoPrice` v `js/products.js` in velja povsod (kartice, stran izdelka, košarica, blagajna).

Set vzorcev iz košarice je v `SAMPLE_SET` (cena, naziv, slika).

### Akcija (Black Friday)

Na vrhu `js/products.js`:

```js
var PROMO = { active: true, label: "BLACK FRIDAY", percent: 30 };
```

- `active: false` izklopi akcijo (redne cene, brez oznake popusta in brez Black Friday diapozitiva).
- `percent` je odstotek popusta.
- Besedilo na Black Friday diapozitivu (`text` v `HERO_SLIDES`) je ročno napisano, zato ga ob spremembi popusta ali datuma popravite tudi tam.

Prag za brezplačno dostavo je `FREE_SHIPPING_FROM`, načini in cene dostave pa `SHIPPING`.

## Kako urediti hero diapozitive

V `js/products.js` poiščite `HERO_SLIDES`. Vsak diapozitiv je objekt:

```js
{
  image: "images/hero-woman.jpg",
  alt: "Opis slike",
  title: "ZANJO",
  text: "Mehke, cvetlične in pudrne dišave",
  button: "Ženski parfumi",
  href: "index.html?spol=zanjo#products",
  filter: "zanjo"            // "all" | "zanjo" | "zanj" | "unisex"
}
```

Vrstni red v seznamu je vrstni red prikaza. Diapozitiv z `promoOnly: true` se prikaže le, ko je akcija aktivna.
Slike naj bodo razmerja 16:9 s praznim prostorom na levi, kjer je besedilo.

Za vsak diapozitiv lahko nastavite tudi `focus` (kateri del slike ostane viden na računalniku) in `focusMobile` (na telefonu).

## Slike

Datoteke v `images/`: `logo-black.svg`, `favicon.svg`, `favicon-32.png`, `hero-blackfriday.jpg`, `hero-woman.jpg`, `hero-man.jpg`,
`product-01.jpg` … `product-06.jpg`, `travertine.jpg`, `sizes.jpg`.

Neobvezne slike (če datoteke ni, se prostor tiho izpusti):
- `about.jpg`: slika v razdelku O NAS (brez nje se uporabi izrez iz `hero-woman.jpg`).
- `product-0X-lifestyle.jpg` (npr. `product-02-lifestyle.jpg`): slika ob prehodu z miško na kartici in v galeriji izdelka.

Ker brskalnik datoteke, ki je ni, javi kot 404, se lahko v konzoli ob prvem obisku pojavi nekaj takih opozoril za manjkajoče neobvezne slike. To ni napaka.

## Opombe

- Košarica se shranjuje v `localStorage`.
- Blagajna je samo demo: naročilo se ne pošlje, plačilo se ne izvede.
- Povezave v nogi (Dostava, Vračila, ...) so označevalci mesta.
