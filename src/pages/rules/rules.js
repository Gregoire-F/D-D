// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const rulesDropdown = document.getElementById("rulesDropdown");
const rulesResult = document.getElementById("rulesResult");

// Cache des règles
let allRules = [];
let currentRulesData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  // Pour l'instant, page vide comme demandé
  console.log("Page des règles chargée - Page vide");
});