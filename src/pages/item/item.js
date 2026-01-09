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
// FONCTIONS DE RECHERCHE
// ========================================
async function searchItem(query) {
  try {
    // Chercher l'item dans le cache
    const foundItem = allItems.find(item => 
      item.name.toLowerCase().includes(query)
    );

    if (!foundItem) {
      itemResult.innerHTML = `<p>Aucun item trouvé pour "${query}"</p>`;
      return;
    }

    // Récupérer les détails complets de l'item
    const itemUrl = foundItem.url.startsWith('http') 
      ? foundItem.url 
      : `https://www.dnd5eapi.co${foundItem.url}`;
    
    const response = await fetch(itemUrl);
    const itemDetails = await response.json();

    // Afficher les détails de l'item
    renderCard(itemDetails);
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    itemResult.innerHTML = `<p>Erreur lors du chargement de l'item</p>`;
  }
}

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

function renderCard(item) {
  const type = item.equipment_category ? item.equipment_category.name : "Objet";
  const cost = item.cost ? `${item.cost.quantity} ${item.cost.unit}` : "-";
  const weight = item.weight ? `${item.weight} lb` : "-";

  // --- LOGIQUE IMAGE (AJOUTÉ) ---
  // Construction du nom de fichier : "Dagger" -> "dagger.webp"
  const imageName = item.name.trim().toLowerCase().replace(/\s+/g, '_') + '.webp';
  // Chemin vers le dossier images depuis pages/item/
  const imagePath = `../../assets/images/equipment/${imageName}`;

  // Logique pour la 3ème stat
  const thirdStat = getItemThirdStat(item);

  let html = `
    <div class="entity-card">
      <div class="entity-header">
        <h2>${item.name}</h2>
        <p>${type}</p>
      </div>

      <div style="text-align:center; margin-bottom: 20px;">
          <img src="${imagePath}" 
               alt="${item.name}"
               style="max-width:250px; max-height:250px; border-radius:8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
               onerror="this.style.display='none';">
      </div>

      <div class="monster-stats-top">
        <p><strong>Catégorie :</strong> ${type}</p>
      </div>

      <dnd-stat-grid id="itemStats"></dnd-stat-grid>

      <div class="monster-actions">
        <h3>Description & Propriétés</h3>
        <ul>`;

  if (item.desc && item.desc.length > 0) {
    item.desc.forEach((line) => {
      html += `<li>${DndMarkdown.parse(line)}</li>`;
    });
  } else {
    html += `<li>Pas de description détaillée disponible.</li>`;
  }

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

  html += `</ul></div></div>`;

  itemResult.innerHTML = html;

  // Peupler le composant stat-grid avec les stats de l'item
  const statGrid = itemResult.querySelector("#itemStats");
  statGrid.stats = [
    {
      label: "Coût",
      value: cost,
      tooltip: "Prix de l'objet en pièces",
    },
    {
      label: "Poids",
      value: weight,
      tooltip: "Poids de l'objet en livres",
    },
    {
      label: thirdStat.label,
      value: thirdStat.value,
      tooltip: thirdStat.tooltip,
    },
  ];
}