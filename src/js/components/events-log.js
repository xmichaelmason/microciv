class EventsLog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.lastScrollPosition = 0;
    }
    
    connectedCallback() {
        this.updateEvents();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .events-container {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 10px;
                    font-size: 0.85em;
                    background-color: #f9f9f9;
                    scroll-behavior: smooth;
                }
                .event {
                    margin-bottom: 8px;
                    padding: 8px 10px;
                    border-radius: 4px;
                    background-color: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    transition: background-color 0.2s;
                    animation: fadeIn 0.3s ease-out;
                    border-left: 3px solid #ddd;
                }
                .event:hover {
                    background-color: #f5f5f5;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .turn-indicator {
                    color: #666;
                    font-weight: bold;
                    margin-right: 5px;
                    background-color: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 0.8em;
                }
                .event-message {
                    display: inline;
                }
                .no-events {
                    color: #999;
                    text-align: center;
                    font-style: italic;
                    padding: 20px;
                }
                .raid-alert {
                    border-left: 3px solid #d32f2f;
                    background-color: #ffebee;
                }
                .raid-alert .turn-indicator {
                    background-color: #ef9a9a;
                    color: #b71c1c;
                }
                .positive-event {
                    border-left: 3px solid #4CAF50;
                }
                .resource-discovery {
                    border-left: 3px solid #2196F3;
                }
                .tech-event {
                    border-left: 3px solid #9C27B0;
                }
                .trade-event {
                    border-left: 3px solid #FF9800;
                }
                .seasonal-event {
                    border-left: 3px solid #009688;
                }
                .clear-btn {
                    padding: 6px 10px;
                    margin: 10px;
                    background: #f0f0f0;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.8em;
                    cursor: pointer;
                    align-self: flex-end;
                    transition: background-color 0.2s;
                }
                .clear-btn:hover {
                    background: #e0e0e0;
                }
            </style>
            
            <div class="events-container" id="events-list">
                <div class="no-events">No events yet...</div>
            </div>
            <button class="clear-btn" id="clear-btn">Clear Events</button>
        `;

        // Save reference to the events container
        this.eventsContainer = this.shadowRoot.getElementById('events-list');
        
        // Add scroll position tracking
        this.eventsContainer.addEventListener('scroll', () => {
            this.lastScrollPosition = this.eventsContainer.scrollTop;
        });
        
        // Add clear button functionality
        this.shadowRoot.getElementById('clear-btn').addEventListener('click', () => {
            const gameState = window.gameState;
            if (gameState) {
                // Keep only the most recent event
                if (gameState.events.length > 0) {
                    gameState.events = [gameState.events[gameState.events.length - 1]];
                }
                this.updateEvents();
            }
        });
    }
    
    updateEvents() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        if (gameState.events.length === 0) {
            this.eventsContainer.innerHTML = '<div class="no-events">No events yet...</div>';
            return;
        }

        // Remember if we're near the bottom before updating
        const isAtBottom = this.isScrolledNearBottom();
        
        // Save current scroll position
        const previousScroll = this.lastScrollPosition;
        
        this.eventsContainer.innerHTML = gameState.events
            .slice()
            .reverse()
            .map(event => {
                let eventClass = 'event';
                
                // Determine event type for styling
                if (event.message.includes('RAID ALERT')) {
                    eventClass += ' raid-alert';
                } else if (event.message.includes('Harvest') || event.message.includes('joined your civilization')) {
                    eventClass += ' positive-event';
                } else if (event.message.includes('Discovery')) {
                    eventClass += ' resource-discovery';
                } else if (event.message.includes('technology') || event.message.includes('Research complete')) {
                    eventClass += ' tech-event';
                } else if (event.message.includes('Trade')) {
                    eventClass += ' trade-event';
                } else if (event.message.includes('season')) {
                    eventClass += ' seasonal-event';
                }
                
                const cleanMessage = event.message.replace('RAID ALERT: ', '');
                
                return `
                    <div class="${eventClass}">
                        <span class="turn-indicator">Turn ${event.turn}</span>
                        <span class="event-message">${cleanMessage}</span>
                    </div>
                `;
            })
            .join('');
            
        // Restore scroll position or scroll to bottom only if we were already at the bottom
        if (isAtBottom) {
            this.scrollToBottom();
        } else {
            this.eventsContainer.scrollTop = previousScroll;
        }
    }
    
    isScrolledNearBottom() {
        const tolerance = 50; // pixels from bottom to consider "at bottom"
        return this.eventsContainer.scrollHeight - this.eventsContainer.scrollTop - this.eventsContainer.clientHeight < tolerance;
    }
    
    scrollToBottom() {
        this.eventsContainer.scrollTop = this.eventsContainer.scrollHeight;
        this.lastScrollPosition = this.eventsContainer.scrollTop;
    }
}

customElements.define('events-log', EventsLog);
