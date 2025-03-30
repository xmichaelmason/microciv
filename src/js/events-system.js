// Random events system for MicroCiv
export class EventsSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.eventChance = 0.3; // 30% chance of event per turn
        
        // Define possible random events
        this.possibleEvents = [
            {
                name: "Bountiful Harvest",
                description: "Favorable weather brings extra food!",
                condition: (gs) => true, // Always available
                weight: 10,
                effect: (gs) => {
                    const foodBonus = Math.max(3, Math.floor(gs.production.food * 0.5));
                    gs.resources.food += foodBonus;
                    gs.addEvent(`Bountiful Harvest: Gained ${foodBonus} food!`);
                }
            },
            {
                name: "Wood Rot",
                description: "Moisture has damaged some of your wood supplies.",
                condition: (gs) => gs.resources.wood >= 5,
                weight: 8,
                effect: (gs) => {
                    const woodLost = Math.ceil(gs.resources.wood * 0.2);
                    gs.resources.wood -= woodLost;
                    gs.addEvent(`Wood Rot: Lost ${woodLost} wood to rot!`);
                }
            },
            {
                name: "Wandering Nomads",
                description: "A group of skilled nomads asks to join your civilization.",
                condition: (gs) => gs.population.current < gs.population.capacity - 1,
                weight: 7,
                effect: (gs) => {
                    const newPeople = Math.min(2, gs.population.capacity - gs.population.current);
                    gs.population.current += newPeople;
                    gs.addEvent(`Wandering Nomads: ${newPeople} people joined your civilization!`);
                }
            },
            {
                name: "Natural Disaster",
                description: "A disaster damages some of your buildings!",
                condition: (gs) => Object.values(gs.buildings).reduce((a, b) => a + b, 0) >= 4,
                weight: 5,
                effect: (gs) => {
                    // Find building types that exist (count > 0)
                    const existingBuildings = Object.entries(gs.buildings)
                        .filter(([type, count]) => count > 0 && type !== 'monument');
                    
                    if (existingBuildings.length > 0) {
                        // Pick a random building type
                        const [buildingType] = existingBuildings[Math.floor(Math.random() * existingBuildings.length)];
                        
                        // Destroy one of these buildings
                        gs.buildings[buildingType]--;
                        
                        // Apply reverse effect
                        if (buildingType === 'house') {
                            gs.population.capacity -= 2;
                            // Adjust population if now over capacity
                            if (gs.population.current > gs.population.capacity) {
                                const loss = gs.population.current - gs.population.capacity;
                                gs.population.current = gs.population.capacity;
                                gs.addEvent(`${loss} people left due to housing shortage!`);
                            }
                        } else if (buildingType === 'farm') {
                            gs.production.food -= 3;
                        } else if (buildingType === 'lumberMill') {
                            gs.production.wood -= 2;
                        } else if (buildingType === 'quarry') {
                            gs.production.stone -= 2;
                        }
                        
                        gs.addEvent(`Natural Disaster: A ${buildingType} was destroyed!`);
                    }
                }
            },
            {
                name: "Resource Discovery",
                description: "Your people have discovered a hidden cache of resources!",
                condition: (gs) => gs.turn > 5,
                weight: 8,
                effect: (gs) => {
                    // Pick random resource
                    const resources = ['food', 'wood', 'stone'];
                    const resource = resources[Math.floor(Math.random() * resources.length)];
                    const amount = Math.floor(5 + (gs.turn / 3));
                    
                    gs.resources[resource] += amount;
                    gs.addEvent(`Resource Discovery: Found ${amount} ${resource}!`);
                }
            },
            {
                name: "Epidemic",
                description: "Disease spreads through your population!",
                condition: (gs) => gs.population.current > 4 && gs.turn > 10,
                weight: 4,
                effect: (gs) => {
                    const deaths = Math.max(1, Math.floor(gs.population.current * 0.2));
                    gs.population.current -= deaths;
                    gs.addEvent(`Epidemic: Lost ${deaths} people to disease!`);
                }
            },
            {
                name: "Scientific Breakthrough",
                description: "Your scholars have made an unexpected discovery!",
                condition: (gs) => gs.production.science > 0,
                weight: 6,
                effect: (gs) => {
                    const scienceBonus = Math.ceil(gs.production.science * 3);
                    gs.resources.science += scienceBonus;
                    gs.addEvent(`Scientific Breakthrough: Gained ${scienceBonus} science points!`);
                }
            },
            {
                name: "Trade Caravan",
                description: "Merchants offer to trade with your civilization.",
                condition: (gs) => gs.resources.food > 5 || gs.resources.wood > 5 || gs.resources.stone > 3,
                weight: 10,
                effect: (gs) => {
                    // Generate trade options
                    gs.generateTradeOptions();
                    gs.showTradeDialog = true;
                    gs.addEvent("Trade Caravan: Merchants offer to trade resources!");
                }
            }
        ];
    }
    
    // Check if a random event should occur and process it
    checkForRandomEvent() {
        if (Math.random() > this.eventChance) return;
        
        // Filter events that meet their conditions
        const possibleEvents = this.possibleEvents.filter(event => 
            event.condition(this.gameState)
        );
        
        if (possibleEvents.length === 0) return;
        
        // Weight-based selection
        const totalWeight = possibleEvents.reduce((sum, event) => sum + event.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const event of possibleEvents) {
            random -= event.weight;
            if (random <= 0) {
                // This is our selected event
                event.effect(this.gameState);
                break;
            }
        }
    }
}