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
                
                /* Event type styles */
                .event-negative {
                    border-left: 3px solid #d32f2f;
                    background-color: #ffebee;
                }
                .event-negative .turn-indicator {
                    background-color: #ef9a9a;
                    color: #b71c1c;
                }
                .event-negative .event-message {
                    color: #c62828;
                }
                
                .event-food {
                    border-left: 3px solid #8BC34A;
                }
                .event-food .event-message {
                    color: #558b2f;
                }
                
                .event-wood {
                    border-left: 3px solid #795548;
                }
                .event-wood .event-message {
                    color: #4e342e;
                }
                
                .event-stone {
                    border-left: 3px solid #9E9E9E;
                }
                .event-stone .event-message {
                    color: #424242;
                }
                
                .event-science {
                    border-left: 3px solid #9C27B0;
                }
                .event-science .event-message {
                    color: #6a1b9a;
                }
                
                .event-population {
                    border-left: 3px solid #2196F3;
                }
                .event-population .event-message {
                    color: #0d47a1;
                }
                
                .event-trade {
                    border-left: 3px solid #FF9800;
                }
                .event-trade .event-message {
                    color: #e65100;
                }
                
                .event-season {
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
                
                /* Responsive styles */
                @media (max-width: 768px) {
                    .events-container {
                        padding: 5px;
                    }
                    .event {
                        padding: 6px 8px;
                        margin-bottom: 6px;
                        font-size: 0.95em;
                    }
                }
                
                @media (max-width: 576px) {
                    .event {
                        padding: 5px;
                        margin-bottom: 5px;
                    }
                    .turn-indicator {
                        font-size: 0.7em;
                        padding: 1px 4px;
                    }
                    .clear-btn {
                        padding: 8px 12px;
                        width: 100%;
                        margin: 5px 0;
                        align-self: center;
                    }
                    .event-message {
                        font-size: 0.9em;
                    }
                }
                
                /* Mobile touch improvements */
                @media (hover: none) and (pointer: coarse) {
                    .clear-btn {
                        min-height: 44px;
                    }
                    
                    .event {
                        padding-top: 8px;
                        padding-bottom: 8px;
                    }
                    
                    .events-container {
                        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
                    }
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
                // Determine event type for styling
                let eventClass = this.determineEventClass(event.message);
                
                const cleanMessage = event.message.replace('RAID ALERT: ', '');
                
                return `
                    <div class="event ${eventClass}">
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
    
    determineEventClass(message) {
        // Check for negative events
        if (
            message.includes('RAID ALERT') ||
            message.includes('Lost') ||
            message.includes('starved') ||
            message.includes('Epidemic') ||
            message.includes('destroyed') ||
            message.includes('Wood Rot') ||
            message.includes('shortage') ||
            message.includes('disease')
        ) {
            return 'event-negative';
        }
        
        // Check for food-related positive events
        if (
            message.includes('food') ||
            message.includes('Farm') ||
            message.includes('Harvest') ||
            message.includes('Agriculture')
        ) {
            return 'event-food';
        }
        
        // Check for wood-related events
        if (
            message.includes('wood') ||
            message.includes('Lumber Mill') ||
            message.includes('Woodworking')
        ) {
            return 'event-wood';
        }
        
        // Check for stone-related events
        if (
            message.includes('stone') ||
            message.includes('Quarry') ||
            message.includes('Mining')
        ) {
            return 'event-stone';
        }
        
        // Check for science-related events
        if (
            message.includes('Science') ||
            message.includes('Library') ||
            message.includes('Research') ||
            message.includes('technology')
        ) {
            return 'event-science';
        }
        
        // Check for population-related events
        if (
            message.includes('Population') ||
            message.includes('House') ||
            message.includes('people joined') ||
            message.includes('capacity')
        ) {
            return 'event-population';
        }
        
        // Check for trade events
        if (message.includes('Trade')) {
            return 'event-trade';
        }
        
        // Check for season changes
        if (message.includes('Season changed') || message.includes('is coming')) {
            return 'event-season';
        }
        
        // Default - no special styling
        return '';
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
