class BuildingCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Bound methods for event listeners
        this.handleResourceChange = this.updateBuildingInfo.bind(this);
        this.handleBuildingChange = this.updateBuildingInfo.bind(this);
    }
    
    static get observedAttributes() {
        return ['type'];
    }
    
    connectedCallback() {
        this.render();
        this.addEventListeners();
        this.updateBuildingInfo();
        
        // Add global event listeners for dynamic updates
        document.addEventListener('resourcesChanged', this.handleResourceChange);
        document.addEventListener('buildingChanged', this.handleBuildingChange);
    }
    
    disconnectedCallback() {
        // Clean up event listeners when component is removed from DOM
        document.removeEventListener('resourcesChanged', this.handleResourceChange);
        document.removeEventListener('buildingChanged', this.handleBuildingChange);
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
                    padding: 0 5px 5px;
                    background-color: rgba(255, 87, 34, 0.05);
                    border-radius: 0 0 12px 12px;
                    line-height: 1.4;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 2;
                }
                
                /* Extra space to accommodate requirement message */
                .card-body {
                    padding-bottom: 25px; 
                }

                @keyframes buildPulse {
                    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                }
                
                .pulse {
                    animation: buildPulse 1s;
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .card {
                        height: 170px;
                    }
                    .card-header {
                        padding: 8px 10px;
                    }
                    .card-body {
                        padding: 8px 10px;
                        padding-bottom: 25px; /* Space for requirement msg */
                    }
                }
                
                @media (max-width: 576px) {
                    .card {
                        height: auto;
                        min-height: 120px;
                        border-radius: 8px;
                    }
                    .building-title {
                        font-size: 0.9em;
                    }
                    .building-effect {
                        margin-bottom: 8px;
                        font-size: 0.8em;
                    }
                    .cost-section {
                        padding-top: 8px;
                    }
                    .cost-title {
                        font-size: 0.7em;
                        margin-bottom: 4px;
                    }
                    .card-accent {
                        height: 5px;
                    }
                    .building-count {
                        padding: 2px 6px;
                        font-size: 0.7em;
                    }
                }
                
                /* Additional compact mode for even smaller screens */
                @media (max-width: 480px) {
                    :host {
                        margin: 3px;
                    }
                    .card {
                        min-height: 90px;
                        border-radius: 6px;
                    }
                    .card-header {
                        padding: 5px 8px;
                    }
                    .card-body {
                        padding: 5px 8px 25px;
                    }
                    .building-icon {
                        font-size: 1em;
                    }
                    .building-title span:nth-child(2) {
                        font-size: 0.9em;
                    }
                    .building-effect {
                        font-size: 0.75em;
                        margin-bottom: 5px;
                    }
                    .cost {
                        gap: 6px;
                        font-size: 0.75em;
                    }
                    .cost-item {
                        padding: 2px 4px;
                    }
                    .cost-icon {
                        width: 8px;
                        height: 8px;
                    }
                    .requirement-msg {
                        font-size: 0.65em;
                    }
                    .locked::after {
                        font-size: 0.9em;
                        top: 5px;
                        right: 5px;
                    }
                }
                
                /* Icon-only mode for very small screens */
                @media (max-width: 380px) {
                    .buildings-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 5px;
                    }
                    :host {
                        margin: 2px;
                    }
                    .card {
                        min-height: 75px;
                        border-radius: 5px;
                    }
                    .card-accent {
                        height: 3px;
                    }
                    .building-title span:nth-child(2) {
                        display: none; /* Hide building name text */
                    }
                    .building-icon {
                        font-size: 1.2em;
                    }
                    .building-effect {
                        font-size: 0.7em;
                        margin-bottom: 5px;
                        max-height: 25px;
                        overflow: hidden;
                    }
                    .cost-title {
                        display: none;
                    }
                    /* Even in compact mode, ensure requirement message is visible */
                    .requirement-msg {
                        position: absolute;
                        bottom: 0;
                        font-weight: bold;
                        padding: 2px;
                        font-size: 0.65em;
                        background-color: rgba(255, 87, 34, 0.1);
                    }
                }
                
                /* Touch optimizations */
                @media (hover: none) and (pointer: coarse) {
                    .card {
                        -webkit-tap-highlight-color: transparent;
                    }
                    .card:active:not(.disabled) {
                        transform: scale(0.98);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                        background-color: #fafafa;
                    }
                    /* Remove hover effect on mobile */
                    .card:hover:not(.disabled) {
                        transform: none;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
                    }
                    /* Increase touch target size */
                    .card-header {
                        min-height: 40px;
                    }
                    @media (max-width: 480px) {
                        .card-header {
                            min-height: 30px;
                        }
                    }
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
        
        // Add both touch and click events for better mobile response
        ['click', 'touchend'].forEach(eventName => {
            card.addEventListener(eventName, (e) => {
                // For touch events, prevent default to avoid double triggering
                if (eventName === 'touchend') {
                    e.preventDefault();
                }
                
                const gameState = window.gameState;
                if (!gameState) return;
                
                if (gameState.canAfford(this.type) && gameState.meetsRequirements(this.type)) {
                    const success = gameState.build(this.type);
                    
                    if (success) {
                        // Immediately update count display instead of waiting for end turn
                        this.updateBuildingInfo();
                        
                        // Provide visual feedback on successful build
                        this.showBuildFeedback();
                        
                        // Dispatch events to notify resource and building changes
                        document.dispatchEvent(new CustomEvent('resourcesChanged'));
                        document.dispatchEvent(new CustomEvent('buildingChanged'));
                        
                        // Update UI through game-ui component or document events
                        const gameUI = document.querySelector('game-ui');
                        if (gameUI) {
                            gameUI.updateUI();
                        } else {
                            // Direct update of resource display as fallback
                            const resourceDisplay = document.querySelector('resource-display');
                            if (resourceDisplay) {
                                resourceDisplay.updateResources();
                            }
                        }
                    }
                }
            });
        });

        // Add touchstart event for feedback
        card.addEventListener('touchstart', function(e) {
            // Don't provide feedback for disabled cards
            if (!this.classList.contains('disabled')) {
                this.style.backgroundColor = '#f5f5f5';
            }
        });

        // Add touchend/touchcancel to reset appearance
        ['touchend', 'touchcancel'].forEach(eventName => {
            card.addEventListener(eventName, function() {
                // Reset background after touch
                setTimeout(() => {
                    this.style.backgroundColor = '';
                }, 150);
            });
        });
    }
    
    showBuildFeedback() {
        const card = this.shadowRoot.querySelector('.card');
        card.classList.add('pulse');
        
        // Reset after animation
        setTimeout(() => {
            card.classList.remove('pulse');
        }, 1000);

        // Add haptic feedback for devices that support it
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
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
            reqMsg.style.display = 'block';
        } else if (!canAfford) {
            card.classList.add('disabled');
            reqMsg.textContent = "Not enough resources";
            reqMsg.style.display = 'block';
        } else {
            card.classList.add('affordable');
            reqMsg.textContent = "";
            reqMsg.style.display = 'none';
        }
    }
}

customElements.define('building-card', BuildingCard);
