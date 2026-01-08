class DndNavbar extends HTMLElement {
    constructor() {
        super();
        this.rootPath = this.getAttribute("root") || ".";
    }

    connectedCallback() {
        this.innerHTML = `
        <style>
            /* --- NAVBAR STYLES --- */
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
            
            /* --- SEARCH BAR --- */
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

            /* --- DROPDOWN RESULTS --- */
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
            .type-tag {
                font-size: 0.75rem;
                padding: 2px 6px;
                border-radius: 4px;
                background: #eee;
                color: #666;
                text-transform: uppercase;
                font-weight: bold;
            }

            /* --- MODAL (POPUP) --- */
            .modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                backdrop-filter: blur(3px);
            }
            .modal-overlay.open { display: flex; }
            .modal-content {
                background: transparent;
                padding: 0;
                border-radius: 8px;
                max-width: 700px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #8b0000;
                color: white;
                border: none;
                width: 30px; 
                height: 30px;
                border-radius: 50%;
                font-weight: bold;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            }

            /* --- CARD STYLES --- */
            .monster-card {
                background-color: #fdf1dc;
                border: 4px solid #8b0000;
                border-radius: 4px;
                padding: 20px;
                color: #333;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                font-family: Arial, sans-serif;
                text-align: left;
            }
            .monster-header h2 { color: #8b0000; margin: 0 0 5px 0; border-bottom: 2px solid #8b0000; }
            .monster-header p { font-style: italic; margin: 0 0 15px 0; color: #555; }
            .monster-image { width: 100%; max-height: 250px; object-fit: contain; margin-bottom: 15px; background: #eee; }
            .monster-stats-top p { margin: 5px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            
            /* Markdown simple pour les Règles */
            .markdown-content h3 { margin-top: 15px; color:#8b0000; }
            .markdown-content ul { margin-bottom: 10px; padding-left: 20px; }
            
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
                <input type="text" id="globalSearchInput" placeholder="Rechercher (Règles, Dons, Sorts...)" autocomplete="off" />
                <div id="globalSearchResults" class="search-dropdown"></div>
            </div>
        </nav>

        <div id="cardModal" class="modal-overlay">
            <div class="modal-content">
                <button class="close-modal" id="closeModalBtn">X</button>
                <div id="modalBody"></div>
            </div>
        </div>
        `;

        this.initSearch();
        this.initModal();
    }

    initModal() {
        const modal = this.querySelector("#cardModal");
        const closeBtn = this.querySelector("#closeModalBtn");

        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    async initSearch() {
        const input = this.querySelector("#globalSearchInput");
        const resultsDiv = this.querySelector("#globalSearchResults");

        // --- 1. LISTE COMPLÈTE DES ENDPOINTS ---
        // Cette liste contient TOUT ce qui est disponible dans l'API 2014
        const endpoints = [
            { url: "monsters", type: "Monstre" },
            { url: "spells", type: "Sort" },
            { url: "classes", type: "Classe" },
            { url: "races", type: "Race" },
            { url: "equipment", type: "Item" },
            { url: "magic-items", type: "Item Magique" },
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
            { url: "ability-scores", type: "Caractéristique" },
            { url: "weapon-properties", type: "Propriété Arme" },
            { url: "equipment-categories", type: "Catégorie Item" }
        ];

        let allItems = [];

        try {
            // --- 2. CHARGEMENT PARALLÈLE ---
            const promises = endpoints.map(ep =>
                fetch(`https://www.dnd5eapi.co/api/2014/${ep.url}`)
                    .then(r => r.json())
                    .then(data => {
                        return data.results.map(item => ({
                            ...item,
                            type: ep.type,
                            rawType: ep.url // Sert à savoir quel affichage utiliser
                        }));
                    })
                    .catch(() => [])
            );

            const results = await Promise.all(promises);
            allItems = results.flat();
            console.log(`D&D Navbar chargée : ${allItems.length} éléments disponibles.`);

        } catch (e) { console.error("Erreur chargement navbar", e); }

        // --- 3. LOGIQUE DE RECHERCHE ---
        input.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsDiv.innerHTML = "";

            if (query.length < 2) {
                resultsDiv.classList.remove("active");
                return;
            }

            // Filtrage : On cherche dans le NOM ou dans le TYPE (Catégorie)
            const hits = allItems.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query)
            );

            const itemsToShow = hits.slice(0, 100); // Affiche les 100 premiers résultats

            if (itemsToShow.length > 0) {
                resultsDiv.classList.add("active");
                const fragment = document.createDocumentFragment();

                itemsToShow.forEach(hit => {
                    const div = document.createElement("div");
                    div.className = "search-result-item";
                    div.innerHTML = `<span>${hit.name}</span><span class="type-tag">${hit.type}</span>`;

                    div.addEventListener("click", () => {
                        this.fetchAndShow(hit);
                        resultsDiv.classList.remove("active");
                        input.value = "";
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

    // --- 4. AFFICHAGE DÉTAILLÉ (MODALE) ---
    async fetchAndShow(item) {
        const modal = this.querySelector("#cardModal");
        const body = this.querySelector("#modalBody");

        body.innerHTML = `<div class="monster-card" style="text-align:center; padding:50px; font-size:1.2rem;">Chargement...</div>`;
        modal.classList.add("open");

        try {
            const url = item.url.startsWith("http") ? item.url : `https://www.dnd5eapi.co${item.url}`;
            const res = await fetch(url);
            const data = await res.json();

            // Switch intelligent pour choisir le bon template HTML selon le type
            switch (item.rawType) {
                case 'monsters': body.innerHTML = this.renderMonster(data); break;
                case 'classes': body.innerHTML = this.renderClass(data); break;
                case 'spells': body.innerHTML = this.renderSpell(data); break;
                case 'equipment':
                case 'magic-items': body.innerHTML = this.renderItem(data, item.type); break;
                case 'races': body.innerHTML = this.renderRace(data); break;
                case 'rules':
                case 'rule-sections': body.innerHTML = this.renderRule(data, item.type); break;
                default: body.innerHTML = this.renderGeneric(data, item.type); // Pour tout le reste
            }

        } catch (error) {
            console.error(error);
            body.innerHTML = `<div class="monster-card"><p>Erreur lors de la récupération des données.</p></div>`;
        }
    }

    // --- 5. TEMPLATES HTML ---

    renderRule(data, type) {
        let content = data.desc || "";
        // Nettoyage Markdown
        content = content
            .replace(/^# (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h4>$1</h4>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>${type}</em></p>
            </div>
            <div class="markdown-content">
                ${content ? `<p>${content}</p>` : ""}
                ${data.subsections ? `<h3>Sous-sections</h3><ul>${data.subsections.map(s => `<li>${s.name}</li>`).join("")}</ul>` : ""}
            </div>
        </div>`;
    }

    renderRace(data) {
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>Race - Vitesse: ${data.speed}ft</em></p>
            </div>
            <div class="monster-stats-top" style="display:flex; gap:20px; border-bottom:1px solid #ccc; padding-bottom:10px;">
                <span><strong>Taille:</strong> ${data.size}</span>
                <span><strong>Alignement:</strong> ${data.alignment ? "Voir desc." : "Variable"}</span>
            </div>
            <div class="monster-actions">
                <h3>Traits & Bonus</h3>
                ${data.traits ? `<ul>${data.traits.map(t => `<li><strong>${t.name}</strong></li>`).join("")}</ul>` : "<p>Aucun trait.</p>"}
                <p>${data.age_desc || ""}</p>
            </div>
        </div>`;
    }

    renderGeneric(data, type) {
        let desc = "";
        if (data.desc) {
            desc = Array.isArray(data.desc) ? data.desc.join("<br><br>") : data.desc;
        }
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>${type}</em></p>
            </div>
            <div class="monster-actions">
                <p>${desc || "Pas de description détaillée disponible."}</p>
                ${data.prerequisites ? `<p><strong>Prérequis:</strong> ${data.prerequisites.map(p => p.ability_score ? `${p.ability_score.name} ${p.minimum_score}` : p.name).join(", ")}</p>` : ""}
            </div>
        </div>`;
    }

    renderMonster(data) {
        const image = data.image ? `https://www.dnd5eapi.co${data.image}` : "";
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>${data.size} ${data.type}, ${data.alignment}</em></p>
            </div>
            ${image ? `<img src="${image}" class="monster-image">` : ""}
            <div class="monster-stats-top">
                <p><strong>AC:</strong> ${this.formatAC(data.armor_class)}</p>
                <p><strong>HP:</strong> ${data.hit_points} (${data.hit_dice})</p>
            </div>
            <div class="ability-scores">${this.renderStats(data)}</div>
            <div class="monster-actions">
                <h3>Actions</h3>
                ${this.formatList(data.actions)}
            </div>
        </div>`;
    }

    renderClass(data) {
        const imagePath = `${this.rootPath}/images/classes/${data.index}.jpg`;
        const placeholder = `https://placehold.co/600x400/8b0000/FFF?text=${data.name}`;
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>Class (Héros)</em></p>
            </div>
            <img src="${imagePath}" class="monster-image" onerror="this.src='${placeholder}'">
            <div class="monster-stats-top">
                <p><strong>Dé de vie:</strong> d${data.hit_die}</p>
                <p><strong>Sauvegardes:</strong> ${data.saving_throws.map(s => s.name).join(", ")}</p>
            </div>
        </div>`;
    }

    renderSpell(data) {
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>${data.level === 0 ? "Cantrip" : "Niveau " + data.level} • ${data.school.name}</em></p>
            </div>
            <div class="monster-stats-top">
                <p><strong>Temps:</strong> ${data.casting_time} | <strong>Portée:</strong> ${data.range}</p>
            </div>
            <div class="monster-actions">
                <p>${data.desc.join("<br><br>")}</p>
            </div>
        </div>`;
    }

    renderItem(data, type) {
        return `
        <div class="monster-card">
            <div class="monster-header">
                <h2>${data.name}</h2>
                <p><em>${type}</em></p>
            </div>
            <div class="monster-stats-top">
                <p><strong>Coût:</strong> ${data.cost ? data.cost.quantity + " " + data.cost.unit : "-"}</p>
            </div>
            <div class="monster-actions">
                ${data.desc ? `<ul>${data.desc.map(d => `<li>${d}</li>`).join("")}</ul>` : ""}
            </div>
        </div>`;
    }

    // --- HELPERS ---
    formatAC(ac) { return ac ? ac.map(a => `${a.value} (${a.type})`).join(", ") : "N/A"; }
    formatList(l) { if (!l) return ""; return `<ul>${l.map(i => `<li><strong>${i.name}:</strong> ${i.desc}</li>`).join("")}</ul>`; }
    renderStats(d) {
        const stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
        return stats.map(s => {
            const mod = Math.floor((d[s] - 10) / 2);
            return `<div class="ability"><strong>${s.slice(0, 3).toUpperCase()}</strong><span>${d[s]}</span></div>`;
        }).join("");
    }
}

customElements.define("dnd-navbar", DndNavbar);