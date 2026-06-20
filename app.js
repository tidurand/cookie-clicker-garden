// Logique d'affichage du jardin
const STORAGE_KEY = "cc-garden-checked";

// --- état des cases (sauvegardé localement) ---
function loadChecked() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") return saved;
  } catch (_) {}
  // par défaut : valeurs "checked" de data.js
  const init = {};
  PLANTS.forEach(p => { init[p.en] = !!p.checked; });
  return init;
}
function saveChecked(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let checkedState = loadChecked();
let currentFilter = "all";
let currentSort = "default";
let currentSearch = "";

// --- rendu ---
function maturePill(p) {
  return `<span class="stat" title="Ticks avant maturation">🌱 ${p.mature}/tick</span>`;
}
function windowPill(p) {
  if (p.window === -1) {
    return `<span class="stat immortal" title="Ne meurt jamais">♾️ immortelle${p.modif ? " +" : ""}</span>`;
  }
  return `<span class="stat window" title="Ticks de vie après maturité avant disparition">+${p.window}${p.modif ? "+" : ""}</span>`;
}

function cardHTML(p) {
  const checked = checkedState[p.en];
  const marker = p.marker ? `<span class="marker">${p.marker}</span>` : "";
  return `
    <div class="card ${checked ? "" : "locked"}" data-en="${p.en}">
      <div class="card-head">
        <input type="checkbox" ${checked ? "checked" : ""} aria-label="Débloquée">
        <div class="names">
          <div class="name-en">${marker}${p.en}</div>
          <div class="name-fr">${p.fr}</div>
        </div>
      </div>
      <div class="stats">${maturePill(p)} ${windowPill(p)}</div>
      <p class="detail"><b>Effet :</b> ${p.effect}</p>
      <p class="detail"><b>Mutation :</b> ${p.mutation}</p>
      <p class="detail"><b>Coût :</b> ${p.cost}</p>
    </div>`;
}

function matchesFilter(p) {
  if (currentFilter === "unlocked") return checkedState[p.en];
  if (currentFilter === "locked") return !checkedState[p.en];
  return true;
}
function matchesSearch(p) {
  if (!currentSearch) return true;
  const q = currentSearch.toLowerCase();
  return [p.en, p.fr, p.effect, p.mutation].some(s => s.toLowerCase().includes(q));
}

function sortPlants(list) {
  const arr = [...list];
  switch (currentSort) {
    case "name-fr": return arr.sort((a, b) => a.fr.localeCompare(b.fr, "fr"));
    case "name-en": return arr.sort((a, b) => a.en.localeCompare(b.en, "en"));
    case "mature-asc": return arr.sort((a, b) => a.mature - b.mature);
    case "mature-desc": return arr.sort((a, b) => b.mature - a.mature);
    default: return arr;
  }
}

function render() {
  const garden = document.getElementById("garden");
  const visible = PLANTS.filter(p => matchesFilter(p) && matchesSearch(p));

  if (!visible.length) {
    garden.innerHTML = `<p class="empty">Aucune plante ne correspond. 🥀</p>`;
    updateProgress();
    return;
  }

  let html = "";
  if (currentSort === "default") {
    // afficher les 2 groupes
    [1, 2].forEach(g => {
      const inGroup = sortPlants(visible.filter(p => p.group === g));
      if (!inGroup.length) return;
      html += `<h2 class="group-title">${g === 1 ? "🌟 Plantes prioritaires" : "🍄 Autres plantes"}</h2>`;
      html += `<div class="grid">${inGroup.map(cardHTML).join("")}</div>`;
    });
  } else {
    html += `<div class="grid">${sortPlants(visible).map(cardHTML).join("")}</div>`;
  }
  garden.innerHTML = html;

  // brancher les cases à cocher
  garden.querySelectorAll(".card input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", e => {
      const en = e.target.closest(".card").dataset.en;
      checkedState[en] = e.target.checked;
      saveChecked(checkedState);
      e.target.closest(".card").classList.toggle("locked", !e.target.checked);
      updateProgress();
    });
  });
  updateProgress();
}

function updateProgress() {
  const total = PLANTS.length;
  const done = PLANTS.filter(p => checkedState[p.en]).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent = `${done} / ${total} débloquées (${pct}%)`;
}

// --- événements UI ---
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
document.getElementById("sort").addEventListener("change", e => {
  currentSort = e.target.value;
  render();
});
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Réinitialiser toutes les cases aux valeurs de départ ?")) return;
  checkedState = {};
  PLANTS.forEach(p => { checkedState[p.en] = !!p.checked; });
  saveChecked(checkedState);
  render();
});

render();
