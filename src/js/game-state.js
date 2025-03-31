import { TechnologySystem } from './technology-system.js';
import { EventsSystem } from './events-system.js';
import { MilitarySystem } from './military-system.js';
import { TerrainSystem } from './terrain-system.js';
import { SeasonsSystem } from './seasons-system.js';

export class GameState {
    constructor() {
        this.resources = {
            food: 10,
            wood: 10,
            stone: 0,
            science: 0  // New resource for technology research
        };
        
        this.population = {
            current: 2,
            capacity: 4, // Initial houses provide this capacity
            foodConsumptionPerPerson: 1
        };
        
        // Base production values (unmodified by terrain/seasons)
        this.baseProduction = {
            food: 1, // Base food production
            wood: 0.5, // Base wood production
            stone: 0.1,  // Base stone production
            science: 0.5 // Base science production
        };
        
        // Actual production (modified by terrain/seasons/tech)
        this.production = {
            food: 1,
            wood: 0.5,
            stone: 0.1,
            science: 0.5
        };
        
        // Production multipliers
        this.productionMultipliers = {
            farm: 1.0,
            lumberMill: 1.0,
            quarry: 1.0,
            library: 1.0
        };
        
        this.buildings = {
            house: 2,    // Start with 2 houses
            farm: 0,
            lumberMill: 0,
            quarry: 0,
            library: 0,  // New building for science
            barracks: 0, // Military building
            wall: 0,     // Defense structure
            monument: 0  // Win condition
        };
        
        // Building costs
        this.buildingCosts = {
            house: { wood: 5, stone: 0 },
            farm: { wood: 5, stone: 0 },
            lumberMill: { wood: 3, stone: 5 },
            quarry: { wood: 5, stone: 3 },
            library: { wood: 8, stone: 5 },
            barracks: { wood: 10, stone: 5 },
            wall: { wood: 5, stone: 15 },
            monument: { wood: 30, stone: 30 }
        };
        
        // Building production values for terrain modifiers
        this.buildingProductionValues = {
            farm: { resource: 'food', amount: 3 },
            lumberMill: { resource: 'wood', amount: 2 },
            quarry: { resource: 'stone', amount: 2 },
            library: { resource: 'science', amount: 1.5 }
        };
        
        // Building effects
        this.buildingEffects = {
            house: () => { this.population.capacity += 2; },
            farm: () => { this.production.food += 3 * this.productionMultipliers.farm; },
            lumberMill: () => { this.production.wood += 2 * this.productionMultipliers.lumberMill; },
            quarry: () => { this.production.stone += 2 * this.productionMultipliers.quarry; },
            library: () => { this.production.science += 1.5 * this.productionMultipliers.library; },
            barracks: () => { 
                // Barracks increase defense and allow training units
                if (this.militarySystem) {
                    this.militarySystem.updateDefenseValue();
                }
            },
            wall: () => { 
                // Walls provide defense
                if (this.militarySystem) {
                    this.militarySystem.updateDefenseValue();
                }
            },
            monument: () => { this.gameWon = true; }
        };
        
        // Building requirements (technologies, other buildings)
        this.buildingRequirements = {
            house: { tech: [], building: {} },
            farm: { tech: [], building: {} },
            lumberMill: { tech: [], building: {} },
            quarry: { tech: [], building: {} },
            library: { tech: [], building: {} },
            barracks: { tech: ['construction'], building: {} },
            wall: { tech: ['construction'], building: { barracks: 1 } },
            monument: { tech: [], building: {} }
        };
        
        // Initialize strategic systems
        this.technologySystem = new TechnologySystem(this);
        this.eventsSystem = new EventsSystem(this);
        this.militarySystem = new MilitarySystem(this);
        this.terrainSystem = new TerrainSystem();
        this.seasonsSystem = new SeasonsSystem(this);
        
        // Trade system (simple placeholder)
        this.tradeOptions = [];
        this.showTradeDialog = false;
        
        this.turn = 1;
        this.gameWon = false;
        this.events = [];
        
        // Apply initial production modifiers from terrain/seasons
        this.updateProduction();
    }
    
    // Check if player can afford a building
    canAfford(buildingType) {
        const costs = this.buildingCosts[buildingType];
        return Object.entries(costs).every(([resource, amount]) => 
            this.resources[resource] >= amount
        );
    }
    
