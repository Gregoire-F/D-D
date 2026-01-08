// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const monsterDropdown = document.getElementById("monsterDropdown");
const monsterResult = document.getElementById("monsterResult");

// Cache des monstres pour éviter les requêtes multiples
let allMonsters = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/monsters");
    const data = await response.json();

    // Tri alphabétique des monstres par nom
    allMonsters = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allMonsters.map((monster) => ({
      value: monster.name.toLowerCase(),
      label: monster.name,
    }));
    monsterDropdown.setOptions(options);
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
    searchMonster(query);
  } else {
    monsterResult.innerHTML = "Veuillez entrer un nom de monstre.";
  }
});

// Événement de sélection depuis le dropdown
monsterDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchMonster(value);
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
async function searchMonster(monsterName) {
  monsterResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche du monstre dans le cache
    const matchedMonster = allMonsters.find(
      (monster) => monster.name.toLowerCase() === monsterName
    );

    if (!matchedMonster) {
      monsterResult.innerHTML = "Monstre non trouvé.";
      return;
    }

    // Récupérer les détails complets du monstre
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedMonster.url}`
    );
    const monsterData = await response.json();

    // Construction de la fiche de monstre
    monsterResult.innerHTML = `
      <div class="monster-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="monster-header">
          <h2>${monsterData.name}</h2>
          <p><em>${monsterData.size} ${monsterData.type}, ${
      monsterData.alignment
    }</em></p>
        </div>

        <!-- Image du monstre si disponible -->
        ${
          monsterData.image
            ? `<img src="https://www.dnd5eapi.co${monsterData.image}" alt="${monsterData.name}" class="monster-image">`
            : ""
        }

        <!-- Statistiques principales de combat -->
        <div class="monster-stats-top">
          <p><strong class="tooltip" data-tooltip="Armor Class (AC) : Difficulté pour toucher la créature.">Armor Class:</strong> ${formatAC(
            monsterData.armor_class
          )}</p>
          <p><strong class="tooltip" data-tooltip="Hit Points (HP) : Points de vie de la créature.">Hit Points:</strong> ${
            monsterData.hit_points
          } (${monsterData.hit_dice})</p>
          <p><strong class="tooltip" data-tooltip="Speed : Vitesse de déplacement de la créature.">Speed:</strong> ${formatSpeed(
            monsterData.speed
          )}</p>
        </div>

        <!-- Caractéristiques avec modificateurs (WebComponent) -->
        <dnd-stat-grid id="monsterStats"></dnd-stat-grid>

        <!-- Informations de jeu -->
        <div class="monster-details">
          <p><strong class="tooltip" data-tooltip="Challenge Rating (CR) : Niveau de puissance du monstre.">Challenge:</strong> ${
            monsterData.challenge_rating
          } (${monsterData.xp} XP)</p>
          <p><strong>Languages:</strong> ${monsterData.languages || "-"}</p>
        </div>

        <!-- Actions et capacités spéciales -->
        <div class="monster-actions">
          <h3>Actions</h3>
          ${formatList(monsterData.actions)}

          ${
            monsterData.special_abilities?.length
              ? `<h3>Special Abilities</h3>${formatList(
                  monsterData.special_abilities
                )}`
              : ""
          }
        </div>
      </div>
    `;

    // Peupler le composant stat-grid avec les ability scores
    const statGrid = monsterResult.querySelector("#monsterStats");
    statGrid.stats = DndStatGrid.createAbilityStats(monsterData);
  } catch (error) {
    console.error(error);
    monsterResult.innerHTML = "Erreur lors de la recherche.";
  }
}
