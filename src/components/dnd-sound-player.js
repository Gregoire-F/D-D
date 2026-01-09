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
    this.currentTab = 'player';
    this.selectedSounds = new Set();
    this.mixagePlaying = false;

    // Scénarios prédéfinis
    this.scenarios = {
      'Village Attaqué': {
        sounds: ['assets/sound/combat/cri.mp3', 'assets/sound/combat/dragon-breathing-fire.mp3', 'assets/sound/ambiance/medieval_village_atmosphere.mp3'],
        icon: '🐉',
        description: 'Un dragon attaque un village'
      },
      'Exécution': {
        sounds: ['assets/sound/combat/cri.mp3', 'assets/sound/combat/coup-epee.mp3'],
        icon: '🗡️',
        description: 'Une exécution'
      },
      'Échec Critique': {
        sounds: ['assets/sound/autre/echec.mp3', 'assets/sound/combat/cri.mp3'],
        icon: '☠️',
        description: 'Un échec avec des conséquences'
      }
    };
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
      { name: "Village Médiéval", file: "assets/sound/ambiance/medieval_village_atmosphere.mp3", category: "Ambiance", icon: "🏘️" },
      { name: "Caverne du Dragon", file: "assets/sound/ambiance/Caverne-dragon.mp3", category: "Ambiance", icon: "🗻" },
      { name: "Coup d'Épée", file: "assets/sound/combat/coup-epee.mp3", category: "Combat", icon: "⚔️" },
      { name: "Souffle de Dragon", file: "assets/sound/combat/dragon-breathing-fire.mp3", category: "Combat", icon: "🔥" },
      { name: "Cri", file: "assets/sound/combat/cri.mp3", category: "Combat", icon: "😱" },
      { name: "Échec", file: "assets/sound/autre/echec.mp3", category: "Autre", icon: "❌" },
      { name: "Victoire", file: "assets/sound/autre/victoire.mp3", category: "Autre", icon: "🏆" },
      { name: "Lancé de Dés", file: "assets/sound/autre/lance-de-des.mp3", category: "Autre", icon: "🎲" }
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
    if (!this.shadowRoot) return;
    
    const buttons = this.shadowRoot.querySelectorAll(".sound-btn");
    buttons.forEach(btn => btn.classList.remove("playing"));
    
    if (soundName) {
      const activeBtn = this.shadowRoot.querySelector(`[data-sound-name="${soundName}"]`);
      if (activeBtn) activeBtn.classList.add("playing");
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
    this.mixagePlaying = false;
    this.updateMixageButtons();
  }

  /**
   * Arrête uniquement les sons du mixage
   */
  stopMixage() {
    this.selectedSounds.forEach(soundFile => {
      if (this.audioElements[soundFile]) {
        this.audioElements[soundFile].pause();
        this.audioElements[soundFile].currentTime = 0;
      }
    });
    this.mixagePlaying = false;
    this.updateMixageButtons();
  }

  /**
   * Lance un scénario prédéfini
   */
  launchScenario(scenarioName) {
    const scenario = this.scenarios[scenarioName];
    if (!scenario) return;

    // Arrêter les sons en cours
    this.stopAllSounds();

    // Sélectionner automatiquement les sons du scénario
    this.selectedSounds.clear();
    scenario.sounds.forEach(soundFile => {
      this.selectedSounds.add(soundFile);
    });

    // Lancer automatiquement le mixage
    this.mixagePlaying = false;
    this.playMixage();
  }

  /**
   * Bascule l'onglet actuel
   */
  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  /**
   * Ajoute/retire un son de la sélection de mixage
   */
toggleSoundSelection(soundFile) {
    this.selectedSounds.has(soundFile) ? this.selectedSounds.delete(soundFile) : this.selectedSounds.add(soundFile);
    this.updateMixageButtons();
  }

  /**
   * Joue tous les sons pré-sélectionnés en même temps
   */
  playMixage() {
    if (this.selectedSounds.size === 0) {
      alert('Veuillez sélectionner au moins un son pour le mixage');
      return;
    }

    if (this.mixagePlaying) {
      // Mettre en pause tous les sons du mixage (conserve la position)
      this.selectedSounds.forEach(soundFile => {
        if (this.audioElements[soundFile]) {
          this.audioElements[soundFile].pause();
        }
      });
      this.mixagePlaying = false;
    } else {
      // Reprendre la lecture depuis la position actuelle
      this.selectedSounds.forEach(soundFile => {
        if (!this.audioElements[soundFile]) {
          this.audioElements[soundFile] = new Audio(soundFile);
        }
        
        const audio = this.audioElements[soundFile];
        // Ne remet pas currentTime à 0, continue depuis là où il était
        audio.play().catch(error => {
          console.error(`Erreur de lecture pour ${soundFile}:`, error);
        });
      });

      this.mixagePlaying = true;
    }

    this.updateMixageButtons();
  }

  /**
   * Met à jour l'état des boutons dans l'onglet mixage
   */
