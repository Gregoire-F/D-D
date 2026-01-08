// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const backgroundDropdown = document.getElementById("backgroundDropdown");
const backgroundResult = document.getElementById("backgroundResult");

// Cache des backgrounds
let allBackgrounds = [];
let currentBackgroundData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des backgrounds chargée - Page vide");
});