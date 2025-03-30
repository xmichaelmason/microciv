import { GameState } from './game-state.js';
import './components/game-ui.js';
import './components/events-log.js';

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    window.gameState = gameState; // Make it available globally for debugging
    
    // Format numbers to 1 decimal place
    const formatNumber = (num) => Number(num.toFixed(1));
    
    // Set up end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.addEventListener('click', () => {
        gameState.endTurn();
        updateUI();
    });
    
    // Initialize the events log in the right panel
    initializeEventsLog();
    
    // Set up terrain selection
    const terrainSelect = document.getElementById('terrain-select');
    if (terrainSelect) {
        // Populate terrain options
        const terrainOptions = gameState.terrainSystem.getAllTerrainTypes();
        terrainOptions.forEach(terrain => {
            const option = document.createElement('option');
            option.value = terrain.id;
            option.textContent = terrain.name;
            terrainSelect.appendChild(option);
        });
        
        terrainSelect.addEventListener('change', (e) => {
            gameState.terrainSystem.changeTerrain(e.target.value);
            gameState.updateProduction();
            gameState.addEvent(`Moved to ${gameState.terrainSystem.getCurrentTerrain().name} terrain`);
            updateUI();
        });
    }
    
    // Set up technology research
    const techSelect = document.getElementById('tech-select');
    const researchBtn = document.getElementById('research-btn');
    
    if (techSelect && researchBtn) {
        updateTechOptions();
        
        researchBtn.addEventListener('click', () => {
            const selectedTech = techSelect.value;
            if (selectedTech) {
                gameState.technologySystem.startResearch(selectedTech);
                updateTechOptions();
                updateUI();
            }
        });
    }
    
    // Set up military unit training
    const unitSelect = document.getElementById('unit-select');
    const trainBtn = document.getElementById('train-btn');
    
    if (unitSelect && trainBtn) {
        trainBtn.addEventListener('click', () => {
            const selectedUnit = unitSelect.value;
            if (selectedUnit) {
                gameState.militarySystem.trainUnit(selectedUnit);
                updateUI();
            }
        });
    }
    
    // Set up trading UI
    document.addEventListener('showTradeDialog', () => {
        if (gameState.showTradeDialog) {
            showTradeUI();
        }
    });
    
    // Initialize the events log in the right panel
    function initializeEventsLog() {
        const eventsLogContainer = document.getElementById('events-log-container');
        if (!eventsLogContainer) return;
        
        // Create a new events-log element
        const eventsLog = document.createElement('events-log');
        eventsLogContainer.appendChild(eventsLog);
    }
    
    function showTradeUI() {
        const tradeDialog = document.getElementById('trade-dialog');
        if (!tradeDialog) return;
        
        // Clear existing options
        const tradeOptions = document.getElementById('trade-options');
        tradeOptions.innerHTML = '';
        
        // Add trade options
        gameState.tradeOptions.forEach((trade, index) => {
            const option = document.createElement('div');
            option.className = 'trade-option';
            option.innerHTML = `
                <p>Give: ${trade.give.amount} ${trade.give.resource}</p>
                <p>Receive: ${trade.receive.amount} ${trade.receive.resource}</p>
                <button class="trade-btn" data-index="${index}">Accept Trade</button>
            `;
            tradeOptions.appendChild(option);
        });
        
        // Add event listeners to trade buttons
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tradeIndex = parseInt(e.target.dataset.index);
                gameState.trade(tradeIndex);
                tradeDialog.style.display = 'none';
                updateUI();
            });
        });
        
        // Show the dialog
        tradeDialog.style.display = 'block';
        
        // Close button
        const closeBtn = document.querySelector('#trade-dialog .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                tradeDialog.style.display = 'none';
                gameState.tradeOptions = [];
                gameState.showTradeDialog = false;
            });
        }
    }
    
    function updateTechOptions() {
        if (!techSelect) return;
        
        // Clear existing options
        techSelect.innerHTML = '';
        
        // Add available technologies
        const availableTechs = gameState.technologySystem.getAvailableTechnologies();
        availableTechs.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = `${tech.name} (${tech.cost} science) - ${tech.description}`;
            techSelect.appendChild(option);
        });
        
        // Disable if no options or currently researching
        techSelect.disabled = availableTechs.length === 0 || gameState.technologySystem.currentResearch !== null;
        researchBtn.disabled = availableTechs.length === 0 || gameState.technologySystem.currentResearch !== null;
    }
    
    // Function to update UI elements
    function updateUI() {
        // Update the main game UI
        document.querySelector('game-ui').updateUI();
        
        // Update events log in the right panel
        const eventsLog = document.querySelector('#events-log-container events-log');
        if (eventsLog) {
            eventsLog.updateEvents();
        }
        
        // Update turn counter
        document.getElementById('turn-counter').textContent = gameState.turn;
        
        // Update current season
        const seasonInfo = gameState.seasonsSystem.getCurrentSeasonInfo();
        const seasonDisplay = document.getElementById('current-season');
        if (seasonDisplay) {
            seasonDisplay.textContent = `${seasonInfo.name} (${seasonInfo.turnsRemaining} turns remaining)`;
        }
        
        // Update current terrain
        const terrainInfo = gameState.terrainSystem.getTerrainInfo();
        const terrainDisplay = document.getElementById('current-terrain');
        if (terrainDisplay) {
            terrainDisplay.textContent = terrainInfo.name;
        }
        
        // Update technology research progress
        const techProgress = document.getElementById('tech-progress');
        const currentResearch = document.getElementById('current-research');
        if (techProgress && currentResearch) {
            const progress = gameState.technologySystem.getResearchProgress();
            techProgress.value = progress;
            currentResearch.textContent = gameState.technologySystem.getCurrentResearchName();
        }
        
        // Update tech options in case something was researched
        updateTechOptions();
        
        // Update defense value display
        const defenseDisplay = document.getElementById('defense-value');
        if (defenseDisplay) {
            defenseDisplay.textContent = gameState.militarySystem.defenseValue;
        }
        
        // Check if a trade dialog should be displayed
        if (gameState.showTradeDialog) {
            showTradeUI();
        }
        
        // Check production multipliers to highlight bonuses
        updateProductionMultipliers();
    }
    
    function updateProductionMultipliers() {
        const prodMultipliers = document.getElementById('production-multipliers');
        if (!prodMultipliers) return;
        
        prodMultipliers.innerHTML = '';
        
        // Add info about active multipliers
        const terrain = gameState.terrainSystem.getCurrentTerrain();
        const season = gameState.seasonsSystem.getCurrentSeasonInfo();
        
        // Terrain modifier
        const terrainLi = document.createElement('li');
        terrainLi.textContent = `${terrain.name} terrain: Food ${formatNumber(terrain.modifiers.food * 100)}%, Wood ${formatNumber(terrain.modifiers.wood * 100)}%, Stone ${formatNumber(terrain.modifiers.stone * 100)}%`;
        prodMultipliers.appendChild(terrainLi);
        
        // Season modifier
        const seasonLi = document.createElement('li');
        seasonLi.textContent = `${season.name} season: Food ${formatNumber(season.modifiers.food * 100)}%, Wood ${formatNumber(season.modifiers.wood * 100)}%, Stone ${formatNumber(season.modifiers.stone * 100)}%`;
        prodMultipliers.appendChild(seasonLi);
        
        // Technology modifiers
        for (const [buildingType, multiplier] of Object.entries(gameState.productionMultipliers)) {
            if (multiplier !== 1.0) {
                const techLi = document.createElement('li');
                techLi.textContent = `${buildingType} efficiency: ${formatNumber(multiplier * 100)}%`;
                prodMultipliers.appendChild(techLi);
            }
        }
    }
    
    // Initial UI update
    updateUI();
});
