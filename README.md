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
js/quiz.js       kviz Najdi svojo dišavo
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

Trenutno je v trgovini 10 dišav (`product-01.jpg` … `product-10.jpg`). Pri vsakem izdelku sta tudi `longevity` (obstojnost) in `sillage` (sled), ki se prikažeta pod imenom na strani izdelka.

Nov izdelek dodate tako, da skopirate obstoječ objekt, spremenite `id` in vsebino ter dodate sliko v `images/`.
Izdelek odstranite tako, da izbrišete njegov objekt.

### Mreža izdelkov in dodatni ploščici

Mreža ima na računalniku 4 stolpce, na tabličnem računalniku in telefonu 2. Ko je izbran filter "Vse", se za izdelki prikažeta še ploščica
"Set vzorcev" in besedilna ploščica "Ne veš, katero izbrati?" (obe sta v `js/home.js`). Pri filtrih Zanjo, Zanj in Unisex se ne prikažeta.
Z 10 izdelki in 2 ploščicama je mreža polna (3 vrstice po 4). Če dodate ali odstranite izdelke, preverite, da zadnja vrstica ni nepopolna.

"Morda ti bo všeč" na strani izdelka prikaže 4 dišave: najprej iste vrste (zanjo / zanj / unisex), nato druge.

### Družbena omrežja

Povezave za ikone Instagram, TikTok in Facebook v nogi so v `SOCIAL` na vrhu `js/products.js` (zdaj `#`).

## Darilo, kviz, mnenja in drugo (vse v `js/products.js`)

- **Darilno pakiranje:** `GIFT = { price: 4.9 }`. Možnost "Zapakiraj kot darilo" je v košarici in na blagajni (isto besedilo kartice v obeh), cena se prikaže kot ločena vrstica.
  Možnost in besedilo kartice se shranita v `localStorage` skupaj s košarico. Pisava kartice (Pinyon Script) se naloži iz Google Fonts.
- **Kviz "Najdi svojo dišavo"** (`kviz.html`): odgovori se točkujejo glede na `tags` pri vsakem izdelku (`gender`, `occasion`, `families`, `intensity`).
  Pri novem izdelku obvezno izpolnite `tags`.
- **Mnenja:** `REVIEWS = {}`. Prave ocene dodate kot `REVIEWS["01"] = [{ name: "Ana", date: "2026-11-20", rating: 5, text: "…" }];`.
  Povprečna ocena se prikaže ob imenu izdelka in na kartici samo, če mnenja obstajajo. Obrazec za mnenje je demo in ničesar ne shrani.
- **Podjetje:** `COMPANY` (ime, naslov, telefon, e-pošta, davčna, matična, delovni čas) se uporabi v nogi, na strani Kontakt ter v pogojih in zasebnosti. Besedila v oglatih oklepajih zamenjajte z resničnimi podatki.
- **Sestavine:** `inci` pri vsakem izdelku je primer seznama, dokler ni podatkov proizvajalca.
- **Dostava in božič:** `DELIVERY` (pošiljanje čez N delovnih dni, dostava min–max delovnih dni, vikendi se preskočijo) in `CHRISTMAS = { lastOrderDate: "2026-12-19" }`. Obvestilo o božiču se prikaže od 1. 12. do tega datuma.
- **Velikosti steklenic:** `SIZE_INFO` (višina v cm, trenutno okvirne vrednosti).
- **Vračila:** besedilo je v `RETURNS_TEXT` (stran izdelka); isto besedilo je ročno vneseno še na `vracila.html` in v pogostih vprašanjih.
- `pogoji.html` in `zasebnost.html` sta **osnutka**: pred objavo ju mora pregledati pravni strokovnjak.

## Kako spremeniti cene

Vsak izdelek ima svoj `prices` objekt (cena v evrih za 30, 50 in 100 ml). Spremenite številke pri izdelku, ki ga želite.
Cena na 100 ml se izračuna samodejno.
Galerija na strani izdelka prikaže samo slike tega izdelka (pakshot, lifestyle, `secondImage`). Slika `sizes.jpg` je samo pri izdelku 01. Sličice in puščice se skrijejo, če je slika samo ena.

Na karticah je prikazana najnižja cena ("od ..."), na strani izdelka pa cena izbrane velikosti.

Pri akciji se cena zaokroži navzgor na najbližjih X,90 € (59 € → 41,90 €, 39 € → 27,90 €, 89 € → 62,90 €).
Zaokroževanje je v funkciji `promoPrice` v `js/products.js` in velja povsod (kartice, stran izdelka, košarica, blagajna).

Set vzorcev (10 × 2 ml, 24,90 €, slika `sample-set.jpg`) je v `SAMPLE_SET` v `js/products.js`. Cena in opis se spremenita samo tam.

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
`product-01.jpg` … `product-10.jpg`, `travertine.jpg`, `sizes.jpg`, `about.jpg` (4:5, razdelek O NAS), `sample-set.jpg` (set vzorcev).

Neobvezne slike (če datoteke ni, se prostor tiho izpusti):
- `product-XX-lifestyle.jpg` (npr. `product-02-lifestyle.jpg`, priporočeno 4:5): slika ob prehodu z miško na kartici in druga slika v galeriji izdelka. Prikaže se izrezana na sredino v kvadratnem okvirju. Če datoteke ni, ni zamenjave slike in ni praznih sličic. Trenutno obstajajo `product-02-lifestyle.jpg` … `product-10-lifestyle.jpg`; izdelek 01 uporablja `travertine.jpg`.

Ker brskalnik datoteke, ki je ni, javi kot 404, se lahko v konzoli ob prvem obisku pojavi nekaj takih opozoril za manjkajoče neobvezne slike. To ni napaka.

## Opombe

- Košarica se shranjuje v `localStorage`.
- Blagajna je samo demo: naročilo se ne pošlje, plačilo se ne izvede.
- Povezave v nogi (Dostava, Vračila, ...) so označevalci mesta.
