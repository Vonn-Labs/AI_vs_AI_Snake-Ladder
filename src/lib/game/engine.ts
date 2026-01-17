import { GameState, Turn, Player, SnakeLadderEvent } from './types';
import { rollDice, calculateNewPosition, resolvePosition, hasWon } from './board';
import { v4 as uuidv4 } from 'uuid';

export interface TurnResult {
    turn: Turn;
    gameState: GameState;
    isGameOver: boolean;
    winner: 1 | 2 | null;
}

// Execute a single turn for the current player
export function executeTurn(
    gameState: GameState,
    preRollCommentary: string | null = null,
    postRollCommentary: string | null = null,
    trashTalk: string | null = null
): TurnResult {
    const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);
    console.log(`[${timestamp()}] 🎲 GameEngine: Executing turn for player ${gameState.currentPlayer}`);

    const currentPlayerNum = gameState.currentPlayer;
    const currentPlayer = currentPlayerNum === 1 ? gameState.player1 : gameState.player2;

    // Roll the dice
    const diceRoll = rollDice();
    console.log(`[${timestamp()}] 🎲 GameEngine: Dice rolled: ${diceRoll}`);

    // Calculate new position
    const fromPos = currentPlayer.position;
    const toPos = calculateNewPosition(fromPos, diceRoll);
    console.log(`[${timestamp()}] 🎲 GameEngine: Position ${fromPos} -> ${toPos}`);

    // Resolve snakes and ladders
    const { finalPosition, event } = resolvePosition(toPos);
    if (event) {
        console.log(`[${timestamp()}] 🎲 GameEngine: ${event.type.toUpperCase()} - ${toPos} -> ${finalPosition}`);
    }

    // Create turn record
    const turn: Turn = {
        id: uuidv4(),
        turnNumber: gameState.turns.length + 1,
        playerNum: currentPlayerNum,
        provider: currentPlayer.provider,
        model: currentPlayer.model,
        diceRoll,
        fromPos,
        toPos,
        finalPos: finalPosition,
        event,
        preRollCommentary,
        postRollCommentary,
        trashTalk,
        timestamp: new Date(),
    };

    // Update player position
    const updatedPlayer: Player = {
        ...currentPlayer,
        position: finalPosition,
    };

    // Check for win
    const isGameOver = hasWon(finalPosition);
    const winner = isGameOver ? currentPlayerNum : null;

    if (isGameOver) {
        console.log(`[${timestamp()}] 🎲 GameEngine: 🎉 WINNER! Player ${currentPlayerNum}`);
    }

    // Create updated game state
    const updatedGameState: GameState = {
        ...gameState,
        player1: currentPlayerNum === 1 ? updatedPlayer : gameState.player1,
        player2: currentPlayerNum === 2 ? updatedPlayer : gameState.player2,
        currentPlayer: isGameOver ? currentPlayerNum : (currentPlayerNum === 1 ? 2 : 1),
        turns: [...gameState.turns, turn],
        status: isGameOver ? 'completed' : 'active',
        winner,
        updatedAt: new Date(),
    };

    console.log(`[${timestamp()}] ✅ GameEngine: Turn complete. Next player: ${updatedGameState.currentPlayer}`);

    return {
        turn,
        gameState: updatedGameState,
        isGameOver,
        winner,
    };
}

// Create a new game
export function createGame(
    player1Config: { provider: string; model: string; name: string; apiKey: string },
    player2Config: { provider: string; model: string; name: string; apiKey: string }
): GameState {
    const player1: Player = {
        number: 1,
        provider: player1Config.provider as Player['provider'],
        model: player1Config.model,
        name: player1Config.name,
        position: 0,
        apiKey: player1Config.apiKey,
    };

    const player2: Player = {
        number: 2,
        provider: player2Config.provider as Player['provider'],
        model: player2Config.model,
        name: player2Config.name,
        position: 0,
        apiKey: player2Config.apiKey,
    };

    return {
        id: uuidv4(),
        status: 'active',
        player1,
        player2,
        currentPlayer: 1,
        turns: [],
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// Get game summary for display
export function getGameSummary(gameState: GameState): string {
    const p1 = gameState.player1;
    const p2 = gameState.player2;

    if (gameState.status === 'completed') {
        const winner = gameState.winner === 1 ? p1 : p2;
        return `🎉 ${winner.name} (${winner.model}) wins after ${gameState.turns.length} turns!`;
    }

    const currentPlayer = gameState.currentPlayer === 1 ? p1 : p2;
    return `Turn ${gameState.turns.length + 1}: ${currentPlayer.name}'s turn. Positions: ${p1.name} @ ${p1.position}, ${p2.name} @ ${p2.position}`;
}

// Get event description for display
export function getEventDescription(event: SnakeLadderEvent | null): string | null {
    if (!event) return null;

    if (event.type === 'snake') {
        return `🐍 Oh no! Slid down a snake from ${event.from} to ${event.to}!`;
    } else {
        return `🪜 Climbed a ladder from ${event.from} to ${event.to}!`;
    }
}
