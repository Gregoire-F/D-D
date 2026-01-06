// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const heroInput = document.getElementById("heroInput");
const searchButton = document.getElementById("searchButton");
const heroResult = document.getElementById("heroResult");
const heroSelect = document.getElementById("heroSelect");

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", () => {
    fetch(`https://www.dnd5eapi.co/api/2014/classes`)
        .then((response) => response.json())
        .then((data) => {
            const classes = data.results.sort((a, b) => a.name.localeCompare(b.name));
            classes.forEach((cls) => {
                const option = document.createElement("option");
                option.value = cls.index; // On utilise l'index (ex: "barbarian") pour l'image
                option.textContent = cls.name;
                heroSelect.appendChild(option);
            });
        })
        .catch((error) => console.error("Erreur menu :", error));
});

// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================
searchButton.addEventListener("click", () => {
    const query = heroInput.value.toLowerCase();
    if (query) searchClass(query);
    else heroResult.innerHTML = "Veuillez entrer une classe.";
});

heroSelect.addEventListener("change", (e) => {
    const query = e.target.value;
    if (query) {
        heroInput.value = e.target.options[e.target.selectedIndex].text;
        searchClass(query);
    }
});

// ========================================
// FONCTIONS DE FORMATAGE
// ========================================
function formatProficiencies(profs) {
    if (!profs || profs.length === 0) return "Aucune";
    return profs.map(p => p.name).join(", ");
}

function formatList(list) {
    if (!list || list.length === 0) return "Aucun";
    return `<ul>${list.map(item => `<li>${item.name || item.equipment?.name}</li>`).join("")}</ul>`;
}

// ========================================
// FONCTION PRINCIPALE
// ========================================
function searchClass(indexOrName) {
    heroResult.innerHTML = "Recherche en cours...";

    // On cherche d'abord la classe pour être sûr d'avoir la bonne URL
    fetch(`https://www.dnd5eapi.co/api/2014/classes/${indexOrName}`)
        .then((response) => {
            if (!response.ok) throw new Error("Classe non trouvée");
            return response.json();
        })
        .then((heroData) => {

            // --- GESTION INTELLIGENTE DE L'IMAGE ---
            // 1. On essaie de trouver l'image dans un dossier "images/classes" à la racine
            // 2. Si ça échoue (onerror), on met une image générée automatiquement avec le nom
            const imagePath = `../../images/classes/${heroData.index}.jpg`;
            const placeholder = `https://placehold.co/600x400/8b0000/FFF?text=${heroData.name}`;

            heroResult.innerHTML = `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${heroData.name}</h2>
                <p><em>Class (Héros) - Hit Die: d${heroData.hit_die}</em></p>
            </div>

            <img src="${imagePath}" 
                 alt="${heroData.name}" 
                 class="monster-image"
                 onerror="this.onerror=null; this.src='${placeholder}';">

            <div class="monster-stats-top">
                <p><strong>Hit Die:</strong> 1d${heroData.hit_die} par niveau</p>
                <p><strong>Saving Throws:</strong> ${heroData.saving_throws.map(s => s.name).join(", ")}</p>
            </div>

            <div class="monster-details">
                <p><strong>Proficiencies:</strong> ${formatProficiencies(heroData.proficiencies)}</p>
            </div>

            <div class="monster-actions">
                <h3>Starting Equipment</h3>
                ${formatList(heroData.starting_equipment)}

                ${heroData.subclasses && heroData.subclasses.length > 0
                    ? `<h3>Subclasses</h3>${formatList(heroData.subclasses)}`
                    : ""}
            </div>
        </div>
      `;
        })
        .catch((error) => {
            console.error(error);
            heroResult.innerHTML = "Classe non trouvée. Essayez le nom anglais (ex: Wizard).";
        });
}