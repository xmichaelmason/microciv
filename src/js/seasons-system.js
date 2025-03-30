// Seasons system for MicroCiv
export class SeasonsSystem {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Seasons and their modifiers
        this.seasons = {
            spring: {
                name: "Spring",
                description: "Growing season with increased food production.",
                modifiers: {
                    food: 1.5,
                    wood: 1.2,
                    stone: 1.0,
                    science: 1.0
                },
                eventWeights: {
                    "Bountiful Harvest": 2.0,
                    "Wandering Nomads": 1.5,
                    "Wood Rot": 1.2 // Spring showers can cause rot
                }
            },
            summer: {
                name: "Summer",
                description: "Peak productivity season for most resources.",
                modifiers: {
                    food: 1.3,
                    wood: 1.2,
                    stone: 1.3,
                    science: 1.1
                },
                eventWeights: {
                    "Resource Discovery": 1.5,
                    "Trade Caravan": 1.5,
                    "Natural Disaster": 1.2 // Summer storms
                }
            },
            autumn: {
                name: "Autumn",
                description: "Harvest season with balanced production.",
                modifiers: {
                    food: 1.4,
                    wood: 1.1,
                    stone: 1.0,
                    science: 1.2
                },
                eventWeights: {
                    "Bountiful Harvest": 1.8,
                    "Resource Discovery": 1.2,
                    "Trade Caravan": 1.3
                }
            },
            winter: {
                name: "Winter",
                description: "Cold season with reduced production but increased research.",
                modifiers: {
                    food: 0.6,
                    wood: 0.7,
                    stone: 0.8,
                    science: 1.4
                },
                eventWeights: {
                    "Scientific Breakthrough": 1.5,
                    "Wood Rot": 0.5, // Less rot in dry winter
                    "Natural Disaster": 1.5, // Winter storms
                    "Epidemic": 1.3 // Disease spreads in close quarters
                }
            }
        };
        
        // Current season and tracker
        this.currentSeason = "spring";
        this.turnsInSeason = 0;
        this.seasonLength = 3; // Turns per season
    }
    
    // Process season changes
    processTurn() {
        this.turnsInSeason++;
        
        // Check if we need to change seasons
        if (this.turnsInSeason >= this.seasonLength) {
            this.advanceSeason();
            this.turnsInSeason = 0;
        }
    }
    
    // Advance to the next season
    advanceSeason() {
        const seasonOrder = ["spring", "summer", "autumn", "winter"];
        const currentIndex = seasonOrder.indexOf(this.currentSeason);
        const nextIndex = (currentIndex + 1) % seasonOrder.length;
        
        this.currentSeason = seasonOrder[nextIndex];
        const newSeason = this.seasons[this.currentSeason];
        
        this.gameState.addEvent(`Season changed to ${newSeason.name}. ${newSeason.description}`);
        
        // Apply season effects
        this.applySeasonModifiers();
    }
    
    // Apply season modifiers to production
    applySeasonModifiers() {
        const season = this.seasons[this.currentSeason];
        
        // Store the base production values affected by terrain but not season
        const terrainProduction = {...this.gameState.production};
        
        // Apply season modifiers
        for (const resource in terrainProduction) {
            if (season.modifiers[resource]) {
                this.gameState.production[resource] = terrainProduction[resource] * season.modifiers[resource];
            }
        }
        
        // Apply event weight modifiers if events system exists
        if (this.gameState.eventsSystem) {
            for (const eventName in season.eventWeights) {
                const event = this.gameState.eventsSystem.possibleEvents.find(e => e.name === eventName);
                if (event) {
                    event.seasonalWeight = season.eventWeights[eventName];
                }
            }
        }
    }
    
    // Get current season info for display
    getCurrentSeasonInfo() {
        const season = this.seasons[this.currentSeason];
        return {
            name: season.name,
            description: season.description,
            modifiers: {...season.modifiers},
            turnsRemaining: this.seasonLength - this.turnsInSeason
        };
    }
    
    // Get warning about upcoming season change
    getSeasonChangeWarning() {
        if (this.turnsInSeason === this.seasonLength - 1) {
            const seasonOrder = ["spring", "summer", "autumn", "winter"];
            const currentIndex = seasonOrder.indexOf(this.currentSeason);
            const nextIndex = (currentIndex + 1) % seasonOrder.length;
            const nextSeason = this.seasons[seasonOrder[nextIndex]];
            
            return {
                upcoming: true,
                message: `${nextSeason.name} is coming next turn. Prepare for ${nextSeason.description.toLowerCase()}`
            };
        }
        
        return {
            upcoming: false
        };
    }
}