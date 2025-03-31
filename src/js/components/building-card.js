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
        const buildingType = this.type;
        
        // Generate a unique color for each building type based on its name
        const getCardAccentColor = (type) => {
            const colors = {
                house: '#2196F3',         // Blue
                farm: '#8BC34A',          // Green
                lumberMill: '#795548',    // Brown
                quarry: '#9E9E9E',        // Gray
                library: '#9C27B0',       // Purple
                barracks: '#F44336',      // Red
                wall: '#607D8B',          // Blue Gray
                monument: '#FFC107'       // Amber
            };
            return colors[type] || '#3f51b5'; // Default to primary color
        };

        // Get a simple icon character for the building
        const getBuildingIcon = (type) => {
            const icons = {
                house: '🏠',
                farm: '🌾',
                lumberMill: '🪓',
                quarry: '⛏️',
                library: '📚',
                barracks: '⚔️',
                wall: '🧱',
                monument: '🏛️'
            };
            return icons[type] || '🏢';
        };
        
        const accentColor = getCardAccentColor(buildingType);
        const icon = getBuildingIcon(buildingType);
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 5px;
                }
                .card {
                    height: 180px;
                    border-radius: 12px;
                    background: #ffffff;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                    border: 1px solid #eaeaea;
                }
                .card:hover:not(.disabled) {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
                }
                .disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    background: #f8f8f8;
                }
                .card-accent {
                    height: 8px;
                    background-color: ${accentColor};
                    width: 100%;
                }
                .card-header {
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f0f0f0;
                }
                .building-title {
                    font-weight: bold;
                    font-size: 1.1em;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .building-icon {
                    font-size: 1.2em;
                }
                .building-count {
                    background-color: ${accentColor}22;
                    color: ${accentColor};
                    border-radius: 12px;
                    padding: 3px 10px;
                    font-size: 0.85em;
                    font-weight: bold;
                }
                .card-body {
                    padding: 12px 15px;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                .building-effect {
                    color: #555;
                    font-size: 0.9em;
                    margin-bottom: 12px;
                    flex-grow: 1;
                }
                .cost-section {
                    margin-top: auto;
                    padding-top: 10px;
                    border-top: 1px dashed #eee;
                }
                .cost-title {
                    font-size: 0.75em;
                    color: #888;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .cost {
                    display: flex;
                    justify-content: flex-start;
                    gap: 12px;
                    font-size: 0.85em;
                }
                .cost-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background-color: #f9f9f9;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .cost-icon {
                    width: 10px;
                    height: 10px;
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
                    filter: grayscale(1);
                }
                
                .requirement-msg {
                    font-size: 0.75em;
                    color: #FF5722;
                    margin-top: 6px;
                    text-align: center;
                }

                @keyframes buildPulse {
                    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                }
                
                .pulse {
                    animation: buildPulse 1s;
                }
            </style>
            
            <div class="card">
                <div class="card-accent"></div>
                <div class="card-header">
                    <div class="building-title">
                        <span class="building-icon">${icon}</span>
                        <span>${buildingInfo.title}</span>
                    </div>
                    <div class="building-count" id="count">0</div>
                </div>
                <div class="card-body">
                    <div class="building-effect">${buildingInfo.effect}</div>
                    <div class="cost-section">
                        <div class="cost-title">Resources Needed</div>
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
                const success = gameState.build(this.type);
                
                if (success) {
                    // Immediately update count display instead of waiting for end turn
                    this.updateBuildingInfo();
                    
                    // Provide visual feedback on successful build
                    this.showBuildFeedback();
                    
                    // Update UI through game-ui component or document events
                    const gameUI = document.querySelector('game-ui');
                    if (gameUI) {
                        gameUI.updateUI();
                    }
                }
            }
        });
    }
    
    showBuildFeedback() {
        const card = this.shadowRoot.querySelector('.card');
        card.classList.add('pulse');
        
        // Reset after animation
        setTimeout(() => {
            card.classList.remove('pulse');
        }, 1000);
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
