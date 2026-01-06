const API_BASE_URL = "https://www.dnd5eapi.co/api";

const btnMonsters = document.getElementById("btn-monsters");
const btnSpells = document.getElementById("btn-spells");
const btnItems = document.getElementById("btn-items");
const resultsSection = document.getElementById("results-section");
const resultsContainer = document.getElementById("results-container");
const resultsTitle = document.getElementById("results-title");
const detailContainer = document.getElementById("detail-container");
const backBtn = document.getElementById("back-to-categories");
const categoriesDiv = document.querySelector(".categories");

// --- Event Listeners ---

btnMonsters.addEventListener("click", () =>
  fetchCategory("monsters", "Monstres")
);
btnSpells.addEventListener("click", () => fetchCategory("spells", "Sorts"));
btnItems.addEventListener("click", () => fetchCategory("equipment", "Items"));

backBtn.addEventListener("click", () => {
  resultsSection.classList.remove("active");
  categoriesDiv.style.display = "grid";
  detailContainer.innerHTML = "";
});

// --- Core Functions ---

async function fetchCategory(endpoint, title) {
  categoriesDiv.style.display = "none";
  resultsSection.classList.add("active");
  resultsTitle.textContent = `Chargement des ${title}...`;
  resultsContainer.innerHTML = "";
  detailContainer.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    const data = await response.json();

    resultsTitle.textContent = title;
    renderList(data.results, endpoint);
  } catch (error) {
    console.error("Error fetching data:", error);
    resultsTitle.textContent = "Erreur lors du chargement";
  }
}

function renderList(items, endpoint) {
  resultsContainer.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.textContent = item.name;
    div.addEventListener("click", () => fetchDetails(item.url, endpoint));
    resultsContainer.appendChild(div);
  });
}

async function fetchDetails(url, category) {
  detailContainer.innerHTML = "<p>Chargement des détails...</p>";
  resultsContainer.style.display = "none";

  try {
    const response = await fetch(`https://www.dnd5eapi.co${url}`);
    const data = await response.json();
    renderDetails(data, category);
  } catch (error) {
    console.error("Error fetching details:", error);
    detailContainer.innerHTML = "<p>Erreur lors du chargement des détails.</p>";
  }
}

function renderDetails(data, category) {
  let html = `<div class="detail-view">
    <span class="close-detail" onclick="closeDetails()">&times;</span>
    <h2>${data.name}</h2>`;

  if (category === "monsters") {
    html += `
      <p><em>${data.size} ${data.type}, ${data.alignment}</em></p>
      <div class="stats">
        <p><strong>AC:</strong> ${data.armor_class[0].value}</p>
        <p><strong>HP:</strong> ${data.hit_points} (${data.hit_dice})</p>
      </div>
      <div class="abilities">
        <p>STR: ${data.strength} | DEX: ${data.dexterity} | CON: ${data.constitution}</p>
        <p>INT: ${data.intelligence} | WIS: ${data.wisdom} | CHA: ${data.charisma}</p>
      </div>`;
  } else if (category === "spells") {
    html += `
      <p><em>Niveau ${data.level} - ${data.school.name}</em></p>
      <p><strong>Temps d'incantation:</strong> ${data.casting_time}</p>
      <p><strong>Portée:</strong> ${data.range}</p>
      <p><strong>Composantes:</strong> ${data.components.join(", ")}</p>
      <p><strong>Durée:</strong> ${data.duration}</p>
      <div class="description">${data.desc.join("<br><br>")}</div>`;
  } else {
    html += `
      <p><em>${data.equipment_category.name}</em></p>
      ${
        data.cost
          ? `<p><strong>Coût:</strong> ${data.cost.quantity} ${data.cost.unit}</p>`
          : ""
      }
      ${data.weight ? `<p><strong>Poids:</strong> ${data.weight} lb</p>` : ""}
      <div class="description">${
        data.desc
          ? data.desc.join("<br>")
          : "Pas de description supplémentaire."
      }</div>`;
  }

  html += `</div>`;
  detailContainer.innerHTML = html;
}

function closeDetails() {
  detailContainer.innerHTML = "";
  resultsContainer.style.display = "grid";
}
