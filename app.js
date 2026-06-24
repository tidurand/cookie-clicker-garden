// Diagramme de l'arbre des mutations du jardin de Cookie Clicker
const STORAGE_KEY = "cc-garden-checked";
const TIMER_KEY = "cc-garden-timer-start";
const BEST_KEY = "cc-garden-best-times";

// index rapide nom EN -> plante
const BY_EN = {};
PLANTS.forEach(p => { BY_EN[p.en] = p; });

// fusionne les données de vieillissement (AT = âge/tick, MA = âge à maturité ; mort à 100)
if (typeof AGING !== "undefined") {
  PLANTS.forEach(p => { const a = AGING[p.en]; if (a) { p.at = a.at; p.ma = a.ma; } });
}

// index : plante -> liste des enfants qu'elle permet d'obtenir (en tant que parent)
// un parent dupliqué dans une même recette (ex. 2× Blé) n'est compté qu'une fois
const PARENT_OF = {};
MUTATIONS.forEach(m => {
  const seen = new Set();
  m.parents.forEach(p => {
    if (p.special || seen.has(p.en)) return;
    seen.add(p.en);
    (PARENT_OF[p.en] = PARENT_OF[p.en] || []).push(m.child);
  });
});
// nombre de mutations encore obtenables grâce à cette plante (enfant pas encore débloqué)
function remainingMutations(en) {
  return (PARENT_OF[en] || []).filter(child => !isUnlocked(child)).length;
}
// recettes où cette plante est un parent
function mutationsAsParent(en) {
  return MUTATIONS.filter(m => m.parents.some(p => !p.special && p.en === en));
}

// --- ordre topologique : un enfant n'apparaît qu'une fois tous ses parents
//     déjà obtenus (dans l'ordre où tu peux réellement les débloquer) ---
function topoSortMutations() {
  const produced = new Set(MUTATIONS.map(m => m.child));
  // parents jamais produits = plantes de départ (racines, déjà disponibles)
  const available = new Set();
  MUTATIONS.forEach(m => m.parents.forEach(p => {
    if (!p.special && !produced.has(p.en)) available.add(p.en);
  }));

  const ordered = [];
  const remaining = [...MUTATIONS];
  let guard = 0;
  while (remaining.length && guard++ < 500) {
    const i = remaining.findIndex(m =>
      m.parents.every(p => p.special || available.has(p.en)));
    if (i < 0) { ordered.push(...remaining); break; } // cycle éventuel : on garde l'ordre source
    const m = remaining.splice(i, 1)[0];
    ordered.push(m);
    available.add(m.child);
  }
  return ordered;
}
const MUTATIONS_ORDERED = topoSortMutations();

