// Military system for MicroCiv
export class MilitarySystem {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Military units and defense structures
        this.units = {
            warriors: 0,
            archers: 0
        };
        
        // Unit costs
        this.unitCosts = {
            warrior: { food: 5, wood: 3 },
            archer: { food: 5, wood: 8 }
        };
        
        // Unit combat stats
        this.unitStats = {
            warrior: { attack: 3, defense: 5 },
            archer: { attack: 5, defense: 2 }
        };
        
        // Defense value of the civilization (from buildings and units)
        this.defenseValue = 0;
        // Terrain defense multiplier - default to 1.0, modified by terrain system
        this.terrainDefenseMultiplier = 1.0;
        this.updateDefenseValue();
        
        // Threat level that increases over time
        this.threatLevel = 0;
        
        // Chance of raid each turn (increases with threat level)
        this.raidChance = 0.1;
        
        // History of raids
        this.raidHistory = [];
    }
    
    // Train a new military unit
    trainUnit(unitType) {
        if (!this.unitCosts[unitType]) {
            this.gameState.addEvent(`Unknown unit type: ${unitType}`);
            return false;
        }
        
        // Check if player has a barracks
        if (this.gameState.buildings.barracks <= 0) {
            this.gameState.addEvent(`Cannot train ${unitType} - need to build a barracks first`);
            return false;
        }
        
        // Check if player can afford the unit
        const costs = this.unitCosts[unitType];
        for (const [resource, amount] of Object.entries(costs)) {
            if (this.gameState.resources[resource] < amount) {
                this.gameState.addEvent(`Cannot afford ${unitType} - need more ${resource}`);
                return false;
            }
        }
        
        // Pay the costs
        for (const [resource, amount] of Object.entries(costs)) {
            this.gameState.resources[resource] -= amount;
        }
        
        // Add the unit
        this.units[unitType + 's']++;
        this.gameState.addEvent(`Trained a new ${unitType}`);
        
        // Update defense value
        this.updateDefenseValue();
        return true;
    }
    
    // Calculate total defense value from buildings and units
    updateDefenseValue() {
        let defense = 0;
        
        // Add defense from buildings
        if (this.gameState.buildings.barracks) {
            defense += this.gameState.buildings.barracks * 5;
        }
        
        if (this.gameState.buildings.wall) {
            defense += this.gameState.buildings.wall * 10;
        }
        
        // Add defense from units
        for (const [unitType, count] of Object.entries(this.units)) {
            const baseType = unitType.endsWith('s') ? unitType.slice(0, -1) : unitType;
            if (this.unitStats[baseType]) {
                defense += count * this.unitStats[baseType].defense;
            }
        }
        
        // Apply terrain defense multiplier if applicable
        defense = Math.floor(defense * this.terrainDefenseMultiplier);
        
        this.defenseValue = defense;
        return defense;
    }
    
    // Process military related events for the turn
    processTurn() {
        // Increase threat level over time, influenced by prosperity
        const prosperityFactor = (
            this.gameState.population.current +
            Object.values(this.gameState.buildings).reduce((a, b) => a + b, 0) +
            Object.values(this.gameState.resources).reduce((a, b) => a + b, 0) / 10
        ) / 10;
        
        this.threatLevel += 0.5 + (prosperityFactor * 0.2);
        
        // Calculate raid chance based on threat level
        const raidProbability = Math.min(0.7, this.raidChance + (this.threatLevel / 100));
        
        // Check for raid
        if (Math.random() < raidProbability) {
            this.conductRaid();
        }
    }
    
    // Simulate a raid against the player's civilization
    conductRaid() {
        // Calculate raid strength based on threat level and turn number
        const baseStrength = 10 + (this.threatLevel * 0.8) + (this.gameState.turn * 0.5);
        const raidStrength = Math.floor(baseStrength * (0.8 + (Math.random() * 0.4)));
        
        const defenseStrength = this.defenseValue;
        const defenseSuccess = defenseStrength >= raidStrength;
        
        let message, losses = {};
        
        if (defenseSuccess) {
            // Successful defense
            message = `Raid repelled! Your defense (${defenseStrength}) withstood the attack (${raidStrength}).`;
            
            // Small chance to gain resources from defeated raiders
            if (Math.random() < 0.3) {
                const loot = Math.floor(3 + (raidStrength / 5));
                const resources = ['food', 'wood', 'stone'];
                const resource = resources[Math.floor(Math.random() * resources.length)];
                
                this.gameState.resources[resource] += loot;
                message += ` Gained ${loot} ${resource} from the defeated raiders.`;
            }
        } else {
            // Failed defense - calculate losses
            const severityFactor = Math.min(1, (raidStrength - defenseStrength) / raidStrength);
            
            // Possible resource losses
            for (const resource of ['food', 'wood', 'stone']) {
                if (this.gameState.resources[resource] > 0) {
                    const loss = Math.floor(this.gameState.resources[resource] * severityFactor * 0.5);
                    if (loss > 0) {
                        this.gameState.resources[resource] -= loss;
                        losses[resource] = loss;
                    }
                }
            }
            
            // Possible population losses
            if (this.gameState.population.current > 1) {
                const popLoss = Math.floor(this.gameState.population.current * severityFactor * 0.3);
                if (popLoss > 0) {
                    this.gameState.population.current -= popLoss;
                    losses.population = popLoss;
                }
            }
            
            // Possible building damage
            const buildings = Object.entries(this.gameState.buildings)
                .filter(([type, count]) => count > 0 && type !== 'monument');
            
            if (buildings.length > 0 && Math.random() < severityFactor) {
                const [buildingType] = buildings[Math.floor(Math.random() * buildings.length)];
                this.gameState.buildings[buildingType]--;
                losses.building = buildingType;
                
                // Apply reverse effect of the lost building
                if (buildingType === 'house') {
                    this.gameState.population.capacity -= 2;
                } else if (buildingType === 'farm') {
                    this.gameState.production.food -= 3;
                } else if (buildingType === 'lumberMill') {
                    this.gameState.production.wood -= 2;
                } else if (buildingType === 'quarry') {
                    this.gameState.production.stone -= 2;
                }
            }
            
            // Generate the loss message
            message = `Raid successful! Your defense (${defenseStrength}) was overwhelmed by the attack (${raidStrength}).`;
            
            if (Object.keys(losses).length > 0) {
                message += " Losses:";
                for (const [resource, amount] of Object.entries(losses)) {
                    if (resource === 'building') {
                        message += ` 1 ${amount},`;
                    } else {
                        message += ` ${amount} ${resource},`;
                    }
                }
                message = message.slice(0, -1) + "."; // Replace last comma with period
            }
        }
        
        // Record the raid and notify player
        this.raidHistory.push({
            turn: this.gameState.turn,
            strength: raidStrength,
            defense: defenseStrength,
            success: defenseSuccess,
            losses
        });
        
        this.gameState.addEvent(`RAID ALERT: ${message}`);
        
        // Reduce threat level slightly after a raid
        this.threatLevel = Math.max(0, this.threatLevel - 10);
    }
}