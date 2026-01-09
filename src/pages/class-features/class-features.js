// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const classFeaturesDropdown = document.getElementById("classFeaturesDropdown");
const classFeaturesResult = document.getElementById("classFeaturesResult");

// Cache des aptitudes de classe
let allClassFeatures = [];
let currentClassFeaturesData = null;

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/features");
    const data = await response.json();

    // Filtrer pour ne garder qu'une seule occurrence par nom d'aptitude
    const uniqueFeaturesMap = new Map();
    data.results.forEach((feature) => {
      if (!uniqueFeaturesMap.has(feature.name)) {
        uniqueFeaturesMap.set(feature.name, feature);
      }
    });

    // Convertir le Map en tableau et trier alphabétiquement
    allClassFeatures = Array.from(uniqueFeaturesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Peupler le dropdown avec les WebComponents
    const options = allClassFeatures.map((feature) => ({
      value: feature.name.toLowerCase(),
      label: feature.name,
    }));
    classFeaturesDropdown.setOptions(options);
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
    searchFeatures(query);
  } else {
    classFeaturesResult.innerHTML = "Veuillez entrer un nom d'aptitude.";
  }
});

// Événement de sélection depuis le dropdown
classFeaturesDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchFeatures(value);
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
async function searchFeatures(featureName) {
  classFeaturesResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche de l'aptitude dans le cache
    const matchedFeature = allClassFeatures.find(
      (feature) => feature.name.toLowerCase() === featureName
    );

    if (!matchedFeature) {
      classFeaturesResult.innerHTML = "Aptitude non trouvé.";
      return;
    }

    // Récupérer les détails complets de l'aptitude
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedFeature.url}`
    );
    const featureData = await response.json();
    console.log("data : ", featureData);

    // Construction de la fiche d'aptitude
    classFeaturesResult.innerHTML = `
    <favorite-toggle
        entity="background"
        index="${featureData.index}"
        name="${featureData.name}"
        url="${featureData.url}">
      </favorite-toggle>
      <div class="entity-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="entity-header">
          <h2>${featureData.name}</h2>
        </div>

        

        <!-- Statistiques principales de l'aptitude -->
        <div class="entity-stats-top">
          <p><strong class="tooltip" data-tooltip="Niveau  : Niveau requis pour utiliser">Niveau:</strong> ${
            featureData.level
          }</p>
          <p><strong class="tooltip" data-tooltip="Nom de classe : Nom de la classe nécessaire pour utiliser l'aptitude.">Nom de classe:</strong> ${
            featureData.class.name
          }</p>
          <p><strong class="tooltip" data-tooltip="Description : Description de l'aptitude.">Description</strong> ${
            featureData.desc[0]
          }</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    classFeaturesResult.innerHTML = "Erreur lors de la recherche.";
  }
}
