/**
 * <dnd-search-bar> - Barre de recherche configurable pour D&D
 *
 * @attr {string} placeholder - Texte du placeholder
 * @attr {boolean} show-button - Affiche le bouton de recherche (défaut: true)
 * @attr {string} button-text - Texte du bouton (défaut: "Rechercher")
 * @attr {boolean} realtime - Active la recherche temps réel (défaut: false)
 * @attr {number} debounce - Délai en ms pour le mode temps réel (défaut: 300)
 *
 * @fires dnd-search - Déclenché lors d'une recherche (detail: {query})
 *
 * @example
 * <dnd-search-bar
 *   placeholder="Entrez un nom de monstre"
 *   show-button="true">
 * </dnd-search-bar>
 */
class DndSearchBar extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'show-button', 'button-text', 'realtime', 'debounce'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._debounceTimer = null;
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.shadowRoot.innerHTML) {
      this.render();
      this._setupEventListeners();
    }
  }

  // Getters pour les attributs
  get placeholder() {
    return this.getAttribute('placeholder') || 'Rechercher...';
  }

  get showButton() {
    const attr = this.getAttribute('show-button');
    return attr === null || attr === 'true';
  }

  get buttonText() {
    return this.getAttribute('button-text') || 'Rechercher';
  }

  get realtime() {
    return this.getAttribute('realtime') === 'true';
  }

  get debounceDelay() {
    return parseInt(this.getAttribute('debounce'), 10) || 300;
  }

  // Getter/Setter pour la valeur
  get value() {
    const input = this.shadowRoot.querySelector('input');
    return input ? input.value : '';
  }

  set value(val) {
    const input = this.shadowRoot.querySelector('input');
    if (input) input.value = val;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .search-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        input {
          flex: 1;
          min-width: 200px;
          padding: 8px;
          border: 1px solid var(--dnd-border-color, #ccc);
          border-radius: 4px;
          font-size: 14px;
        }

        input:focus {
          outline: none;
          border-color: var(--dnd-primary-color, #900909);
        }

        button {
          background-color: var(--dnd-primary-color, #900909);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        button:hover {
          background-color: var(--dnd-primary-hover, #a00);
        }

        button:active {
          transform: scale(0.98);
        }
      </style>

      <div class="search-container">
        <input
          type="text"
          placeholder="${this.placeholder}"
        />
        ${this.showButton ? `<button type="button">${this.buttonText}</button>` : ''}
      </div>
    `;
  }

  _setupEventListeners() {
    const input = this.shadowRoot.querySelector('input');
    const button = this.shadowRoot.querySelector('button');

    // Recherche via bouton
    if (button) {
      button.addEventListener('click', () => this._emitSearch());
    }

    // Recherche via Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this._emitSearch();
      }
    });

    // Recherche temps réel avec debounce
    if (this.realtime) {
      input.addEventListener('input', () => {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this._emitSearch();
        }, this.debounceDelay);
      });
    }
  }

  _emitSearch() {
    const query = this.value.trim();
    this.dispatchEvent(new CustomEvent('dnd-search', {
      detail: { query },
      bubbles: true,
      composed: true
    }));
  }

  // Méthode publique pour focus
  focus() {
    const input = this.shadowRoot.querySelector('input');
    if (input) input.focus();
  }

  // Méthode publique pour clear
  clear() {
    this.value = '';
  }
}

customElements.define('dnd-search-bar', DndSearchBar);
