class ResourceDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.updateResources();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-bottom: 1px solid #ddd;
                }
                .resources {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .resource {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px 15px;
                    border-radius: 5px;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .resource-value {
                    font-size: 1.4em;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .resource-name {
                    font-size: 0.9em;
                    color: #666;
                }
                .production {
                    font-size: 0.8em;
                    color: green;
                }
                .food { color: #8BC34A; }
                .wood { color: #795548; }
                .stone { color: #9E9E9E; }
                .population { color: #2196F3; }
                .science { color: #9C27B0; }
            </style>
            
            <div class="resources">
                <div class="resource">
                    <div class="resource-name">Food</div>
                    <div class="resource-value food" id="food-value">0</div>
                    <div class="production" id="food-production">+0/turn</div>
                </div>
                
                <div class="resource">
                    <div class="resource-name">Wood</div>
                    <div class="resource-value wood" id="wood-value">0</div>
                    <div class="production" id="wood-production">+0/turn</div>
                </div>
                
                <div class="resource">
                    <div class="resource-name">Stone</div>
                    <div class="resource-value stone" id="stone-value">0</div>
                    <div class="production" id="stone-production">+0/turn</div>
                </div>
                
                <div class="resource">
                    <div class="resource-name">Science</div>
                    <div class="resource-value science" id="science-value">0</div>
                    <div class="production" id="science-production">+0/turn</div>
                </div>
                
                <div class="resource">
                    <div class="resource-name">Population</div>
                    <div class="resource-value population" id="population-value">0/0</div>
                    <div class="production" id="food-consumption">-0 food/turn</div>
                </div>
            </div>
        `;
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
        
        // Update production rates
        this.shadowRoot.getElementById('food-production').textContent = `+${formatNumber(gameState.production.food)}/turn`;
        this.shadowRoot.getElementById('wood-production').textContent = `+${formatNumber(gameState.production.wood)}/turn`;
        this.shadowRoot.getElementById('stone-production').textContent = `+${formatNumber(gameState.production.stone)}/turn`;
        this.shadowRoot.getElementById('science-production').textContent = `+${formatNumber(gameState.production.science)}/turn`;
        
        // Update food consumption
        const consumption = gameState.population.current * gameState.population.foodConsumptionPerPerson;
        this.shadowRoot.getElementById('food-consumption').textContent = `-${formatNumber(consumption)} food/turn`;
    }
}

customElements.define('resource-display', ResourceDisplay);
