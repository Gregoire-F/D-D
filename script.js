const monsterInput = document.getElementById("monsterInput");
const searchButton = document.getElementById("searchButton");
const monsterResult = document.getElementById("monsterResult");
const monsterSelect = document.getElementById("monsterSelect");

// Peupler le menu déroulant au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  fetch(`https://www.dnd5eapi.co/api/2014/monsters`)
    .then((response) => response.json())
    .then((data) => {
      const monsters = data.results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      monsters.forEach((monster) => {
        const option = document.createElement("option");
        option.value = monster.name.toLowerCase();
        option.textContent = monster.name;
        monsterSelect.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Erreur lors du chargement du menu :", error)
    );
});

searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    monsterResult.innerHTML = "Veuillez entrer un nom de monstre.";
  }
});

monsterSelect.addEventListener("change", (e) => {
  const monsterName = e.target.value;
  if (monsterName) {
    monsterInput.value = e.target.options[e.target.selectedIndex].text;
    searchMonster(monsterName);
  }
});

function formatAC(ac) {
  if (!ac) return "N/A";
  return ac.map((item) => `${item.value} (${item.type})`).join(", ");
}

function formatSpeed(speed) {
  if (!speed) return "N/A";
  return Object.entries(speed)
    .map(([type, val]) => `${type}: ${val}`)
    .join(", ");
}

function formatModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : mod;
}

function formatList(list) {
  if (!list || list.length === 0) return "None";
  return `<ul>${list
    .map((item) => `<li><strong>${item.name}:</strong> ${item.desc}</li>`)
    .join("")}</ul>`;
}

function searchMonster(monsterName) {
  monsterResult.innerHTML = "Recherche en cours...";

  fetch(`https://www.dnd5eapi.co/api/2014/monsters`)
    .then((response) => response.json())
    .then((data) => {
      const monsters = data.results;
      const matchedMonster = monsters.find(
        (monster) => monster.name.toLowerCase() === monsterName
      );

      if (matchedMonster) {
        fetch(`https://www.dnd5eapi.co${matchedMonster.url}`)
          .then((monsterResponse) => monsterResponse.json())
          .then((monsterData) => {
            monsterResult.innerHTML = `
              <div class="monster-card">
                <div class="monster-header">
                  <h2>${monsterData.name}</h2>
                  <p><em>${monsterData.size} ${monsterData.type}, ${
              monsterData.alignment
            }</em></p>
                </div>
                
                ${
                  monsterData.image
                    ? `<img src="https://www.dnd5eapi.co${monsterData.image}" alt="${monsterData.name}" class="monster-image">`
                    : ""
                }

                <div class="monster-stats-top">
                  <p><strong>Armor Class:</strong> ${formatAC(
                    monsterData.armor_class
                  )}</p>
                  <p><strong>Hit Points:</strong> ${monsterData.hit_points} (${
              monsterData.hit_dice
            })</p>
                  <p><strong>Speed:</strong> ${formatSpeed(
                    monsterData.speed
                  )}</p>
                </div>

                <div class="ability-scores">
                  <div class="ability"><strong>STR</strong><span>${
                    monsterData.strength
                  } (${formatModifier(monsterData.strength)})</span></div>
                  <div class="ability"><strong>DEX</strong><span>${
                    monsterData.dexterity
                  } (${formatModifier(monsterData.dexterity)})</span></div>
                  <div class="ability"><strong>CON</strong><span>${
                    monsterData.constitution
                  } (${formatModifier(monsterData.constitution)})</span></div>
                  <div class="ability"><strong>INT</strong><span>${
                    monsterData.intelligence
                  } (${formatModifier(monsterData.intelligence)})</span></div>
                  <div class="ability"><strong>WIS</strong><span>${
                    monsterData.wisdom
                  } (${formatModifier(monsterData.wisdom)})</span></div>
                  <div class="ability"><strong>CHA</strong><span>${
                    monsterData.charisma
                  } (${formatModifier(monsterData.charisma)})</span></div>
                </div>

                <div class="monster-details">
                  <p><strong>Challenge:</strong> ${
                    monsterData.challenge_rating
                  } (${monsterData.xp} XP)</p>
                  <p><strong>Languages:</strong> ${
                    monsterData.languages || "-"
                  }</p>
                </div>

                <div class="monster-actions">
                  <h3>Actions</h3>
                  ${formatList(monsterData.actions)}
                  
                  ${
                    monsterData.special_abilities?.length
                      ? `<h3>Special Abilities</h3>${formatList(
                          monsterData.special_abilities
                        )}`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .catch((error) => {
            console.error(error);
            monsterResult.innerHTML =
              "Erreur lors de la récupération des détails.";
          });
      } else {
        monsterResult.innerHTML = "Monstre non trouvé.";
      }
    })
    .catch((error) => {
      console.error(error);
      monsterResult.innerHTML = "Erreur lors de la recherche des monstres.";
    });
}
