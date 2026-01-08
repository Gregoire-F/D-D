// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const classFeaturesDropdown = document.getElementById("classFeaturesDropdown");
const classFeaturesResult = document.getElementById("classFeaturesResult");

// Cache des aptitudes de classe
let allClassFeatures = [];
let currentClassFeaturesData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des aptitudes de classe chargée - Page vide");
});