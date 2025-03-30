// Technology system for MicroCiv
export class TechnologySystem {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Available technologies
        this.technologies = {
            agriculture: {
                name: "Agriculture",
                cost: 10, // Science points needed
                description: "Improves farm output by 50%",
                prereqs: [], // No prerequisites
                effect: () => {
                    // Apply farm production bonus
                    this.gameState.productionMultipliers.farm *= 1.5;
                    this.gameState.addEvent("Agriculture technology improved farm output by 50%!");
                },
                unlocks: ["irrigation"]
            },
            irrigation: {
                name: "Irrigation",
                cost: 20,
                description: "Farms provide +1 population capacity",
                prereqs: ["agriculture"],
                effect: () => {
                    // Update existing farms
                    this.gameState.buildingEffects.farm = () => { 
                        this.gameState.production.food += 3;
                        this.gameState.population.capacity += 1; 
                    };
                    // Apply effect to existing farms
                    this.gameState.population.capacity += this.gameState.buildings.farm;
                    this.gameState.addEvent("Irrigation technology allows farms to support more people!");
                },
                unlocks: ["fertilizers"]
            },
            mining: {
                name: "Mining",
                cost: 15,
                description: "Improves stone production by 50%",
                prereqs: [],
                effect: () => {
                    this.gameState.productionMultipliers.quarry *= 1.5;
                    this.gameState.addEvent("Mining technology improved quarry output by 50%!");
                },
                unlocks: ["metallurgy"]
            },
            woodworking: {
                name: "Woodworking",
                cost: 15,
                description: "Improves lumber mill output by 50%",
                prereqs: [],
                effect: () => {
                    this.gameState.productionMultipliers.lumberMill *= 1.5;
                    this.gameState.addEvent("Woodworking technology improved lumber mill output by 50%!");
                },
                unlocks: ["construction"]
            },
            construction: {
                name: "Construction",
                cost: 25,
                description: "Enables building barracks and reduces building costs by 20%",
                prereqs: ["woodworking", "mining"],
                effect: () => {
                    // Reduce all building costs by 20%
                    for (const building in this.gameState.buildingCosts) {
                        for (const resource in this.gameState.buildingCosts[building]) {
                            this.gameState.buildingCosts[building][resource] *= 0.8;
                        }
                    }
                    this.gameState.addEvent("Construction technology reduced building costs by 20%!");
                },
                unlocks: []
            },
            fertilizers: {
                name: "Fertilizers",
                cost: 30,
                description: "Farms produce double food",
                prereqs: ["irrigation"],
                effect: () => {
                    this.gameState.productionMultipliers.farm *= 2;
                    this.gameState.addEvent("Fertilizers technology doubled farm output!");
                },
                unlocks: []
            },
            metallurgy: {
                name: "Metallurgy",
                cost: 30,
                description: "Enables defense technologies and increases quarry output by 50%",
                prereqs: ["mining"],
                effect: () => {
                    this.gameState.productionMultipliers.quarry *= 1.5;
                    this.gameState.addEvent("Metallurgy technology improved quarry output by 50% and unlocked defense capabilities!");
                },
                unlocks: []
            }
        };
        
        // Technologies that have been researched
        this.researched = [];
        
        // Currently researching technology
        this.currentResearch = null;
        this.researchProgress = 0;
    }
    
    // Get available technologies to research (prerequisites are met and not already researched)
    getAvailableTechnologies() {
        return Object.entries(this.technologies)
            .filter(([id, tech]) => {
                // Check if already researched
                if (this.researched.includes(id)) return false;
                
                // Check if all prerequisites are met
                return tech.prereqs.every(prereq => this.researched.includes(prereq));
            })
            .map(([id, tech]) => ({
                id,
                name: tech.name,
                cost: tech.cost,
                description: tech.description
            }));
    }
    
    // Start researching a technology
    startResearch(technologyId) {
        if (!this.technologies[technologyId]) {
            this.gameState.addEvent(`Unknown technology: ${technologyId}`);
            return false;
        }
        
        if (this.researched.includes(technologyId)) {
            this.gameState.addEvent(`${this.technologies[technologyId].name} already researched`);
            return false;
        }
        
        // Check prerequisites
        const tech = this.technologies[technologyId];
        if (!tech.prereqs.every(prereq => this.researched.includes(prereq))) {
            this.gameState.addEvent(`Missing prerequisites for ${tech.name}`);
            return false;
        }
        
        // Check if player has enough science points to start research
        if (this.gameState.resources.science < 1) {
            this.gameState.addEvent(`Not enough science points to research ${tech.name}`);
            return false;
        }
        
        this.currentResearch = technologyId;
        this.researchProgress = 0;
        this.gameState.addEvent(`Started researching ${tech.name}`);
        return true;
    }
    
    // Process research progress for the turn
    processTurn() {
        if (!this.currentResearch) return;
        
        const tech = this.technologies[this.currentResearch];
        
        // Calculate how much science to use this turn
        const scienceToUse = Math.min(
            this.gameState.resources.science,
            this.gameState.production.science
        );
        
        // Only advance research if we have science points
        if (scienceToUse > 0) {
            // Deduct science points from resources
            this.gameState.resources.science -= scienceToUse;
            
            // Add to research progress
            this.researchProgress += scienceToUse;
        }
        
        if (this.researchProgress >= tech.cost) {
            // Research complete
            this.researched.push(this.currentResearch);
            tech.effect();
            this.gameState.addEvent(`Research complete: ${tech.name}`);
            this.currentResearch = null;
            this.researchProgress = 0;
        }
    }
    
    // Get research progress as percentage
    getResearchProgress() {
        if (!this.currentResearch) return 0;
        const tech = this.technologies[this.currentResearch];
        return Math.min(100, (this.researchProgress / tech.cost) * 100);
    }
    
    // Get current research name
    getCurrentResearchName() {
        if (!this.currentResearch) return "None";
        return this.technologies[this.currentResearch].name;
    }
}