import { AIProvider } from '../game/types';
import { BaseAIProvider, GameContext, PostRollContext } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { OpenRouterProvider } from './providers/openrouter';
import { GroqProvider } from './providers/groq';
import { GrokProvider } from './providers/grok';

// Factory function to create AI provider
export function createAIProvider(
    provider: AIProvider,
    apiKey: string,
    model: string
): BaseAIProvider {
    switch (provider) {
        case 'openai':
            return new OpenAIProvider(apiKey, model);
        case 'anthropic':
            return new AnthropicProvider(apiKey, model);
        case 'gemini':
            return new GeminiProvider(apiKey, model);
        case 'openrouter':
            return new OpenRouterProvider(apiKey, model);
        case 'groq':
            return new GroqProvider(apiKey, model);
        case 'grok':
            return new GrokProvider(apiKey, model);
        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
}

// Generate all commentary for a turn
export async function generateTurnCommentary(
    provider: AIProvider,
    apiKey: string,
    model: string,
    preRollContext: GameContext,
    postRollContext: PostRollContext
): Promise<{
    preRollCommentary: string;
    postRollCommentary: string;
    trashTalk: string;
}> {
    const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);
    console.log(`[${timestamp()}] 🤖 AI Router: Creating provider ${provider} with model ${model}`);

    const aiProvider = createAIProvider(provider, apiKey, model);

    try {
        // Generate pre-roll commentary
        console.log(`[${timestamp()}] 🤖 AI Router: Generating pre-roll commentary...`);
        const preRollCommentary = await aiProvider.generatePreRollCommentary(preRollContext);
        console.log(`[${timestamp()}] ✅ AI Router: Pre-roll commentary received`);

        // Generate post-roll commentary
        console.log(`[${timestamp()}] 🤖 AI Router: Generating post-roll commentary...`);
        const postRollCommentary = await aiProvider.generatePostRollCommentary(postRollContext);
        console.log(`[${timestamp()}] ✅ AI Router: Post-roll commentary received`);

        // Generate trash talk
        console.log(`[${timestamp()}] 🤖 AI Router: Generating trash talk...`);
        const trashTalk = await aiProvider.generateTrashTalk(postRollContext);
        console.log(`[${timestamp()}] ✅ AI Router: Trash talk received`);

        return {
            preRollCommentary,
            postRollCommentary,
            trashTalk,
        };
    } catch (error) {
        console.error(`[${timestamp()}] ❌ AI Router: Error generating commentary`, error);
        throw error;
    }
}

// Re-export types and utilities
export { AVAILABLE_MODELS, PROVIDER_INFO } from './providers/base';
export type { BaseAIProvider, GameContext, PostRollContext } from './providers/base';
