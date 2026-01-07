/**
 * Web Component : CategoryCard
 * Une carte réutilisable pour la page d'accueil D&D qui gère les icônes, le texte et la redirection.
 * Cette version utilise le DOM "léger" (Light DOM) pour permettre un stylage global depuis accueil.css.
 */
class CategoryCard extends HTMLElement {
    constructor() {
        // Appelle le constructeur de la classe parente (HTMLElement)
        super();
    }

    // Appelé lorsque l'élément est inséré dans le document (DOM)
    connectedCallback() {
        this.render();
    }

    // Définit les attributs que le composant doit surveiller pour les changements
    static get observedAttributes() {
        return ["icon", "title", "description", "url"];
    }

    // Appelé chaque fois qu'un des attributs listés dans observedAttributes change
    attributeChangedCallback() {
        this.render();
    }

    // Méthode principale pour générer le contenu HTML du composant
    render() {
        // Récupère les valeurs des attributs ou définit des valeurs par défaut
        const icon = this.getAttribute("icon") || "fas fa-question";
        const title = this.getAttribute("title") || "Titre";
        const description = this.getAttribute("description") || "Description...";
        const url = this.getAttribute("url") || "#";

        // Injecte le template HTML dans l'élément
        this.innerHTML = `
      <div class="category-card">
        <i class="${icon}"></i>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    `;

        // Ajoute un écouteur d'événement pour gérer le clic sur la carte
        this.querySelector(".category-card").addEventListener("click", () => {
            // Redirige vers l'URL spécifiée si elle est valide
            if (url && url !== "#") {
                window.location.href = url;
            }
        });
    }
}

// Enregistre le nouveau composant personnalisé sous le nom "category-card"
customElements.define("category-card", CategoryCard);