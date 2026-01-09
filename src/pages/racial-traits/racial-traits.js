// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const racialTraitsDropdown = document.getElementById("racialTraitsDropdown");
const racialTraitsResult = document.getElementById("racialTraitsResult");

// Cache des traits raciaux pour éviter les requêtes multiples
let allRacialTraits = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/traits");
    const data = await response.json();

    // Tri alphabétique des traits raciaux par nom
    allRacialTraits = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allRacialTraits.map((trait) => ({
      value: trait.name.toLowerCase(),
      label: trait.name,
    }));
    racialTraitsDropdown.setOptions(options);
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
    searchRacialTrait(query);
  } else {
    racialTraitsResult.innerHTML = "Veuillez entrer un nom de trait racial.";
  }
});

// Événement de sélection depuis le dropdown
racialTraitsDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchRacialTrait(value);
  }
});

// ========================================
// FONCTIONS DE FORMATTAGE DES DONNÉES
// ========================================
function formatRaces(races) {
  if (!races || races.length === 0) return "Aucune";
  return races.map(r => r.name).join(", ");
}

function formatSubraces(subraces) {
  if (!subraces || subraces.length === 0) return "Aucune";
  return subraces.map(s => s.name).join(", ");
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchRacialTrait(traitName) {
  racialTraitsResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche du trait racial dans le cache
    const matchedTrait = allRacialTraits.find(
      (trait) => trait.name.toLowerCase() === traitName
    );

    if (!matchedTrait) {
      racialTraitsResult.innerHTML = "Trait racial non trouvé.";
      return;
    }

    // Récupérer les détails complets du trait racial
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedTrait.url}`
    );
    const traitData = await response.json();

    // Construction de la fiche de trait racial
    racialTraitsResult.innerHTML = `
    <favorite-toggle
        entity="background"
        index="${traitData.index}"
        name="${traitData.name}"
        url="${traitData.url}">
      </favorite-toggle>
      <div class="entity-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="entity-header">
          <h2>${traitData.name}</h2>
          <p><em>Trait racial</em></p>
        </div>

        

        <!-- Statistiques principales -->
        <div class="entity-stats-top">
          <p><strong class="tooltip" data-tooltip="Type de trait racial.">Type:</strong> Trait racial</p>
          <p><strong class="tooltip" data-tooltip="Races concernées.">Races:</strong> ${formatRaces(traitData.races)}</p>
          <p><strong class="tooltip" data-tooltip="Sous-races concernées.">Sous-races:</strong> ${formatSubraces(traitData.subraces)}</p>
        </div>

        <!-- Caractéristiques avec WebComponent -->
        <dnd-stat-grid id="monsterStats"></dnd-stat-grid>

        <!-- Informations de jeu -->
        <div class="entity-details">
          <p><strong>Nombre de races:</strong> ${traitData.races?.length || 0}</p>
          <p><strong>Nombre de sous-races:</strong> ${traitData.subraces?.length || 0}</p>
        </div>

        <!-- Description et capacités spéciales -->
        <div class="entity-content">
          <h3>Description</h3>
          <p>${traitData.desc ? DndMarkdown.parseArray(traitData.desc) : "Aucune description disponible."}</p>
        </div>
      </div>
    `;

    // Peupler le composant stat-grid avec les stats du trait
    const statGrid = racialTraitsResult.querySelector("#monsterStats");
    statGrid.stats = [
      {
        label: "Type",
        value: "Trait racial",
        tooltip: "Type de capacité",
      },
      {
        label: "Races",
        value: String(traitData.races?.length || 0),
        tooltip: "Nombre de races concernées",
      },
      {
        label: "Sous-races",
        value: String(traitData.subraces?.length || 0),
        tooltip: "Nombre de sous-races concernées",
      },
    ];
  } catch (error) {
    console.error(error);
    racialTraitsResult.innerHTML = "Erreur lors de la recherche.";
  }
}