// --- état des cases (sauvegardé localement) ---
// 0 = pas sur le jardin · 1 = sur le jardin (pas débloquée) · 2 = débloquée
function loadChecked() {
  const init = {};
  PLANTS.forEach(p => { init[p.en] = p.checked ? 2 : 0; });
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      Object.keys(saved).forEach(en => {
        const v = saved[en];
        // migration : ancien format booléen -> 0/2
        init[en] = v === true ? 2 : v === false ? 0 : (Number(v) || 0);
      });
    }
  } catch (_) {}
  return init;
}
function saveChecked(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let checkedState = loadChecked();
let currentFilter = "all";
let currentSearch = "";

// multiplicateur de croissance (dragon + sol + voisins) appliqué au gain d'âge par tick
const GROWTH_KEY = "cc-garden-growth-mult";
let growthMult = parseFloat(localStorage.getItem(GROWTH_KEY)) || 1;

// helpers d'état
function stateOf(en) { return checkedState[en] || 0; }
function isUnlocked(en) { return stateOf(en) === 2; }

// --- helpers de rendu ---
function plantName(en) {
  const p = BY_EN[en];
  return p ? `${p.en} / ${p.fr}` : en;
}

// nom EN -> fichier image local (img/<slug>.png)
function plantImg(en) {
  const slug = en.toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `img/${slug}.png`;
}

// ticks de maturation / de vie après maturité
function atRange(at) {
  if (at == null) return null;
  const parts = String(at).split("-").map(Number);
  const min = parts[0];
  const max = parts.length > 1 ? parts[1] : parts[0];
  return { min, max, avg: (min + max) / 2 };
}
function fmtNum(n) {
  return Number(n.toFixed(2)).toString().replace(".", ",");
}
// Mécanique réelle (code du jeu) : âge += randomFloor((ageTick + ageTickR*rand) * mult).
// "mult" = plotBoost × dragonBoost (dragon + sol + voisins). Le gain par tick est ENTIER ;
// en save/reload on force le gain max = ceil(AT_max * mult).
// "ticks effacés par tick forcé" = gain_max / gain_moyen − 1.
function saveScumGain(p) {
  const r = atRange(p.at);
  if (!r || r.avg === 0) return null;
  const avg = r.avg * growthMult;            // gain d'âge moyen par tick
  const maxGain = Math.ceil(r.max * growthMult); // gain entier max possible (rare)
  if (avg <= 0) return null;
  // baisse du compteur "mûr dans X ticks" pour chaque +1 d'âge (le cas régulier)
  const erasedPerTick = 1 / avg;
  return { maxGain, avg, erasedPerTick };
}

function statsHTML(p) {
  const kind = p.fungus ? "🍄" : "🌱";
  const kindTitle = p.fungus ? "Champignon" : "Plante";
  const ageInfo = p.ma ? ` · âge à maturité MA ${p.ma} (mort à 100) · gain d'âge/tick AT ${p.at}` : "";
  const mature = `<span class="tick mature" title="${kindTitle} — ${p.mature} ticks avant maturation${ageInfo}">${kind} ${p.mature}</span>`;
  const life = p.window === -1
    ? `<span class="tick immortal" title="Ne meurt jamais">♾️</span>`
    : `<span class="tick life" title="Disparaît ${p.window} ticks après maturité">💀 ${p.window}</span>`;
  const ss = saveScumGain(p);
  const ssBadge = ss ? `<span class="modif-val"> ~${fmtNum(ss.erasedPerTick)} t/tick</span>` : "";
  // 🔄 affiché si le save/reload fait baisser le compteur d'au moins 2 par tick forcé
  // ET que la plante demande au moins 15 ticks pour mûrir
  const showScum = ss && (p.scumForce || (ss.erasedPerTick >= 2 && p.mature >= 15));
  const modif = showScum
    ? `<span class="tick modif">🔄${ssBadge}</span>` : "";
  const overtake = p.overtake
    ? `<span class="tick overtake" title="Peut envahir / submerger les plantes voisines">⚠️</span>` : "";
  return `<span class="ticks">${mature}${life}${modif}${overtake}</span>`;
}

// pastille "plante" (parent ou enfant) cliquable comme case à cocher
function nodeHTML(en, opts = {}) {
  const p = BY_EN[en];
  const qty = opts.qty && opts.qty > 1 ? `<span class="qty">${opts.qty}×</span>` : "";
  if (!p) {
    // parent spécial (cases vides, etc.)
    return `<div class="node special"><div class="node-body">
      <span class="node-names"><span class="n-en">${en}</span></span>
    </div></div>`;
  }
  const state = stateOf(en);
  const cls = state === 2 ? "unlocked" : state === 1 ? "planted" : "locked";
  const icon = state === 2 ? "✅" : state === 1 ? "🟡" : "⬜";
  const title = state === 2
    ? "Débloquée — cliquer pour retirer"
    : state === 1
      ? "Sur le jardin (pas encore débloquée) — cliquer pour marquer débloquée"
      : "Pas sur le jardin — cliquer pour la poser";
  const role = opts.role || "";
  const rem = remainingMutations(en);
  const mutCls = state === 2 ? "mc-unlocked" : state === 1 ? "mc-planted" : "mc-locked";
  const mutBadge = rem > 0
    ? `<span class="mut-count ${mutCls}" title="${rem} mutation${rem > 1 ? "s" : ""} encore obtenable${rem > 1 ? "s" : ""} — cliquer pour voir les mutations de cette plante">🧬 ${rem}</span>`
    : "";
  return `<div class="node ${cls} ${role}" data-en="${en}" tabindex="0" role="button"
            title="${title}">
    <div class="node-body">
      <span class="node-check">${icon}</span>
      ${qty}
      <img class="node-img" src="${plantImg(en)}" alt="" width="32" height="32" loading="lazy">
      <span class="node-names">
        <span class="n-fr">${p.fr}</span>
        <span class="n-en">${p.en}</span>
        ${statsHTML(p)}
      </span>
      ${mutBadge}
    </div>
  </div>`;
}

function formatPct(chance) {
  // 0.01 -> "1%", 0.0007 -> "0.07%" (sans zéros superflus)
  const pct = chance * 100;
  const str = Number(pct.toFixed(4)).toString(); // évite 0.07000000001
  return str + "%";
}

function chanceLabel(m) {
  if (m.chance === null || m.chance === undefined) {
    return `<span class="chance harvest">à la récolte</span>`;
  }
  return `<span class="chance" title="Probabilité de mutation par tick (${m.chance})">${formatPct(m.chance)}</span>`;
}

// niveau de "débloquabilité" d'une mutation (enfant pas encore obtenu) :
//   2 (vert)  = tous les parents sont DÉBLOQUÉS (✅)
//   1 (jaune) = tous les parents sont au moins SUR LE JARDIN (🟡), mais pas tous débloqués
//   0         = au moins un parent n'est pas sur le jardin (les spéciaux comptent comme ✅)
function availabilityLevel(m) {
  if (isUnlocked(m.child)) return 0;
  const states = m.parents.map(p => p.special ? 2 : stateOf(p.en));
  if (states.some(s => s < 1)) return 0;          // un parent absent du jardin
  return states.every(s => s === 2) ? 2 : 1;       // tous débloqués -> vert, sinon jaune
}

function recipeHTML(m, step) {
  const parents = m.parents
    .map(par => nodeHTML(par.en, { qty: par.qty, role: "parent" }))
    .join(`<span class="plus">+</span>`);
  const note = m.note ? `<div class="note">ℹ️ ${m.note}</div>` : "";
  const stepBadge = step
    ? `<span class="step" title="Ordre de déblocage">${step}</span>` : "";
  const lvl = availabilityLevel(m);
  const availClass = lvl === 2 ? "available" : lvl === 1 ? "available-soon" : "";
  const availBadge = lvl === 2
    ? `<span class="avail-badge" title="Les deux parents sont débloqués : tu peux planter et tenter cette mutation">🌟 Débloquable</span>`
    : lvl === 1
      ? `<span class="avail-badge soon" title="Les parents sont sur le jardin (au moins un pas encore débloqué) : la mutation peut apparaître">🟡 Sur le jardin</span>`
      : "";
  return `<div class="recipe ${availClass}" data-child="${m.child}">
    ${stepBadge}${availBadge}
    <div class="parents">${parents}</div>
    <div class="link">
      <span class="arrow">→</span>
      ${chanceLabel(m)}
    </div>
    <div class="child">${nodeHTML(m.child, { role: "child" })}</div>
    ${note}
  </div>`;
}

// --- filtres / recherche ---
function recipeMatchesSearch(m) {
  if (!currentSearch) return true;
  const q = currentSearch.toLowerCase();
  // recherche uniquement sur les noms FR et EN (enfant + parents)
  const names = [m.child, ...m.parents.map(p => p.en)];
  const haystack = names.flatMap(en => {
    const p = BY_EN[en];
    return p ? [p.en, p.fr] : [en];
  });
  return haystack.some(s => s && s.toLowerCase().includes(q));
}

function recipeMatchesFilter(m) {
  if (currentFilter === "all") return true;
  const childUnlocked = isUnlocked(m.child);
  if (currentFilter === "unlocked") return childUnlocked;
  if (currentFilter === "locked") return !childUnlocked;
  if (currentFilter === "available") return availabilityLevel(m) >= 1;
  return true;
}

// --- rendu principal ---
function render() {
  const garden = document.getElementById("garden");
  // ordre topologique : les parents apparaissent toujours avant leurs enfants
  const visible = MUTATIONS_ORDERED.filter(m => recipeMatchesFilter(m) && recipeMatchesSearch(m));

  if (!visible.length) {
    garden.innerHTML = `<p class="empty">Aucune mutation ne correspond. 🥀</p>`;
    updateProgress();
    return;
  }

  // une recette par ligne, dans l'ordre où on peut réellement les débloquer.
  // le numéro d'étape reflète la position dans l'ordre topologique complet.
  const stepOf = new Map();
  MUTATIONS_ORDERED.forEach((m, i) => stepOf.set(m, i + 1));

  const html = visible
    .map(m => `<div class="chain">${recipeHTML(m, stepOf.get(m))}</div>`)
    .join("");

  garden.innerHTML = html;
  bindNodes(garden);
  updateProgress();
}

function bindNodes(scope) {
  scope.querySelectorAll(".node[data-en]").forEach(node => {
    const toggle = () => {
      const en = node.dataset.en;
      // cycle : 0 (pas sur le jardin) -> 1 (sur le jardin) -> 2 (débloquée) -> 0
      checkedState[en] = (stateOf(en) + 1) % 3;
      saveChecked(checkedState);
      render(); // re-rendu : un parent débloqué se met à jour partout
    };
    node.addEventListener("click", toggle);
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
  // clic sur le badge 🧬 -> fenêtre des mutations (sans déclencher le cycle d'état)
  scope.querySelectorAll(".node[data-en] .mut-count").forEach(badge => {
    badge.addEventListener("click", e => {
      e.stopPropagation();
      showMutationsFor(badge.closest(".node").dataset.en);
    });
  });
}

// --- fenêtre : mutations possibles d'une plante ---
function showMutationsFor(en) {
  const p = BY_EN[en];
  const recipes = mutationsAsParent(en);
  document.getElementById("mm-title").textContent =
    `🧬 Mutations possibles avec ${p ? p.fr : en}`;
  const list = document.getElementById("mm-list");
  if (!recipes.length) {
    list.innerHTML = `<li class="mm-empty">Cette plante ne produit aucune mutation.</li>`;
  } else {
    list.innerHTML = recipes.map(m => {
      const parents = m.parents.map(par => {
        const pp = BY_EN[par.en];
        const q = par.qty && par.qty > 1 ? `${par.qty}× ` : "";
        const img = pp ? `<img class="mm-img" src="${plantImg(par.en)}" alt="" width="22" height="22" loading="lazy">` : "";
        return `${q}${img}${pp ? pp.fr : par.en}`;
      }).join(" + ");
      const child = BY_EN[m.child] ? BY_EN[m.child].fr : m.child;
      const childImg = BY_EN[m.child]
        ? `<img class="mm-img" src="${plantImg(m.child)}" alt="" width="22" height="22" loading="lazy">` : "";
      const chance = m.chance == null ? "à la récolte" : formatPct(m.chance);
      const done = isUnlocked(m.child);
      return `<li class="${done ? "mm-done" : ""}">
        <span class="mm-recipe">${parents} → ${childImg}<b>${child}</b></span>
        <span class="mm-chance">${chance}</span>
        <span class="mm-state">${done ? "✅" : "⬜"}</span>
      </li>`;
    }).join("");
  }
  document.getElementById("mutation-modal").classList.remove("hidden");
}
function hideMutationModal() {
  document.getElementById("mutation-modal").classList.add("hidden");
}

function updateProgress() {
  const total = PLANTS.length;
  const done = PLANTS.filter(p => isUnlocked(p.en)).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent = `${done} / ${total} débloquées (${pct}%)`;

  // Réinitialiser n'est cliquable que lorsque TOUTES les plantes sont trouvées
  const resetBtn = document.getElementById("reset");
  const allDone = done === total;
  resetBtn.disabled = !allDone;
  resetBtn.title = allDone
    ? "Réinitialiser les cases et enregistrer le temps"
    : `Disponible une fois toutes les plantes trouvées (${total - done} restante${total - done > 1 ? "s" : ""})`;
}

// --- chronomètre depuis la dernière réinitialisation ---
function startTimer() {
  localStorage.setItem(TIMER_KEY, Date.now().toString());
  updateTimer();
}
function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  const prefix = days > 0 ? `${days}j ` : "";
  return `${prefix}${h}:${m}:${s}`;
}
function updateTimer() {
  const el = document.getElementById("timer");
  const start = parseInt(localStorage.getItem(TIMER_KEY), 10);
  if (!start) { el.textContent = "⏱️ --:--:--"; return; }
  el.textContent = "⏱️ " + formatDuration(Date.now() - start);
}
// démarre le chrono au premier chargement s'il n'existe pas encore
if (!localStorage.getItem(TIMER_KEY)) startTimer();
setInterval(updateTimer, 1000);
updateTimer();

// --- top 3 des meilleurs temps (les plus courts) ---
// format stocké : [{ ms, date }] (ancien format = simple nombre, migré à la volée)
function loadBestTimes() {
  try {
    const arr = JSON.parse(localStorage.getItem(BEST_KEY));
    if (Array.isArray(arr)) {
      return arr
        .map(e => typeof e === "number" ? { ms: e, date: null } : e)
        .filter(e => e && typeof e.ms === "number");
    }
  } catch (_) {}
  return [];
}
function recordTime(ms) {
  if (!(ms > 0)) return; // ignore les durées nulles/invalides
  const times = [...loadBestTimes(), { ms, date: Date.now() }]
    .sort((a, b) => a.ms - b.ms)
    .slice(0, 3);
  localStorage.setItem(BEST_KEY, JSON.stringify(times));
  renderLeaderboard();
}
function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function renderLeaderboard() {
  const list = document.getElementById("lb-list");
  const times = loadBestTimes();
  if (!times.length) {
    list.innerHTML = `<li class="lb-empty">Aucun temps encore — clique sur « Réinitialiser » pour en enregistrer un.</li>`;
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  list.innerHTML = times
    .map((e, i) => `<li>
        <span class="medal">${medals[i] || ""}</span>
        <span class="lb-time">${formatDuration(e.ms)}</span>
        ${e.date ? `<span class="lb-date" title="Date du record">${formatDate(e.date)}</span>` : ""}
      </li>`)
    .join("");
}
function clearBestTimes() {
  localStorage.removeItem(BEST_KEY);
  renderLeaderboard();
}
renderLeaderboard();

// --- événements UI ---
document.getElementById("mm-close").addEventListener("click", hideMutationModal);
document.getElementById("mutation-modal").addEventListener("click", e => {
  if (e.target.id === "mutation-modal") hideMutationModal(); // clic sur le fond
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") hideMutationModal();
});
document.getElementById("lb-clear").addEventListener("click", () => {
  if (loadBestTimes().length && !confirm("Effacer tous les meilleurs temps ?")) return;
  clearBestTimes();
});
document.getElementById("search").addEventListener("input", e => {
  currentSearch = e.target.value.trim();
  render();
});
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Tout marquer comme « pas encore trouvé » ?")) return;
  // enregistre le temps du run qui se termine dans le top 3
  const start = parseInt(localStorage.getItem(TIMER_KEY), 10);
  if (start) recordTime(Date.now() - start);
  checkedState = {};
  // Baker's Wheat est la plante de départ : toujours débloquée, même en recommençant
  PLANTS.forEach(p => { checkedState[p.en] = p.en === "Baker's Wheat" ? 2 : 0; });
  saveChecked(checkedState);
  startTimer(); // relance le chronomètre à zéro
  render();
});

render();
