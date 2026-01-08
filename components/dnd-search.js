class DndSearch extends HTMLElement {
  static _fontsLoaded = false;

  static _loadFonts() {
    if (DndSearch._fontsLoaded) return;

    const head = document.head;

    // Preconnect pour performance
    const preconnectGoogle = document.createElement("link");
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";
    head.appendChild(preconnectGoogle);

    const preconnectGstatic = document.createElement("link");
    preconnectGstatic.rel = "preconnect";
    preconnectGstatic.href = "https://fonts.gstatic.com";
    preconnectGstatic.crossOrigin = "anonymous";
    head.appendChild(preconnectGstatic);

    // Charger les polices
    const fontStylesheet = document.createElement("link");
    fontStylesheet.rel = "stylesheet";
    fontStylesheet.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=MedievalSharp&display=swap";
    head.appendChild(fontStylesheet);

    DndSearch._fontsLoaded = true;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render = null;
    DndSearch._loadFonts();
  }

  connectedCallback() {
    const title = this.getAttribute("title") || "Recherche D&D";
    this.endpoint = this.getAttribute("endpoint");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }

        .container {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          text-align: center;
        }

        h1 {
          color: #333;
          margin-top: 0;
        }

        .search-input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .search-button {
          background-color: #900909;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: background-color 0.2s ease;
        }

        .search-button:hover {
          background-color: #a00;
        }

        .dropdown-container {
          margin-bottom: 20px;
        }

        .dropdown-select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          box-sizing: border-box;
        }

        .result-area {
          margin-top: 20px;
          text-align: left;
        }

        /* Slot pour le contenu personnalisé */
        ::slotted(*) {
          display: block;
        }
      </style>

      <div class="container">
        <h1>${title}</h1>
        <input type="text" class="search-input" placeholder="Rechercher..." />
        <button class="search-button">Rechercher</button>
        <div class="dropdown-container">
          <select class="dropdown-select entity-select">
            <option value="">-- Chargement... --</option>
          </select>
        </div>
        <div class="dropdown-container">
          <select class="dropdown-select sort-select">
            <option value="name-asc">Nom (A → Z)</option>
            <option value="name-desc">Nom (Z → A)</option>
          </select>
        </div>
        <div class="result-area"></div>
      </div>
    `;

    this.input = this.shadowRoot.querySelector(".search-input");
    this.select = this.shadowRoot.querySelector(".entity-select");
    this.sortSelect = this.shadowRoot.querySelector(".sort-select");
    this.resultArea = this.shadowRoot.querySelector(".result-area");
    this.btn = this.shadowRoot.querySelector(".search-button");

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
    this.sortSelect.addEventListener("change", () => {
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
      const sortedResults = this.sortResults(data.results, sortMode);
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
