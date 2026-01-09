// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const heroDropdown = document.getElementById("heroDropdown");
const heroResult = document.getElementById("heroResult");

// Cache des classes
let allClasses = [];
let currentHeroData = null;

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/classes");
    const data = await response.json();

    allClasses = data.results.sort((a, b) => a.name.localeCompare(b.name));

    const options = allClasses.map((cls) => ({
      value: cls.index,
      label: cls.name,
    }));
    heroDropdown.setOptions(options);

    // GESTION DU PARAMÈTRE D'URL
    const urlParams = new URLSearchParams(window.location.search);
    const classToLoad = urlParams.get("class");
    const subclassToLoad = urlParams.get("subclass");

    if (classToLoad) {
      searchBar.value = classToLoad;
      searchClass(classToLoad);
    } else if (subclassToLoad) {
      // Si on arrive via une sous-classe, on doit trouver sa classe parente
      try {
        const subResp = await fetch(
          `https://www.dnd5eapi.co/api/2014/subclasses/${subclassToLoad}`
        );
        const subData = await subResp.json();
        if (subData.class) {
          searchClass(subData.class.index);
          searchBar.value = subData.class.name;
        }
      } catch (err) {
        console.error("Erreur sous-classe:", err);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const query = e.detail.query.toLowerCase();
  if (query) {
    searchClass(query);
  } else {
    heroResult.innerHTML = "Veuillez entrer une classe.";
  }
});

heroDropdown.addEventListener("dnd-select", (e) => {
  const { value, label } = e.detail;
  if (value) {
    searchBar.value = label;
    searchClass(value);
  }
});

// ========================================
// FONCTIONS DE FORMATAGE
// ========================================
function formatProficiencies(profs) {
  if (!profs || profs.length === 0) return "Aucune";
  return profs.map((p) => p.name).join(", ");
}

function formatList(list) {
  if (!list || list.length === 0) return "Aucun";
  return `<ul>${list
    .map((item) => `<li>${item.name || item.equipment?.name}</li>`)
    .join("")}</ul>`;
}

// ========================================
// FONCTIONS POUR LES SORTS
// ========================================
async function fetchClassSpells(classIndex) {
  try {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/2014/classes/${classIndex}/spells`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Erreur lors du chargement des sorts:", error);
    return [];
  }
}

function groupSpellsByLevel(spells) {
  const grouped = {};
  spells.forEach((spell) => {
    const level = spell.level;
    if (!grouped[level]) {
      grouped[level] = [];
    }
    grouped[level].push(spell);
  });
  // Trier les sorts par nom dans chaque niveau
  Object.keys(grouped).forEach((level) => {
    grouped[level].sort((a, b) => a.name.localeCompare(b.name));
  });
  return grouped;
}

function formatSpellsByLevel(groupedSpells) {
  if (Object.keys(groupedSpells).length === 0) {
    return "<p><em>Cette classe ne possède pas de sorts.</em></p>";
  }

  const levelNames = {
    0: "Sortilèges (Niveau 0)",
    1: "Niveau 1",
    2: "Niveau 2",
    3: "Niveau 3",
    4: "Niveau 4",
    5: "Niveau 5",
    6: "Niveau 6",
    7: "Niveau 7",
    8: "Niveau 8",
    9: "Niveau 9",
  };

  let html = "";

  // Parcourir les niveaux de 0 à 9
  for (let level = 0; level <= 9; level++) {
    const spells = groupedSpells[level];
    if (spells && spells.length > 0) {
      html += `<h4>${levelNames[level]}</h4>`;
      html += `<ul class="spell-list">`;
      spells.forEach((spell) => {
        html += `<li>
          <a href="#" class="spell-link" data-spell-url="${spell.url}">
            ${spell.name}
          </a>
        </li>`;
      });
      html += `</ul>`;
    }
  }

  return html;
}

async function showSpellDetails(spellUrl) {
  const modal = document.getElementById("spellModal");
  const modalContent = document.getElementById("spellModalContent");

  modalContent.innerHTML = "Chargement...";
  modal.style.display = "flex";

  try {
    const response = await fetch(`https://www.dnd5eapi.co${spellUrl}`);
    const spell = await response.json();

    const description = DndMarkdown.parseArray(spell.desc);
    const higherLevel = spell.higher_level
      ? DndMarkdown.parseArray(spell.higher_level)
      : "";

    const damageType = spell.damage?.damage_type?.name || "N/A";
    const saveType = spell.dc?.dc_type?.name || "N/A";

    // Vérification de la compétence de sauvegarde du héros
    const isProficientInSave = currentHeroData?.saving_throws.some(
      (s) => s.name.toLowerCase() === saveType.toLowerCase()
    );

    // Vérification sommaire du matériel (Focus ou Sacoche)
    const hasFocusOrPouch = currentHeroData?.starting_equipment.some((eq) => {
      const name = eq.equipment.name.toLowerCase();
      return (
        name.includes("focus") ||
        name.includes("pouch") ||
        name.includes("symbol")
      );
    });

    modalContent.innerHTML = `
      <div class="spell-card">
        <button class="modal-close" onclick="closeSpellModal()">&times;</button>
        <h2>${spell.name}</h2>
        <p><em>
          ${spell.level === 0 ? "Sortilège" : "Niveau " + spell.level}
          - ${spell.school.name}
        </em></p>

        <dnd-stat-grid id="modalSpellStats"></dnd-stat-grid>

        <div class="spell-extra-info">
          <p><strong>Type de Dégâts :</strong> ${damageType}</p>
          <p><strong>Jet de Sauvegarde :</strong> ${saveType} 
            ${
              isProficientInSave
                ? `<span class="check-success" title="Votre héros est entraîné à résister à ce type d'effet !">✔ Maîtrisé !</span>`
                : ""
            }
          </p>
          <p><strong>Matériel requis :</strong> 
            ${
              hasFocusOrPouch
                ? `<span class="check-success">✔ Équipement de base OK</span>`
                : `<span class="check-warning">⚠ Composants à vérifier</span>`
            }
          </p>
        </div>

        <h3>Description</h3>
        <p>${description}</p>

        ${higherLevel ? `<h3>À plus haut niveau</h3><p>${higherLevel}</p>` : ""}

        <p><strong>Classes :</strong> ${spell.classes
          .map((c) => c.name)
          .join(", ")}</p>
      </div>
    `;

    // Peupler le stat-grid
    const statGrid = modalContent.querySelector("#modalSpellStats");
    statGrid.stats = [
      {
        label: "Incantation",
        value: spell.casting_time,
        tooltip: "Temps nécessaire pour lancer le sort",
      },
      {
        label: "Portée",
        value: spell.range,
        tooltip: "Distance maximale d'effet du sort",
      },
      {
        label: "Durée",
        value: spell.duration,
        tooltip: "Durée de l'effet du sort",
      },
      {
        label: "Composants",
        value: spell.components.join(", "),
        tooltip: "V=Verbal, S=Somatique, M=Matériel",
      },
    ];
  } catch (error) {
    modalContent.innerHTML = "Erreur lors du chargement du sort.";
  }
}

