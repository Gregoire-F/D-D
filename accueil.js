/**
 * URL de base de l'API D&D 5e
 */
const API_BASE_URL = "https://www.dnd5eapi.co/api";

/**
 * Sélection des éléments du DOM
 */
const btnMonsters = document.getElementById("btn-monsters");
const btnSpells = document.getElementById("btn-spells");
const btnItems = document.getElementById("btn-items");
const resultsSection = document.getElementById("results-section");
const resultsContainer = document.getElementById("results-container");
const resultsTitle = document.getElementById("results-title");
const detailContainer = document.getElementById("detail-container");
const backBtn = document.getElementById("back-to-categories");
const categoriesDiv = document.querySelector(".categories");

// --- Gestionnaires d'événements (Event Listeners) ---

// Clic sur les cartes de catégories
btnMonsters.addEventListener("click", () =>
  fetchCategory("monsters", "Monstres")
);
btnSpells.addEventListener("click", () => fetchCategory("spells", "Sorts"));
btnItems.addEventListener("click", () => fetchCategory("equipment", "Items"));

// Bouton retour : masque la section résultats et réaffiche les catégories
backBtn.addEventListener("click", () => {
  resultsSection.classList.remove("active");
  categoriesDiv.style.display = "grid";
  detailContainer.innerHTML = "";
});

// --- Fonctions Principales ---

/**
 * Récupère la liste des éléments pour une catégorie donnée
 * @param {string} endpoint - Le point d'entrée de l'API (ex: 'monsters')
 * @param {string} title - Le titre à afficher pour la section
 */
async function fetchCategory(endpoint, title) {
  // Masquage de l'accueil et affichage de la zone de résultats
  categoriesDiv.style.display = "none";
  resultsSection.classList.add("active");
  resultsTitle.textContent = `Chargement des ${title}...`;
  resultsContainer.innerHTML = "";
  detailContainer.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    const data = await response.json();

    resultsTitle.textContent = title;
    renderList(data.results, endpoint);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    resultsTitle.textContent = "Erreur lors du chargement";
  }
}

/**
 * Affiche la liste des éléments sous forme de boutons cliquables
 * @param {Array} items - La liste des éléments renvoyée par l'API
 * @param {string} endpoint - La catégorie actuelle
 */
function renderList(items, endpoint) {
  resultsContainer.innerHTML = "";
  resultsContainer.style.display = "grid"; // Assure que la grille est visible

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.textContent = item.name;
    // Au clic, on récupère les détails spécifiques de l'élément
    div.addEventListener("click", () => fetchDetails(item.url, endpoint));
    resultsContainer.appendChild(div);
  });
}

/**
 * Récupère les détails d'un élément spécifique via son URL
 * @param {string} url - L'URL relative fournie par l'API
 * @param {string} category - La catégorie de l'élément (pour adapter l'affichage)
 */
async function fetchDetails(url, category) {
  detailContainer.innerHTML = "<p>Chargement des détails...</p>";
  resultsContainer.style.display = "none"; // Masque la liste pour montrer les détails

  try {
    const response = await fetch(`https://www.dnd5eapi.co${url}`);
    const data = await response.json();
    renderDetails(data, category);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error);
    detailContainer.innerHTML = "<p>Erreur lors du chargement des détails.</p>";
  }
}

/**
 * Construit et affiche le HTML des détails selon la catégorie
 * @param {Object} data - Les données complètes de l'élément
 * @param {string} category - La catégorie (monsters, spells, equipment)
 */
function renderDetails(data, category) {
  let html = `<div class="detail-view">
    <span class="close-detail" onclick="closeDetails()">&times;</span>
    <h2>${data.name}</h2>`;

  // Affichage spécifique pour les MONSTRES
  if (category === "monsters") {
    html += `
      <p><em>${data.size} ${data.type}, ${data.alignment}</em></p>
      <div class="stats">
        <p><strong>AC (Armure):</strong> ${data.armor_class[0].value}</p>
        <p><strong>HP (Vie):</strong> ${data.hit_points} (${data.hit_dice})</p>
      </div>
      <div class="abilities">
        <p>FOR: ${data.strength} | DEX: ${data.dexterity} | CON: ${data.constitution}</p>
        <p>INT: ${data.intelligence} | SAG: ${data.wisdom} | CHA: ${data.charisma}</p>
      </div>`;
  }
  // Affichage spécifique pour les SORTS
  else if (category === "spells") {
    html += `
      <p><em>Niveau ${data.level} - ${data.school.name}</em></p>
      <p><strong>Temps d'incantation:</strong> ${data.casting_time}</p>
      <p><strong>Portée:</strong> ${data.range}</p>
      <p><strong>Composantes:</strong> ${data.components.join(", ")}</p>
      <p><strong>Durée:</strong> ${data.duration}</p>
      <div class="description">${data.desc.join("<br><br>")}</div>`;
  }
  // Affichage spécifique pour les ITEMS (Équipement)
  else {
    html += `
      <p><em>${data.equipment_category.name}</em></p>
      ${
        data.cost
          ? `<p><strong>Coût:</strong> ${data.cost.quantity} ${data.cost.unit}</p>`
          : ""
      }
      ${data.weight ? `<p><strong>Poids:</strong> ${data.weight} lb</p>` : ""}
      <div class="description">${
        data.desc
          ? data.desc.join("<br>")
          : "Pas de description supplémentaire."
      }</div>`;
  }

  html += `</div>`;
  detailContainer.innerHTML = html;
}

/**
 * Ferme la vue détaillée et revient à la liste des résultats
 */
function closeDetails() {
  detailContainer.innerHTML = "";
  resultsContainer.style.display = "grid";
}
