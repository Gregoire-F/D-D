/**
 * @fileoverview Gestion de la recherche et de l'affichage des traits raciaux via l'API D&D 5e.
 * @author Projet SKOLAE D&D
 */

// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
// Récupération des éléments du DOM par leur ID
const searchBar = document.getElementById("searchBar");
const racialTraitsDropdown = document.getElementById("racialTraitsDropdown");
const racialTraitsResult = document.getElementById("racialTraitsResult");

/** URL de base de l'API pour les traits raciaux */
const API_URL = "https://www.dnd5eapi.co/api/traits";

/** Cache local pour stocker la liste complète des traits raciaux (pour le filtrage) */
let allRacialTraits = [];

// ========================================
// CHARGEMENT INITIAL
// ========================================
/** Déclenche le chargement initial au chargement de la page */
window.addEventListener("DOMContentLoaded", async () => {
  await loadRacialTraits();
  setupEventListeners();
});

/**
 * Charge la liste de tous les traits raciaux depuis l'API.
 * Remplit le dropdown avec les données récupérées.
 */
async function loadRacialTraits() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Transformation des données pour le format attendu par dnd-dropdown {value, label}
    allRacialTraits = data.results.map((trait) => ({
      value: trait.index,
      label: trait.name,
    }));

    // Tri par ordre alphabétique pour une meilleure expérience utilisateur
    allRacialTraits.sort((a, b) => a.label.localeCompare(b.label));

    // Mise à jour du composant dropdown
    if (racialTraitsDropdown) {
      racialTraitsDropdown.setOptions(allRacialTraits);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des traits raciaux :", error);
    if (racialTraitsResult) {
      // Affichage d'un message d'erreur dans l'UI
      racialTraitsResult.innerHTML = `<p class="error">Impossible de charger les traits raciaux.</p>`;
    }
  }
}

/**
 * Configure les écouteurs d'événements pour les composants interactifs.
 */
function setupEventListeners() {
  if (!racialTraitsDropdown || !searchBar) return;

  /** Écoute de l'événement de sélection personnalisé du dnd-dropdown */
  racialTraitsDropdown.addEventListener("dnd-select", (e) => {
    const traitIndex = e.detail.value;
    if (traitIndex) {
      // Si un trait est sélectionné, on récupère ses détails
      fetchTraitDetails(traitIndex);
    } else {
      // Si la sélection est vidée, on efface le résultat
      racialTraitsResult.innerHTML = "";
    }
  });

  /** Écoute de l'événement de recherche personnalisé du dnd-search-bar */
  searchBar.addEventListener("dnd-search", (e) => {
    const query = e.detail.query.toLowerCase().trim();
    // Filtre la liste visible dans le dropdown
    filterTraits(query);
  });
}

/**
 * Filtre les options du dropdown selon la saisie de l'utilisateur.
 * @param {string} query - Le terme de recherche
 */
function filterTraits(query) {
  if (!query) {
    // Si la recherche est vide, on réaffiche tout
    racialTraitsDropdown.setOptions(allRacialTraits);
    return;
  }

  // Filtrage basé sur le nom du trait
  const filtered = allRacialTraits.filter((trait) =>
    trait.label.toLowerCase().includes(query)
  );

  racialTraitsDropdown.setOptions(filtered);

  if (filtered.length === 0) {
    console.log("Aucun trait trouvé pour :", query);
  }
}

/**
 * Récupère les détails d'un trait spécifique via son index API.
 * @param {string} index - L'index unique du trait (ex: 'darkvision')
 */
async function fetchTraitDetails(index) {
  try {
    if (racialTraitsResult) {
      racialTraitsResult.innerHTML = "<p>Chargement des détails...</p>";
    }

    const response = await fetch(`${API_URL}/${index}`);
    const trait = await response.json();

    // Affichage des données formatées
    displayTrait(trait);
  } catch (error) {
    console.error("Erreur lors de la récupération du trait :", error);
    if (racialTraitsResult) {
      racialTraitsResult.innerHTML = `<p class="error">Erreur lors du chargement des détails du trait.</p>`;
    }
  }
}

/**
 * Formate et affiche les détails du trait dans le conteneur de résultat.
 * @param {Object} trait - L'objet trait complet renvoyé par l'API
 */
function displayTrait(trait) {
  if (!racialTraitsResult) return;

  // Préparation du HTML pour les races associées
  let racesHtml = "";
  if (trait.races && trait.races.length > 0) {
    racesHtml = `
      <div class="trait-races">
        <strong>Races :</strong> ${trait.races.map((r) => r.name).join(", ")}
      </div>
    `;
  }

  // Préparation du HTML pour les sous-races associées
  let subracesHtml = "";
  if (trait.subraces && trait.subraces.length > 0) {
    subracesHtml = `
      <div class="trait-subraces">
        <strong>Sous-races :</strong> ${trait.subraces
          .map((s) => s.name)
          .join(", ")}
      </div>
    `;
  }

  // Traitement de la description (souvent un tableau de chaînes dans l'API)
  const description = trait.desc
    ? trait.desc.join("\n\n")
    : "Aucune description disponible.";

  // Injection du HTML final dans le DOM
  racialTraitsResult.innerHTML = `
    <div class="trait-card">
      <h2 class="trait-title">${trait.name}</h2>
      ${racesHtml}
      ${subracesHtml}
      <div class="trait-description">
        ${DndMarkdown.parse(description)}
      </div>
    </div>
  `;
}
