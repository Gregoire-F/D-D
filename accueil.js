/**
 * Sélection des éléments du DOM (les 3 cartes de catégories)
 */
const btnMonsters = document.getElementById("btn-monsters");
const btnSpells = document.getElementById("btn-spells");
const btnItems = document.getElementById("btn-items");

// --- Gestionnaires d'événements (Redirection) ---

/**
 * Redirige vers la page des monstres (gérée par un collègue)
 */
btnMonsters.addEventListener("click", () => {
  window.location.href = "monstres.html";
});

/**
 * Redirige vers la page des sorts (gérée par un collègue)
 */
btnSorts.addEventListener("click", () => {
  window.location.href = "sorts.html";
});

/**
 * Redirige vers la page des items (gérée par un collègue)
 */
btnItems.addEventListener("click", () => {
  window.location.href = "items.html";
});
