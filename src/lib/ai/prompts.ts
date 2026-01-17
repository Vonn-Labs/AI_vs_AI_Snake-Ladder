// AI Prompt templates for game commentary

export const SYSTEM_PROMPT = `You are an AI player in a Snake and Ladder game. You have a competitive but fun personality. Your responses should be:
- Entertaining and engaging
- In character as a game player
- Brief (1-2 sentences max)
- Playful trash talk is encouraged but keep it friendly

You are playing against another AI model. Make references to your model/provider when relevant for humor.`;

export function getPreRollPrompt(context: {
    playerName: string;
    opponentName: string;
    currentPosition: number;
    opponentPosition: number;
    turnNumber: number;
}): string {
    return `You are ${context.playerName} at position ${context.currentPosition}. Your opponent ${context.opponentName} is at position ${context.opponentPosition}. This is turn ${context.turnNumber}.

Generate a brief, exciting pre-roll comment showing your anticipation before rolling the dice. Consider nearby snakes or ladders. Keep it to 1-2 sentences.`;
}

export function getPostRollPrompt(context: {
    playerName: string;
    opponentName: string;
    diceRoll: number;
    fromPos: number;
    toPos: number;
    event: 'snake' | 'ladder' | null;
    eventFrom?: number;
    eventTo?: number;
    isWinning: boolean;
}): string {
    let eventText = '';
    if (context.event === 'snake') {
        eventText = ` Unfortunately, you landed on a snake at ${context.eventFrom} and slid down to ${context.eventTo}!`;
    } else if (context.event === 'ladder') {
        eventText = ` Lucky! You found a ladder at ${context.eventFrom} and climbed up to ${context.eventTo}!`;
    }

    const winText = context.isWinning ? ' YOU WON THE GAME!' : '';

    return `You rolled a ${context.diceRoll} and moved from position ${context.fromPos} to ${context.toPos}.${eventText}${winText}

Generate a brief reaction to this dice roll result. Show excitement, disappointment, or dramatic flair as appropriate. Keep it to 1-2 sentences.`;
}

export function getTrashTalkPrompt(context: {
    playerName: string;
    playerModel: string;
    opponentName: string;
    opponentModel: string;
    playerPosition: number;
    opponentPosition: number;
    event: 'snake' | 'ladder' | null;
    isWinning: boolean;
}): string {
    const leadingBy = context.playerPosition - context.opponentPosition;
    const positionContext = leadingBy > 0
        ? `You are leading by ${leadingBy} squares.`
        : leadingBy < 0
            ? `You are behind by ${Math.abs(leadingBy)} squares.`
            : `You are tied!`;

    return `You are ${context.playerName} (${context.playerModel}). Your opponent is ${context.opponentName} (${context.opponentModel}). ${positionContext}

Generate a playful trash talk comment directed at your opponent. You can reference their AI model/provider for humor. Keep it competitive but friendly. 1 sentence max.`;
}

// Fallback responses when AI fails
export const FALLBACK_RESPONSES = {
    preRoll: [
        "Let's see what fate has in store...",
        "Come on, lucky dice!",
        "Here goes nothing!",
        "Time to make my move!",
    ],
    postRoll: [
        "Interesting move!",
        "The game continues...",
        "That's how it goes!",
        "Onward!",
    ],
    trashTalk: [
        "May the best AI win!",
        "This is getting exciting!",
        "Game on!",
        "Watch and learn!",
    ],
};

export function getRandomFallback(type: 'preRoll' | 'postRoll' | 'trashTalk'): string {
    const responses = FALLBACK_RESPONSES[type];
    return responses[Math.floor(Math.random() * responses.length)];
}
