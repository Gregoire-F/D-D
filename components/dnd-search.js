class DndSearch extends HTMLElement {
  constructor() {
    super();
    this.render = null;
  }

  connectedCallback() {
    const title = this.getAttribute("title") || "Recherche D&D";
    this.endpoint = this.getAttribute("endpoint");

    this.innerHTML = `
      <div class="container">
        <h1>${title}</h1>
        <input type="text" id="monsterInput" placeholder="Rechercher..." />
        <button id="searchButton">Rechercher</button>
        <div class="dropdown-container">
            <select id="monsterSelect">
                <option value="">-- Chargement... --</option>
            </select>
        </div>
        <div class="dropdown-container">
            <select id="sortSelect">
                <option value="name-asc">Nom (A → Z)</option>
                <option value="name-desc">Nom (Z → A)</option>
            </select>
        </div>
        <div id="monsterResult" class="monster-result"></div>
      </div>
    `;

    this.input = this.querySelector("#monsterInput");
    this.select = this.querySelector("#monsterSelect");
    this.sortSelect = this.querySelector("#sortSelect");
    this.resultArea = this.querySelector("#monsterResult");
    this.btn = this.querySelector("#searchButton");

    if (this.endpoint) {
      this.loadList();
    }

    this.btn.addEventListener("click", () => this.triggerSearch());
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.triggerSearch();
    });
    this.select.addEventListener("change", (e) => {
      if (e.target.value) {
        this.input.value = e.target.options[e.target.selectedIndex].text;
        this.fetchDetails(e.target.value);
      }
    });
    this.sortSelect.addEventListener("change", () => {  //si la valeur change, on l'enregistre
      this.loadList();
    });
  }

  async loadList() {
    try {
      const response = await fetch(
        `https://www.dnd5eapi.co/api/2014/${this.endpoint}`
      );
      const data = await response.json();
      const sortMode = this.sortSelect.value;
      const sortedResults = this.sortResults(data.results, sortMode); // pour stocker la version triée de la liste
      this.select.innerHTML =
        '<option value="">-- Choisissez dans la liste --</option>';
      sortedResults.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.index;
        option.textContent = item.name;
        this.select.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      this.select.innerHTML = "<option>Erreur de chargement</option>";
    }
  }

  // Fonction de tri centralisée
  sortResults(results, mode) {
    const list = [...results];

    switch (mode) {
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));

      case "name-asc":
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  triggerSearch() {
    const query = this.input.value.trim().toLowerCase().replace(/\s+/g, "-");
    if (query) this.fetchDetails(query);
  }

  async fetchDetails(index) {
    this.resultArea.innerHTML = "<p>Recherche en cours...</p>";
    try {
      const response = await fetch(
        `https://www.dnd5eapi.co/api/2014/${this.endpoint}/${index}`
      );
      if (!response.ok) throw new Error("Non trouvé");
      const data = await response.json();

      if (typeof this.render === "function") {
        this.resultArea.innerHTML = this.render(data);
      } else {
        this.resultArea.innerHTML = `<pre>${JSON.stringify(
          data,
          null,
          2
        )}</pre>`;
      }
    } catch (error) {
      this.resultArea.innerHTML = `<p>Aucun résultat trouvé.</p>`;
    }
  }
}

customElements.define("dnd-search", DndSearch);
