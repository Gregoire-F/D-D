/**
 * DndSoundPlayer - Un Web Component pour lire des sons D&D.
 * Table de mixage pratique avec détection automatique des fichiers audio.
 */
class DndSoundPlayer extends HTMLElement {
  constructor() {
    super();
    // Initialise le Shadow DOM pour isoler les styles
    this.attachShadow({ mode: "open" });
    // État interne du composant
    this.isOpen = false;
    this.sounds = [];
    this.currentlyPlaying = null;
    this.audioElements = {};
  }

  /**
   * Appelé lorsque le composant est ajouté au document.
   */
  connectedCallback() {
    this.loadSounds();
    this.render();
  }

  /**
   * Charge les sons depuis les dossiers de sons
   */
  loadSounds() {
    // Liste des sons détectés avec leurs catégories et icônes
    this.sounds = [
      // Catégorie Ambiance
      {
        name: "Village Médiéval",
        file: "assets/sound/ambiance/medieval_village_atmosphere.mp3",
        category: "Ambiance",
        icon: "🏘️",
      },
      {
        name: "Caverne du Dragon",
        file: "assets/sound/ambiance/Caverne-dragon.mp3",
        category: "Ambiance",
        icon: "🗻",
      },

      // Catégorie Combat
      {
        name: "Coup d'Épée",
        file: "assets/sound/combat/coup-epee.mp3",
        category: "Combat",
        icon: "⚔️",
      },
      {
        name: "Souffle de Dragon",
        file: "assets/sound/combat/dragon-breathing-fire.mp3",
        category: "Combat",
        icon: "🔥",
      },

      // Catégorie Autre
      {
        name: "Échec",
        file: "assets/sound/autre/echec.mp3",
        category: "Autre",
        icon: "❌",
      },
      {
        name: "Victoire",
        file: "assets/sound/autre/victoire.mp3",
        category: "Autre",
        icon: "🏆",
      },
      {
        name: "Lancé de Dés",
        file: "assets/sound/autre/lance-de-des.mp3",
        category: "Autre",
        icon: "🎲",
      },
    ];
  }

