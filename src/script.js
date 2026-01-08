// ========================================
// DÉCLARATION DES VARIABLES DOM
// ========================================
// Récupération des éléments du formulaire
const monsterInput = document.getElementById("monsterInput");
const searchButton = document.getElementById("searchButton");
// Récupération des zones d'affichage
const monsterResult = document.getElementById("monsterResult");
const monsterSelect = document.getElementById("monsterSelect");

// ========================================
// CHARGEMENT INITIAL DE LA PAGE
// ========================================
// Peupler le menu déroulant avec la liste des monstres
window.addEventListener("DOMContentLoaded", () => {
  // Appel API pour récupérer tous les monstres disponibles
  fetch(`https://www.dnd5eapi.co/api/2014/monsters`)
    .then((response) => response.json())
    .then((data) => {
      // Tri alphabétique des monstres par nom
      const monsters = data.results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      // Création des options du menu déroulant
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

// ========================================
// GESTION DES ÉVÉNEMENTS UTILISATEUR
// ========================================
// Événement clic sur le bouton de recherche
searchButton.addEventListener("click", () => {
  const monsterName = monsterInput.value.toLowerCase();
  if (monsterName) {
    searchMonster(monsterName);
  } else {
    monsterResult.innerHTML = "Veuillez entrer un nom de monstre.";
  }
});

// Événement changement dans le menu déroulant
monsterSelect.addEventListener("change", (e) => {
  const monsterName = e.target.value;
  if (monsterName) {
    // Synchronisation du champ de saisie avec le menu déroulant
    monsterInput.value = e.target.options[e.target.selectedIndex].text;
    searchMonster(monsterName);
  }
});

// ========================================
// FONCTIONS DE FORMATTAGE DES DONNÉES
// ========================================
// Formatage de l'Armor Class (peut avoir plusieurs types)
function formatAC(ac) {
  if (!ac) return "N/A";
  return ac.map((item) => `${item.value} (${item.type})`).join(", ");
}

// Formatage de la vitesse (peut avoir plusieurs types de déplacement)
function formatSpeed(speed) {
  if (!speed) return "N/A";
  return Object.entries(speed)
    .map(([type, val]) => `${type}: ${val}`)
    .join(", ");
}

// Calcul du modificateur de caractéristique
function formatModifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : mod;
}

// Formatage des listes d'actions et capacités spéciales
function formatList(list) {
  if (!list || list.length === 0) return "None";
  return `<ul>${list
    .map((item) => `<li><strong>${item.name}:</strong> ${item.desc}</li>`)
    .join("")}</ul>`;
}

// ========================================
// FONCTION PRINCIPALE DE RECHERCHE
// ========================================
function searchMonster(monsterName) {
  // Message de chargement pendant la recherche
  monsterResult.innerHTML = "Recherche en cours...";

  // Première requête : récupérer la liste complète des monstres
  fetch(`https://www.dnd5eapi.co/api/2014/monsters`)
    .then((response) => response.json())
    .then((data) => {
      const monsters = data.results;
      // Recherche du monstre correspondant au nom saisi
      const matchedMonster = monsters.find(
        (monster) => monster.name.toLowerCase() === monsterName
      );

      if (matchedMonster) {
        // Deuxième requête : récupérer les détails complets du monstre
        fetch(`https://www.dnd5eapi.co${matchedMonster.url}`)
          .then((monsterResponse) => monsterResponse.json())
          .then((monsterData) => {
            // Construction de la fiche de monstre avec toutes ses informations
            monsterResult.innerHTML = `
              <div class="monster-card">
                <!-- En-tête avec nom et caractéristiques de base -->
                <div class="monster-header">
                  <h2>${monsterData.name}</h2>
                  <p><em>${monsterData.size} ${monsterData.type}, ${
              monsterData.alignment
            }</em></p>
                </div>
                
                <!-- Image du monstre si disponible -->
                ${
                  monsterData.image
                    ? `<img src="https://www.dnd5eapi.co${monsterData.image}" alt="${monsterData.name}" class="monster-image">`
                    : ""
                }

                <!-- Statistiques principales de combat -->
                <div class="monster-stats-top">
                  <p><strong class="tooltip" data-tooltip="Armor Class (AC) : Difficulté pour toucher la créature.&#10;(Dex) : basée sur la Dextérité&#10;(Natural) : caractéristique de base">Armor Class:</strong> ${formatAC(
                    monsterData.armor_class
                  )}</p>
                  <p><strong class="tooltip" data-tooltip="Hit Points (HP) : Points de vie de la créature.&#10;Indique combien de dégâts elle peut subir avant d'être vaincue">Hit Points:</strong> ${
                    monsterData.hit_points
                  } (${monsterData.hit_dice})</p>
                  <p><strong class="tooltip" data-tooltip="Speed : Vitesse de déplacement de la créature.&#10;Différents types : walk, fly, swim, burrow, climb">Speed:</strong> ${formatSpeed(
                    monsterData.speed
                  )}</p>
                </div>

                <!-- Caractéristiques avec modificateurs -->
                <div class="ability-scores">
                  <div class="ability"><strong class="tooltip" data-tooltip="Strength (STR) : Force physique.&#10;Influence les attaques en mêlée et le port de charge">STR</strong><span>${
                    monsterData.strength
                  } (${formatModifier(monsterData.strength)})</span></div>
                  <div class="ability"><strong class="tooltip" data-tooltip="Dexterity (DEX) : Agilité et coordination.&#10;Influence l'Armure, l'initiative et les attaques à distance">DEX</strong><span>${
                    monsterData.dexterity
                  } (${formatModifier(monsterData.dexterity)})</span></div>
                  <div class="ability"><strong class="tooltip" data-tooltip="Constitution (CON) : Endurance et vitalité.&#10;Influence les points de vie et la résistance aux effets">CON</strong><span>${
                    monsterData.constitution
                  } (${formatModifier(monsterData.constitution)})</span></div>
                  <div class="ability"><strong class="tooltip" data-tooltip="Intelligence (INT) : Raisonnement et mémoire.&#10;Influence les compétences de connaissance et la magie d'arcane">INT</strong><span>${
                    monsterData.intelligence
                  } (${formatModifier(monsterData.intelligence)})</span></div>
                  <div class="ability"><strong class="tooltip" data-tooltip="Wisdom (WIS) : Perception et intuition.&#10;Influence les compétences de perception et la magie divine">WIS</strong><span>${
                    monsterData.wisdom
                  } (${formatModifier(monsterData.wisdom)})</span></div>
                  <div class="ability"><strong class="tooltip" data-tooltip="Charisma (CHA) : Force de personnalité.&#10;Influence les compétences sociales et la magie d'influence">CHA</strong><span>${
                    monsterData.charisma
                  } (${formatModifier(monsterData.charisma)})</span></div>
                </div>

                <!-- Informations de jeu et caractéristiques supplémentaires -->
                <div class="monster-details">
                  <p><strong class="tooltip" data-tooltip="Challenge Rating (CR) : Niveau de puissance du monstre.&#10;Indique la difficulté du combat et les XP récompenses">Challenge:</strong> ${
                    monsterData.challenge_rating
                  } (${monsterData.xp} XP)</p>
                  <p><strong>Languages:</strong> ${
                    monsterData.languages || "-"
                  }</p>
                </div>

                <!-- Actions et capacités spéciales du monstre -->
                <div class="monster-actions">
                  <h3>Actions</h3>
                  ${formatList(monsterData.actions)}
                   
                  <!-- Capacités spéciales si elles existent -->
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
          // Gestion des erreurs lors de la récupération des détails
          .catch((error) => {
            console.error(error);
            monsterResult.innerHTML =
              "Erreur lors de la récupération des détails.";
          });
      } else {
        // Message si le monstre n'est pas trouvé dans la liste
        monsterResult.innerHTML = "Monstre non trouvé.";
      }
    })
    // Gestion des erreurs lors de la recherche initiale
    .catch((error) => {
      console.error(error);
      monsterResult.innerHTML = "Erreur lors de la recherche des monstres.";
    });
}
