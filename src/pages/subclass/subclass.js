// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const subclassDropdown = document.getElementById("subclassDropdown");
const subclassResult = document.getElementById("subclassResult");

// Cache des sous-classes
let allSubclasses = [];
let currentSubclassData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des sous-classes chargée - Page vide");
});