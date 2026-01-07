/**
 * @fileoverview WebComponent pour afficher une grille de statistiques D&D
 * @author Projet SKOLAE D&D
 * @version 1.0.0
 */

/**
 * <dnd-stat-grid> - Grille de statistiques D&D (ability scores, stats d'items, etc.)
 *
 * Ce composant affiche une grille horizontale de statistiques avec labels,
 * valeurs, modificateurs optionnels et tooltips au style parchemin.
 *
 * @element dnd-stat-grid
 *
 * @attr {string} stats - JSON des statistiques à afficher (voir format ci-dessous)
 *
 * @cssprop {color} [--dnd-primary-color=#8b0000] - Couleur principale (bordures, labels)
 * @cssprop {color} [--dnd-text-color=#333] - Couleur du texte des valeurs
 * @cssprop {url} [--dnd-tooltip-image] - Image de fond des tooltips (parchemin)
 *
 * @fires Aucun événement émis par ce composant
 *
 * @example
 * <!-- Utilisation avec attribut HTML (JSON) -->
 * <dnd-stat-grid stats='[
 *   {"label": "STR", "value": "15", "modifier": "+2", "tooltip": "Force physique"},
 *   {"label": "DEX", "value": "14", "modifier": "+2", "tooltip": "Agilité"}
 * ]'></dnd-stat-grid>
 *
 * @example
 * <!-- Utilisation via JavaScript (recommandé) -->
 * <dnd-stat-grid id="monsterStats"></dnd-stat-grid>
 * <script>
 *   const grid = document.getElementById('monsterStats');
 *   grid.stats = [
 *     { label: "STR", value: "18", modifier: "+4", tooltip: "Force physique" },
 *     { label: "DEX", value: "12", modifier: "+1", tooltip: "Agilité" }
 *   ];
 * </script>
 *
 * @example
 * <!-- Utilisation avec la méthode helper pour les monstres D&D -->
 * <script>
 *   const monsterData = await fetch('https://www.dnd5eapi.co/api/2014/monsters/goblin').then(r => r.json());
 *   grid.stats = DndStatGrid.createAbilityStats(monsterData);
 * </script>
 */
class DndStatGrid extends HTMLElement {
  /**
   * Liste des attributs observés par le composant.
   * Lorsque ces attributs changent, attributeChangedCallback est appelé.
   * @returns {string[]} Liste des noms d'attributs
   */
  static get observedAttributes() {
    return ['stats'];
  }

