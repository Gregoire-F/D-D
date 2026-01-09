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

  // --- LOGIQUE IMAGE (AJOUTÉ) ---
  // Construction du nom de fichier : "Dagger" -> "dagger.webp"
  const imageName = item.name.trim().toLowerCase().replace(/\s+/g, '_') + '.webp';
  // Chemin vers le dossier images depuis pages/item/
  const imagePath = `../../assets/images/equipment/${imageName}`;

  // Logique pour la 3ème stat
  let stat3Label = "Info";
  let stat3Value = "-";
  let stat3Tooltip = "";

  if (item.armor_class) {
    stat3Label = "AC";
    stat3Value =
      item.armor_class.base + (item.armor_class.dex_bonus ? " + Dex" : "");
    stat3Tooltip = "Classe d'armure - Protection fournie";
  } else if (item.damage) {
    stat3Label = "Dégâts";
    stat3Value = `${item.damage.damage_dice} ${item.damage.damage_type.name}`;
    stat3Tooltip = "Dégâts infligés par l'arme";
  } else if (item.rarity) {
    stat3Label = "Rareté";
    stat3Value = item.rarity.name;
    stat3Tooltip = "Niveau de rareté de l'objet magique";
  }


  let html = `
    <div class="monster-card">
      <div class="monster-header">
        <h2>${item.name}</h2>
        <p>${type}</p>
      </div>

      <div style="text-align:center; margin-bottom: 20px;">
          <img src="${imagePath}" 
               alt="${item.name}"
               style="max-width:250px; max-height:250px; border-radius:8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
               onerror="this.style.display='none';">
      </div>

      <div class="monster-stats-top">
        <p><strong>Catégorie :</strong> ${type}</p>
      </div>

      <dnd-stat-grid id="itemStats"></dnd-stat-grid>

      <div class="monster-actions">
        <h3>Description & Propriétés</h3>
        <ul>`;

  if (item.desc && item.desc.length > 0) {
    item.desc.forEach((line) => {
      html += `<li>${DndMarkdown.parse(line)}</li>`;
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

  // Peupler le composant stat-grid avec les stats de l'item
  const statGrid = resultArea.querySelector("#itemStats");
  statGrid.stats = [
    {
      label: "Coût",
      value: cost,
      tooltip: "Prix de l'objet en pièces",
    },
    {
      label: "Poids",
      value: weight,
      tooltip: "Poids de l'objet en livres",
    },
    {
      label: stat3Label,
      value: stat3Value,
      tooltip: stat3Tooltip || "Information supplémentaire",
    },
  ];
}