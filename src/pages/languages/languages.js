// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const languagesDropdown = document.getElementById("languagesDropdown");
const languagesResult = document.getElementById("languagesResult");

// Cache des langues
let allLanguages = [];
let currentLanguagesData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des langues chargée - Page vide");
});