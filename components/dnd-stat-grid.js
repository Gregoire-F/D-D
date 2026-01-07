/**
 * <dnd-stat-grid> - Grille de statistiques D&D (ability scores)
 *
 * @attr {string} stats - JSON des statistiques à afficher
 *
 * Format des stats:
 * [
 *   {"label": "STR", "value": "15", "modifier": "+2", "tooltip": "Force physique"},
 *   {"label": "DEX", "value": "14", "modifier": "+2"}
 * ]
 *
 * @example
 * <dnd-stat-grid stats='[{"label":"STR","value":"15","modifier":"+2"}]'>
 * </dnd-stat-grid>
 */
class DndStatGrid extends HTMLElement {
  static get observedAttributes() {
    return ['stats'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._stats = [];
  }

  connectedCallback() {
    this._parseStats();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stats' && oldValue !== newValue) {
      this._parseStats();
      this.render();
    }
  }

  _parseStats() {
    const statsAttr = this.getAttribute('stats');
    if (statsAttr) {
      try {
        this._stats = JSON.parse(statsAttr);
      } catch (e) {
        console.error('dnd-stat-grid: Invalid JSON in stats attribute', e);
        this._stats = [];
      }
    }
  }

  // Getter/Setter pour les stats via JS
  get stats() {
    return this._stats;
  }

  set stats(value) {
    if (Array.isArray(value)) {
      this._stats = value;
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .stat-grid {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 2px solid var(--dnd-primary-color, #8b0000);
          border-top: 2px solid var(--dnd-primary-color, #8b0000);
        }

        .stat {
          text-align: center;
          flex: 1;
          min-width: 50px;
          padding: 5px;
        }

        .stat-label {
          display: block;
          color: var(--dnd-primary-color, #8b0000);
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 14px;
          color: var(--dnd-text-color, #333);
        }

        /* Tooltip styles */
        .tooltip {
          position: relative;
          cursor: help;
          border-bottom: 1px dotted var(--dnd-primary-color, #8b0000);
        }

        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%) scale(0);
          background-color: var(--dnd-card-bg, #fdf1dc);
          border: 2px solid var(--dnd-primary-color, #8b0000);
          border-radius: 4px;
          padding: 8px 12px;
          color: var(--dnd-text-color, #333);
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .tooltip:hover::after {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) scale(1);
        }

        @media (max-width: 480px) {
          .stat-grid {
            gap: 8px;
          }

          .stat {
            min-width: 45px;
          }

          .stat-label {
            font-size: 10px;
          }

          .stat-value {
            font-size: 12px;
          }
        }
      </style>

      <div class="stat-grid">
        ${this._renderStats()}
      </div>
    `;
  }

  _renderStats() {
    if (!this._stats || this._stats.length === 0) {
      return '<div class="stat"><span class="stat-value">Aucune statistique</span></div>';
    }

    return this._stats.map(stat => {
      const hasTooltip = stat.tooltip;
      const tooltipClass = hasTooltip ? 'tooltip' : '';
      const tooltipAttr = hasTooltip ? `data-tooltip="${this._escapeHtml(stat.tooltip)}"` : '';

      // Affichage: valeur (modificateur) si modifier présent
      const displayValue = stat.modifier
        ? `${stat.value} (${stat.modifier})`
        : stat.value;

      return `
        <div class="stat">
          <span class="stat-label ${tooltipClass}" ${tooltipAttr}>
            ${this._escapeHtml(stat.label)}
          </span>
          <span class="stat-value">${this._escapeHtml(displayValue)}</span>
        </div>
      `;
    }).join('');
  }

  _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Méthode utilitaire pour calculer le modificateur D&D
  static calculateModifier(score) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  // Méthode statique pour créer les stats D&D standard
  static createAbilityStats(data) {
    const abilities = [
      { key: 'strength', label: 'STR', tooltip: 'Force physique - Influence les attaques en mêlée' },
      { key: 'dexterity', label: 'DEX', tooltip: 'Agilité - Influence l\'Armure et l\'initiative' },
      { key: 'constitution', label: 'CON', tooltip: 'Endurance - Influence les points de vie' },
      { key: 'intelligence', label: 'INT', tooltip: 'Raisonnement - Influence la magie arcane' },
      { key: 'wisdom', label: 'WIS', tooltip: 'Perception - Influence la magie divine' },
      { key: 'charisma', label: 'CHA', tooltip: 'Force de personnalité - Influence les compétences sociales' }
    ];

    return abilities.map(ability => ({
      label: ability.label,
      value: String(data[ability.key] || 10),
      modifier: DndStatGrid.calculateModifier(data[ability.key] || 10),
      tooltip: ability.tooltip
    }));
  }
}

customElements.define('dnd-stat-grid', DndStatGrid);
