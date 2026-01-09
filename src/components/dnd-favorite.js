// class FavoritesGlobal extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" });
//   }

//   connectedCallback() {
//     this.render();
//   }

//   render() {
//     const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

//     if (!favorites.length) {
//       this.shadowRoot.innerHTML = `<p>Aucun favori pour le moment.</p>`;
//       return;
//     }

//     this.shadowRoot.innerHTML = `
//       <style>
//         a { text-decoration: none; color: inherit; display: block; margin-bottom: 8px; }
//         a:hover { color: #8b0000; }
//       </style>
//       <h2>Mes favoris</h2>
//       <ul>
//         ${favorites
//           .map(
//             (f) =>
//               `<li><a href="pages/fiche/fiche.html?url=${encodeURIComponent(
//                 f.url
//               )}&type=${encodeURIComponent(f.entity)}">${f.name}</a>

// </li>`
//           )
//           .join("")}
//       </ul>
//     `;
//   }
// }

// customElements.define("favorites-global", FavoritesGlobal);

class FavoritesGlobal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  get favorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  }

  render() {
    const favorites = this.favorites;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 300px;
          font-family: inherit;
        }

        button {
          width: 100%;
          background: #8b0000;
          color: white;
          border: none;
          padding: 12px 16px;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        button:hover {
          background: #a00000;
        }

        .menu {
         position: absolute;
         z-index:10;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          padding: 12px;
          display: none;
        }

        .menu.open {
          display: block;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 8px;
        }

        a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
        }

        a:hover {
          color: #8b0000;
        }

        .empty {
          font-style: italic;
          color: #777;
        }
      </style>

      <button id="toggle">
        ⭐ Favoris
        <span id="arrow">▾</span>
      </button>

      <div class="menu" id="menu">
        ${
          favorites.length
            ? `<ul>
                ${favorites
                  .map(
                    (f) => `
                      <li>
                        <a href="pages/fiche/fiche.html?url=${encodeURIComponent(
                          f.url
                        )}&type=${encodeURIComponent(f.entity)}">
                          ${f.name}
                        </a>
                      </li>
                    `
                  )
                  .join("")}
              </ul>`
            : `<p class="empty">Aucun favori pour le moment.</p>`
        }
      </div>
    `;
  }

  attachEvents() {
    const toggle = this.shadowRoot.querySelector("#toggle");
    const menu = this.shadowRoot.querySelector("#menu");

    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
    });

    // Fermer si clic en dehors du composant
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        menu.classList.remove("open");
      }
    });
  }
}

customElements.define("favorites-global", FavoritesGlobal);
