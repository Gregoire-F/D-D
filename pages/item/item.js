const BASE_URL = "https://www.dnd5eapi.co";

// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const itemDropdown = document.getElementById("itemDropdown");
const resultArea = document.getElementById("resultArea");

// Cache des items
let globalItems = [];

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const [eqRes, magicRes] = await Promise.all([
      fetch(`${BASE_URL}/api/equipment`),
      fetch(`${BASE_URL}/api/magic-items`),
    ]);
    const eqData = await eqRes.json();
    const magicData = await magicRes.json();

    // Fusion des listes
    globalItems = [...eqData.results, ...magicData.results];
    console.log("Inventaire chargé : " + globalItems.length);
  } catch (error) {
    console.error("Erreur API", error);
    resultArea.innerHTML = "<p>Erreur de connexion à l'API.</p>";
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query;
  if (query) {
    performSearch(query);
  }
});

itemDropdown.addEventListener("dnd-select", (e) => {
  const { value } = e.detail;
  if (value) {
    fetchAndRenderItem(value);
  }
});

// ========================================
// LOGIQUE DE RECHERCHE
// ========================================
function performSearch(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return;

  // Filtrer
  const matches = globalItems.filter((item) =>
    item.name.toLowerCase().includes(lowerQuery)
  );

  // Reset UI
  resultArea.innerHTML = "";
  itemDropdown.clear();

  if (matches.length === 0) {
    resultArea.innerHTML = "<p>Aucun item trouvé.</p>";
    itemDropdown.hide();
  } else if (matches.length === 1) {
    // Un seul résultat : on affiche direct
    itemDropdown.hide();
    fetchAndRenderItem(matches[0].url);
  } else {
    // Plusieurs résultats : on remplit le dropdown
    const options = matches.map((item) => ({
      value: item.url,
      label: item.name,
    }));
    itemDropdown.setOptions(options);
    itemDropdown.show();
  }
}

// ========================================
// FETCH ET AFFICHAGE
// ========================================
async function fetchAndRenderItem(urlSuffix) {
  resultArea.innerHTML = "<p>Chargement des détails...</p>";
  try {
    const res = await fetch(BASE_URL + urlSuffix);
    const data = await res.json();
    renderCard(data);
  } catch (e) {
    resultArea.innerHTML = "<p>Erreur lors du chargement de l'item.</p>";
  }
}

function renderCard(item) {
  const type = item.equipment_category ? item.equipment_category.name : "Objet";
  const cost = item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "-";
  const weight = item.weight ? `${item.weight} lb` : "-";

  // Logique pour la 3ème stat
  let stat3Label = "Info";
  let stat3Value = "-";

  if (item.armor_class) {
    stat3Label = "AC";
    stat3Value =
      item.armor_class.base + (item.armor_class.dex_bonus ? " + Dex" : "");
  } else if (item.damage) {
    stat3Label = "Dégâts";
    stat3Value = `${item.damage.damage_dice} ${item.damage.damage_type.name}`;
  } else if (item.rarity) {
    stat3Label = "Rareté";
    stat3Value = item.rarity.name;
  }

  let html = `
    <div class="monster-card">
      <div class="monster-header">
        <h2>${item.name}</h2>
        <p>${type}</p>
      </div>

      <div class="monster-stats-top">
        <p><strong>Catégorie :</strong> ${type}</p>
      </div>

      <div class="ability-scores">
        <div class="ability">
          <strong>Coût</strong>
          <span>${cost}</span>
        </div>
        <div class="ability">
          <strong>Poids</strong>
          <span>${weight}</span>
        </div>
        <div class="ability">
          <strong>${stat3Label}</strong>
          <span>${stat3Value}</span>
        </div>
      </div>

      <div class="monster-actions">
        <h3>Description & Propriétés</h3>
        <ul>`;

  if (item.desc && item.desc.length > 0) {
    item.desc.forEach((line) => {
      html += `<li>${line}</li>`;
    });
  } else {
    html += `<li>Pas de description détaillée disponible.</li>`;
  }

  if (item.properties && item.properties.length > 0) {
    html += `<li><strong>Propriétés: </strong>`;
    html += item.properties
      .map(
        (p) =>
          `<span class="tooltip" data-tooltip="Propriété de l'arme">${p.name}</span>`
      )
      .join(", ");
    html += `</li>`;
  }

  html += `</ul></div></div>`;

  resultArea.innerHTML = html;
}
