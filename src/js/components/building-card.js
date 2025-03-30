class BuildingCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    static get observedAttributes() {
        return ['type'];
    }
    
    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.updateBuildingInfo();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'type' && oldValue !== newValue) {
            this.render();
            this.updateBuildingInfo();
        }
    }
    
    get type() {
        return this.getAttribute('type');
    }
    
    render() {
        const buildingInfo = this.getBuildingInfo();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .card {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 12px;
                    width: 140px;
                    background-color: white;
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                    text-align: center;
                }
                .card:hover:not(.disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 10px rgba(0,0,0,0.1);
                }
                .disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .building-title {
                    font-weight: bold;
                    font-size: 1.1em;
                    margin-bottom: 5px;
                }
                .building-count {
                    margin-bottom: 8px;
                    font-size: 0.9em;
                    color: #666;
                }
                .building-effect {
                    margin-bottom: 8px;
                    font-size: 0.8em;
                    color: #2196F3;
                }
                .cost {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.8em;
                    margin-top: 5px;
                }
                .cost-item {
                    display: flex;
                    align-items: center;
                }
                .wood { color: #795548; }
                .stone { color: #9E9E9E; }
            </style>
            
            <div class="card">
                <div class="building-title">${buildingInfo.title}</div>
                <div class="building-count" id="count">Owned: 0</div>
                <div class="building-effect">${buildingInfo.effect}</div>
                <div class="cost">
                    ${buildingInfo.costs.wood ? `<div class="cost-item wood">${buildingInfo.costs.wood} Wood</div>` : ''}
                    ${buildingInfo.costs.stone ? `<div class="cost-item stone">${buildingInfo.costs.stone} Stone</div>` : ''}
                </div>
            </div>
        `;
    }
    
    getBuildingInfo() {
        const buildingInfo = {
            house: {
                title: "House",
                effect: "+2 Population capacity",
                costs: { wood: 5, stone: 0 }
            },
            farm: {
                title: "Farm",
                effect: "+3 Food per turn",
                costs: { wood: 5, stone: 0 }
            },
            lumberMill: {
                title: "Lumber Mill",
                effect: "+2 Wood per turn",
                costs: { wood: 3, stone: 5 }
            },
            quarry: {
                title: "Quarry",
                effect: "+2 Stone per turn",
                costs: { wood: 5, stone: 3 }
            },
            library: {
                title: "Library",
                effect: "+1.5 Science per turn",
                costs: { wood: 8, stone: 5 }
            },
            barracks: {
                title: "Barracks",
                effect: "+5 Defense, train units",
                costs: { wood: 10, stone: 5 }
            },
            wall: {
                title: "Wall",
                effect: "+10 Defense",
                costs: { wood: 5, stone: 15 }
            },
            monument: {
                title: "Monument",
                effect: "Win the game!",
                costs: { wood: 30, stone: 30 }
            }
        };
        
        return buildingInfo[this.type] || { 
            title: "Unknown", effect: "", costs: { wood: 0, stone: 0 } 
        };
    }
    
    addEventListeners() {
        const card = this.shadowRoot.querySelector('.card');
        card.addEventListener('click', () => {
            const gameState = window.gameState;
            if (!gameState) return;
            
            if (gameState.canAfford(this.type)) {
                gameState.build(this.type);
                document.querySelector('game-ui').updateUI();
            }
        });
    }
    
    updateBuildingInfo() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        const card = this.shadowRoot.querySelector('.card');
        const countElement = this.shadowRoot.getElementById('count');
        
        // Update count
        countElement.textContent = `Owned: ${gameState.buildings[this.type]}`;
        
        // Enable/disable card based on affordability
        if (gameState.canAfford(this.type)) {
            card.classList.remove('disabled');
        } else {
            card.classList.add('disabled');
        }
    }
}

customElements.define('building-card', BuildingCard);
