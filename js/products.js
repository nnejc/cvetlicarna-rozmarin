/*
 * AURELLE – product data and shop settings.
 * Everything that is meant to be edited by hand lives in this file.
 */

// Social profile links shown as icons in the footer. Replace "#" with the real URLs.
var SOCIAL = { instagram: "#", tiktok: "#", facebook: "#" };

// Global promotion. Set active to false to show regular prices everywhere.
var PROMO = { active: true, label: "BLACK FRIDAY", percent: 30, until: "1. 12." };

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

// Company details used in the footer, on the contact page and in the legal texts.
// Placeholders in brackets stay visible until the real data is filled in.
var COMPANY = {
  name: "[Ime podjetja d.o.o.]",
  address: "[Ulica 1, 2250 Ptuj]",
  phone: "[+386 …]",
  email: "info@aurelle.si",
  vat: "[SI…]",
  reg: "[matična št.]",
  hours: "pon–pet 9–17"
};

// Gift wrap with a printed personal card (one fee per order).
var GIFT = { price: 4.9 };

// Delivery estimate: the parcel ships shipsInDays working days after the order and then
// takes minDays–maxDays working days. Weekends are skipped.
var DELIVERY = { shipsInDays: 1, minDays: 1, maxDays: 2 };

// Christmas notice: shown from 1 December until lastOrderDate (inclusive).
var CHRISTMAS = { lastOrderDate: "2026-12-19" };

// Approximate bottle heights in cm for the size guide (placeholder values).
var SIZE_INFO = { 30: { height: 9 }, 50: { height: 11 }, 100: { height: 13.5 } };

// Customer reviews, keyed by product id. Leave empty until there are real reviews.
// Example: REVIEWS["01"] = [{ name: "Ana", date: "2026-11-20", rating: 5, text: "…" }];
var REVIEWS = {};

// Answers of the "Najdi svojo dišavo" quiz are scored against product.tags:
//   gender: "zanjo" | "zanj" | "unisex"
//   occasion: "dan" | "vecer" | "poletje" | "zima"
//   families: "cvetje" | "sadje" | "les-dim" | "sveze" | "zelena"
//   intensity: "nezna" | "zmerna" | "mocna"
// inci: example ingredient list incl. allergens (placeholder until the producer data arrives).

// Returns policy shown on the product page (the same wording is used on vracila.html and in the FAQ).
var RETURNS_TEXT = "Neodprt izdelek lahko vrnete v 14 dneh brez navedbe razloga. Ker parfuma ni mogoče povohati na spletu, vsakemu naročilu priložimo vzorec 2 ml: najprej preizkusi vzorec in šele nato odpri veliko steklenico – če ti dišava ni všeč, jo lahko neodprto vrneš.";

// Optional extra item offered in the cart (no size selector).
var SAMPLE_SET = {
  id: "set",
  name: "Set vzorcev",
  detail: "10 × 2 ml",
  image: "images/sample-set.jpg",
  price: 24.9
};

// Promo price: base price minus PROMO.percent, rounded UP to the nearest X,90 EUR
// (never above the regular price). Every price on the site goes through this function.
function promoPrice(base) {
  var raw = (base * (100 - PROMO.percent)) / 100;
  var rounded = Math.ceil(raw - 0.9 - 1e-9) + 0.9;
  return Math.round(Math.min(base, rounded) * 100) / 100;
}