updateMixageButtons() {
    if (!this.shadowRoot) return;
    
    const selectButtons = this.shadowRoot.querySelectorAll('.select-sound-btn');
    selectButtons.forEach(btn => {
      const soundFile = btn.getAttribute('data-sound-file');
      btn.classList.toggle('selected', this.selectedSounds.has(soundFile));
    });

    const playMixageBtn = this.shadowRoot.getElementById('play-mixage-btn');
    if (playMixageBtn) {
      playMixageBtn.textContent = this.mixagePlaying ? '⏸️ Pause Mixage' : '▶️ Jouer Mixage';
      playMixageBtn.style.background = this.mixagePlaying ? '#ffc107' : '#28a745';
    }
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
    const renderCategorySounds = (isMixage = false) => {
      return Object.entries(groupedSounds).map(([category, sounds]) => `
        <div class="category">
          <div class="category-title">${category}</div>
          <div class="sounds-grid">
            ${sounds.map(sound => `
              <button class="${isMixage ? 'select-sound-btn' : 'sound-btn'} ${isMixage && this.selectedSounds.has(sound.file) ? 'selected' : ''}" 
                      ${isMixage ? `data-sound-file="${sound.file}" onclick="this.getRootNode().host.toggleSoundSelection('${sound.file}')"` : 
                      `data-sound-file="${sound.file}" data-sound-name="${sound.name}"`}>
                <span>${sound.icon}</span>
                <span>${sound.name}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `).join("");
    };

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

        /* Onglets */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }

        .tab.active {
          color: #e63946;
          border-bottom-color: #e63946;
        }

        .tab:hover {
          color: #d62828;
        }

        /* Contenu des onglets */
        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

/* Boutons de base */
        .sound-btn, .select-sound-btn {
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

        .select-sound-btn { position: relative; }
        .sound-btn:hover { background: #e9ecef; border-color: #e63946; transform: translateY(-1px); }
        .select-sound-btn:hover { background: #e9ecef; border-color: #6c757d; }
        .select-sound-btn.selected { background: #28a745; color: white; border-color: #218838; }
        .select-sound-btn.selected::after { content: '✓'; position: absolute; top: 0.2rem; right: 0.3rem; font-size: 0.7rem; }
        .sound-btn.playing { background: #e63946; color: white; border-color: #d62828; animation: pulse 1.5s infinite; }

        /* Boutons d'action */
        .play-mixage-btn, .stop-mixage-btn, .stop-all-btn {
          width: 100%;
          padding: 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }

        .play-mixage-btn { background: #28a745; color: white; margin-top: 1rem; }
        .play-mixage-btn:hover { background: #218838; }
        .play-mixage-btn:disabled { background: #6c757d; cursor: not-allowed; }

        .stop-mixage-btn, .stop-all-btn { background: #dc3545; color: white; }
        .stop-mixage-btn { margin-top: 0.5rem; }
        .stop-mixage-btn:hover, .stop-all-btn:hover { background: #c82333; }
        .stop-all-btn { margin-top: 1rem; }

        /* Scénarios prédéfinis */
        .scenarios-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }



        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.5rem;
        }

        .scenario-btn {
          padding: 0.8rem;
          background: linear-gradient(135deg, #8b4513, #654321);
          border: 2px solid #4a2c17;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: #f4e4c1;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          text-align: center;
          box-shadow: 0 3px 10px rgba(139, 69, 19, 0.4);
          font-family: 'Georgia', serif;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }

        .scenario-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(139, 69, 19, 0.6);
          background: linear-gradient(135deg, #a0522d, #704214);
          border-color: #5d3a1a;
        }

        .scenario-btn:active {
          transform: translateY(0);
        }

        .scenario-icon {
          font-size: 1.5rem;
        }

        .scenario-name {
          font-size: 0.8rem;
          line-height: 1.2;
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

.category-title, .scenarios-title {
          font-weight: bold;
          color: #2c5aa0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-title { margin-bottom: 0.5rem; }
        .scenarios-title { margin-bottom: 0.8rem; }

        /* Grid des boutons de sons */
        .sounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.5rem;
        }

@keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
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

        /* Adaptation mobile */
        @media (max-width: 480px) {
          :host {
            bottom: 1rem;
            left: 1rem;
          }

          .mixer {
            width: calc(100vw - 2rem);
            max-width: none;
            left: -1rem;
            border-radius: 12px 12px 0 0;
            padding: 1rem;
          }

          .sound-button {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }

          .sounds-grid {
            grid-template-columns: 1fr;
          }

          .sound-btn, .select-sound-btn {
            padding: 0.8rem;
            font-size: 0.9rem;
          }

          .scenarios-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tabs {
            gap: 0.3rem;
          }

          .tab {
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 380px) {
          .mixer {
            width: calc(100vw - 1rem);
            left: -0.5rem;
            right: -0.5rem;
            padding: 0.8rem;
          }

          :host {
            left: 0.5rem;
          }
        }
      </style>

      <!-- Bouton icône musicale -->
      <button class="sound-button" id="toggle-btn" title="Table de mixage D&D">
        🎵
      </button>

<!-- Panneau de mixage -->
      <div class="mixer fade-in">
        <h3>🎵 Table de Mixage D&D</h3>
        
        <!-- Onglets -->
        <div class="tabs">
          <button class="tab ${this.currentTab === 'player' ? 'active' : ''}" 
                  onclick="this.getRootNode().host.switchTab('player')">
            🎵 Lecteur
          </button>
          <button class="tab ${this.currentTab === 'mixage' ? 'active' : ''}" 
                  onclick="this.getRootNode().host.switchTab('mixage')">
            🎛️ Mixage
          </button>
        </div>

<!-- Onglet Lecteur -->
        <div class="tab-content ${this.currentTab === 'player' ? 'active' : ''}" id="player-tab">
          ${renderCategorySounds(false)}
          <button class="stop-all-btn" onclick="this.getRootNode().host.stopAllSounds()">⏹️ Arrêter tous les sons</button>
        </div>

        <!-- Onglet Mixage -->
        <div class="tab-content ${this.currentTab === 'mixage' ? 'active' : ''}" id="mixage-tab">
          <!-- Scénarios prédéfinis -->
          <div class="scenarios-section">
            <div class="scenarios-title">🎬 Scénarios Rapides</div>
            <div class="scenarios-grid">
              ${Object.entries(this.scenarios).map(([name, scenario]) => `
                <button class="scenario-btn" onclick="this.getRootNode().host.launchScenario('${name}')">
                  <span class="scenario-icon">${scenario.icon}</span>
                  <span class="scenario-name">${name}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Sélection manuelle -->
          <div style="margin-bottom: 1rem; font-size: 0.85rem; color: #6c757d;">
            Ou sélectionnez manuellement plusieurs sons et jouez-les simultanément
          </div>
          
          ${renderCategorySounds(true)}

          <button class="play-mixage-btn" id="play-mixage-btn" onclick="this.getRootNode().host.playMixage()">
            ${this.mixagePlaying ? '⏸️ Pause Mixage' : '▶️ Jouer Mixage'}
          </button>
          <button class="stop-mixage-btn" onclick="this.getRootNode().host.stopMixage()">⏹️ Arrêter Mixage</button>
        </div>
      </div>
    `;

// Attache les événements après le rendu
    this.shadowRoot.getElementById("toggle-btn").onclick = () => this.toggleMenu();

    const soundButtons = this.shadowRoot.querySelectorAll(".sound-btn");
    soundButtons.forEach(btn => {
      const soundFile = btn.getAttribute("data-sound-file");
      const soundName = btn.getAttribute("data-sound-name");
      btn.onclick = () => this.playSound(soundFile, soundName);
    });

    this.updateMixageButtons();
  }
}

// Enregistrement du composant personnalisé auprès du navigateur
customElements.define("dnd-sound-player", DndSoundPlayer);
