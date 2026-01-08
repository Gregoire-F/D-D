// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const subclassDropdown = document.getElementById("subclassDropdown");
const subclassResult = document.getElementById("subclassResult");

// Cache des sous-classes
let allSubclasses = [];
let currentSubclassData = null;

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/subclasses");
    const data = await response.json();

    // Tri alphabétique des subs par nom
    allSubclasses = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allSubclasses.map((subclasses) => ({
      value: subclasses.name.toLowerCase(),
      label: subclasses.name,
    }));
    subclassDropdown.setOptions(options);
  } catch (error) {
    console.error("Erreur lors du chargement du menu :", error);
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
// Événement de recherche depuis la barre de recherche
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query.toLowerCase();
  if (query) {
    searchSub(query);
  } else {
    subclassResult.innerHTML = "Veuillez entrer un nom de sous classe.";
  }
});

// Événement de sélection depuis le dropdown
subclassDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchSub(value);
  }
});

// ========================================
// FONCTIONS DE FORMATTAGE DES DONNÉES
// ========================================
function formatAC(ac) {
  if (!ac) return "N/A";
  return ac.map((item) => `${item.value} (${item.type})`).join(", ");
}

function formatSpeed(speed) {
  if (!speed) return "N/A";
  return Object.entries(speed)
    .map(([type, val]) => `${type}: ${val}`)
    .join(", ");
}

function formatList(list) {
  if (!list || list.length === 0) return "None";
  return `<ul>${list
    .map(
      (item) =>
        `<li><strong>${item.name}:</strong> ${DndMarkdown.parse(
          item.desc
        )}</li>`
    )
    .join("")}</ul>`;
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchSub(subclassesName) {
  subclassResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche de l'aptitude dans le cache
    const matchedClasses = allSubclasses.find(
      (subclasses) => subclasses.name.toLowerCase() === subclassesName
    );

    if (!matchedClasses) {
      subclassResult.innerHTML = "Sous classe non trouvé.";
      return;
    }

    // Récupérer les détails complets de sous classe
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedClasses.url}`
    );
    const subData = await response.json();
    console.log("data : ", subData);

    // Construction de la fiche d'aptitude
    subclassResult.innerHTML = `
      <div class="monster-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="monster-header">
          <h2>${subData.name}</h2>
        </div>

        <!-- Statistiques principales de l'aptitude -->
        <div class="monster-stats-top">
          <p><strong class="tooltip" data-tooltip="Nom">Nom:</strong> ${
            subData.subclass_flavor
          }</p>
          <p><strong class="tooltip" data-tooltip="Description : Description de l'aptitude.">Description</strong> ${
            subData.desc[0]
          }</p>
        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    subclassResult.innerHTML = "Erreur lors de la recherche.";
  }
}
