export class GameState {
    constructor() {
        this.resources = {
            food: 10,
            wood: 10,
            stone: 0
        };
        
        this.population = {
            current: 2,
            capacity: 4, // Initial houses provide this capacity
            foodConsumptionPerPerson: 1
        };
        
        this.production = {
            food: 1, // Base food production
            wood: .5, // Base wood production
            stone: .1  // Base stone production
        };
        
        this.buildings = {
            house: 2,    // Start with 2 houses
            farm: 0,
            lumberMill: 0,
            quarry: 0,
            monument: 0  // Win condition
        };
        
        this.buildingCosts = {
            house: { wood: 5, stone: 0 },
            farm: { wood: 5, stone: 0 },
            lumberMill: { wood: 3, stone: 5 },
            quarry: { wood: 5, stone: 3 },
            monument: { wood: 30, stone: 30 }
        };
        
        this.buildingEffects = {
            house: () => { this.population.capacity += 2; },
            farm: () => { this.production.food += 3; },
            lumberMill: () => { this.production.wood += 2; },
            quarry: () => { this.production.stone += 2; },
            monument: () => { this.gameWon = true; }
        };
        
        this.turn = 1;
        this.gameWon = false;
        this.events = [];
    }
    
    // Check if player can afford a building
    canAfford(buildingType) {
        const costs = this.buildingCosts[buildingType];
        return Object.entries(costs).every(([resource, amount]) => 
            this.resources[resource] >= amount
        );
    }
    
    // Construct a new building
    build(buildingType) {
        if (!this.canAfford(buildingType)) {
            this.addEvent(`Cannot afford ${buildingType}`);
            return false;
        }
        
        // Pay the costs
        const costs = this.buildingCosts[buildingType];
        for (const [resource, amount] of Object.entries(costs)) {
            this.resources[resource] -= amount;
        }
        
        // Add the building and apply its effects
        this.buildings[buildingType]++;
        this.buildingEffects[buildingType]();
        
        this.addEvent(`Built a new ${buildingType}`);
        return true;
    }
    
    // End the current turn and process effects
    endTurn() {
        // Collect resources based on production
        this.resources.food += this.production.food;
        this.resources.wood += this.production.wood;
        this.resources.stone += this.production.stone;
        
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
        
        this.turn++;
        
        // Check win condition
        if (this.buildings.monument > 0) {
            this.gameWon = true;
            this.addEvent("Victory! You've built the Monument!");
        }
    }
    
    addEvent(message) {
        this.events.push({ turn: this.turn, message });
        if (this.events.length > 10) {
            this.events.shift(); // Keep only the last 10 events
        }
    }
}