// gender: "zanjo" | "zanj" | "unisex"
// notes: comma separated list per level
// longevity / sillage: shown under the product name
// secondImage: optional, see below. Optional images images/product-0X-lifestyle.jpg are picked up automatically.
// secondImage: optional image shown on hover (cards) and in the product gallery
var PRODUCTS = [
  {
    id: "01",
    longevity: "8+ ur",
    sillage: "zmerna",
    tags: { gender: "zanjo", occasion: ["dan"], families: ["cvetje"], intensity: "nezna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol, Citral, Hexyl Cinnamal, Benzyl Salicylate.",
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
    longevity: "10+ ur",
    sillage: "močna",
    tags: { gender: "zanj", occasion: ["vecer", "zima"], families: ["les-dim"], intensity: "mocna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Coumarin, Eugenol, Isoeugenol, Benzyl Benzoate, Citral.",
    name: "Jantar & dim",
    gender: "zanj",
    family: "Ambrasto lesna",
    notes: { top: "mandarina, kardamom", heart: "kadilo, tobakov list", base: "jantar, vetiver" },
    description: "Topla, samozavestna dišava za večere, ki si jih zapomniš. Odpre se s sočno mandarino in zelenim kardamomom, nato na plan pride dim kadila in suh tobakov list. V bazi se jantar in vetiver zlijeta v toplo, rahlo sladko sled, ki ostane na šalu še naslednji dan. Za hladne mesece, večerje in trenutke, ko želiš pustiti vtis.",
    image: "images/product-02.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "03",
    longevity: "6+ ur",
    sillage: "lahka",
    tags: { gender: "unisex", occasion: ["dan", "poletje"], families: ["zelena", "sadje"], intensity: "nezna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citral, Coumarin, Hexyl Cinnamal, Benzyl Benzoate.",
    name: "Figa",
    gender: "unisex",
    family: "Zeleno lesna",
    notes: { top: "figov list, limeta", heart: "figa, kokosovo mleko", base: "cedra, sandalovina" },
    description: "Poletni vrt v steklenici. Zelen, rahlo grenak figov list in kanček limete dišita kot sprehod med drevesi v sredozemskem soncu. Srce je zrela, kremasta figa s kokosovim mlekom, baza pa mehka cedra in sandalovina. Lahka za vsak dan, a z dovolj značaja, da jo nosita on in ona.",
    image: "images/product-03.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "04",
    longevity: "8+ ur",
    sillage: "zmerna",
    tags: { gender: "zanjo", occasion: ["dan", "poletje"], families: ["cvetje", "sadje"], intensity: "zmerna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Benzyl Salicylate, Benzyl Benzoate, Benzyl Alcohol, Farnesol, Coumarin.",
    name: "Zlati vrt",
    gender: "zanjo",
    family: "Cvetlično ambrasta",
    notes: { top: "neroli, hruška", heart: "jasmin, pomarančni cvet", base: "ambra, vanilija" },
    description: "Sončna, svetla in topla kot pozno popoldne. Neroli in sočna hruška jo odpreta sveže, jasmin in pomarančni cvet ji dasta bogato cvetlično srce. Na koži se počasi spremeni v mehko ambro in vanilijo, ki greje, a ne obteži. Za dneve, ko želiš sijati.",
    image: "images/product-04.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "05",
    longevity: "6+ ur",
    sillage: "lahka",
    tags: { gender: "unisex", occasion: ["poletje", "dan"], families: ["sveze"], intensity: "nezna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citral, Geraniol, Coumarin, Hexyl Cinnamal.",
    name: "Morska sol",
    gender: "unisex",
    family: "Sveže aromatična",
    notes: { top: "morska sol, grenivka", heart: "žajbelj, lavanda", base: "ambreta, plavljeni les" },
    description: "Veter z morja in topla koža po kopanju. Morska sol in grenivka prineseta svežino, žajbelj in lavanda čist, aromatičen občutek. Ambreta in plavljeni les v bazi ji dasta mehko, slano toplino. Lahka in čista, a obstojnejša, kot pričakuješ.",
    image: "images/product-05.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "06",
    longevity: "12+ ur",
    sillage: "močna",
    tags: { gender: "zanj", occasion: ["vecer", "zima"], families: ["les-dim"], intensity: "mocna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citronellol, Geraniol, Eugenol, Isoeugenol, Coumarin, Cinnamyl Alcohol.",
    name: "Nočni oud",
    gender: "zanj",
    family: "Orientalsko lesna",
    notes: { top: "črni poper, žafran", heart: "vrtnica, usnje", base: "oud, pačuli" },
    description: "Temna, bogata in elegantna. Žafran in črni poper ji dasta začinjen, skrivnosten začetek, srce iz usnja in vrtnice pa globino in mehkobo hkrati. V bazi oud les in pačuli pustita dolgo, toplo sled, ki traja do jutra. Za posebne večere in tiste, ki se ne bojijo izstopati.",
    image: "images/product-06.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "07",
    longevity: "10+ ur",
    sillage: "močna",
    tags: { gender: "zanjo", occasion: ["vecer", "zima"], families: ["cvetje", "sadje"], intensity: "mocna" },
    inci: "Alcohol Denat., Parfum, Aqua, Citronellol, Geraniol, Linalool, Limonene, Eugenol, Benzyl Benzoate, Coumarin.",
    name: "Žametna vrtnica",
    gender: "zanjo",
    family: "Ambrasto cvetlična",
    notes: { top: "malina, roza poper", heart: "turška vrtnica, geranija", base: "pačuli, vanilija" },
    description: "Vrtnica, kot je še nisi vonjala. Sočna malina in roza poper ji dasta živahen začetek, turška vrtnica in geranija bogato, žametno srce. Pačuli in vanilija v bazi jo naredita toplo in zapeljivo. Za večere, ko želiš, da te opazijo.",
    image: "images/product-07.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "08",
    longevity: "8+ ur",
    sillage: "zmerna",
    tags: { gender: "zanjo", occasion: ["vecer", "zima"], families: ["sadje", "cvetje"], intensity: "zmerna" },
    inci: "Alcohol Denat., Parfum, Aqua, Alpha-Isomethyl Ionone, Linalool, Limonene, Coumarin, Benzyl Salicylate, Hexyl Cinnamal.",
    name: "Divja sliva",
    gender: "zanjo",
    family: "Sadno pudrasta",
    notes: { top: "sliva, črni ribez", heart: "vijolica, iris", base: "tonka, sandalovina" },
    description: "Temna, sočna in skrivnostna. Zrela sliva in črni ribez se prelijeta v pudrasto vijolico in iris. Tonka in sandalovina pustita mehko, kremasto sled, ki traja vse do jutra.",
    image: "images/product-08.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "09",
    longevity: "8+ ur",
    sillage: "zmerna",
    tags: { gender: "zanj", occasion: ["vecer", "dan"], families: ["les-dim", "sveze"], intensity: "zmerna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Geraniol, Citral, Citronellol, Alpha-Isomethyl Ionone, Coumarin.",
    name: "Polnoč",
    gender: "zanj",
    family: "Aromatično lesna",
    notes: { top: "bergamotka, ingver", heart: "iris, geranija", base: "ambroksan, cedra" },
    description: "Elegantna svežina za mestne noči. Bergamotka in ingver jo odpreta živahno, iris in geranija ji dasta čist, sodoben značaj. Ambroksan in cedra v bazi poskrbita za sled, ki je prisotna, a nikoli vsiljiva.",
    image: "images/product-09.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  },
  {
    id: "10",
    longevity: "7+ ur",
    sillage: "zmerna",
    tags: { gender: "unisex", occasion: ["dan", "poletje"], families: ["zelena"], intensity: "zmerna" },
    inci: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Evernia Prunastri Extract, Citral, Geraniol, Coumarin, Eugenol.",
    name: "Smaragd",
    gender: "unisex",
    family: "Zeleno šipretna",
    notes: { top: "galbanum, bazilika", heart: "mate čaj, bor", base: "hrastov mah, mošus" },
    description: "Gozd po dežju. Zelen galbanum in bazilika dišita sveže in drzno, mate čaj in bor ji dasta globino. Hrastov mah in mošus v bazi zaokrožita dišavo, ki jo nosita on in ona.",
    image: "images/product-10.jpg",
    prices: { 30: 39, 50: 59, 100: 89 }
  }
];

// Homepage hero slides, in display order.
// promoOnly: slide is hidden when PROMO.active is false.
// focus / focusMobile: CSS object-position of the image on desktop / on phones.
var HERO_SLIDES = [
  {
    image: "images/hero-blackfriday.jpg",
    alt: "Tri steklenice dišav AURELLE na kamnitih ploščah",
    title: "BLACK FRIDAY",
    text: "−30 % na vse dišave do 1. 12.",
    button: "Nakupuj zdaj",
    href: "index.html#products",
    filter: "all",
    promoOnly: true,
    focus: "right 12%",
    focusMobile: "70% center"
  },
  {
    image: "images/hero-woman.jpg",
    alt: "Mlada ženska v beli obleki drži steklenico dišave AURELLE",
    title: "ZANJO",
    text: "Mehke, cvetlične in pudrne dišave",
    button: "Ženski parfumi",
    href: "index.html?spol=zanjo#products",
    filter: "zanjo",
    focus: "right 20%",
    focusMobile: "100% center"
  },
  {
    image: "images/hero-man.jpg",
    alt: "Moški v beli pletenini drži steklenico dišave AURELLE",
    title: "ZANJ",
    text: "Lesne, začinjene in dimne dišave",
    button: "Moški parfumi",
    href: "index.html?spol=zanj#products",
    filter: "zanj",
    focus: "right top",
    focusMobile: "100% center"
  }
];
