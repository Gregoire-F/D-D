/**
 * Sélection des éléments du DOM (les 3 cartes de catégories)
 */
const btnHeros = document.getElementById("btn-heros");
const btnSorts = document.getElementById("btn-spells");
const btnItems = document.getElementById("btn-items");
const btnMonstres = document.getElementById("btn-monstres");

// --- Gestionnaires d'événements (Redirection) ---

/**
 * Redirige vers la page des héros (gérée par un collègue)
 */
btnHeros.addEventListener("click", () => {
  window.location.href = "heros.html";
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
/**
 * Redirige vers la page des monstres (gérée par un collègue)
 */
btnMonstres.addEventListener("click", () => {
  window.location.href = "monstres.html";
});
