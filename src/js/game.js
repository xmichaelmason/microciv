import { GameState } from './game-state.js';
import './components/game-ui.js';
import './components/events-log.js';

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    window.gameState = gameState; // Make it available globally for debugging
    
    // Format numbers to 1 decimal place
    const formatNumber = (num) => Number(num.toFixed(1));
    
    // Set up tab navigation
    setupTabs();
    
    // Set up end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.addEventListener('click', () => {
        gameState.endTurn();
        updateUI();
    });
    
    // Initialize the events log
    initializeEventsLog();
    
    // Initialize buildings in the buildings tab
    initializeBuildingsTab();
    
    // Initialize the research tab
    initializeResearchTab();
    
    // Initialize the military tab
    initializeMilitaryTab();
    
    // Initialize the terrain tab
    initializeTerrainTab();
    
    // Set up trading UI
    document.addEventListener('showTradeDialog', () => {
        if (gameState.showTradeDialog) {
            showTradeUI();
        }
    });
    
    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Show the corresponding pane
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
    
    // Initialize the events log
    function initializeEventsLog() {
        const eventsLogContainer = document.getElementById('events-log-container');
        if (!eventsLogContainer) return;
        
        // Create a new events-log element
        const eventsLog = document.createElement('events-log');
        eventsLogContainer.appendChild(eventsLog);
    }
    
    // Initialize buildings tab with all building types
    function initializeBuildingsTab() {
        const buildingsGrid = document.querySelector('.buildings-grid');
        if (!buildingsGrid) return;
        
        // Building types organized by category
        const buildingsByCategory = {
            resources: ['house', 'farm', 'lumberMill', 'quarry', 'library'],
            defense: ['barracks', 'wall'],
            victory: ['monument']
        };
        
        // Create buildings grouped by category
        for (const [category, buildings] of Object.entries(buildingsByCategory)) {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            buildingsGrid.appendChild(categoryHeader);
            
            // Add buildings for this category
            buildings.forEach(type => {
                const buildingCard = document.createElement('building-card');
                buildingCard.setAttribute('type', type);
                buildingsGrid.appendChild(buildingCard);
            });
        }
    }
    
    // Initialize research tab
    function initializeResearchTab() {
        const techList = document.getElementById('tech-list');
        if (!techList) return;
        
        updateTechOptions();
    }
    
    // Update technology research UI
    function updateTechOptions() {
        const techList = document.getElementById('tech-list');
        if (!techList) return;
        
        // Clear existing options
        techList.innerHTML = '';
        
        // Add available technologies as cards
        const availableTechs = gameState.technologySystem.getAvailableTechnologies();
        
        if (availableTechs.length === 0) {
            const noTech = document.createElement('div');
            noTech.className = 'no-tech-message';
            noTech.textContent = 'No technologies available to research at this time.';
            techList.appendChild(noTech);
        } else {
            availableTechs.forEach(tech => {
                const techCard = document.createElement('div');
                techCard.className = 'tech-option';
                
                // Check if player can afford this tech
                const canAfford = gameState.resources.science >= tech.cost;
                if (!canAfford) {
                    techCard.classList.add('disabled');
                }
                
                techCard.innerHTML = `
                    <div class="tech-name">${tech.name}</div>
                    <div class="tech-cost">${tech.cost} science points</div>
                    <div class="tech-description">${tech.description}</div>
                    <button class="research-btn" data-tech-id="${tech.id}" ${!canAfford ? 'disabled' : ''}>
                        ${!canAfford ? 'Not Enough Science' : 'Research'}
                    </button>
                `;
                
                // Add click event for research button
                const researchBtn = techCard.querySelector('.research-btn');
                researchBtn.addEventListener('click', () => {
                    if (canAfford) {
                        gameState.technologySystem.startResearch(tech.id);
                        updateResearchedTechList();
                        updateUI();
                    }
                });
                
                techList.appendChild(techCard);
            });
        }
    }

    // Update the list of researched technologies
    function updateResearchedTechList() {
        const researchedList = document.getElementById('researched-tech-list');
        if (!researchedList) return;

        // Clear existing list
        researchedList.innerHTML = '';

        // Get researched technologies
        const researched = gameState.technologySystem.researched;
        
        if (researched.length === 0) {
            researchedList.innerHTML = '<span class="no-techs">None yet</span>';
            return;
        }
        
        // Add each researched tech to the list
        researched.forEach(techId => {
            const tech = gameState.technologySystem.technologies[techId];
            if (!tech) return;
            
            const techSpan = document.createElement('span');
            techSpan.className = 'researched-tech';
            techSpan.textContent = tech.name;
            researchedList.appendChild(techSpan);
        });
    }
    
    // Initialize military tab
    function initializeMilitaryTab() {
        const trainWarriorBtn = document.getElementById('train-warrior');
        const trainArcherBtn = document.getElementById('train-archer');
        
        if (trainWarriorBtn) {
            trainWarriorBtn.addEventListener('click', () => {
                if (gameState.militarySystem) {
                    gameState.militarySystem.trainUnit('warrior');
                    updateUI();
                }
            });
        }
        
        if (trainArcherBtn) {
            trainArcherBtn.addEventListener('click', () => {
                if (gameState.militarySystem) {
                    gameState.militarySystem.trainUnit('archer');
                    updateUI();
                }
            });
        }
    }
    
    // Initialize terrain tab
    function initializeTerrainTab() {
        const terrainOptions = document.getElementById('terrain-options');
        if (!terrainOptions) return;
        
        // Get all terrain types
        const allTerrains = gameState.terrainSystem.getAllTerrainTypes();
        
        // Create terrain option cards
        allTerrains.forEach(terrain => {
            const terrainCard = document.createElement('div');
            terrainCard.className = 'terrain-option';
            if (gameState.terrainSystem.currentTerrain === terrain.id) {
                terrainCard.classList.add('active');
            }
            
            // Get detailed terrain info for modifiers
            const terrainInfo = gameState.terrainSystem.terrainTypes[terrain.id];
            const modifiers = terrainInfo.modifiers;
            
            terrainCard.innerHTML = `
                <div class="terrain-name">${terrain.name}</div>
                <div class="terrain-description">${terrain.description}</div>
                <div class="terrain-modifiers">
                    Food: ${formatNumber(modifiers.food * 100)}% • 
                    Wood: ${formatNumber(modifiers.wood * 100)}% • 
                    Stone: ${formatNumber(modifiers.stone * 100)}%
                </div>
            `;
            
            // Add click event to select terrain
            terrainCard.addEventListener('click', () => {
                if (gameState.terrainSystem.currentTerrain !== terrain.id) {
                    gameState.terrainSystem.changeTerrain(terrain.id);
                    gameState.updateProduction();
                    gameState.addEvent(`Moved to ${terrain.name} terrain`);
                    
                    // Update active class
                    document.querySelectorAll('.terrain-option').forEach(card => {
                        card.classList.remove('active');
                    });
                    terrainCard.classList.add('active');
                    
                    updateUI();
                }
            });
            
            terrainOptions.appendChild(terrainCard);
        });
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
    
    // Function to update UI elements
    function updateUI() {
        // Update resource display
        const resourceDisplay = document.querySelector('resource-display');
        if (resourceDisplay) {
            resourceDisplay.updateResources();
        }
        
        // Update events log
        const eventsLog = document.querySelector('#events-log-container events-log');
        if (eventsLog) {
            eventsLog.updateEvents();
        }
        
        // Update building cards
        const buildingCards = document.querySelectorAll('building-card');
        buildingCards.forEach(card => {
            card.updateBuildingInfo();
        });
        
        // Update turn counter
        document.getElementById('turn-counter').textContent = gameState.turn;
        
        // Update current season
        const seasonInfo = gameState.seasonsSystem.getCurrentSeasonInfo();
        document.getElementById('current-season').textContent = `${seasonInfo.name} (${seasonInfo.turnsRemaining})`;
        
        // Update current terrain
        document.getElementById('current-terrain').textContent = gameState.terrainSystem.getCurrentTerrain().name;
        
        // Update defense value
        document.getElementById('defense-value').textContent = gameState.militarySystem.defenseValue;
        if (document.getElementById('defense-rating')) {
            document.getElementById('defense-rating').textContent = gameState.militarySystem.defenseValue;
        }
        
        // Update military units count
        if (document.getElementById('warrior-count')) {
            document.getElementById('warrior-count').textContent = gameState.militarySystem.units.warriors;
        }
        if (document.getElementById('archer-count')) {
            document.getElementById('archer-count').textContent = gameState.militarySystem.units.archers;
        }
        
        // Update military buttons state
        const trainWarriorBtn = document.getElementById('train-warrior');
        const trainArcherBtn = document.getElementById('train-archer');
        
        if (trainWarriorBtn && trainArcherBtn) {
            const hasBarracks = gameState.buildings.barracks > 0;
            const canAffordWarrior = hasBarracks && 
                gameState.resources.food >= gameState.militarySystem.unitCosts.warrior.food && 
                gameState.resources.wood >= gameState.militarySystem.unitCosts.warrior.wood;
            const canAffordArcher = hasBarracks && 
                gameState.resources.food >= gameState.militarySystem.unitCosts.archer.food && 
                gameState.resources.wood >= gameState.militarySystem.unitCosts.archer.wood;
                
            trainWarriorBtn.disabled = !canAffordWarrior;
            trainArcherBtn.disabled = !canAffordArcher;
        }
        
        // Update tech options and researched techs
        updateTechOptions();
        updateResearchedTechList();
        
        // Update production multipliers
        updateProductionMultipliers();
        
        // Check if a trade dialog should be displayed
        if (gameState.showTradeDialog) {
            showTradeUI();
        }
        
        // Check for win condition
        if (gameState.gameWon) {
            showWinMessage();
        }
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
    
    function showWinMessage() {
        // Check if win overlay already exists
        if (document.querySelector('.win-overlay')) return;
        
        const winOverlay = document.createElement('div');
        winOverlay.className = 'win-overlay';
        winOverlay.innerHTML = `
            <h1>Victory!</h1>
            <p>You have built the Monument and secured your civilization's legacy.</p>
            <button id="restart-btn">Start New Game</button>
        `;
        
        document.body.appendChild(winOverlay);
        
        // Set up restart button
        winOverlay.querySelector('#restart-btn').addEventListener('click', () => {
            window.gameState = new GameState();
            updateUI();
            winOverlay.remove();
        });
    }
    
    // Initial UI update
    updateUI();
});
