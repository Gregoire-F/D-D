class FavoriteToggle extends HTMLElement {
  static get observedAttributes() {
    return ["entity", "index", "name", "url"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector("button")
      .addEventListener("click", () => this.toggle());
  }

  get storageKey() {
    return "favorites";
  }

  get data() {
    return {
      entity: this.getAttribute("entity"),
      index: this.getAttribute("index"),
      name: this.getAttribute("name"),
      url: this.getAttribute("url"),
    };
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  saveFavorites(favorites) {
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }

  isFavorite() {
    return this.getFavorites().some(
      fav => fav.entity === this.data.entity && fav.index === this.data.index
    );
  }

  toggle() {
    let favorites = this.getFavorites();

    if (this.isFavorite()) {
      favorites = favorites.filter(
        fav => !(fav.entity === this.data.entity && fav.index === this.data.index)
      );
    } else {
      favorites.push(this.data);
    }

    this.saveFavorites(favorites);
    this.render();

    this.dispatchEvent(new CustomEvent("favorite-change", {
      detail: {
        favorite: this.isFavorite(),
        data: this.data
      },
      bubbles: true
    }));
  }

  render() {
    const active = this.isFavorite();

    this.shadowRoot.innerHTML = `
      <style>
        button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
        }
        .active {
          color: goldenrod;
        }
      </style>

      <button class="${active ? "active" : ""}">
        ${active ? "★ En favori" : "☆ Ajouter aux favoris"}
      </button>
    `;
  }
}

customElements.define("favorite-toggle", FavoriteToggle);
