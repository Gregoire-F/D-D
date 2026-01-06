const BASE_URL = "https://www.dnd5eapi.co";
let globalItems = [];

// Récupération des éléments du DOM
const searchInput = document.getElementById("monsterInput");
const searchBtn = document.getElementById("searchButton");
const select = document.getElementById("monsterSelect");
const dropdownWrapper = document.getElementById("dropdownWrapper");
const resultArea = document.getElementById("resultArea");

// 1. Chargement des données au démarrage
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

// 2. Logique de recherche
searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") performSearch();
});

function performSearch() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return;

  // Filtrer
  const matches = globalItems.filter((item) =>
    item.name.toLowerCase().includes(query)
  );

  // Reset UI
  resultArea.innerHTML = "";
  select.innerHTML = '<option value="">-- Choisir un item --</option>';

  if (matches.length === 0) {
    resultArea.innerHTML = "<p>Aucun item trouvé.</p>";
    dropdownWrapper.style.display = "none";
  } else if (matches.length === 1) {
    // Un seul résultat : on affiche direct
    dropdownWrapper.style.display = "none";
    fetchAndRenderItem(matches[0].url);
  } else {
    // Plusieurs résultats : on remplit le select
    dropdownWrapper.style.display = "block";
    matches.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.url;
      opt.textContent = item.name;
      select.appendChild(opt);
    });
  }
}

// 3. Changement dans le dropdown
select.addEventListener("change", () => {
  if (select.value) {
    fetchAndRenderItem(select.value);
  }
});

// 4. Fetch et Affichage de la Carte
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

// 5. Création du HTML selon le CSS "Monster"
function renderCard(item) {
  // Extraction des données pour adapter au CSS
  const type = item.equipment_category ? item.equipment_category.name : "Objet";
  const cost = item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "-";
  const weight = item.weight ? `${item.weight} lb` : "-";

  // Logique pour la 3ème stat (AC ou Dégâts)
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

  // Construction HTML
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

  // Ajout de la description
  if (item.desc && item.desc.length > 0) {
    item.desc.forEach((line) => {
      html += `<li>${line}</li>`;
    });
  } else {
    html += `<li>Pas de description détaillée disponible.</li>`;
  }

  // Ajout des propriétés spéciales (avec tooltip du CSS si possible)
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

  html += `   </ul>
                    </div>
                </div>`;

  resultArea.innerHTML = html;
}
