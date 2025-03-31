// Terrain system for MicroCiv
export class TerrainSystem {
    constructor() {
        // Terrain types and their production modifiers
        this.terrainTypes = {
            plains: {
                name: "Plains",
                description: "Balanced terrain with good food production.",
                modifiers: {
                    food: 1.2,
                    wood: 0.8,
                    stone: 1.0,
                    science: 1.0
                },
                buildingModifiers: {
                    farm: 1.2,
                    lumberMill: 0.8,
                    quarry: 1.0
                }
            },
            forest: {
                name: "Forest",
                description: "Dense forests provide abundant wood but less food.",
                modifiers: {
                    food: 0.8,
                    wood: 1.5,
                    stone: 0.7,
                    science: 1.0
                },
                buildingModifiers: {
                    farm: 0.7,
                    lumberMill: 1.5,
                    quarry: 0.8
                }
            },
            hills: {
                name: "Hills",
                description: "Rocky terrain with abundant stone but difficult farming.",
                modifiers: {
                    food: 0.7,
                    wood: 0.9,
                    stone: 1.5,
                    science: 1.1
                },
                buildingModifiers: {
                    farm: 0.7,
                    lumberMill: 0.9,
                    quarry: 1.5
                }
            },
            mountains: {
                name: "Mountains",
                description: "High terrain with strategic advantages and rich stone deposits.",
                modifiers: {
                    food: 0.5,
                    wood: 0.6,
                    stone: 1.8,
                    science: 1.2
                },
                buildingModifiers: {
                    farm: 0.5,
                    lumberMill: 0.6,
                    quarry: 1.8
                },
                defenseBonus: 1.5
            },
            river: {
                name: "River Valley",
                description: "Fertile river valley with excellent farming conditions.",
                modifiers: {
                    food: 1.5,
                    wood: 1.2,
                    stone: 0.8,
                    science: 1.1
                },
                buildingModifiers: {
                    farm: 1.5,
                    lumberMill: 1.1,
                    quarry: 0.8
                }
            },
            coast: {
                name: "Coastal Region",
                description: "Access to the sea provides fishing and trade opportunities.",
                modifiers: {
                    food: 1.3,
                    wood: 0.9,
                    stone: 0.8,
                    science: 1.3
                },
                buildingModifiers: {
                    farm: 1.1,
                    lumberMill: 0.9,
                    quarry: 0.8
                },
                tradeBonus: 1.3
            }
        };
        
        // The current terrain for the civilization
        this.currentTerrain = "plains"; // Default terrain
    }
    
    // Get the current terrain object
    getCurrentTerrain() {
        return this.terrainTypes[this.currentTerrain];
    }
    
    // Change the terrain (for expansion or migration)
    changeTerrain(terrainType) {
        if (this.terrainTypes[terrainType]) {
            this.currentTerrain = terrainType;
            return true;
        }
        return false;
    }
    
    // Apply terrain modifiers to base production
    applyTerrainModifiers(gameState) {
        const terrain = this.terrainTypes[this.currentTerrain];
        const baseProduction = {...gameState.baseProduction};
        
        // Start by applying terrain modifiers to base production values
        for (const resource in baseProduction) {
            if (terrain.modifiers[resource]) {
                // Apply terrain modifiers to base production only - don't add building production yet
                gameState.production[resource] = baseProduction[resource] * terrain.modifiers[resource];
            }
        }
        
        // Now handle building production separately
        for (const building in gameState.buildings) {
            if (gameState.buildings[building] > 0 && terrain.buildingModifiers[building]) {
                // Get the base production value for this building type
                const baseValue = gameState.buildingProductionValues[building];
                if (baseValue && baseValue.resource) {
                    const resource = baseValue.resource;
                    const amount = baseValue.amount;
                    const count = gameState.buildings[building];
                    const multiplier = gameState.productionMultipliers[building];
                    
                    // Calculate the building production with terrain modifier
                    // Important: This is additive to base production, not replacing it
                    const buildingProduction = amount * count * multiplier * terrain.buildingModifiers[building];
                    gameState.production[resource] += buildingProduction;
                }
            }
        }
        
        // Apply defense and trade bonuses as before
        // Apply defense bonus if applicable
        if (terrain.defenseBonus && gameState.militarySystem) {
            gameState.militarySystem.terrainDefenseMultiplier = terrain.defenseBonus;
        } else if (gameState.militarySystem) {
            gameState.militarySystem.terrainDefenseMultiplier = 1.0;
        }
        
        // Apply trade bonus if applicable
        if (terrain.tradeBonus && gameState.tradeSystem) {
            gameState.tradeSystem.terrainTradeMultiplier = terrain.tradeBonus;
        } else if (gameState.tradeSystem) {
            gameState.tradeSystem.terrainTradeMultiplier = 1.0;
        }
    }
    
    // Get the terrain information for display
    getTerrainInfo() {
        const terrain = this.terrainTypes[this.currentTerrain];
        return {
            name: terrain.name,
            description: terrain.description,
            modifiers: {...terrain.modifiers},
            buildingModifiers: {...terrain.buildingModifiers}
        };
    }
    
    // Get list of all terrain types
    getAllTerrainTypes() {
        return Object.entries(this.terrainTypes).map(([id, terrain]) => ({
            id,
            name: terrain.name,
            description: terrain.description
        }));
    }
}