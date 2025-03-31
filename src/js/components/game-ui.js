import './resource-display.js';
import './building-card.js';
import './events-log.js';
import './military-panel.js';

class GameUI extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.updateUI();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                
                .game-title-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .end-turn-btn {
                    background-color: var(--accent-color, #FF5722);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 20px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .end-turn-btn:hover {
                    background-color: #e64a19;
                }
                
                .game-status {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    gap: 10px;
                    background-color: rgba(0, 0, 0, 0.1);
                    padding: 8px 12px;
                    border-radius: 4px;
                    margin-top: 10px;
                }
                
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.9rem;
                    color: white;
                }
                
                .status-icon {
                    width: 16px;
                    height: 16px;
                    display: inline-block;
                    background-color: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                }
                
                .status-label {
                    font-weight: 500;
                    opacity: 0.8;
                }
                
                /* Responsive styles */
                @media (max-width: 864px) {
                    .game-status {
                        flex-wrap: wrap;
                        padding: 6px 8px;
                        gap: 5px;
                        background-color: rgba(0, 0, 0, 0.2);
                        font-size: 0.85rem;
                    }
                    
                    .status-item {
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                        padding: 3px 6px;
                        border-radius: 3px;
                        background-color: rgba(255, 255, 255, 0.1);
                        white-space: nowrap;
                        margin-right: 5px;
                    }
                    
                    .status-icon {
                        width: 10px;
                        height: 10px;
                    }
                    
                    /* Hide labels on very small screens */
                    .status-label {
                        display: none;
                    }
                    
                    .end-turn-btn {
                        padding: 6px 15px;
                        font-size: 0.9rem;
                    }
                }
                
                /* Ultra compact mode */
                @media (max-width: 480px) {
                    .game-status {
                        padding: 4px;
                        gap: 3px;
                    }
                    
                    .status-item {
                        padding: 2px 4px;
                        font-size: 0.75rem;
                    }
                    
                    .status-icon {
                        width: 8px;
                        height: 8px;
                    }
                }
            </style>
            
            <div class="game-title-section">
                <h1>MicroCiv</h1>
                <button class="end-turn-btn" id="end-turn-btn">End Turn</button>
            </div>
            
            <div class="game-status">
                <div class="status-item">
                    <div class="status-icon" style="background-color: #FF9800;"></div>
                    <span class="status-label">Turn:</span>
                    <span id="turn-counter">1</span>
                </div>
                
                <div class="status-item">
                    <div class="status-icon" style="background-color: #4CAF50;"></div>
                    <span class="status-label">Season:</span>
                    <span id="current-season">Spring (3)</span>
                </div>
                
                <div class="status-item">
                    <div class="status-icon" style="background-color: #9C27B0;"></div>
                    <span class="status-label">Terrain:</span>
                    <span id="current-terrain">Plains</span>
                </div>
                
                <div class="status-item">
                    <div class="status-icon" style="background-color: #F44336;"></div>
                    <span class="status-label">Defense:</span>
                    <span id="defense-value">10</span>
                </div>
            </div>
        `;
        
        // Add event listener to the end turn button
        const endTurnBtn = this.shadowRoot.getElementById('end-turn-btn');
        endTurnBtn.addEventListener('click', () => {
            const gameState = window.gameState;
            if (gameState) {
                gameState.endTurn();
                this.updateUI();
            }
        });
    }
    
    updateUI() {
        const gameState = window.gameState;
        if (!gameState) return;

        // Update turn counter
        this.shadowRoot.getElementById('turn-counter').textContent = gameState.turn;
        
        // Update current season
        const seasonInfo = gameState.seasonsSystem.getCurrentSeasonInfo();
        this.shadowRoot.getElementById('current-season').textContent = `${seasonInfo.name} (${seasonInfo.turnsRemaining})`;
        
        // Update current terrain
        this.shadowRoot.getElementById('current-terrain').textContent = gameState.terrainSystem.getCurrentTerrain().name;
        
        // Update defense value
        this.shadowRoot.getElementById('defense-value').textContent = gameState.militarySystem.defenseValue;
        
        // Since we may have a standalone game-ui component and original status elements,
        // also update the document elements if they exist
        if (document.getElementById('turn-counter')) {
            document.getElementById('turn-counter').textContent = gameState.turn;
        }
        if (document.getElementById('current-season')) {
            document.getElementById('current-season').textContent = `${seasonInfo.name} (${seasonInfo.turnsRemaining})`;
        }
        if (document.getElementById('current-terrain')) {
            document.getElementById('current-terrain').textContent = gameState.terrainSystem.getCurrentTerrain().name;
        }
        if (document.getElementById('defense-value')) {
            document.getElementById('defense-value').textContent = gameState.militarySystem.defenseValue;
        }
        
        // Update building cards if they exist
        const buildingCards = document.querySelectorAll('building-card');
        buildingCards.forEach(card => {
            card.updateBuildingInfo();
        });
        
        // Update resource display
        const resourceDisplay = document.querySelector('resource-display');
        if (resourceDisplay) {
            resourceDisplay.updateResources();
        }
        
        // Update events log
        const eventsLog = document.querySelector('events-log');
        if (eventsLog) {
            eventsLog.updateEvents();
        }
    }
}

customElements.define('game-ui', GameUI);