  /**
   * Bascule l'affichage du menu (ouverture/fermeture).
   */
  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.render();
  }

  /**
   * Joue un son spécifique
   */
  playSound(soundFile, soundName) {
    // Si un son est déjà en cours, l'arrêter
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
      this.currentlyPlaying.currentTime = 0;
    }

    // Créer ou récupérer l'élément audio
    if (!this.audioElements[soundFile]) {
      this.audioElements[soundFile] = new Audio(soundFile);
      this.audioElements[soundFile].addEventListener("ended", () => {
        this.currentlyPlaying = null;
        this.updatePlayingIndicator(null);
      });

      // Ajouter la gestion d'erreurs
      this.audioElements[soundFile].addEventListener("error", (e) => {
        console.error(`Erreur de chargement pour ${soundFile}:`, e);
        alert(`Impossible de charger le son: ${soundName}`);
      });
    }

    const audio = this.audioElements[soundFile];
    audio.currentTime = 0;

    // Gérer la lecture avec gestion d'erreurs
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.currentlyPlaying = audio;
          this.updatePlayingIndicator(soundName);
        })
        .catch((error) => {
          console.error(`Erreur de lecture pour ${soundFile}:`, error);
          alert(`Impossible de jouer le son: ${soundName}`);
        });
    }
  }

  /**
   * Met à jour l'indicateur visuel du son en cours
   */
  updatePlayingIndicator(soundName) {
    if (this.shadowRoot) {
      // Retirer toutes les classes 'playing'
      const buttons = this.shadowRoot.querySelectorAll(".sound-btn");
      buttons.forEach((btn) => btn.classList.remove("playing"));

      // Ajouter la classe au bouton actif
      if (soundName) {
        const activeBtn = this.shadowRoot.querySelector(
          `[data-sound-name="${soundName}"]`
        );
        if (activeBtn) {
          activeBtn.classList.add("playing");
        }
      }
    }
  }

  /**
   * Arrête tous les sons
   */
  stopAllSounds() {
    Object.values(this.audioElements).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentlyPlaying = null;
    this.updatePlayingIndicator(null);
  }

  /**
   * Regroupe les sons par catégorie
   */
  groupSoundsByCategory() {
    const grouped = {};
    this.sounds.forEach((sound) => {
      if (!grouped[sound.category]) {
        grouped[sound.category] = [];
      }
      grouped[sound.category].push(sound);
    });
    return grouped;
  }

  /**
   * Génère le HTML et le CSS du composant.
   */
  render() {
    const groupedSounds = this.groupSoundsByCategory();

    this.shadowRoot.innerHTML = `
      <style>
        /* Conteneur principal fixé à gauche pour éviter le chevauchement */
        :host {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 1000; /* Même niveau que le lanceur de dés */
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Bouton déclencheur principal (l'icône musicale) */
        .sound-button {
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

        .sound-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        /* Menu de mixage */
        .mixer {
          position: absolute;
          bottom: 70px;
          left: 0;
          width: 320px;
          max-height: 400px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: ${this.isOpen ? "block" : "none"};
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow-y: auto;
        }

        h3 {
          margin: 0 0 1rem 0;
          color: #1d3557;
          font-size: 1.2rem;
          text-align: center;
          border-bottom: 2px solid #e63946;
          padding-bottom: 0.5rem;
        }

        /* Catégorie de sons */
        .category {
          margin-bottom: 1.2rem;
        }

        .category-title {
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Grid des boutons de sons */
        .sounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.5rem;
        }

        /* Boutons de sons individuels */
        .sound-btn {
          padding: 0.6rem 0.8rem;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          text-align: left;
        }

        .sound-btn:hover {
          background: #e9ecef;
          border-color: #e63946;
          transform: translateY(-1px);
        }

        .sound-btn.playing {
          background: #e63946;
          color: white;
          border-color: #d62828;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* Bouton stop universel */
        .stop-all-btn {
          width: 100%;
          padding: 0.8rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 1rem;
          transition: background 0.2s;
        }

        .stop-all-btn:hover {
          background: #c82333;
        }

        /* Animation d'apparition */
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar stylisée */
        .mixer::-webkit-scrollbar {
          width: 6px;
        }

        .mixer::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .mixer::-webkit-scrollbar-thumb {
          background: rgba(230, 57, 70, 0.5);
          border-radius: 3px;
        }

        .mixer::-webkit-scrollbar-thumb:hover {
          background: rgba(230, 57, 70, 0.7);
        }
      </style>

      <!-- Bouton icône musicale -->
      <button class="sound-button" id="toggle-btn" title="Table de mixage D&D">
        🎵
      </button>

      <!-- Panneau de mixage -->
      <div class="mixer fade-in">
        <h3>🎵 Table de Mixage D&D</h3>
        
        ${Object.entries(groupedSounds)
          .map(
            ([category, sounds]) => `
          <div class="category">
            <div class="category-title">${category}</div>
            <div class="sounds-grid">
              ${sounds
                .map(
                  (sound) => `
                <button class="sound-btn" 
                        data-sound-file="${sound.file}"
                        data-sound-name="${sound.name}">
                  <span>${sound.icon}</span>
                  <span>${sound.name}</span>
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}

        <button class="stop-all-btn" onclick="this.getRootNode().host.stopAllSounds()">
          ⏹️ Arrêter tous les sons
        </button>
      </div>
    `;

    // Attache les événements après le rendu
    this.shadowRoot.getElementById("toggle-btn").onclick = () =>
      this.toggleMenu();

    // Attache les événements pour tous les boutons de sons
    const soundButtons = this.shadowRoot.querySelectorAll(".sound-btn");
    soundButtons.forEach((btn) => {
      const soundFile = btn.getAttribute("data-sound-file");
      const soundName = btn.getAttribute("data-sound-name");
      btn.onclick = () => this.playSound(soundFile, soundName);
    });
  }
}

// Enregistrement du composant personnalisé auprès du navigateur
customElements.define("dnd-sound-player", DndSoundPlayer);
