/*
 * AURELLE – product data and shop settings.
 * Everything that is meant to be edited by hand lives in this file.
 */

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

// Optional extra item offered in the cart (no size selector).
var SAMPLE_SET = {
  id: "set",
  name: "Set vzorcev",
  detail: "6 × 2 ml",
  image: "images/sizes.jpg",
  price: 19
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
