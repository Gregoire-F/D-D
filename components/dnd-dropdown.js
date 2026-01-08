/**
 * <dnd-dropdown> - Menu déroulant configurable pour D&D
 *
 * @attr {string} placeholder - Texte de l'option par défaut
 * @attr {boolean} hidden - Masqué par défaut (défaut: false)
 *
 * @fires dnd-select - Déclenché lors d'une sélection (detail: {value, label})
 *
 * @example
 * <dnd-dropdown placeholder="-- Choisissez un monstre --"></dnd-dropdown>
 */
class DndDropdown extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'hidden'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._options = [];
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'hidden') {
      this._updateVisibility();
    } else if (oldValue !== newValue && this.shadowRoot.innerHTML) {
      this.render();
      this._setupEventListeners();
    }
  }

  // Getters pour les attributs
  get placeholder() {
    return this.getAttribute('placeholder') || '-- Sélectionner --';
  }

  get isHidden() {
    return this.hasAttribute('hidden');
  }

  // Getter pour la valeur sélectionnée
  get value() {
    const select = this.shadowRoot.querySelector('select');
    return select ? select.value : '';
  }

  set value(val) {
    const select = this.shadowRoot.querySelector('select');
    if (select) select.value = val;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        :host([hidden]) {
          display: none;
        }

        .dropdown-container {
          margin: 10px 0;
        }

        select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--dnd-border-color, #ccc);
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          font-size: 14px;
        }

        select:focus {
          outline: none;
          border-color: var(--dnd-primary-color, #900909);
        }

        select:hover {
          border-color: var(--dnd-primary-color, #900909);
        }
      </style>

      <div class="dropdown-container">
        <select>
          <option value="">${this.placeholder}</option>
        </select>
      </div>
    `;

    // Restaurer les options si elles existent
    if (this._options.length > 0) {
      this._populateOptions();
    }
  }

  _setupEventListeners() {
    const select = this.shadowRoot.querySelector('select');
    if (select) {
      select.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        this.dispatchEvent(new CustomEvent('dnd-select', {
          detail: {
            value: e.target.value,
            label: selectedOption.textContent
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  _updateVisibility() {
    // La visibilité est gérée par le CSS :host([hidden])
  }

  _populateOptions() {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;

    // Garder l'option par défaut
    select.innerHTML = `<option value="">${this.placeholder}</option>`;

    // Ajouter les options
    this._options.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  // Méthodes publiques

  /**
   * Peuple le dropdown avec des options
   * @param {Array<{value: string, label: string}>} items - Liste des options
   */
  setOptions(items) {
    this._options = items || [];
    this._populateOptions();
  }

  /**
   * Affiche le dropdown
   */
  show() {
    this.removeAttribute('hidden');
  }

  /**
   * Masque le dropdown
   */
  hide() {
    this.setAttribute('hidden', '');
  }

  /**
   * Vide les options du dropdown
   */
  clear() {
    this._options = [];
    const select = this.shadowRoot.querySelector('select');
    if (select) {
      select.innerHTML = `<option value="">${this.placeholder}</option>`;
    }
  }

  /**
   * Retourne le nombre d'options
   */
  get optionsCount() {
    return this._options.length;
  }
}

customElements.define('dnd-dropdown', DndDropdown);