    // Check if building requirements are met
    meetsRequirements(buildingType) {
        const reqs = this.buildingRequirements[buildingType];
        
        // Check technology requirements
        if (reqs.tech && reqs.tech.length > 0) {
            if (!reqs.tech.every(tech => this.technologySystem.researched.includes(tech))) {
                return false;
            }
        }
        
        // Check building requirements
        if (reqs.building) {
            for (const [reqBuilding, count] of Object.entries(reqs.building)) {
                if (!this.buildings[reqBuilding] || this.buildings[reqBuilding] < count) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Construct a new building
    build(buildingType) {
        if (!this.canAfford(buildingType)) {
            this.addEvent(`Cannot afford ${buildingType}`);
            return false;
        }
        
        if (!this.meetsRequirements(buildingType)) {
            this.addEvent(`Requirements not met for ${buildingType}`);
            return false;
        }
        
        // Pay the costs
        const costs = this.buildingCosts[buildingType];
        for (const [resource, amount] of Object.entries(costs)) {
            this.resources[resource] -= amount;
            
            // Ensure resources don't go negative (safeguard)
            if (this.resources[resource] < 0) {
                this.resources[resource] = 0;
            }
        }
        
        // Add the building and apply its effects
        this.buildings[buildingType]++;
        
        // Apply the building effect
        this.buildingEffects[buildingType]();
        
        this.addEvent(`Built a new ${buildingType}`);
        
        // Update production after building constructed
        this.updateProduction();
        return true;
    }
    
    // Generate trade options for when caravans visit
    generateTradeOptions() {
        const tradeMultiplier = this.tradeSystem?.terrainTradeMultiplier || 1.0;
        
        this.tradeOptions = [
            {
                give: { resource: 'food', amount: Math.floor(5 * tradeMultiplier) },
                receive: { resource: 'wood', amount: Math.floor(4 * tradeMultiplier) }
            },
            {
                give: { resource: 'wood', amount: Math.floor(4 * tradeMultiplier) },
                receive: { resource: 'stone', amount: Math.floor(3 * tradeMultiplier) }
            },
            {
                give: { resource: 'stone', amount: Math.floor(3 * tradeMultiplier) },
                receive: { resource: 'food', amount: Math.floor(6 * tradeMultiplier) }
            }
        ];
    }
    
    // Accept a trade
    trade(tradeIndex) {
        if (tradeIndex >= this.tradeOptions.length) {
            this.addEvent('Invalid trade option');
            return false;
        }
        
        const trade = this.tradeOptions[tradeIndex];
        
        // Check if player can afford the trade
        if (this.resources[trade.give.resource] < trade.give.amount) {
            this.addEvent(`Not enough ${trade.give.resource} for this trade`);
            return false;
        }
        
        // Execute the trade
        this.resources[trade.give.resource] -= trade.give.amount;
        this.resources[trade.receive.resource] += trade.receive.amount;
        
        this.addEvent(`Traded ${trade.give.amount} ${trade.give.resource} for ${trade.receive.amount} ${trade.receive.resource}`);
        
        // Clear trade options
        this.tradeOptions = [];
        this.showTradeDialog = false;
        
        return true;
    }
    
    // Update production based on all factors
    updateProduction() {
        // Reset to base values
        this.production = {...this.baseProduction};
        
        // Apply building effects
        for (const [buildingType, count] of Object.entries(this.buildings)) {
            if (count > 0 && buildingType !== 'house' && buildingType !== 'monument' && buildingType !== 'barracks' && buildingType !== 'wall') {
                // For each building, add its production * count * multiplier
                const productionValue = this.buildingProductionValues[buildingType];
                if (productionValue) {
                    const { resource, amount } = productionValue;
                    this.production[resource] += amount * count * this.productionMultipliers[buildingType];
                }
            }
        }
        
        // Apply terrain modifiers
        this.terrainSystem.applyTerrainModifiers(this);
        
        // Apply season modifiers - using current season modifiers
        const currentSeason = this.seasonsSystem.seasons[this.seasonsSystem.currentSeason];
        if (currentSeason && currentSeason.modifiers) {
            for (const resource in this.production) {
                if (currentSeason.modifiers[resource]) {
                    this.production[resource] *= currentSeason.modifiers[resource];
                }
            }
        }
    }
    
    // End the current turn and process effects
    endTurn() {
        // Process season changes
        this.seasonsSystem.processTurn();
        
        // Process technology research
        this.technologySystem.processTurn();
        
        // Process military and raids
        this.militarySystem.processTurn();
        
        // Check for random events
        this.eventsSystem.checkForRandomEvent();
        
        // Collect resources based on production and ensure they never go below zero
        for (const [resource, rate] of Object.entries(this.production)) {
            this.resources[resource] += rate;
            // Ensure resources don't go below zero
            if (this.resources[resource] < 0) {
                this.resources[resource] = 0;
            }
        }
        
        // Population consumes food
        const foodNeeded = this.population.current * this.population.foodConsumptionPerPerson;
        if (this.resources.food >= foodNeeded) {
            this.resources.food -= foodNeeded;
            
            // Population growth if we have food surplus and housing capacity
            if (this.resources.food >= this.population.foodConsumptionPerPerson && 
                this.population.current < this.population.capacity) {
                this.population.current++;
                this.addEvent("Population increased!");
            }
        } else {
            // Not enough food - lose population
            const foodShortage = foodNeeded - this.resources.food;
            const peopleStarving = Math.ceil(foodShortage / this.population.foodConsumptionPerPerson);
            const actualLoss = Math.min(peopleStarving, this.population.current - 1);
            
            if (actualLoss > 0) {
                this.population.current -= actualLoss;
                this.addEvent(`${actualLoss} people starved due to food shortage!`);
            }
            
            this.resources.food = 0;
        }
        
        // Ensure all resources are non-negative
        Object.keys(this.resources).forEach(resource => {
            if (this.resources[resource] < 0) {
                this.resources[resource] = 0;
            }
        });
        
        this.turn++;
        
        // Check win condition
        if (this.buildings.monument > 0) {
            this.gameWon = true;
            this.addEvent("Victory! You've built the Monument!");
        }
        
        // Check for upcoming season changes
        const seasonWarning = this.seasonsSystem.getSeasonChangeWarning();
        if (seasonWarning.upcoming) {
            this.addEvent(seasonWarning.message);
        }
    }
    
    addEvent(message) {
        this.events.push({ turn: this.turn, message });
        if (this.events.length > 15) {
            this.events.shift(); // Keep only the last 15 events
        }
    }
}
