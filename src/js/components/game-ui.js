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
                    margin-top: 10px;
                    padding-bottom: 20px;
                }
                .buildings-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 20px;
                    padding: 15px;
                    justify-content: center;
                }
                h2 {
                    text-align: center;
                    margin: 10px 0;
                    color: #333;
                    font-size: 1.2em;
                    position: relative;
                }
                h2::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 3px;
                    background-color: #3f51b5;
                    border-radius: 2px;
                }
                .category-title {
                    display: flex;
                    align-items: center;
                    margin: 25px 15px 10px;
                    position: relative;
                }
                .category-title::before {
                    content: '';
                    flex-grow: 1;
                    height: 1px;
                    background-color: #e0e0e0;
                    margin-right: 15px;
                }
                .category-title::after {
                    content: '';
                    flex-grow: 1;
                    height: 1px;
                    background-color: #e0e0e0;
                    margin-left: 15px;
                }
                .category-label {
                    font-size: 0.9em;
                    font-weight: bold;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background-color: #f5f5f5;
                    border-radius: 20px;
                    padding: 5px 15px;
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
                    
                    <div class="category-title">
                        <span class="category-label">Resource Production</span>
                    </div>
                    <div class="buildings-container">
                        <building-card type="house"></building-card>
                        <building-card type="farm"></building-card>
                        <building-card type="lumberMill"></building-card>
                        <building-card type="quarry"></building-card>
                        <building-card type="library"></building-card>
                    </div>
                    
                    <div class="category-title">
                        <span class="category-label">Military & Defense</span>
                    </div>
                    <div class="buildings-container">
                        <building-card type="barracks"></building-card>
                        <building-card type="wall"></building-card>
                    </div>
                    
                    <div class="category-title">
                        <span class="category-label">Victory Monument</span>
                    </div>
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
