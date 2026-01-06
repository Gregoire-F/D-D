const spellInput = document.getElementById("spellInput");
const spellList = document.getElementById("spellList");
const spellResult = document.getElementById("spellResult");

let allSpells = [];

// Chargement initial
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/spells");
    const data = await response.json();

    allSpells = data.results.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    displaySpellList(allSpells);
  } catch (error) {
    spellList.innerHTML = "<li>Erreur de chargement</li>";
  }
});

// Affiche la liste des sorts
function displaySpellList(spells) {
  spellList.innerHTML = "";

  spells.forEach(spell => {
    const li = document.createElement("li");
    li.textContent = spell.name;
    li.classList.add("spell-item");

    li.addEventListener("click", () => {
      loadSpellDetails(spell.url);
    });

    spellList.appendChild(li);
  });
}

// Recherche en temps réel
spellInput.addEventListener("input", () => {
  const value = spellInput.value.toLowerCase();

  const filtered = allSpells.filter(spell =>
    spell.name.toLowerCase().includes(value)
  );

  displaySpellList(filtered);
});

// Chargement des détails du sort
async function loadSpellDetails(url) {
  spellResult.innerHTML = "Chargement du sort...";

  try {
    const response = await fetch(`https://www.dnd5eapi.co${url}`);
    const spell = await response.json();

    spellResult.innerHTML = `
      <div class="spell-card">
        <h2>${spell.name}</h2>
        <p><em>
          ${spell.level === 0 ? "Cantrip" : "Niveau " + spell.level}
          • ${spell.school.name}
        </em></p>

        <p><strong>Temps d’incantation :</strong> ${spell.casting_time}</p>
        <p><strong>Portée :</strong> ${spell.range}</p>
        <p><strong>Durée :</strong> ${spell.duration}</p>
        <p><strong>Composants :</strong> ${spell.components.join(", ")}</p>

        <h3>Description</h3>
        <p>${spell.desc.join("<br><br>")}</p>

        ${
          spell.higher_level
            ? `<h3>À plus haut niveau</h3><p>${spell.higher_level.join("<br><br>")}</p>`
            : ""
        }

        <p><strong>Classes :</strong> ${spell.classes.map(c => c.name).join(", ")}</p>
      </div>
    `;
  } catch (error) {
    spellResult.innerHTML = "Erreur lors du chargement du sort.";
  }
}
