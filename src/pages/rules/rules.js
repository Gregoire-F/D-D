// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const rulesDropdown = document.getElementById("rulesDropdown");
const rulesResult = document.getElementById("rulesResult");

// Cache des règles
let allRules = [];

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/rules");
    const data = await response.json();

    allRules = data.results.sort((a, b) => a.name.localeCompare(b.name));

    const options = allRules.map((rule) => ({
      value: rule.index,
      label: rule.name,
    }));
    rulesDropdown.setOptions(options);
  } catch (error) {
    console.error("Erreur lors du chargement des règles :", error);
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query.toLowerCase();
  if (query) {
    searchRule(query);
  } else {
    rulesResult.innerHTML = "Veuillez entrer un nom de règle.";
  }
});

rulesDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchRule(value);
  }
});

// ========================================
// FONCTIONS DE FORMATAGE
// ========================================
function formatSubsections(subsections) {
  if (!subsections || subsections.length === 0) return "";

  return `
    <div class="subsections-list">
      <h3>Sections</h3>
      <ul class="spell-list">
        ${subsections
          .map(
            (sub) => `
          <li>
            <a href="#" class="spell-link subsection-link" data-url="${sub.url}">
              ${sub.name}
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>`
  ;
}



// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
async function searchRule(indexOrName) {
  rulesResult.innerHTML = "Recherche en cours...";

  try {
    // Chercher dans le cache par index ou nom
    const matchedRule = allRules.find(
      (rule) =>
        rule.index === indexOrName ||
        rule.name.toLowerCase() === indexOrName.toLowerCase()
    );

    if (!matchedRule) {
      rulesResult.innerHTML = "Règle non trouvée.";
      return;
    }

    const response = await fetch(
      `https://www.dnd5eapi.co/api/2014/rules/${matchedRule.index}`
    );

    if (!response.ok) {
      throw new Error("Règle non trouvée");
    }

    const ruleData = await response.json();

    rulesResult.innerHTML = ` 
      <div class="monster-card">
        <div class="monster-header">
          <h2>${ruleData.name}</h2>
        </div>

        <div class="monster-details">
          ${DndMarkdown.parse(ruleData.desc)}
        </div>

        ${formatSubsections(ruleData.subsections)}

        <!-- Contenu de la sous-section sélectionnée -->
        <div id="subsectionContent" class="monster-actions"></div>
      </div>`
    ;

    // Ajouter les événements de clic sur les sous-sections
    document.querySelectorAll(".subsection-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = e.target.dataset.url;
        loadSubsection(url);
      });
    });
  } catch (error) {
    console.error(error);
    rulesResult.innerHTML = "Erreur lors de la recherche.";
  }
}

// ========================================
// CHARGEMENT DES SOUS-SECTIONS
// ========================================
async function loadSubsection(url) {
  const subsectionContent = document.getElementById("subsectionContent");
  subsectionContent.innerHTML = "<p>Chargement...</p>";

  try {
    const response = await fetch(`https://www.dnd5eapi.co${url}`);
    const data = await response.json();

    subsectionContent.innerHTML = `
      <h3>${data.name}</h3>
      <div class="rule-content">
        ${DndMarkdown.parse(data.desc)}
      </div> `
    ;

    // Scroll vers le contenu
    subsectionContent.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    subsectionContent.innerHTML = "<p>Erreur lors du chargement.</p>";
  }
}