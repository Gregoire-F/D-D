// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const heroDropdown = document.getElementById("heroDropdown");
const heroResult = document.getElementById("heroResult");

// Cache des classes
let allClasses = [];

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/classes");
    const data = await response.json();

    allClasses = data.results.sort((a, b) => a.name.localeCompare(b.name));

    const options = allClasses.map((cls) => ({
      value: cls.index,
      label: cls.name,
    }));
    heroDropdown.setOptions(options);
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query.toLowerCase();
  if (query) {
    searchClass(query);
  } else {
    heroResult.innerHTML = "Veuillez entrer une classe.";
  }
});

heroDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchClass(value);
  }
});

// ========================================
// FONCTIONS DE FORMATAGE
// ========================================
function formatProficiencies(profs) {
  if (!profs || profs.length === 0) return "Aucune";
  return profs.map((p) => p.name).join(", ");
}

function formatList(list) {
  if (!list || list.length === 0) return "Aucun";
  return `<ul>${list
    .map((item) => `<li>${item.name || item.equipment?.name}</li>`)
    .join("")}</ul>`;
}

// ========================================
// FONCTION PRINCIPALE
// ========================================
async function searchClass(indexOrName) {
  heroResult.innerHTML = "Recherche en cours...";

  try {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/2014/classes/${indexOrName}`
    );

    if (!response.ok) {
      throw new Error("Classe non trouvée");
    }

    const heroData = await response.json();

    // Gestion de l'image
    const imagePath = `../../images/classes/${heroData.index}.jpg`;
    const placeholder = `https://placehold.co/600x400/8b0000/FFF?text=${heroData.name}`;

    heroResult.innerHTML = `
      <div class="monster-card">
        <div class="monster-header">
          <h2>${heroData.name}</h2>
          <p><em>Class (Héros) - Hit Die: d${heroData.hit_die}</em></p>
        </div>

        <img
          src="${imagePath}"
          alt="${heroData.name}"
          class="monster-image"
          onerror="this.onerror=null; this.src='${placeholder}';"
        />

        <div class="monster-stats-top">
          <p><strong>Hit Die:</strong> 1d${heroData.hit_die} par niveau</p>
          <p><strong>Saving Throws:</strong> ${heroData.saving_throws
            .map((s) => s.name)
            .join(", ")}</p>
        </div>

        <div class="monster-details">
          <p><strong>Proficiencies:</strong> ${formatProficiencies(
            heroData.proficiencies
          )}</p>
        </div>

        <div class="monster-actions">
          <h3>Starting Equipment</h3>
          ${formatList(heroData.starting_equipment)}

          ${
            heroData.subclasses && heroData.subclasses.length > 0
              ? `<h3>Subclasses</h3>${formatList(heroData.subclasses)}`
              : ""
          }
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    heroResult.innerHTML =
      "Classe non trouvée. Essayez le nom anglais (ex: Wizard).";
  }
}
