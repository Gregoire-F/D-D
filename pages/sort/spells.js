// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
const searchBar = document.getElementById("searchBar");
const spellList = document.getElementById("spellList");
const spellResult = document.getElementById("spellResult");

let allSpells = [];

// ========================================
// CHARGEMENT INITIAL
// ========================================
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/spells");
    const data = await response.json();

    allSpells = data.results.sort((a, b) => a.name.localeCompare(b.name));

    displaySpellList(allSpells);
  } catch (error) {
    spellList.innerHTML = "<li>Erreur de chargement</li>";
  }
});

// ========================================
// GESTION DES ÉVÉNEMENTS (WebComponents)
// ========================================
searchBar.addEventListener("dnd-search", (e) => {
  const value = e.detail.query.toLowerCase();

  const filtered = allSpells.filter((spell) =>
    spell.name.toLowerCase().includes(value)
  );

  displaySpellList(filtered);
});

// ========================================
// AFFICHAGE DE LA LISTE
// ========================================
function displaySpellList(spells) {
  spellList.innerHTML = "";

  spells.forEach((spell) => {
    const li = document.createElement("li");
    li.textContent = spell.name;
    li.classList.add("spell-item");

    li.addEventListener("click", () => {
      // Retirer la classe active des autres
      document.querySelectorAll("#spellList li").forEach((el) => {
        el.classList.remove("active");
      });
      li.classList.add("active");

      loadSpellDetails(spell.url);
    });

    spellList.appendChild(li);
  });
}

// ========================================
// FORMATAGE MARKDOWN
// Utilise le module partagé DndMarkdown
// ========================================

// ========================================
// CHARGEMENT DES DÉTAILS
// ========================================
async function loadSpellDetails(url) {
  spellResult.innerHTML = "Chargement du sort...";

  try {
    const response = await fetch(`https://www.dnd5eapi.co${url}`);
    const spell = await response.json();

    const description = DndMarkdown.parseArray(spell.desc);
    const higherLevel = spell.higher_level
      ? DndMarkdown.parseArray(spell.higher_level)
      : "";

    const classesLinks = spell.classes
      .map(
        (c) =>
          `<a href="../hero/hero.html?class=${c.index}" class="class-link">${c.name}</a>`
      )
      .join(", ");

    const subclassesLinks =
      spell.subclasses && spell.subclasses.length > 0
        ? spell.subclasses
            .map(
              (s) =>
                `<a href="../hero/hero.html?subclass=${s.index}" class="class-link">${s.name}</a>`
            )
            .join(", ")
        : "Aucune";

    const damageType = spell.damage?.damage_type?.name || "N/A";
    const saveType = spell.dc?.dc_type?.name || "N/A";

    spellResult.innerHTML = `
      <div class="spell-card">
        <h2>${spell.name}</h2>
        <p><em>
          ${spell.level === 0 ? "Sortilège" : "Niveau " + spell.level}
          - ${spell.school.name}
        </em></p>

        <!-- Stats du sort (WebComponent) -->
        <dnd-stat-grid id="spellStats"></dnd-stat-grid>

        <div class="spell-extra-info">
          <p><strong>Type de Dégâts :</strong> ${damageType}</p>
          <p><strong>Jet de Sauvegarde :</strong> ${saveType}</p>
        </div>

        <h3>Description</h3>
        <p>${description}</p>

        ${higherLevel ? `<h3>À plus haut niveau</h3><p>${higherLevel}</p>` : ""}

        <p><strong>Classes :</strong> ${classesLinks}</p>
        <p><strong>Sous-classes :</strong> ${subclassesLinks}</p>
      </div>
    `;

    // Peupler le composant stat-grid avec les stats du sort
    const statGrid = spellResult.querySelector("#spellStats");
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
    spellResult.innerHTML = "Erreur lors du chargement du sort.";
  }
}
