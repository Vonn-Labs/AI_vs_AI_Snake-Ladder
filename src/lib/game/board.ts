import { BoardConfig, SnakeLadderEvent } from './types';

// Classic 10x10 Snake and Ladder Board Configuration
export const BOARD_CONFIG: BoardConfig = {
    size: 100,
    // Snakes: head -> tail (go DOWN)
    snakes: {
        99: 41,
        95: 75,
        92: 88,
        89: 68,
        74: 53,
        64: 60,
        62: 19,
        49: 11,
        46: 25,
        16: 6,
    },
    // Ladders: bottom -> top (go UP)
    ladders: {
        2: 38,
        7: 14,
        8: 31,
        15: 26,
        21: 42,
        28: 84,
        36: 44,
        51: 67,
        71: 91,
        78: 98,
        87: 94,
    },
};

// Get the position after checking for snakes/ladders
export function resolvePosition(position: number): {
    finalPosition: number;
    event: SnakeLadderEvent | null;
} {
    // Check for snake
    if (BOARD_CONFIG.snakes[position]) {
        return {
            finalPosition: BOARD_CONFIG.snakes[position],
            event: {
                type: 'snake',
                from: position,
                to: BOARD_CONFIG.snakes[position],
            },
        };
    }

    // Check for ladder
    if (BOARD_CONFIG.ladders[position]) {
        return {
            finalPosition: BOARD_CONFIG.ladders[position],
            event: {
                type: 'ladder',
                from: position,
                to: BOARD_CONFIG.ladders[position],
            },
        };
    }

    // No snake or ladder
    return {
        finalPosition: position,
        event: null,
    };
}

// Roll a dice (1-6)
export function rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
}

// Calculate new position after dice roll
export function calculateNewPosition(
    currentPosition: number,
    diceRoll: number
): number {
    const newPosition = currentPosition + diceRoll;

    // Must land exactly on 100 to win
    if (newPosition > 100) {
        return currentPosition; // Stay in place if overshoot
    }

    return newPosition;
}

// Check if player has won
export function hasWon(position: number): boolean {
    return position === 100;
}

// Get row and column from square number (for rendering)
export function getSquareCoordinates(square: number): { row: number; col: number } {
    const row = Math.floor((square - 1) / 10);
    const col = (square - 1) % 10;

    // Alternate row direction for snake pattern
    const adjustedCol = row % 2 === 0 ? col : 9 - col;

    return { row: 9 - row, col: adjustedCol }; // Flip row for display (1 at bottom)
}

// Get square number from row and column
export function getSquareNumber(row: number, col: number): number {
    const invertedRow = 9 - row;
    const adjustedCol = invertedRow % 2 === 0 ? col : 9 - col;
    return invertedRow * 10 + adjustedCol + 1;
}

// Get all square data for rendering the board
export function getBoardSquares(): Array<{
    number: number;
    row: number;
    col: number;
    hasSnake: boolean;
    hasLadder: boolean;
    snakeTo?: number;
    ladderTo?: number;
}> {
    const squares = [];

    for (let i = 1; i <= 100; i++) {
        const { row, col } = getSquareCoordinates(i);
        squares.push({
            number: i,
            row,
            col,
            hasSnake: i in BOARD_CONFIG.snakes,
            hasLadder: i in BOARD_CONFIG.ladders,
            snakeTo: BOARD_CONFIG.snakes[i],
            ladderTo: BOARD_CONFIG.ladders[i],
        });
    }

    return squares;
}

// Get color for square based on position
export function getSquareColor(squareNumber: number): string {
    const { row, col } = getSquareCoordinates(squareNumber);
    const isEven = (row + col) % 2 === 0;
    return isEven ? 'bg-amber-100' : 'bg-amber-200';
}
