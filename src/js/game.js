import { GameState } from './game-state.js';
import './components/game-ui.js';

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    window.gameState = gameState; // Make it available globally for debugging
    
    // Set up end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.addEventListener('click', () => {
        gameState.endTurn();
        document.querySelector('game-ui').updateUI();
        document.getElementById('turn-counter').textContent = gameState.turn;
    });
    
    // Initial UI update
    document.querySelector('game-ui').updateUI();
});
