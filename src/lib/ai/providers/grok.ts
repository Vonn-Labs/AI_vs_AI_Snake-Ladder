import { BaseAIProvider, GameContext, PostRollContext } from './base';
import { SYSTEM_PROMPT, getPreRollPrompt, getPostRollPrompt, getTrashTalkPrompt, getRandomFallback } from '../prompts';

// xAI Grok uses OpenAI-compatible API
export class GrokProvider implements BaseAIProvider {
    name = 'xAI Grok';
    provider = 'grok' as const;
    private apiKey: string;
    private model: string;
    private baseUrl = 'https://api.x.ai/v1';

    constructor(apiKey: string, model: string = 'grok-4.1') {
        this.apiKey = apiKey;
        this.model = model;
    }

    private async makeRequest(messages: Array<{ role: string; content: string }>, maxTokens: number): Promise<string> {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                max_tokens: maxTokens,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            throw new Error(`Grok API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generatePreRollCommentary(context: GameContext): Promise<string> {
        try {
            return await this.makeRequest([
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user', content: getPreRollPrompt({
                        playerName: context.playerName,
                        opponentName: context.opponentName,
                        currentPosition: context.currentPosition,
                        opponentPosition: context.opponentPosition,
                        turnNumber: context.turnNumber,
                    })
                },
            ], 100);
        } catch (error) {
            console.error('Grok pre-roll error:', error);
            return getRandomFallback('preRoll');
        }
    }

    async generatePostRollCommentary(context: PostRollContext): Promise<string> {
        try {
            return await this.makeRequest([
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user', content: getPostRollPrompt({
                        playerName: context.playerName,
                        opponentName: context.opponentName,
                        diceRoll: context.diceRoll,
                        fromPos: context.currentPosition,
                        toPos: context.newPosition,
                        event: context.event,
                        eventFrom: context.eventFrom,
                        eventTo: context.eventTo,
                        isWinning: context.isWinningMove,
                    })
                },
            ], 100);
        } catch (error) {
            console.error('Grok post-roll error:', error);
            return getRandomFallback('postRoll');
        }
    }

    async generateTrashTalk(context: PostRollContext): Promise<string> {
        try {
            return await this.makeRequest([
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user', content: getTrashTalkPrompt({
                        playerName: context.playerName,
                        playerModel: this.model,
                        opponentName: context.opponentName,
                        opponentModel: context.opponentModel,
                        playerPosition: context.newPosition,
                        opponentPosition: context.opponentPosition,
                        event: context.event,
                        isWinning: context.isWinningMove,
                    })
                },
            ], 60);
        } catch (error) {
            console.error('Grok trash talk error:', error);
            return getRandomFallback('trashTalk');
        }
    }

    async validateApiKey(): Promise<boolean> {
        try {
            await this.makeRequest([{ role: 'user', content: 'Hi' }], 10);
            return true;
        } catch {
            return false;
        }
    }
}
