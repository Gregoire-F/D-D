class DndNavbar extends HTMLElement {
    constructor() {
        super();
        this.rootPath = this.getAttribute("root") || ".";
    }

    connectedCallback() {
        // On force le composant lui-même à être un bloc collant
        this.style.display = "block";
        this.style.position = "sticky";
        this.style.top = "0";
        this.style.zIndex = "9999"; // Très haut pour passer au-dessus de tout
        this.style.width = "100%";

        this.innerHTML = `
        <style>
            /* Reset pour éviter les débordements */
            * { box-sizing: border-box; }

            .main-navbar {
                background-color: #8b0000;
                padding: 0.8rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); /* Ombre plus marquée */
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                width: 100%;
                height: 70px; /* Hauteur fixe pour la stabilité */
            }

            .nav-brand {
                font-size: 1.6rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                color: white;
                text-decoration: none;
                transition: opacity 0.2s;
            }
            .nav-brand:hover { opacity: 0.9; }
            
            /* --- BARRE DE RECHERCHE --- */
            .global-search-container {
                position: relative;
                width: 100%;
                max-width: 500px;
            }
            #globalSearchInput {
                width: 100%;
                padding: 10px 20px;
                border-radius: 25px;
                border: none;
                font-size: 0.95rem;
                outline: none;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #globalSearchInput:focus {
                transform: scale(1.02);
                box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
            }

            /* --- RESULTATS DÉROULANTS --- */
            .search-dropdown {
                position: absolute;
                top: 120%; /* Un peu plus bas pour l'esthétique */
                left: 0;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                max-height: 60vh;
                overflow-y: auto;
                display: none;
                flex-direction: column;
                color: #333;
                text-align: left;
                z-index: 10000; /* Encore plus haut */
                border: 1px solid #eee;
            }
            .search-dropdown.active { display: flex; }

            /* Scrollbar personnalisée pour la liste */
            .search-dropdown::-webkit-scrollbar { width: 8px; }
            .search-dropdown::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
            
            .search-result-item {
                padding: 12px 20px;
                border-bottom: 1px solid #f0f0f0;
                color: #333;
                text-decoration: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.95rem;
                cursor: pointer;
                transition: background 0.1s;
            }
            .search-result-item:last-child { border-bottom: none; }
            .search-result-item:hover { 
                background-color: #fdf1dc; 
                color: #8b0000;
            }
            
            .type-tag { 
                font-size: 0.7rem; 
                padding: 3px 8px; 
                border-radius: 12px; 
                background: #eee; 
                color: #666; 
                font-weight: bold; 
                text-transform: uppercase; 
                letter-spacing: 0.5px;
            }
            
            /* Responsive Mobile */
            @media (max-width: 768px) {
                .main-navbar { 
                    flex-direction: column; 
                    height: auto; 
                    padding: 1rem;
                    gap: 15px; 
                }
                .global-search-container { width: 100%; }
                .nav-brand { font-size: 1.4rem; }
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

        // Liste complète des endpoints API
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
            // Chargement parallèle
            const promises = endpoints.map(ep => 
                fetch(`https://www.dnd5eapi.co/api/2014/${ep.url}`)
                    .then(r => r.json())
                    .then(data => data.results.map(item => ({ ...item, type: ep.type })))
                    .catch(() => []) 
            );

            const results = await Promise.all(promises);
            allItems = results.flat();
            console.log(`D&D Navbar: ${allItems.length} éléments chargés.`);

        } catch(e) { console.error("Erreur chargement navbar", e); }

        input.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsDiv.innerHTML = "";
            
            if (query.length < 2) {
                resultsDiv.classList.remove("active");
                return;
            }

            // Recherche filtrée (top 100)
            const hits = allItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.type.toLowerCase().includes(query)
            ).slice(0, 100);

            if(hits.length > 0) {
                resultsDiv.classList.add("active");
                const fragment = document.createDocumentFragment();

                hits.forEach(hit => {
                    const div = document.createElement("div");
                    div.className = "search-result-item";
                    div.innerHTML = `<span>${hit.name}</span><span class="type-tag">${hit.type}</span>`;
                    
                    // --- REDIRECTION VERS LA FICHE ---
                    div.addEventListener("click", () => {
                        // Utilise le chemin correct vers la page fiche universelle
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

        // Fermeture au clic dehors
        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !resultsDiv.contains(e.target)) {
                resultsDiv.classList.remove("active");
            }
        });
    }
}

customElements.define("dnd-navbar", DndNavbar);