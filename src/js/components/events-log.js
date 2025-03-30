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
                }
                .events-container {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 10px;
                    font-size: 0.9em;
                    background-color: #f9f9f9;
                }
                .event {
                    margin-bottom: 5px;
                    padding: 5px;
                    border-bottom: 1px dotted #ddd;
                }
                .event:nth-child(even) {
                    background-color: #f5f5f5;
                }
                .turn-indicator {
                    color: #666;
                    font-weight: bold;
                    margin-right: 5px;
                }
                .no-events {
                    color: #999;
                    text-align: center;
                    font-style: italic;
                    padding: 20px;
                }
                .raid-alert {
                    color: #d32f2f;
                    font-weight: bold;
                    background-color: rgba(255, 0, 0, 0.05);
                }
            </style>
            
            <div class="events-container" id="events-list">
                <div class="no-events">No events yet...</div>
            </div>
        `;

        // Save reference to the events container
        this.eventsContainer = this.shadowRoot.getElementById('events-list');
        
        // Add scroll position tracking
        this.eventsContainer.addEventListener('scroll', () => {
            this.lastScrollPosition = this.eventsContainer.scrollTop;
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
                const isRaid = event.message.includes('RAID ALERT');
                return `
                    <div class="event ${isRaid ? 'raid-alert' : ''}">
                        <span class="turn-indicator">Turn ${event.turn}:</span>
                        ${event.message.replace('RAID ALERT: ', '')}
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
