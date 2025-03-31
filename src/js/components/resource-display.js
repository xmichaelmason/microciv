class ResourceDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.updateResources();
        // Add responsive handling
        this.setupResponsiveDisplay();
        window.addEventListener('resize', () => this.setupResponsiveDisplay());
    }
    
    disconnectedCallback() {
        // Clean up event listener
        window.removeEventListener('resize', () => this.setupResponsiveDisplay());
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                .resources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }
                .resource-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px;
                    background-color: rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    transition: background-color 0.2s;
                }
                .resource-card:hover {
                    background-color: rgba(255, 255, 255, 0.25);
                }
                .resource-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    margin-bottom: 5px;
                }
                .resource-name {
                    font-size: 0.8em;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                    color: white;
                }
                .resource-value {
                    font-size: 1.4em;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .resource-production {
                    font-size: 0.8em;
                    display: flex;
                    align-items: center;
                }
                .food-icon { background-color: #8BC34A; }
                .wood-icon { background-color: #795548; }
                .stone-icon { background-color: #9E9E9E; }
                .science-icon { background-color: #9C27B0; }
                .population-icon { background-color: #2196F3; }
                
                .food-text { color: #8BC34A; }
                .wood-text { color: #795548; }
                .stone-text { color: #9E9E9E; }
                .science-text { color: #9C27B0; }
                .population-text { color: #2196F3; }
                
                .production-positive {
                    color: #4CAF50;
                }
                .production-negative {
                    color: #F44336;
                }
                
                /* Info bar mode for screens below 864px */
                @media (max-width: 864px) {
                    :host {
                        padding: 5px;
                    }
                    .resources-grid {
                        grid-template-columns: repeat(5, 1fr);
                        gap: 4px;
                    }
                    .resource-card {
                        padding: 4px;
                        flex-direction: row;
                        justify-content: center;
                        background-color: transparent;
                    }
                    .resource-name {
                        display: none; /* Hide name on smaller screens */
                    }
                    .resource-value {
                        font-size: 1em;
                        margin: 0 2px;
                    }
                    .resource-icon {
                        width: 16px;
                        height: 16px;
                        margin: 0 3px 0 0;
                    }
                    .resource-production {
                        display: none; /* Hide production on smaller screens */
                    }
                }
                
                /* More compact styling for the info bar */
                .info-bar-mode {
                    padding: 5px;
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                }
                .info-bar-mode .resources-grid {
                    grid-template-columns: repeat(5, 1fr);
                    gap: 3px;
                }
                .info-bar-mode .resource-card {
                    flex-direction: row;
                    padding: 2px;
                    background-color: transparent;
                    align-items: center;
                    justify-content: center;
                }
                .info-bar-mode .resource-icon {
                    width: 12px;
                    height: 12px;
                    margin: 0 3px 0 0;
                }
                .info-bar-mode .resource-name {
                    display: none;
                }
                .info-bar-mode .resource-production {
                    display: none;
                }
                .info-bar-mode .resource-value {
                    font-size: 0.85em;
                    margin: 0;
                    font-weight: bold;
                }
                
                /* Compact mode for tiny screens */
                @media (max-width: 400px) {
                    :host {
                        padding: 3px;
                        margin-bottom: 3px;
                    }
                    .resource-icon {
                        width: 10px;
                        height: 10px;
                    }
                    .resource-value {
                        font-size: 0.75em;
                    }
                }
            </style>
            
            <div class="resources-grid">
                <div class="resource-card">
                    <div class="resource-icon food-icon"></div>
                    <div class="resource-name">Food</div>
                    <div class="resource-value food-text" id="food-value">0</div>
                    <div class="resource-production" id="food-production">+0/turn</div>
                </div>
                
                <div class="resource-card">
                    <div class="resource-icon wood-icon"></div>
                    <div class="resource-name">Wood</div>
                    <div class="resource-value wood-text" id="wood-value">0</div>
                    <div class="resource-production" id="wood-production">+0/turn</div>
                </div>
                
                <div class="resource-card">
                    <div class="resource-icon stone-icon"></div>
                    <div class="resource-name">Stone</div>
                    <div class="resource-value stone-text" id="stone-value">0</div>
                    <div class="resource-production" id="stone-production">+0/turn</div>
                </div>
                
                <div class="resource-card">
                    <div class="resource-icon science-icon"></div>
                    <div class="resource-name">Science</div>
                    <div class="resource-value science-text" id="science-value">0</div>
                    <div class="resource-production" id="science-production">+0/turn</div>
                </div>
                
                <div class="resource-card">
                    <div class="resource-icon population-icon"></div>
                    <div class="resource-name">Population</div>
                    <div class="resource-value population-text" id="population-value">0/0</div>
                    <div class="resource-production" id="food-consumption">-0 food/turn</div>
                </div>
            </div>
        `;
    }
    
    // New method for responsive layout
    setupResponsiveDisplay() {
        const hostElement = this.shadowRoot.host;
        
        // For screens below 864px, use info bar mode
        if (window.innerWidth <= 864) {
            hostElement.classList.add('info-bar-mode');
        } else {
            // Restore normal layout
            if (hostElement.classList.contains('info-bar-mode')) {
                hostElement.classList.remove('info-bar-mode');
            }
        }
    }
    
    updateResources() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        // Format numbers to 1 decimal place
        const formatNumber = (num) => Number(num.toFixed(1));
        
        // Update resource values
        this.shadowRoot.getElementById('food-value').textContent = formatNumber(gameState.resources.food);
        this.shadowRoot.getElementById('wood-value').textContent = formatNumber(gameState.resources.wood);
        this.shadowRoot.getElementById('stone-value').textContent = formatNumber(gameState.resources.stone);
        this.shadowRoot.getElementById('science-value').textContent = formatNumber(gameState.resources.science);
        
        // Update population
        this.shadowRoot.getElementById('population-value').textContent = 
            `${gameState.population.current}/${gameState.population.capacity}`;
        
        // Update production rates with visual indicators - ensure they're never negative
        this.updateProductionElement('food-production', gameState.production.food);
        this.updateProductionElement('wood-production', gameState.production.wood);
        this.updateProductionElement('stone-production', gameState.production.stone);
        this.updateProductionElement('science-production', gameState.production.science);
        
        // Update food consumption
        const consumption = gameState.population.current * gameState.population.foodConsumptionPerPerson;
        const foodConsumptionElement = this.shadowRoot.getElementById('food-consumption');
        foodConsumptionElement.textContent = `-${formatNumber(consumption)} food/turn`;
        foodConsumptionElement.className = 'resource-production production-negative';
    }
    
    updateProductionElement(elementId, value) {
        const element = this.shadowRoot.getElementById(elementId);
        if (!element) return;
        
        // Ensure value is never negative for display
        value = Math.max(0, value);
        
        // Format the value
        const formattedValue = Number(value.toFixed(1));
        
        // Set text content with appropriate sign
        element.textContent = (formattedValue >= 0 ? '+' : '') + formattedValue + '/turn';
        
        // Set class for styling
        element.className = 'resource-production ' + 
            (formattedValue > 0 ? 'production-positive' : 
             formattedValue < 0 ? 'production-negative' : '');
    }
}

customElements.define('resource-display', ResourceDisplay);
