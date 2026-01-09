// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const spellDropdown = document.getElementById("spellDropdown");
const spellResult = document.getElementById("spellResult");

// Cache des sorts pour éviter les requêtes multiples
let allSpells = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/spells");
    const data = await response.json();

    // Tri alphabétique des sorts par nom
    allSpells = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allSpells.map((spell) => ({
      value: spell.name.toLowerCase(),
      label: spell.name,
    }));
    spellDropdown.setOptions(options);
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
    searchSpell(query);
  } else {
    spellResult.innerHTML = "Veuillez entrer un nom de sort.";
  }
});

// Événement de sélection depuis le dropdown
spellDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchSpell(value);
  }
});

// ========================================
// FONCTIONS DE FORMATTAGE DES DONNÉES
// ========================================
function formatComponents(components) {
  if (!components || components.length === 0) return "N/A";
  
  const componentMap = {
    V: "Verbal",
    S: "Somatique",
    M: "Matériel"
  };
  
  return components.map(c => componentMap[c] || c).join(", ");
}

function formatClasses(classes) {
  if (!classes || classes.length === 0) return "Aucune";
  return classes.map(c => c.name).join(", ");
}

function formatSubclasses(subclasses) {
  if (!subclasses || subclasses.length === 0) return "Aucune";
  return subclasses.map(s => s.name).join(", ");
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchSpell(spellName) {
  spellResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche du sort dans le cache
    const matchedSpell = allSpells.find(
      (spell) => spell.name.toLowerCase() === spellName
    );

    if (!matchedSpell) {
      spellResult.innerHTML = "Sort non trouvé.";
      return;
    }

    // Récupérer les détails complets du sort
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedSpell.url}`
    );
    const spellData = await response.json();

    // Construction de la fiche de sort
    spellResult.innerHTML = `
      <div class="monster-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="monster-header">
          <h2>${spellData.name}</h2>
          <p><em>${spellData.level === 0 ? "Sortilège" : "Niveau " + spellData.level} - ${spellData.school.name}</em></p>
        </div>

        <!-- Statistiques principales de combat -->
        <div class="monster-stats-top">
          <p><strong class="tooltip" data-tooltip="Temps nécessaire pour lancer le sort.">Incantation:</strong> ${spellData.casting_time}</p>
          <p><strong class="tooltip" data-tooltip="Distance maximale d'effet du sort.">Portée:</strong> ${spellData.range}</p>
          <p><strong class="tooltip" data-tooltip="Durée de l'effet du sort.">Durée:</strong> ${spellData.duration}</p>
        </div>

        <!-- Caractéristiques avec modificateurs (WebComponent) -->
        <dnd-stat-grid id="monsterStats"></dnd-stat-grid>

        <!-- Informations de jeu -->
        <div class="monster-details">
          <p><strong class="tooltip" data-tooltip="Composants nécessaires pour le sort.">Composants:</strong> ${formatComponents(spellData.components)}</p>
          <p><strong>Type de Dégâts:</strong> ${spellData.damage?.damage_type?.name || "N/A"}</p>
          <p><strong>Jet de Sauvegarde:</strong> ${spellData.dc?.dc_type?.name || "N/A"}</p>
          <p><strong>Classes:</strong> ${formatClasses(spellData.classes)}</p>
          <p><strong>Sous-classes:</strong> ${formatSubclasses(spellData.subclasses)}</p>
        </div>

        <!-- Actions et capacités spéciales -->
        <div class="monster-actions">
          <h3>Description</h3>
          <p>${DndMarkdown.parseArray(spellData.desc)}</p>

          ${
            spellData.higher_level?.length
              ? `<h3>À plus haut niveau</h3><p>${DndMarkdown.parseArray(spellData.higher_level)}</p>`
              : ""
          }
        </div>
      </div>
    `;

    // Peupler le composant stat-grid avec les stats du sort
    const statGrid = spellResult.querySelector("#monsterStats");
    statGrid.stats = [
      {
        label: "Incantation",
        value: spellData.casting_time,
        tooltip: "Temps nécessaire pour lancer le sort",
      },
      {
        label: "Portée",
        value: spellData.range,
        tooltip: "Distance maximale d'effet du sort",
      },
      {
        label: "Durée",
        value: spellData.duration,
        tooltip: "Durée de l'effet du sort",
      },
      {
        label: "Composants",
        value: formatComponents(spellData.components),
        tooltip: "V=Verbal, S=Somatique, M=Matériel",
      },
    ];
  } catch (error) {
    console.error(error);
    spellResult.innerHTML = "Erreur lors de la recherche.";
  }
}