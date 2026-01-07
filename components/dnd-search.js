class DndSearch extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._debounce = null;
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Recherche';
        const endpoint = this.getAttribute('endpoint') || '';
        const dataUrl = this.getAttribute('data-url');

        this.shadowRoot.innerHTML = `
            <style>
                :host{display:block;font-family:inherit}
                .card{border:1px solid #ddd;padding:10px;border-radius:6px;background:#fff}
                .title{font-weight:700;margin-bottom:8px}
                input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #ccc;border-radius:4px}
                ul{list-style:none;padding:0;margin:8px 0 0 0;max-height:240px;overflow:auto}
                li{padding:6px;border-bottom:1px solid #f0f0f0;cursor:pointer}
                li:hover{background:#f6f6f6}
                .empty{color:#666;font-size:0.95rem;padding:6px}
            </style>
            <div class="card">
                <div class="title">${title}</div>
                <input placeholder="Rechercher..." aria-label="Recherche" />
                <ul></ul>
            </div>
        `;

        this._input = this.shadowRoot.querySelector('input');
        this._list = this.shadowRoot.querySelector('ul');
        this._endpoint = endpoint;
        this._dataUrl = dataUrl;

        this._input.addEventListener('input', () => this._onInput());

        // Optionally load initial data
        if (this.hasAttribute('load')) {
            this._fetchAndRender('');
        }
    }

    disconnectedCallback() {
        this._input && this._input.removeEventListener('input', () => this._onInput);
    }

    _onInput() {
        clearTimeout(this._debounce);
        this._debounce = setTimeout(() => {
            const q = this._input.value.trim();
            this._fetchAndRender(q);
        }, 300);
    }

    async _fetchAndRender(query) {
        let url = '';
        if (this._dataUrl) {
            url = this._dataUrl + (query ? (`?q=${encodeURIComponent(query)}`) : '');
        } else if (this._endpoint) {
            // Default: call a JSON endpoint at /api/<endpoint>?q=...
            const base = this._endpoint.startsWith('/') ? this._endpoint : `/api/${this._endpoint}`;
            url = base + (query ? (`?q=${encodeURIComponent(query)}`) : '');
        } else {
            this._renderEmpty('Aucun endpoint configuré');
            return;
        }

        try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!Array.isArray(data)) {
                this._renderEmpty('Réponse inattendue (JSON attendu)');
                return;
            }
            this._renderList(data);
        } catch (err) {
            this._renderEmpty('Erreur de récupération');
            console.warn('dnd-search fetch error:', err);
        }
    }

    _renderList(items) {
        this._list.innerHTML = '';
        if (!items.length) {
            this._renderEmpty('Aucun résultat');
            return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            // Support for item being string or object with `name`/`label`/`title`
            const label = (typeof item === 'string') ? item : (item.name || item.label || item.title || JSON.stringify(item));
            li.textContent = label;
            li.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('select', { detail: item, bubbles: true }));
            });
            this._list.appendChild(li);
        });
    }

    _renderEmpty(text) {
        this._list.innerHTML = `<li class="empty">${text}</li>`;
    }
}

customElements.define('dnd-search', DndSearch);

export default DndSearch;
class DndSearch extends HTMLElement {
    constructor() {
        super();
        this.render = null; // La fonction de rendu sera définie par le script de la page
    }

    connectedCallback() {
        const title = this.getAttribute("title") || "Recherche D&D";
        // L'endpoint API (ex: "classes", "monsters", "spells","")
        // classes = héro
        // monsters = monstres
        // spells = sorts
        // equipment = items
        this.endpoint = this.getAttribute("endpoint");

        this.innerHTML = `
      <div class="container">
        <h1>${title}</h1>
        <input type="text" id="monsterInput" placeholder="Rechercher..." />
        <button id="searchButton">Rechercher</button>
        <div class="dropdown-container">
            <select id="monsterSelect">
                <option value="">-- Chargement de la liste... --</option>
            </select>
        </div>
        <div id="monsterResult" class="monster-result"></div>
      </div>
    `;

        this.input = this.querySelector("#monsterInput");
        this.select = this.querySelector("#monsterSelect");
        this.resultArea = this.querySelector("#monsterResult");
        this.btn = this.querySelector("#searchButton");

        // Chargement automatique de la liste au démarrage
        if (this.endpoint) {
            this.loadList();
        }

        // Gestion des événements
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
    }

    // --- 1. Fetch de la liste (Menu déroulant) ---
    async loadList() {
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/2014/${this.endpoint}`);
            const data = await response.json();

            this.select.innerHTML = '<option value="">-- Choisissez dans la liste --</option>';

            data.results
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.index; // On utilise l'index pour la recherche API
                    option.textContent = item.name;
                    this.select.appendChild(option);
                });
        } catch (error) {
            console.error("Erreur liste:", error);
            this.select.innerHTML = '<option>Erreur de chargement</option>';
        }
    }

    // --- 2. Déclenchement recherche ---
    triggerSearch() {
        const query = this.input.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (query) this.fetchDetails(query);
    }

    // --- 3. Fetch du détail (Carte) ---
    async fetchDetails(index) {
        this.resultArea.innerHTML = "<p>Recherche en cours...</p>";
        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/2014/${this.endpoint}/${index}`);
            if (!response.ok) throw new Error("Non trouvé");

            const data = await response.json();

            // C'est ici que la magie opère : on appelle la fonction de rendu définie dans hero.js
            if (typeof this.render === "function") {
                this.resultArea.innerHTML = this.render(data);
            } else {
                this.resultArea.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }

        } catch (error) {
            console.error(error);
            this.resultArea.innerHTML = `<p>Aucun résultat trouvé pour "${index}".</p>`;
        }
    }
}

customElements.define("dnd-search", DndSearch);