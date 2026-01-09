// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const itemDropdown = document.getElementById("itemDropdown");
const itemResult = document.getElementById("itemResult");

// Cache des items pour éviter les requêtes multiples
let allItems = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const [eqRes, magicRes] = await Promise.all([
      fetch("https://www.dnd5eapi.co/api/2014/equipment"),
      fetch("https://www.dnd5eapi.co/api/2014/magic-items"),
    ]);
    const eqData = await eqRes.json();
    const magicData = await magicRes.json();

    // Fusion et tri alphabétique des items
    allItems = [...eqData.results, ...magicData.results].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Peupler le dropdown avec les WebComponents
    const options = allItems.map((item) => ({
      value: item.name.toLowerCase(),
      label: item.name,
    }));
    itemDropdown.setOptions(options);
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
    searchItem(query);
  } else {
    itemResult.innerHTML = "Veuillez entrer un nom d'item.";
  }
});

// Événement de sélection depuis le dropdown
itemDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchItem(value);
  }
});

// ========================================
// FONCTIONS DE FORMATTAGE DES DONNÉES
// ========================================
function formatCost(cost) {
  if (!cost) return "N/A";
  return `${cost.quantity} ${cost.unit}`;
}

function formatWeight(weight) {
  if (!weight) return "N/A";
  return `${weight} lb`;
}

function formatProperties(properties) {
  if (!properties || properties.length === 0) return "Aucune";
  return properties.map(p => p.name).join(", ");
}

function getItemThirdStat(item) {
  if (item.armor_class) {
    return {
      label: "AC",
      value: item.armor_class.base + (item.armor_class.dex_bonus ? " + Dex" : ""),
      tooltip: "Classe d'armure - Protection fournie"
    };
  } else if (item.damage) {
    return {
      label: "Dégâts", 
      value: `${item.damage.damage_dice} ${item.damage.damage_type.name}`,
      tooltip: "Dégâts infligés par l'arme"
    };
  } else if (item.rarity) {
    return {
      label: "Rareté",
      value: item.rarity.name,
      tooltip: "Niveau de rareté de l'objet magique"
    };
  }
  return {
    label: "Info",
    value: "-",
    tooltip: "Information supplémentaire"
  };
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchItem(itemName) {
  itemResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche de l'item dans le cache
    const matchedItem = allItems.find(
      (item) => item.name.toLowerCase() === itemName
    );

    if (!matchedItem) {
      itemResult.innerHTML = "Item non trouvé.";
      return;
    }

    // Récupérer les détails complets de l'item
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedItem.url}`
    );
    const itemData = await response.json();

    const type = itemData.equipment_category ? itemData.equipment_category.name : "Objet";
    const thirdStat = getItemThirdStat(itemData);

    // Construction de la fiche d'item
    itemResult.innerHTML = `
      <div class="entity-card">
        <!-- En-tête avec nom et caractéristiques de base -->
        <div class="entity-header">
          <h2>${itemData.name}</h2>
          <p><em>${type}</em></p>
        </div>

        <!-- Statistiques principales -->
        <div class="entity-stats-top">
          <p><strong class="tooltip" data-tooltip="Catégorie de l'objet.">Catégorie:</strong> ${type}</p>
          <p><strong class="tooltip" data-tooltip="Poids de l'objet.">Poids:</strong> ${formatWeight(itemData.weight)}</p>
          <p><strong class="tooltip" data-tooltip="${thirdStat.tooltip}">${thirdStat.label}:</strong> ${thirdStat.value}</p>
        </div>

        <!-- Caractéristiques avec WebComponent -->
        <dnd-stat-grid id="monsterStats"></dnd-stat-grid>

        <!-- Informations de jeu -->
        <div class="entity-details">
          <p><strong class="tooltip" data-tooltip="Prix de l'objet.">Coût:</strong> ${formatCost(itemData.cost)}</p>
          <p><strong>Propriétés:</strong> ${formatProperties(itemData.properties)}</p>
        </div>

        <!-- Description et capacités spéciales -->
        <div class="entity-content">
          <h3>Description</h3>
          <ul>
            ${
              itemData.desc && itemData.desc.length > 0
                ? itemData.desc.map(line => `<li>${DndMarkdown.parse(line)}</li>`).join("")
                : `<li>Pas de description détaillée disponible.</li>`
            }
          </ul>
        </div>
      </div>
    `;

    // Peupler le composant stat-grid avec les stats de l'item
    const statGrid = itemResult.querySelector("#monsterStats");
    statGrid.stats = [
      {
        label: "Coût",
        value: formatCost(itemData.cost),
        tooltip: "Prix de l'objet en pièces",
      },
      {
        label: "Poids",
        value: formatWeight(itemData.weight),
        tooltip: "Poids de l'objet en livres",
      },
      {
        label: thirdStat.label,
        value: thirdStat.value,
        tooltip: thirdStat.tooltip,
      },
    ];
  } catch (error) {
    console.error(error);
    itemResult.innerHTML = "Erreur lors de la recherche.";
  }
}