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
                    border-radius: 6px;
                    padding: 15px;
                    background-color: white;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .card:hover:not(.disabled) {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
                    border-color: #aaa;
                }
                .disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .building-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .building-title {
                    font-weight: bold;
                    font-size: 1.2em;
                    color: #333;
                }
                .building-count {
                    background-color: #f0f0f0;
                    border-radius: 12px;
                    padding: 3px 8px;
                    font-size: 0.9em;
                    color: #666;
                }
                .building-effect {
                    margin: 10px 0;
                    color: #3f51b5;
                    font-size: 0.9em;
                }
                .cost-section {
                    margin-top: auto;
                    padding-top: 10px;
                    border-top: 1px dotted #eee;
                }
                .cost-title {
                    font-size: 0.8em;
                    color: #888;
                    margin-bottom: 5px;
                }
                .cost {
                    display: flex;
                    justify-content: flex-start;
                    gap: 12px;
                    font-size: 0.9em;
                }
                .cost-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .cost-icon {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .wood-icon { background-color: #795548; }
                .stone-icon { background-color: #9E9E9E; }
                
                .affordable {
                    border-left: 3px solid #4CAF50;
                }
                
                .locked {
                    position: relative;
                }
                
                .locked::after {
                    content: "🔒";
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 1.2em;
                }
                
                .requirement-msg {
                    margin-top: 8px;
                    font-size: 0.8em;
                    color: #FF5722;
                }
            </style>
            
            <div class="card">
                <div class="building-header">
                    <div class="building-title">${buildingInfo.title}</div>
                    <div class="building-count" id="count">0</div>
                </div>
                <div class="building-effect">${buildingInfo.effect}</div>
                <div class="cost-section">
                    <div class="cost-title">Cost</div>
                    <div class="cost">
                        ${buildingInfo.costs.wood ? `
                            <div class="cost-item">
                                <span class="cost-icon wood-icon"></span>
                                <span>${buildingInfo.costs.wood}</span>
                            </div>` : ''}
                        ${buildingInfo.costs.stone ? `
                            <div class="cost-item">
                                <span class="cost-icon stone-icon"></span>
                                <span>${buildingInfo.costs.stone}</span>
                            </div>` : ''}
                    </div>
                </div>
                <div class="requirement-msg" id="requirement-msg"></div>
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
            
            if (gameState.canAfford(this.type) && gameState.meetsRequirements(this.type)) {
                gameState.build(this.type);
                
                // Provide visual feedback on successful build
                this.showBuildFeedback();
                
                // Update UI through game-ui component or document events
                const gameUI = document.querySelector('game-ui');
                if (gameUI) {
                    gameUI.updateUI();
                }
            }
        });
    }
    
    showBuildFeedback() {
        const card = this.shadowRoot.querySelector('.card');
        card.style.backgroundColor = '#e8f5e9'; // Light green flash
        
        // Reset after animation
        setTimeout(() => {
            card.style.backgroundColor = '';
        }, 500);
    }
    
    updateBuildingInfo() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        const card = this.shadowRoot.querySelector('.card');
        const countElement = this.shadowRoot.querySelector('.building-count');
        const reqMsg = this.shadowRoot.getElementById('requirement-msg');
        
        // Update count
        const buildingCount = gameState.buildings[this.type] || 0;
        countElement.textContent = buildingCount;
        
        // Check if player can afford it
        const canAfford = gameState.canAfford(this.type);
        
        // Check if requirements are met
        const meetsReqs = gameState.meetsRequirements(this.type);
        
        // Update card appearance and interactivity
        card.classList.remove('disabled', 'affordable', 'locked');
        
        if (!meetsReqs) {
            card.classList.add('disabled', 'locked');
            
            // Show requirements message
            const reqs = gameState.buildingRequirements[this.type];
            let reqMessage = "Requires: ";
            
            if (reqs.tech && reqs.tech.length > 0) {
                reqMessage += reqs.tech.map(tech => {
                    const techObj = gameState.technologySystem.technologies[tech];
                    return techObj ? techObj.name : tech;
                }).join(", ");
                
                if (Object.keys(reqs.building).length > 0) {
                    reqMessage += " and ";
                }
            }
            
            if (Object.keys(reqs.building).length > 0) {
                reqMessage += Object.entries(reqs.building)
                    .map(([building, count]) => `${count} ${building}`)
                    .join(", ");
            }
            
            reqMsg.textContent = reqMessage;
        } else if (!canAfford) {
            card.classList.add('disabled');
            reqMsg.textContent = "Not enough resources";
        } else {
            card.classList.add('affordable');
            reqMsg.textContent = "";
        }
    }
}

customElements.define('building-card', BuildingCard);
