// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const racialTraitsDropdown = document.getElementById("racialTraitsDropdown");
const racialTraitsResult = document.getElementById("racialTraitsResult");

// Cache des traits raciaux
let allRacialTraits = [];
let currentRacialTraitsData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des traits raciaux chargée - Page vide");
});