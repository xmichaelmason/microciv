import './resource-display.js';
import './building-card.js';
import './events-log.js';

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
                }
                .game-content {
                    padding: 10px;
                }
                .buildings-section {
                    margin-top: 20px;
                }
                .buildings-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 10px;
                    color: #333;
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
            </style>
            
            <resource-display></resource-display>
            
            <div class="game-content">
                <div class="buildings-section">
                    <h2>Buildings</h2>
                    <div class="buildings-container">
                        <building-card type="house"></building-card>
                        <building-card type="farm"></building-card>
                        <building-card type="lumberMill"></building-card>
                        <building-card type="quarry"></building-card>
                        <building-card type="monument"></building-card>
                    </div>
                </div>
                
                <events-log></events-log>
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
        
        // Update events log
        const eventsLog = this.shadowRoot.querySelector('events-log');
        if (eventsLog) {
            eventsLog.updateEvents();
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
