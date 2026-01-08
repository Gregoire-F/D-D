class DndNavbar extends HTMLElement {
    constructor() {
        super();
        this.rootPath = this.getAttribute("root") || ".";
    }

    connectedCallback() {
        this.innerHTML = `
        <style>
            .main-navbar {
                background-color: #8b0000;
                padding: 1rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                font-family: sans-serif;
                position: relative;
                z-index: 1000;
            }
            .nav-brand {
                font-size: 1.5rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                color: white;
                text-decoration: none;
            }
            .global-search-container {
                position: relative;
                width: 100%;
                max-width: 500px;
            }
            #globalSearchInput {
                width: 100%;
                padding: 10px 15px;
                border-radius: 20px;
                border: none;
                font-size: 0.9rem;
                outline: none;
            }
            .search-dropdown {
                position: absolute;
                top: 110%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                max-height: 60vh;
                overflow-y: auto;
                display: none;
                flex-direction: column;
                color: #333;
                text-align: left;
                z-index: 1001;
            }
            .search-dropdown.active { display: flex; }
            .search-result-item {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                color: #333;
                text-decoration: none;
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
                cursor: pointer;
            }
            .search-result-item:hover { background-color: #fdf1dc; }
            .type-tag { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: #eee; color: #666; font-weight: bold; }
            
            @media (max-width: 768px) {
                .main-navbar { flex-direction: column; gap: 10px; }
                .global-search-container { width: 100%; }
            }
        </style>

        <nav class="main-navbar">
            <a href="${this.rootPath}/index.html" class="nav-brand">
                <i class="fas fa-dice-d20"></i> D&D Codex
            </a>
            <div class="global-search-container">
                <input type="text" id="globalSearchInput" placeholder="Rechercher (Dragon, Sort, Règle...)" autocomplete="off" />
                <div id="globalSearchResults" class="search-dropdown"></div>
            </div>
        </nav>
        `;

        this.initSearch();
    }

    async initSearch() {
        const input = this.querySelector("#globalSearchInput");
        const resultsDiv = this.querySelector("#globalSearchResults");

        // Liste complète des endpoints
        const endpoints = [
            { url: "monsters", type: "Monstre" },
            { url: "spells", type: "Sort" },
            { url: "classes", type: "Classe" },
            { url: "equipment", type: "Item" },
            { url: "magic-items", type: "Item Magique" },
            { url: "races", type: "Race" },
            { url: "rules", type: "Règle" },
            { url: "rule-sections", type: "Section Règle" },
            { url: "feats", type: "Don" },
            { url: "traits", type: "Trait" },
            { url: "skills", type: "Compétence" },
            { url: "features", type: "Aptitude" },
            { url: "languages", type: "Langue" },
            { url: "subclasses", type: "Sous-classe" },
            { url: "proficiencies", type: "Maîtrise" },
            { url: "alignments", type: "Alignement" },
            { url: "backgrounds", type: "Historique" },
            { url: "conditions", type: "État" },
            { url: "damage-types", type: "Type Dégât" },
            { url: "magic-schools", type: "École Magie" },
            { url: "ability-scores", type: "Caractéristique" }
        ];

        let allItems = [];

        try {
            const promises = endpoints.map(ep =>
                fetch(`https://www.dnd5eapi.co/api/2014/${ep.url}`)
                    .then(r => r.json())
                    .then(data => data.results.map(item => ({ ...item, type: ep.type })))
                    .catch(() => [])
            );

            const results = await Promise.all(promises);
            allItems = results.flat();
            console.log(`D&D Navbar: ${allItems.length} éléments chargés.`);

        } catch (e) { console.error("Erreur chargement navbar", e); }

        input.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsDiv.innerHTML = "";

            if (query.length < 2) {
                resultsDiv.classList.remove("active");
                return;
            }

            const hits = allItems.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query)
            ).slice(0, 100);

            if (hits.length > 0) {
                resultsDiv.classList.add("active");
                const fragment = document.createDocumentFragment();

                hits.forEach(hit => {
                    const div = document.createElement("div");
                    div.className = "search-result-item";
                    div.innerHTML = `<span>${hit.name}</span><span class="type-tag">${hit.type}</span>`;

                    // --- CORRECTION DU LIEN ---
                    div.addEventListener("click", () => {
                        // On utilise this.rootPath qui pointe déjà vers la racine (ex: "src" ou ".")
                        // On ajoute ensuite le chemin vers la fiche SANS répéter "src"
                        const targetUrl = `${this.rootPath}/pages/fiche/fiche.html?url=${hit.url}&type=${hit.type}`;
                        window.location.href = targetUrl;
                    });

                    fragment.appendChild(div);
                });

                resultsDiv.appendChild(fragment);
            } else {
                resultsDiv.classList.remove("active");
            }
        });

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
                resultsDiv.classList.remove("active");
            }
        });
    }
}

customElements.define("dnd-navbar", DndNavbar);