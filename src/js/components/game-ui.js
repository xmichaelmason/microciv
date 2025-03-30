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
        this.addEventListeners();
    }
    
    addEventListeners() {
        // Listen for military updates to refresh the UI
        this.shadowRoot.addEventListener('military-update', () => {
            this.updateUI();
        });
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    overflow: auto;
                }
                .game-content {
                    display: flex;
                    flex-direction: column;
                }
                .buildings-section {
                    margin-top: 5px;
                }
                .buildings-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    justify-content: center;
                    padding: 5px;
                }
                h2 {
                    text-align: center;
                    margin: 5px 0;
                    color: #333;
                    font-size: 1.1em;
                }
                .category-title {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 10px;
                    padding: 3px;
                    background-color: #f5f5f5;
                    border-radius: 3px;
                    font-size: 0.85em;
                    font-weight: bold;
                    color: #555;
                }
                .win-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    color: white;
                    font-size: 24px;
                    z-index: 1000;
                }
                .win-overlay button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 18px;
                    background-color: gold;
                    color: black;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .military-section {
                    margin: 0 10px;
                }
            </style>
            
            <resource-display></resource-display>
            
            <div class="game-content">
                <div class="buildings-section">
                    <h2>Buildings</h2>
                    
                    <div class="category-title">Resources</div>
                    <div class="buildings-container">
                        <building-card type="house"></building-card>
                        <building-card type="farm"></building-card>
                        <building-card type="lumberMill"></building-card>
                        <building-card type="quarry"></building-card>
                        <building-card type="library"></building-card>
                    </div>
                    
                    <div class="category-title">Defense</div>
                    <div class="buildings-container">
                        <building-card type="barracks"></building-card>
                        <building-card type="wall"></building-card>
                    </div>
                    
                    <div class="category-title">Victory</div>
                    <div class="buildings-container">
                        <building-card type="monument"></building-card>
                    </div>
                </div>
                
                <div class="military-section">
                    <military-panel></military-panel>
                </div>
            </div>
        `;
    }
    
    updateUI() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        // Update resource display
        const resourceDisplay = this.shadowRoot.querySelector('resource-display');
        if (resourceDisplay) {
            resourceDisplay.updateResources();
        }
        
        // Update building cards
        const buildingCards = this.shadowRoot.querySelectorAll('building-card');
        buildingCards.forEach(card => {
            card.updateBuildingInfo();
        });
        
        // Update military panel
        const militaryPanel = this.shadowRoot.querySelector('military-panel');
        if (militaryPanel) {
            militaryPanel.updatePanel();
        }
        
        // Check for win condition
        if (gameState.gameWon && !this.shadowRoot.querySelector('.win-overlay')) {
            this.showWinMessage();
        }
    }
    
    showWinMessage() {
        const winOverlay = document.createElement('div');
        winOverlay.className = 'win-overlay';
        winOverlay.innerHTML = `
            <h1>Victory!</h1>
            <p>You have built the Monument and secured your civilization's legacy.</p>
            <button id="restart-btn">Start New Game</button>
        `;
        
        this.shadowRoot.appendChild(winOverlay);
        
        // Set up restart button
        winOverlay.querySelector('#restart-btn').addEventListener('click', () => {
            window.gameState = new window.gameState.constructor();
            this.updateUI();
            winOverlay.remove();
            document.getElementById('turn-counter').textContent = 1;
        });
    }
}

customElements.define('game-ui', GameUI);