  /**
   * Constructeur du composant.
   * Initialise le Shadow DOM et les propriétés internes.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    /** @private {Array<StatObject>} Tableau des statistiques à afficher */
    this._stats = [];
  }

  /**
   * Callback appelé lorsque le composant est ajouté au DOM.
   * Parse les attributs et effectue le premier rendu.
   */
  connectedCallback() {
    this._parseStats();
    this.render();
  }

  /**
   * Callback appelé lorsqu'un attribut observé change.
   * @param {string} name - Nom de l'attribut modifié
   * @param {string|null} oldValue - Ancienne valeur
   * @param {string|null} newValue - Nouvelle valeur
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stats' && oldValue !== newValue) {
      this._parseStats();
      this.render();
    }
  }

  /**
   * Parse l'attribut 'stats' (JSON) et met à jour _stats.
   * Affiche une erreur en console si le JSON est invalide.
   * @private
   */
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

  /**
   * Getter pour accéder aux statistiques actuelles.
   * @returns {Array<StatObject>} Tableau des statistiques
   */
  get stats() {
    return this._stats;
  }

  /**
   * Setter pour définir les statistiques via JavaScript.
   * Déclenche automatiquement un nouveau rendu.
   *
   * @param {Array<StatObject>} value - Tableau des statistiques
   *
   * @typedef {Object} StatObject
   * @property {string} label - Label affiché (ex: "STR", "Coût", "Portée")
   * @property {string} value - Valeur affichée (ex: "15", "50 gp", "30 ft")
   * @property {string} [modifier] - Modificateur optionnel (ex: "+2", "-1")
   * @property {string} [tooltip] - Texte de la bulle d'aide au survol
   *
   * @example
   * grid.stats = [
   *   { label: "AC", value: "15", tooltip: "Classe d'armure" },
   *   { label: "HP", value: "45", tooltip: "Points de vie" }
   * ];
   */
  set stats(value) {
    if (Array.isArray(value)) {
      this._stats = value;
      this.render();
    }
  }

  /**
   * Effectue le rendu du composant dans le Shadow DOM.
   * Génère le HTML et les styles encapsulés.
   * @private
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* ========================================
         * STYLES DU CONTENEUR
         * ======================================== */
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

        /* ========================================
         * STYLES DES STATISTIQUES INDIVIDUELLES
         * ======================================== */
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

        /* ========================================
         * STYLES DES TOOLTIPS (STYLE PARCHEMIN)
         * Utilise l'image parchemin-aide.png comme fond
         * Animation d'apparition avec effet de déroulement
         * ======================================== */
        .tooltip {
          position: relative;
          cursor: help;
          border-bottom: 1px dotted var(--dnd-primary-color, #8b0000);
          transition: all 0.3s ease;
        }

        .tooltip:hover {
          color: #a00;
          border-bottom-color: #a00;
        }

        /* Contenu du tooltip (bulle d'aide) */
        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%) scaleY(0);
          background-color: transparent;
          background-image: var(--dnd-tooltip-image, url('../../images/parchemin-aide.png'));
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          color: #4a3426;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', 'MedievalSharp', serif;
          font-size: 11px;
          font-weight: 600;
          white-space: normal;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          min-height: 200px;
          min-width: 100px;
          padding: 30px 50px;
          text-align: center;
          transform-origin: bottom center;
        }

        /* Flèche du tooltip */
        .tooltip::before {
          content: "";
          position: absolute;
          bottom: 118%;
          left: 50%;
          transform: translateX(-50%) scale(0);
          border: 6px solid transparent;
          border-top-color: #8b0000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
          z-index: 999;
        }

        /* États hover des tooltips */
        .tooltip:hover::after {
          opacity: 1;
          visibility: visible;
          bottom: 130%;
          transform: translateX(-50%) scaleY(1);
        }

        .tooltip:hover::before {
          opacity: 1;
          visibility: visible;
          bottom: 123%;
          transform: translateX(-50%) scale(1);
        }

        /* ========================================
         * STYLES RESPONSIVE (MOBILE)
         * ======================================== */
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

  /**
   * Génère le HTML pour chaque statistique.
   * Gère l'affichage conditionnel des modificateurs et tooltips.
   * @private
   * @returns {string} HTML des statistiques
   */
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

  /**
   * Échappe les caractères HTML pour éviter les injections XSS.
   * @private
   * @param {string} text - Texte à échapper
   * @returns {string} Texte échappé
   */
  _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ========================================
   * MÉTHODES STATIQUES UTILITAIRES
   * ======================================== */

  /**
   * Calcule le modificateur D&D à partir d'un score de caractéristique.
   * Formule standard D&D 5e : (score - 10) / 2, arrondi vers le bas.
   *
   * @static
   * @param {number} score - Score de caractéristique (1-30)
   * @returns {string} Modificateur formaté avec signe (ex: "+2", "-1")
   *
   * @example
   * DndStatGrid.calculateModifier(15); // "+2"
   * DndStatGrid.calculateModifier(8);  // "-1"
   * DndStatGrid.calculateModifier(10); // "+0"
   */
  static calculateModifier(score) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  /**
   * Crée un tableau de statistiques pour les 6 ability scores D&D standard.
   * Utilisé pour afficher les caractéristiques des monstres ou créatures.
   *
   * @static
   * @param {Object} data - Objet contenant les scores de caractéristiques
   * @param {number} data.strength - Score de Force (STR)
   * @param {number} data.dexterity - Score de Dextérité (DEX)
   * @param {number} data.constitution - Score de Constitution (CON)
   * @param {number} data.intelligence - Score d'Intelligence (INT)
   * @param {number} data.wisdom - Score de Sagesse (WIS)
   * @param {number} data.charisma - Score de Charisme (CHA)
   * @returns {Array<StatObject>} Tableau de statistiques prêt à être utilisé
   *
   * @example
   * // Avec les données de l'API D&D 5e
   * const monster = await fetch('https://www.dnd5eapi.co/api/2014/monsters/goblin')
   *   .then(r => r.json());
   *
   * const grid = document.querySelector('dnd-stat-grid');
   * grid.stats = DndStatGrid.createAbilityStats(monster);
   * // Affiche: STR 8(-1), DEX 14(+2), CON 10(+0), INT 10(+0), WIS 8(-1), CHA 8(-1)
   */
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

// Enregistrement du Custom Element
customElements.define('dnd-stat-grid', DndStatGrid);
