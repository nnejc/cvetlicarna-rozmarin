/*
 * AURELLE – product data and shop settings.
 * Everything that is meant to be edited by hand lives in this file.
 */

// Global promotion. Set active to false to show regular prices everywhere.
var PROMO = { active: true, label: "BLACK FRIDAY", percent: 30 };

// Order value (in EUR) from which delivery is free.
var FREE_SHIPPING_FROM = 60;

// Available sizes in ml and the one that is preselected.
var SIZES = [30, 50, 100];
var DEFAULT_SIZE = 50;

// Delivery options shown at checkout (price in EUR).
var SHIPPING = [
  { id: "posta", name: "Pošta Slovenije", note: "Dostava v 1–2 delovnih dneh", price: 3.9 },
  { id: "gls", name: "GLS", note: "Dostava naslednji delovni dan", price: 4.9 }
];

// gender: "zanjo" | "zanj" | "unisex"
// notes: comma separated list per level
// secondImage: optional image shown on hover (cards) and in the product gallery
var PRODUCTS = [
  {
    id: "01",
    name: "Bela svila",
    gender: "zanjo",
    family: "Cvetlično pudrasta",
    notes: { top: "bergamotka, roza poper", heart: "pivonija, vrtnica", base: "beli mošus, kašmir les" },
    description: "Dišava čiste kože in sveže opranega perila. Bela svila se odpre z bergamotko in rahlo pikantnim roza poprom, nato se razcveti v mehko pivonijo in vrtnico. Na koncu ostane topel, pudrast mošus, ki se na koži drži ves dan, a nikoli ni vsiljiv. Za vsak dan, za pisarno in za trenutke, ko želiš dišati po sebi, samo malo lepše.",
    image: "images/product-01.jpg",
    secondImage: "images/travertine.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "02",
    name: "Jantar & dim",
    gender: "zanj",
    family: "Ambrasto lesna",
    notes: { top: "mandarina, kardamom", heart: "kadilo, tobakov list", base: "jantar, vetiver" },
    description: "Topla, samozavestna dišava za večer. Mandarina in kardamom odpreta kompozicijo, kadilo in tobakov list ji dasta globino, jantar in vetiver pa pustita sled, ki jo opazijo tudi drugi.",
    image: "images/product-02.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "03",
    name: "Figa",
    gender: "unisex",
    family: "Zeleno lesna",
    notes: { top: "figov list, limeta", heart: "figa, kokosovo mleko", base: "cedra, sandalovina" },
    description: "Poletni vrt v steklenici. Zelen, sočen figov list in kremasta sandalovina. Dišava, ki jo nosita on in ona.",
    image: "images/product-03.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "04",
    name: "Zlati vrt",
    gender: "zanjo",
    family: "Cvetlično ambrasta",
    notes: { top: "neroli, hruška", heart: "jasmin, pomarančni cvet", base: "ambra, vanilija" },
    description: "Sončna, svetla in topla. Jasmin in pomarančni cvet na mehki podlagi ambre in vanilije. Za dneve, ko želiš sijati.",
    image: "images/product-04.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "05",
    name: "Morska sol",
    gender: "unisex",
    family: "Sveže aromatična",
    notes: { top: "morska sol, grenivka", heart: "žajbelj, lavanda", base: "ambreta, plavljeni les" },
    description: "Veter z morja in topla koža po kopanju. Sveža, čista in lahka, a obstojnejša, kot pričakuješ.",
    image: "images/product-05.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "06",
    name: "Nočni oud",
    gender: "zanj",
    family: "Orientalsko lesna",
    notes: { top: "črni poper, žafran", heart: "vrtnica, usnje", base: "oud, pačuli" },
    description: "Temna, bogata in elegantna. Žafran in črni poper, srce iz usnja in vrtnice, baza iz oud lesa. Za posebne večere.",
    image: "images/product-06.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  }
];

// Homepage hero slides, in display order.
// promoOnly: slide is hidden when PROMO.active is false.
var HERO_SLIDES = [
  {
    image: "images/hero-blackfriday.jpg",
    alt: "Tri steklenice dišav AURELLE na kamnitih ploščah",
    title: "BLACK FRIDAY",
    text: "−30 % na vse dišave do 1. 12.",
    button: "Nakupuj zdaj",
    href: "index.html#products",
    filter: "all",
    promoOnly: true
  },
  {
    image: "images/hero-woman.jpg",
    alt: "Mlada ženska v beli obleki drži steklenico dišave AURELLE",
    title: "ZANJO",
    text: "Mehke, cvetlične in pudrne dišave",
    button: "Ženski parfumi",
    href: "index.html?spol=zanjo#products",
    filter: "zanjo"
  },
  {
    image: "images/hero-man.jpg",
    alt: "Moški v beli pletenini drži steklenico dišave AURELLE",
    title: "ZANJ",
    text: "Lesne, začinjene in dimne dišave",
    button: "Moški parfumi",
    href: "index.html?spol=zanj#products",
    filter: "zanj"
  }
];
