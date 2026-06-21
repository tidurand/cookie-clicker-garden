// Données du jardin de Cookie Clicker
// mature  = nombre de ticks avant maturation (valeur de ta feuille d'optimisation)
// window  = nombre de ticks de vie APRÈS maturité avant disparition  (-1 = immortelle)
// modif   = true => durée notable / modifiable (le 2e "+" de ta notation)
// marker  = marqueur de ta feuille (¹ ² ³ W J) pour les groupes / variantes
// group   = 1 (plantes prioritaires) / 2 (autres plantes), tel que dans ta liste
// checked = état de départ de la case (sera ensuite mémorisé dans le navigateur)
// effect / mutation / cost viennent du wiki (https://cookieclicker.wiki.gg/wiki/Garden)

const PLANTS = [
  // ---------- GROUPE 1 ----------
  { en: "Baker's Wheat", fr: "Blé du Pâtissier", mature: 5, window: 8, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% CpS", mutation: "Plante de départ", cost: "1 min de CpS" },
  { en: "Bakeberry", fr: "Pâtisetille", mature: 32, window: 35, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% CpS ; récolte → +30 min de CpS", mutation: "2× Blé du pâtissier (rare)", cost: "45 min de CpS" },
  { en: "Thumbcorn", fr: "Maïspouce", mature: 3, window: 12, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+2% cookies par clic", mutation: "2× Blé du pâtissier", cost: "5 min de CpS" },
  { en: "Cronerice", fr: "Mégèriz", mature: 70, window: 64, modif: true, marker: "", group: 1, checked: true, fungus: false,
    effect: "+3% CpS des mamies", mutation: "Blé + Maïspouce", cost: "15 min de CpS" },
  { en: "Gildmillet", fr: "Mildoré", mature: 14, window: 23, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% gains cookies dorés, +0,1% durée", mutation: "Mégèriz + Maïspouce", cost: "15 min de CpS" },
  { en: "Ordinary Clover", fr: "Trèfle Ordinaire", mature: 20, window: 38, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% fréquence cookies dorés", mutation: "Blé + Gildmillet", cost: "25 min de CpS" },
  { en: "Shimmerlily", fr: "Lys Irisé", mature: 9, window: 4, modif: false, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% gains / fréquence / drops cookies dorés", mutation: "Trèfle + Gildmillet", cost: "60 min de CpS" },
  { en: "Elderwort", fr: "Odeurweiss", mature: 156, window: -1, modif: true, marker: "", group: 1, checked: true, fungus: false,
    effect: "+1% gains/fréquence wrath, +1% CpS mamies ; vieillit l'entourage de 3%", mutation: "Lys Irisé + Mégèriz", cost: "180 min de CpS" },
  { en: "Ichorpuff", fr: "Vesse d'Ichor", mature: 20, window: 38, modif: false, marker: "²", group: 1, checked: true, fungus: true,
    effect: "L'entourage vieillit 2× moins vite, mais 50% moins efficace", mutation: "Odeurweiss + Sporemiette", cost: "120 min de CpS" },
  { en: "Golden Clover", fr: "Trèfle Doré", mature: 5, window: 5, modif: true, marker: "", group: 1, checked: false, fungus: false,
    effect: "+3% fréquence cookies dorés", mutation: "Blé + Gildmillet (très rare) ou 4× Trèfle", cost: "125 min de CpS" },

  // ---------- GROUPE 2 ----------
  { en: "Meddleweed", fr: "Indiscrerbe", mature: 4, window: 4, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "Aucun effet ; peut envahir les plantes voisines", mutation: "Apparaît sur les cases vides", cost: "1 min de CpS" },
  { en: "Brown Mold", fr: "Moisissure Brune", mature: 5, window: 3, modif: false, marker: "¹", group: 2, checked: true, fungus: true,
    effect: "-1% CpS ; peut se répandre en mildou blanc", mutation: "Mildou blanc + Moisissure brune", cost: "20 min de CpS" },
  { en: "Crumbspore", fr: "Sporemiette", mature: 14, window: 9, modif: false, marker: "²", group: 2, checked: true, fungus: true,
    effect: "Explose en jusqu'à 1 min de CpS ; peut envahir", mutation: "Apparaît seule / 2× Champipâte", cost: "10 min de CpS" },
  { en: "White Mildew", fr: "Mildou Blanc", mature: 5, window: 3, modif: false, marker: "³", group: 2, checked: true, fungus: true,
    effect: "+1% CpS ; peut se répandre en moisissure brune", mutation: "Moisissure brune + mildou", cost: "20 min de CpS" },
  { en: "Chocoroot", fr: "Chocoracine", mature: 6, window: 19, modif: false, marker: "¹", group: 2, checked: true, fungus: false,
    effect: "+1% CpS ; récolte → +3 min ; croissance prévisible", mutation: "Blé + Moisissure brune", cost: "15 min de CpS" },
  { en: "Queenbeet", fr: "Bettereine", mature: 64, window: 20, modif: true, marker: "", group: 2, checked: true, fungus: false,
    effect: "+0,3% durée dorés, -2% CpS ; récolte → +1 h de CpS", mutation: "Pâtisetille + Chocoracine", cost: "90 min de CpS" },
  { en: "White Chocoroot", fr: "Chocoracine Blanche", mature: 6, window: 19, modif: false, marker: "W", group: 2, checked: true, fungus: false,
    effect: "+1% gains dorés ; récolte → +3 min", mutation: "Chocoracine + Mildou blanc", cost: "15 min de CpS" },
  { en: "Wrinklegill", fr: "Ridegibier", mature: 25, window: 15, modif: false, marker: "²", group: 2, checked: true, fungus: true,
    effect: "Les wrinklers apparaissent 2% plus vite, digèrent 1% de plus", mutation: "Sporemiette + Moisissure brune", cost: "20 min de CpS" },
  { en: "Tidygrass", fr: "Proprerbe", mature: 76, window: 124, modif: true, marker: "", group: 2, checked: true, fungus: false,
    effect: "La zone 5×5 ne développe ni mauvaise herbe ni champignon", mutation: "Blé + Chocoracine blanche", cost: "90 min de CpS" },
  { en: "Glovemorel", fr: "Gantomorille", mature: 7, window: 2, modif: false, marker: "²", group: 2, checked: true, fungus: true,
    effect: "+4% clics, +1% CpS curseurs, -1% CpS", mutation: "Sporemiette + Maïspouce", cost: "30 min de CpS" },
  { en: "Cheapcap", fr: "Capacher", mature: 3, window: 5, modif: false, marker: "", group: 2, checked: true, fungus: true,
    effect: "Bâtiments 0,2% moins chers", mutation: "Sporemiette + Lys Irisé", cost: "40 min de CpS" },
  { en: "Doughshroom", fr: "Champipâte", mature: 41, window: 9, modif: false, marker: "²", group: 2, checked: true, fungus: true,
    effect: "Explose en jusqu'à 5 min de CpS ; peut envahir", mutation: "2× Sporemiette", cost: "100 min de CpS" },
  { en: "Green Rot", fr: "Vertiture", mature: 4, window: 2, modif: false, marker: "³", group: 2, checked: true, fungus: true,
    effect: "+0,5% durée dorés, +1% fréquence, +1% drops", mutation: "Mildou blanc + Trèfle", cost: "60 min de CpS" },
  { en: "Keenmoss", fr: "Poussemousse", mature: 10, window: 6, modif: false, marker: "¹", group: 2, checked: true, fungus: false,
    effect: "+3% drops aléatoires", mutation: "Vertiture + Moisissure brune", cost: "50 min de CpS" },
  { en: "Wardlichen", fr: "Gardelichen", mature: 9, window: 6, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "-2% cookies wrath, wrinklers 15% plus lents", mutation: "Mégèriz + Poussemousse", cost: "10 min de CpS" },
  { en: "Drowsyfern", fr: "Ronflegère", mature: 285, window: 715, modif: true, marker: "", group: 2, checked: false, fungus: false,
    effect: "+3% CpS, -5% clics, -10% fréquence dorés", mutation: "Chocoracine + Poussemousse", cost: "90 min de CpS" },
  { en: "Fool's Bolete", fr: "Bolet Sleula", mature: 3, window: 6, modif: false, marker: "", group: 2, checked: true, fungus: true,
    effect: "+2% fréquence dorés, -5% gains, -2% durée", mutation: "Champipâte + Vertiture", cost: "15 min de CpS" },
  { en: "Whiskerbloom", fr: "Moustafleur", mature: 19, window: 15, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "+0,2% des effets du lait", mutation: "Lys Irisé + Chocoracine blanche", cost: "20 min de CpS" },
  { en: "Nursetulip", fr: "Nutrilipe", mature: 38, window: 29, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "Entourage 20% plus efficace, -2% CpS", mutation: "2× Moustafleur", cost: "40 min de CpS" },
  { en: "Chimerose", fr: "Tinterose", mature: 17, window: 41, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "+1% gains / fréquence rennes", mutation: "Lys Irisé + Moustafleur", cost: "15 min de CpS" },
  { en: "Duketater", fr: "Ducdeterre", mature: 201, window: 22, modif: true, marker: "", group: 2, checked: false, fungus: false,
    effect: "Récolte → +2 h de CpS", mutation: "2× Bettereine", cost: "480 min de CpS" },
  { en: "Shriekbulb", fr: "Burburleur", mature: 17, window: 12, modif: false, marker: "", group: 2, checked: true, fungus: false,
    effect: "-2% CpS, entourage 5% moins efficace", mutation: "Ducdeterre / Champipâte / Odeurweiss", cost: "60 min de CpS" },
  { en: "Juicy Queenbeet", fr: "Bettereine Juteuse", mature: 1010, window: 240, modif: true, marker: "J", group: 2, checked: false, fungus: false,
    effect: "-10% CpS, entourage 20% moins efficace ; récolte → +1 sucre", mutation: "8× Bettereine autour", cost: "Ne se plante pas" },
  { en: "Everdaisy", fr: "Toujoursguerite", mature: 238, window: -1, modif: true, marker: "", group: 2, checked: false, fungus: false,
    effect: "Zone 3×3 sans mauvaise herbe ; immortelle", mutation: "3× Proprerbe + 3× Odeurweiss", cost: "180 min de CpS" },
];

// ---------------------------------------------------------------------------
// ARBRE DES MUTATIONS (façon "Bacrima")
// Chaque entrée = une recette : 2 (ou plus) parents -> un enfant, avec une
// probabilité par tick. Structuré pour dessiner le diagramme connecté.
//
//   child   : nom EN de la plante obtenue
//   parents : liste { en, qty } des plantes parentes (qty = nombre de cases requises)
//   chance  : probabilité de mutation par tick (telle que sur la feuille)
//   note    : condition spéciale éventuelle
//   row     : ligne logique du diagramme (pour grouper les chaînes)
//
// Les "parents" spéciaux (case vide, vieillissement…) sont notés avec special:true.
// ---------------------------------------------------------------------------
const MUTATIONS = [
  // ===== Chaîne principale (haut) : Blé -> ... -> Ichorpuff =====
  { child: "Thumbcorn",       row: 0, chance: 0.05,
    parents: [{ en: "Baker's Wheat" }, { en: "Baker's Wheat" }] },
  // Pâtisetille : mêmes parents que Maïspouce (2× Blé), affichée juste en dessous
  { child: "Bakeberry",       row: 0, chance: 0.001,
    parents: [{ en: "Baker's Wheat" }, { en: "Baker's Wheat" }] },
  { child: "Cronerice",       row: 0, chance: 0.01,
    parents: [{ en: "Baker's Wheat" }, { en: "Thumbcorn" }] },
  { child: "Gildmillet",      row: 0, chance: 0.03,
    parents: [{ en: "Thumbcorn" }, { en: "Cronerice" }] },
  { child: "Ordinary Clover", row: 0, chance: 0.03,
    parents: [{ en: "Baker's Wheat" }, { en: "Gildmillet" }] },
  // Trèfle doré : juste après le Trèfle Ordinaire (même parents)
  { child: "Golden Clover",   row: 0, chance: 0.0007,
    parents: [{ en: "Baker's Wheat" }, { en: "Gildmillet" }],
    note: "ou 4× Trèfle Ordinaire" },
  { child: "Shimmerlily",     row: 0, chance: 0.02,
    parents: [{ en: "Ordinary Clover" }, { en: "Gildmillet" }] },
  { child: "Elderwort",       row: 0, chance: 0.01,
    parents: [{ en: "Shimmerlily" }, { en: "Cronerice" }] },
  { child: "Ichorpuff",       row: 0, chance: 0.002,
    parents: [{ en: "Crumbspore" }, { en: "Elderwort" }] },

  // ===== Wardlichen =====
  { child: "Wardlichen",      row: 1, chance: 0.005,
    parents: [{ en: "Keenmoss" }, { en: "Cronerice" }] },

  // ===== Moisissures / mousses =====
  { child: "Green Rot",       row: 2, chance: 0.05,
    parents: [{ en: "Ordinary Clover" }, { en: "White Mildew" }] },
  { child: "Keenmoss",        row: 2, chance: 0.1,
    parents: [{ en: "Green Rot" }, { en: "Brown Mold" }] },
  { child: "Drowsyfern",      row: 2, chance: 0.005,
    parents: [{ en: "Keenmoss" }, { en: "Chocoroot" }] },

  // ===== Champignons divers =====
  { child: "Glovemorel",      row: 3, chance: 0.02,
    parents: [{ en: "Crumbspore" }, { en: "Thumbcorn" }] },
  { child: "Cheapcap",        row: 3, chance: 0.04,
    parents: [{ en: "Crumbspore" }, { en: "Shimmerlily" }] },

  { child: "Wrinklegill",     row: 4, chance: 0.06,
    parents: [{ en: "Brown Mold" }, { en: "Crumbspore" }] },
  { child: "Tidygrass",       row: 4, chance: 0.002,
    parents: [{ en: "White Chocoroot" }, { en: "Baker's Wheat" }] },
  { child: "Everdaisy",       row: 4, chance: 0.002,
    parents: [{ en: "Tidygrass", qty: 3 }, { en: "Elderwort", qty: 3 }] },

  // ===== Meddleweed (apparaît sur cases vides) =====
  { child: "Meddleweed",      row: 5, chance: 0.002, special: true,
    parents: [{ en: "Cases vides autour", special: true }],
    note: "Apparaît quand toutes les cases autour sont vides" },

  // -- branche "When harvest, age/1000" depuis Meddleweed -> Crumbspore --
  { child: "Crumbspore",      row: 5, chance: null,
    parents: [{ en: "Meddleweed" }],
    note: "À la récolte de Meddleweed : âge/1000" },
  { child: "Doughshroom",     row: 5, chance: 0.005,
    parents: [{ en: "Crumbspore" }, { en: "Crumbspore" }] },
  { child: "Fool's Bolete",   row: 5, chance: 0.04,
    parents: [{ en: "Doughshroom" }, { en: "Green Rot" }] },

  // ===== Chaîne moisissure brune -> Whiskerbloom -> Nursetulip =====
  { child: "Brown Mold",      row: 6, chance: null,
    parents: [{ en: "Meddleweed" }],
    note: "À la récolte de Meddleweed : âge/1000" },
  { child: "Chocoroot",       row: 6, chance: 0.1,
    parents: [{ en: "Brown Mold" }, { en: "Baker's Wheat" }] },
  { child: "White Chocoroot", row: 6, chance: 0.1,
    parents: [{ en: "Chocoroot" }, { en: "White Mildew" }] },
  { child: "Whiskerbloom",    row: 6, chance: 0.01,
    parents: [{ en: "White Chocoroot" }, { en: "Shimmerlily" }] },
  { child: "Nursetulip",      row: 6, chance: 0.05,
    parents: [{ en: "Whiskerbloom", qty: 2 }] },

  // ===== Mildou blanc =====
  { child: "White Mildew",    row: 7, chance: 0.5,
    parents: [{ en: "Brown Mold" }] },

  // ===== Chimerose =====
  { child: "Chimerose",       row: 8, chance: 0.05,
    parents: [{ en: "Whiskerbloom" }, { en: "Shimmerlily" }] },

  // ===== Chaîne Queenbeet -> Duketater -> Shriekbulb (Bakeberry déplacée en haut) =====
  { child: "Queenbeet",       row: 9, chance: 0.01,
    parents: [{ en: "Bakeberry" }, { en: "Chocoroot" }] },
  { child: "Duketater",       row: 9, chance: 0.001,
    parents: [{ en: "Queenbeet", qty: 2 }] },
  { child: "Shriekbulb",      row: 9, chance: 0.005,
    parents: [{ en: "Duketater", qty: 3 }] },

  // ===== Bettereine juteuse (8× Bettereine autour) =====
  { child: "Juicy Queenbeet", row: 10, chance: 0.001,
    parents: [{ en: "Queenbeet", qty: 8 }],
    note: "8× Bettereine autour d'une case mûre" },
];