function closeSpellModal() {
  document.getElementById("spellModal").style.display = "none";
}

// ========================================
// FONCTION PRINCIPALE
// ========================================
async function searchClass(indexOrName) {
  heroResult.innerHTML = "Recherche en cours...";

  try {
    const response = await fetch(
      `https://www.dnd5eapi.co/api/2014/classes/${indexOrName}`
    );

    if (!response.ok) {
      throw new Error("Classe non trouvée");
    }

    const heroData = await response.json();
    currentHeroData = heroData; // Sauvegarder pour le modal des sorts

    // Charger les sorts de la classe en parallèle
    const spells = await fetchClassSpells(heroData.index);
    const groupedSpells = groupSpellsByLevel(spells);
    const spellsHtml = formatSpellsByLevel(groupedSpells);
    const spellCount = spells.length;

    // Gestion de l'image
    const imagePath = `../../assets/images/classes/${heroData.index}.webp`;
    const placeholder = `https://placehold.co/600x400/8b0000/FFF?text=${heroData.name}`;

    heroResult.innerHTML = `
      <div class="entity-card">
        <div class="entity-header">
          <h2>${heroData.name}</h2>
          <p><em>Class (Héros) - Hit Die: d${heroData.hit_die}</em></p>
        </div>

        <img
          src="${imagePath}"
          alt="${heroData.name}"
          class="entity-image"
          onerror="this.onerror=null; this.src='${placeholder}';"
        />

        <!-- Stats de la classe (WebComponent) -->
        <dnd-stat-grid id="heroStats"></dnd-stat-grid>

        <div class="entity-details">
          <p><strong>Proficiencies:</strong> ${formatProficiencies(
            heroData.proficiencies
          )}</p>
        </div>

        <div class="entity-content">
          <h3>Starting Equipment</h3>
          ${formatList(heroData.starting_equipment)}

          ${
            heroData.subclasses && heroData.subclasses.length > 0
              ? `<h3>Subclasses</h3>${formatList(heroData.subclasses)}`
              : ""
          }

          <h3>Sorts disponibles (${spellCount})</h3>
          <div class="spells-section">
            ${spellsHtml}
          </div>
        </div>
      </div>

      <!-- Modal pour les détails du sort -->
      <div id="spellModal" class="spell-modal">
        <div id="spellModalContent" class="spell-modal-content"></div>
      </div>
    `;

    // Peupler le composant stat-grid avec les infos de la classe
    const statGrid = heroResult.querySelector("#heroStats");
    const spellAbility =
      heroData.spellcasting?.spellcasting_ability?.name || "N/A";

    statGrid.stats = [
      {
        label: "Hit Die",
        value: `d${heroData.hit_die}`,
        tooltip: "Dé de vie - Points de vie gagnés par niveau",
      },
      {
        label: "Saves",
        value: heroData.saving_throws.map((s) => s.name).join(", "),
        tooltip: "Jets de sauvegarde maîtrisés",
      },
      {
        label: "Sorts",
        value: String(spellCount),
        tooltip: "Nombre de sorts disponibles pour cette classe",
      },
      {
        label: "Incantation",
        value: spellAbility,
        tooltip: "Caractéristique utilisée pour lancer des sorts",
      },
    ];

    // Ajouter les événements de clic sur les sorts
    document.querySelectorAll(".spell-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const spellUrl = e.target.dataset.spellUrl;
        showSpellDetails(spellUrl);
      });
    });

    // Fermer le modal en cliquant à l'extérieur
    const modal = document.getElementById("spellModal");
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSpellModal();
      }
    });
  } catch (error) {
    console.error(error);
    heroResult.innerHTML =
      "Classe non trouvée. Essayez le nom anglais (ex: Wizard).";
  }
}
