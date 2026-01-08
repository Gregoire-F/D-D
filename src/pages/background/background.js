// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const backgroundDropdown = document.getElementById("backgroundDropdown");
const backgroundResult = document.getElementById("backgroundResult");

// Cache des backgrounds pour éviter les requêtes multiples
let allBackgrounds = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/backgrounds");
    const data = await response.json();

    // Tri alphabétique des backgrounds par nom
    allBackgrounds = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allBackgrounds.map((background) => ({
      value: background.name.toLowerCase(),
      label: background.name,
    }));
    backgroundDropdown.setOptions(options);
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
    searchBackground(query);
  } else {
    backgroundResult.innerHTML = "Veuillez entrer un nom de background.";
  }
});

// Événement de sélection depuis le dropdown
backgroundDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchBackground(value);
  }
});

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchBackground(backgroundName) {
  backgroundResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche du background dans le cache
    const matchedBackground = allBackgrounds.find(
      (background) => background.name.toLowerCase() === backgroundName
    );

    if (!matchedBackground) {
      backgroundResult.innerHTML = "Background non trouvé.";
      return;
    }

    // Récupérer les détails complets du background
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedBackground.url}`
    );
    const backgroundData = await response.json();

    // Construction de la fiche de background
    backgroundResult.innerHTML = `
      <div class="monster-card">
        <!-- En-tête avec nom -->
        <div class="monster-header">
          <h2>${backgroundData.name}</h2>
          <p><em>Background</em></p>
        </div>

        <!-- Informations principales -->
        <div class="monster-details">
          <p><strong class="tooltip" data-tooltip="Compétences : Compétences obtenues grâce à ce background.">Compétences:</strong> ${backgroundData.proficiencies?.map(p => p.name).join(", ") || "Aucune"}</p>
          <p><strong class="tooltip" data-tooltip="Langues : Langues obtenues grâce à ce background.">Langues:</strong> ${backgroundData.language_proficiencies?.map(l => l.name).join(", ") || "Aucune"}</p>
          <p><strong class="tooltip" data-tooltip="Équipement de départ : Équipement obtenu au début.">Équipement de départ:</strong> ${backgroundData.starting_equipment?.map(e => e.equipment?.name || e.name).join(", ") || "Aucun"}</p>
        </div>

        <!-- Traits -->
        <div class="monster-actions">
          <h3>Traits</h3>
          ${backgroundData.personality_traits ? 
            `<dnd-markdown>${backgroundData.personality_traits.from ? backgroundData.personality_traits.from.name : ""}</dnd-markdown>` : 
            "Aucun trait disponible."
          }
        </div>

        <!-- Idéaux -->
        <div class="monster-actions">
          <h3>Idéaux</h3>
          ${backgroundData.ideals ? 
            `<dnd-markdown>${backgroundData.ideals.from ? backgroundData.ideals.from.name : ""}</dnd-markdown>` : 
            "Aucun idéal disponible."
          }
        </div>

        <!-- Liens -->
        <div class="monster-actions">
          <h3>Liens</h3>
          ${backgroundData.bonds ? 
            `<dnd-markdown>${backgroundData.bonds.from ? backgroundData.bonds.from.name : ""}</dnd-markdown>` : 
            "Aucun lien disponible."
          }
        </div>

        <!-- Défauts -->
        <div class="monster-actions">
          <h3>Défauts</h3>
          ${backgroundData.flaws ? 
            `<dnd-markdown>${backgroundData.flaws.from ? backgroundData.flaws.from.name : ""}</dnd-markdown>` : 
            "Aucun défaut disponible."
          }
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    backgroundResult.innerHTML = "Erreur lors de la recherche.";
  }
}