/**
 * DndDiceRoller - Un Web Component pour lancer des dés D&D.
 * Ce composant encapsule sa propre structure, sa logique et ses styles via le Shadow DOM.
 */
class DndDiceRoller extends HTMLElement {
  constructor() {
    super();
    // Initialise le Shadow DOM pour isoler les styles
    this.attachShadow({ mode: "open" });
    // État interne du composant
    this.isOpen = false; // Le menu est-il ouvert ?
    this.results = []; // Liste des derniers résultats obtenus
  }

  /**
   * Appelé lorsque le composant est ajouté au document.
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Bascule l'affichage du menu (ouverture/fermeture).
   */
  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.render();
  }

  /**
   * Logique de lancer de dés.
   * Récupère les valeurs depuis les champs du Shadow DOM et génère des nombres aléatoires.
   */
  rollDice() {
    const dieType = parseInt(this.shadowRoot.getElementById("die-type").value);
    const dieCount = parseInt(
      this.shadowRoot.getElementById("die-count").value
    );
    // AJOUTE CETTE LIGNE pour forcer une limite max (ex: 10)
    if (dieCount > 5) dieCount = 5;
    if (dieCount < 1) dieCount = 1;
    this.results = [];
    // Boucle pour générer autant de dés que demandé
    for (let i = 0; i < dieCount; i++) {
      // Formule : Math.floor(Math.random() * max) + 1
      this.results.push(Math.floor(Math.random() * dieType) + 1);
    }
    this.render(); // Redessine le composant pour afficher les résultats
  }

  /**
   * Génère le HTML et le CSS du composant.
   */
  render() {
    // Calcule la somme totale des dés
    const total = this.results.reduce((acc, curr) => acc + curr, 0);

    // SHADOW DOM CHOISI POUR LE STYLE DU LANCÉ DE DÉS
    this.shadowRoot.innerHTML = `
      <style>
        /* Conteneur principal fixé en bas à droite */
        :host {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Bouton déclencheur principal (l'icône de dé) */
        .dice-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e63946, #d62828);
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .dice-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        /* Menu de configuration */
        .menu {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 250px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: ${this.isOpen ? "block" : "none"};
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h3 {
          margin: 0 0 1rem 0;
          color: #1d3557;
          font-size: 1.1rem;
        }

        .control-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #457b9d;
        }

        select, input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ddd;
          box-sizing: border-box;
          font-family: inherit;
        }

        /* Bouton pour lancer les dés */
        .roll-btn {
          width: 100%;
          padding: 0.75rem;
          background: #8b0000;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }

        .roll-btn:hover {
          background: #900909;
        }

        /* Section d'affichage des résultats */
        .results {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .dice-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Style pour chaque dé individuel */
        .die-result {
          background: #f1faee;
          border: 1px solid #a8dadc;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-weight: bold;
          color: #1d3557;
        }

        /* Résultat final (somme) */
        .total {
          font-size: 1.2rem;
          font-weight: 800;
          color: #e63946;
          text-align: center;
        }

        /* Animation d'apparition */
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <!-- Bouton icône -->
      <button class="dice-button" id="toggle-btn" title="Lancer les dés">
        🎲
      </button>

      <!-- Panneau du menu -->
      <div class="menu fade-in">
        <h3>Lancer de dés</h3>
        
        <div class="control-group">
          <label for="die-type">Type de dé</label>
          <select id="die-type">
            <option value="4">D4</option>
            <option value="6" selected>D6</option>
            <option value="10">D10</option>
            <option value="20">D20</option>
          </select>
        </div>

        <div class="control-group">
          <label for="die-count">Nombre de dés (MAX 5)</label>
          <input type="number" id="die-count" min="1" max="5" value="1">
        </div>

        <button class="roll-btn" id="roll-btn">Lancer !</button>

        <!-- Affichage conditionnel des résultats -->
        ${
          this.results.length > 0
            ? `
          <div class="results fade-in">
            <div class="dice-list">
              ${this.results
                .map((r) => `<span class="die-result">${r}</span>`)
                .join("")}
            </div>
            <div class="total">Total: ${total}</div>
          </div>
        `
            : ""
        }
      </div>
    `;

    // Attache les événements après le rendu
    this.shadowRoot.getElementById("toggle-btn").onclick = () =>
      this.toggleMenu();

    if (this.isOpen) {
      this.shadowRoot.getElementById("roll-btn").onclick = () =>
        this.rollDice();
    }
  }
}

// Enregistrement du composant personnalisé auprès du navigateur
customElements.define("dnd-dice-roller", DndDiceRoller);
