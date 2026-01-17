import { AIProvider } from '../../game/types';

// AI Response interface
export interface AIGameResponse {
    preRollCommentary: string;
    postRollCommentary: string;
    trashTalk: string;
}

// Context passed to AI for decision making
export interface GameContext {
    playerName: string;
    playerNumber: 1 | 2;
    opponentName: string;
    opponentModel: string;
    currentPosition: number;
    opponentPosition: number;
    turnNumber: number;
    lastTurnEvent?: {
        playerNumber: 1 | 2;
        diceRoll: number;
        event: 'snake' | 'ladder' | null;
        fromPos: number;
        toPos: number;
    } | null;
    gameHistory: Array<{
        playerNumber: 1 | 2;
        diceRoll: number;
        fromPos: number;
        toPos: number;
        event: 'snake' | 'ladder' | null;
    }>;
}

// Post-roll context with dice result
export interface PostRollContext extends GameContext {
    diceRoll: number;
    newPosition: number;
    event: 'snake' | 'ladder' | null;
    eventFrom?: number;
    eventTo?: number;
    isWinningMove: boolean;
}

// Base AI provider interface
export interface BaseAIProvider {
    name: string;
    provider: AIProvider;

    // Generate pre-roll commentary (anticipation, strategy)
    generatePreRollCommentary(context: GameContext): Promise<string>;

    // Generate post-roll commentary (reaction to dice result)
    generatePostRollCommentary(context: PostRollContext): Promise<string>;

    // Generate trash talk directed at opponent
    generateTrashTalk(context: PostRollContext): Promise<string>;

    // Validate API key
    validateApiKey(): Promise<boolean>;
}

// Available models per provider - Updated January 2026
export const AVAILABLE_MODELS: Record<AIProvider, Array<{ id: string; name: string; description: string }>> = {
    openai: [
        { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Most advanced frontier model' },
        { id: 'gpt-5', name: 'GPT-5', description: 'Multimodal with PhD-level reasoning' },
        { id: 'o3', name: 'o3', description: 'Advanced reasoning model' },
        { id: 'o3-mini', name: 'o3-mini', description: 'Fast reasoning model' },
        { id: 'gpt-4.5-turbo', name: 'GPT-4.5 Turbo', description: '3x faster, 256k context' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Previous generation multimodal' },
    ],
    anthropic: [
        { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', description: 'Latest Claude, infinite chats' },
        { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Best for coding & agents' },
        { id: 'claude-opus-4.1', name: 'Claude Opus 4.1', description: 'Agentic tasks & reasoning' },
        { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Balanced performance' },
        { id: 'claude-opus-4', name: 'Claude Opus 4', description: 'Complex problem-solving' },
    ],
    gemini: [
        { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro', description: 'Most advanced, multimodal' },
        { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Real-time performance' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast responses' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Previous generation' },
    ],
    openrouter: [
        { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', description: '400B MoE, multilingual' },
        { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout', description: '109B MoE, general purpose' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Powerful open model' },
        { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'Advanced reasoning' },
        { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', description: 'Fast MoE model' },
    ],
    groq: [
        { id: 'llama-4-maverick', name: 'Llama 4 Maverick', description: '400B params, ultra-fast' },
        { id: 'llama-4-scout', name: 'Llama 4 Scout', description: '460+ tokens/sec on Groq' },
        { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', description: 'Distilled reasoning' },
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Fast inference' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Efficient model' },
    ],
    grok: [
        { id: 'grok-4.1', name: 'Grok 4.1', description: 'Latest stable release' },
        { id: 'grok-4.1-thinking', name: 'Grok 4.1 Thinking', description: 'Advanced reasoning mode' },
        { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', description: 'Speed optimized' },
        { id: 'grok-3', name: 'Grok 3', description: 'Enhanced reasoning' },
        { id: 'grok-3-mini', name: 'Grok 3 Mini', description: 'Cost-efficient' },
    ],
};

// Provider display names and colors
export const PROVIDER_INFO: Record<AIProvider, { name: string; color: string; bgColor: string }> = {
    openai: { name: 'OpenAI', color: '#10a37f', bgColor: 'bg-emerald-500' },
    anthropic: { name: 'Anthropic', color: '#d97706', bgColor: 'bg-amber-600' },
    gemini: { name: 'Google Gemini', color: '#4285f4', bgColor: 'bg-blue-500' },
    openrouter: { name: 'OpenRouter', color: '#6366f1', bgColor: 'bg-indigo-500' },
    groq: { name: 'Groq', color: '#f97316', bgColor: 'bg-orange-500' },
    grok: { name: 'xAI Grok', color: '#1d9bf0', bgColor: 'bg-sky-500' },
};
