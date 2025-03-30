// Military panel component for training units and showing defense stats
class MilitaryPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.updatePanel();
        this.addEventListeners();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 10px 0;
                    font-family: Arial, sans-serif;
                }
                .military-panel {
                    background-color: #f5f5f5;
                    border-radius: 5px;
                    padding: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #ddd;
                }
                .defense-value {
                    font-weight: bold;
                    color: #2a6099;
                }
                .unit-training {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                }
                .train-button {
                    background-color: #4c7a34;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 5px 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.9em;
                }
                .train-button:hover {
                    background-color: #5c9641;
                }
                .train-button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
                .unit-icon {
                    width: 16px;
                    height: 16px;
                    display: inline-block;
                }
                .warrior-icon {
                    background-color: #8b4513;
                }
                .archer-icon {
                    background-color: #228b22;
                }
                .unit-count {
                    margin-right: 10px;
                    font-weight: bold;
                }
                .unit-cost {
                    font-size: 0.8em;
                    color: #666;
                }
                .no-barracks {
                    color: #999;
                    font-style: italic;
                    text-align: center;
                    padding: 10px;
                }
                .military-units {
                    margin-top: 10px;
                }
                .unit-stats {
                    display: flex;
                    gap: 15px;
                    margin-top: 5px;
                }
                .unit-stat {
                    font-size: 0.85em;
                    color: #555;
                }
            </style>
            
            <div class="military-panel">
                <div class="panel-header">
                    <h3>Military</h3>
                    <div class="defense-value">Defense: <span id="defense-value">0</span></div>
                </div>
                
                <div id="military-content">
                    <div id="no-barracks-msg" class="no-barracks">
                        Build a Barracks to train military units
                    </div>
                    
                    <div id="military-controls" style="display: none;">
                        <div class="military-units">
                            <div class="unit-count">Warriors: <span id="warrior-count">0</span></div>
                            <div class="unit-count">Archers: <span id="archer-count">0</span></div>
                        </div>
                        
                        <div class="unit-training">
                            <button id="train-warrior" class="train-button">
                                <span class="unit-icon warrior-icon"></span>
                                Train Warrior
                                <span class="unit-cost">(5 food, 3 wood)</span>
                            </button>
                            <button id="train-archer" class="train-button">
                                <span class="unit-icon archer-icon"></span>
                                Train Archer
                                <span class="unit-cost">(5 food, 8 wood)</span>
                            </button>
                        </div>
                        
                        <div class="unit-stats">
                            <div class="unit-stat">Warrior: 3 attack, 5 defense</div>
                            <div class="unit-stat">Archer: 5 attack, 2 defense</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    addEventListeners() {
        const trainWarriorBtn = this.shadowRoot.getElementById('train-warrior');
        const trainArcherBtn = this.shadowRoot.getElementById('train-archer');
        
        if (trainWarriorBtn) {
            trainWarriorBtn.addEventListener('click', () => {
                if (window.gameState?.militarySystem) {
                    window.gameState.militarySystem.trainUnit('warrior');
                    this.updatePanel();
                    
                    // Update parent UI
                    this.dispatchEvent(new CustomEvent('military-update', {
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        }
        
        if (trainArcherBtn) {
            trainArcherBtn.addEventListener('click', () => {
                if (window.gameState?.militarySystem) {
                    window.gameState.militarySystem.trainUnit('archer');
                    this.updatePanel();
                    
                    // Update parent UI
                    this.dispatchEvent(new CustomEvent('military-update', {
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        }
    }
    
    updatePanel() {
        if (!window.gameState?.militarySystem) return;
        
        const militarySystem = window.gameState.militarySystem;
        const hasBarracks = window.gameState.buildings.barracks > 0;
        
        // Update defense value
        const defenseValue = this.shadowRoot.getElementById('defense-value');
        defenseValue.textContent = militarySystem.defenseValue;
        
        // Show/hide controls based on barracks
        const noBarracksMsg = this.shadowRoot.getElementById('no-barracks-msg');
        const militaryControls = this.shadowRoot.getElementById('military-controls');
        
        if (hasBarracks) {
            noBarracksMsg.style.display = 'none';
            militaryControls.style.display = 'block';
            
            // Update unit counts
            const warriorCount = this.shadowRoot.getElementById('warrior-count');
            const archerCount = this.shadowRoot.getElementById('archer-count');
            
            warriorCount.textContent = militarySystem.units.warriors;
            archerCount.textContent = militarySystem.units.archers;
            
            // Update button states based on resources
            const trainWarriorBtn = this.shadowRoot.getElementById('train-warrior');
            const trainArcherBtn = this.shadowRoot.getElementById('train-archer');
            
            const canAffordWarrior = this.canAffordUnit('warrior');
            const canAffordArcher = this.canAffordUnit('archer');
            
            trainWarriorBtn.disabled = !canAffordWarrior;
            trainArcherBtn.disabled = !canAffordArcher;
        } else {
            noBarracksMsg.style.display = 'block';
            militaryControls.style.display = 'none';
        }
    }
    
    canAffordUnit(unitType) {
        if (!window.gameState?.militarySystem?.unitCosts[unitType]) return false;
        
        const costs = window.gameState.militarySystem.unitCosts[unitType];
        return Object.entries(costs).every(([resource, amount]) => 
            window.gameState.resources[resource] >= amount
        );
    }
}

customElements.define('military-panel', MilitaryPanel);