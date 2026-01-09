class FavoritesGlobal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    window.addEventListener("storage", () => this.render());
    document.addEventListener("favorite-change", () => this.render());
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem("dnd-favorites")) || [];
  }

  render() {
    const favorites = this.getFavorites();

    this.shadowRoot.innerHTML = `
      <style>
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: .3rem 0;
        }
        button {
          background: none;
          border: none;
          cursor: pointer;
          color: #4caf50;
        }
        .entity {
          font-size: .8rem;
          opacity: .7;
          margin-left: .5rem;
        }
      </style>

      <h3>⭐ Tous mes favoris</h3>

      ${
        favorites.length
          ? `<ul>
              ${favorites.map(f => `
                <li>
                  <button data-entity="${f.entity}" data-index="${f.index}">
                    ${f.name}
                  </button>
                  <span class="entity">(${f.entity})</span>
                </li>
              `).join("")}
            </ul>`
          : "<p>Aucun favori enregistré</p>"
      }
    `;

    this.shadowRoot.querySelectorAll("button[data-index]")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          this.dispatchEvent(new CustomEvent("favorite-select", {
            detail: {
              entity: btn.dataset.entity,
              index: btn.dataset.index
            },
            bubbles: true
          }));
        });
      });
  }
}

customElements.define("favorites-global", FavoritesGlobal);
