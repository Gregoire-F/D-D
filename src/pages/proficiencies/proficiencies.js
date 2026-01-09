// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const profDropdown = document.getElementById("profDropdown");
const profResult = document.getElementById("profResult");

// Cache des maîtrises
let allProficiencies = [];

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(
      "https://www.dnd5eapi.co/api/2014/proficiencies"
    );
    const data = await response.json();

    // Tri alphabétique par nom
    allProficiencies = data.results.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Peupler le dropdown
    const options = allProficiencies.map((prof) => ({
      value: prof.index, // Utiliser l'index pour la recherche API
      label: prof.name,
    }));
    profDropdown.setOptions(options);
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query.toLowerCase();
  if (query) {
    // Si la requête correspond au label d'un item, on utilise son index
    const found = allProficiencies.find(
      (p) => p.name.toLowerCase() === query || p.index === query
    );
    if (found) {
      searchProficiency(found.index);
    } else {
      profResult.innerHTML = "Maîtrise non trouvée.";
    }
  }
});

profDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchProficiency(value);
  }
});

// ========================================
// FONCTION UTILITAIRE IMAGE
// ========================================
function getProficiencyImagePath(profName) {
  const filename = profName
    .toLowerCase()
    .replace(/['\s,]+/g, "_")
    .replace(/_+$/, "");
  return `../../assets/images/proficiencies/${filename}.webp`;
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchProficiency(profIndex) {
  profResult.innerHTML = "Recherche en cours...";

  try {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/2014/proficiencies/${profIndex}`
    );
    const data = await response.json();

    const imagePath = getProficiencyImagePath(data.name);

    profResult.innerHTML = `
      <div class="entity-card">
        <div class="entity-header">
          <h2>${data.name}</h2>
          <p><strong>Type :</strong> ${data.type}</p>
        </div>

        <div class="entity-image-container" style="text-align: center; margin: 20px 0;">
          <img src="${imagePath}" 
               alt="${data.name}" 
               style="max-width: 250px; border-radius: 12px; display: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" 
               onload="this.style.display='inline-block'"
               onerror="this.style.display='none'">
        </div>

        <div class="entity-stats-top">
          <p><strong>Classes pouvant l'obtenir :</strong></p>
          <ul>
            ${
              data.classes.map((c) => `<li>${c.name}</li>`).join("") ||
              "<li>Aucune classe spécifique</li>"
            }
          </ul>
          
          <p><strong>Races pouvant l'obtenir :</strong></p>
          <ul>
            ${
              data.races.map((r) => `<li>${r.name}</li>`).join("") ||
              "<li>Aucune race spécifique</li>"
            }
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    profResult.innerHTML = "Erreur lors de la récupération des détails.";
  }
}
