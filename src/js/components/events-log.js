class EventsLog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.updateEvents();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 20px;
                }
                .events-container {
                    max-height: 120px;
                    overflow-y: auto;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 10px;
                    background-color: #f9f9f9;
                }
                .event {
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                    font-size: 0.9em;
                }
                .turn-indicator {
                    color: #666;
                    font-weight: bold;
                    margin-right: 5px;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 10px;
                    color: #333;
                    font-size: 1.2em;
                }
                .no-events {
                    color: #999;
                    text-align: center;
                    font-style: italic;
                }
            </style>
            
            <h2>Event Log</h2>
            <div class="events-container" id="events-list">
                <div class="no-events">No events yet...</div>
            </div>
        `;
    }
    
    updateEvents() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        const eventsContainer = this.shadowRoot.getElementById('events-list');
        
        if (gameState.events.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">No events yet...</div>';
            return;
        }
        
        eventsContainer.innerHTML = gameState.events
            .slice()
            .reverse()
            .map(event => `
                <div class="event">
                    <span class="turn-indicator">Turn ${event.turn}:</span>
                    ${event.message}
                </div>
            `)
            .join('');
            
        // Auto-scroll to bottom
        eventsContainer.scrollTop = eventsContainer.scrollHeight;
    }
}

customElements.define('events-log', EventsLog);
