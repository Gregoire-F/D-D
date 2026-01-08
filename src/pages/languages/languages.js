// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const languagesDropdown = document.getElementById("languagesDropdown");
const languagesResult = document.getElementById("languagesResult");

// Cache des langues pour éviter les requêtes multiples
let allLanguages = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/languages");
    const data = await response.json();

    // Tri alphabétique des langues par nom
    allLanguages = data.results.sort((a, b) => a.name.localeCompare(b.name));

    // Peupler le dropdown avec les WebComponents
    const options = allLanguages.map((language) => ({
      value: language.name.toLowerCase(),
      label: language.name,
    }));
    languagesDropdown.setOptions(options);
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
    searchLanguage(query);
  } else {
    languagesResult.innerHTML = "Veuillez entrer un nom de langue.";
  }
});

// Événement de sélection depuis le dropdown
languagesDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchLanguage(value);
  }
});

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchLanguage(languageName) {
  languagesResult.innerHTML = "Recherche en cours...";

  try {
    // Recherche de la langue dans le cache
    const matchedLanguage = allLanguages.find(
      (language) => language.name.toLowerCase() === languageName
    );

    if (!matchedLanguage) {
      languagesResult.innerHTML = "Langue non trouvée.";
      return;
    }

    // Récupérer les détails complets de la langue
    const response = await fetch(
      `https://www.dnd5eapi.co${matchedLanguage.url}`
    );
    const languageData = await response.json();

    // Construction de la fiche de langue
    languagesResult.innerHTML = `
      <div class="language-card">
        <!-- En-tête avec nom -->
        <div class="language-header">
          <h2>${languageData.name}</h2>
        </div>

        <!-- Informations principales -->
        <div class="language-details">
          <p><strong>Type:</strong> ${languageData.type || "Non spécifié"}</p>
          <p><strong>Script:</strong> ${languageData.script || "Aucun"}</p>
          <p><strong>Locuteurs typiques:</strong> ${languageData.typical_speakers?.join(", ") || "Non spécifié"}</p>
        </div>

        <!-- Description -->
        <div class="language-description">
          <h3>Description</h3>
          <p>${languageData.desc || "Aucune description disponible."}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    languagesResult.innerHTML = "Erreur lors de la recherche.";
  }
}