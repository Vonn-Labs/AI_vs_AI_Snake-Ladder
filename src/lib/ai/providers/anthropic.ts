import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, GameContext, PostRollContext } from './base';
import { SYSTEM_PROMPT, getPreRollPrompt, getPostRollPrompt, getTrashTalkPrompt, getRandomFallback } from '../prompts';

export class AnthropicProvider implements BaseAIProvider {
    name = 'Anthropic';
    provider = 'anthropic' as const;
    private client: Anthropic;
    private model: string;

    constructor(apiKey: string, model: string = 'claude-sonnet-4.5') {
        this.client = new Anthropic({ apiKey });
        this.model = model;
    }

    async generatePreRollCommentary(context: GameContext): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 100,
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user', content: getPreRollPrompt({
                            playerName: context.playerName,
                            opponentName: context.opponentName,
                            currentPosition: context.currentPosition,
                            opponentPosition: context.opponentPosition,
                            turnNumber: context.turnNumber,
                        })
                    },
                ],
            });
            const textBlock = response.content.find(block => block.type === 'text');
            return textBlock && 'text' in textBlock ? textBlock.text : getRandomFallback('preRoll');
        } catch (error) {
            console.error('Anthropic pre-roll error:', error);
            return getRandomFallback('preRoll');
        }
    }

    async generatePostRollCommentary(context: PostRollContext): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 100,
                system: SYSTEM_PROMPT,
                messages: [
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
                ],
            });
            const textBlock = response.content.find(block => block.type === 'text');
            return textBlock && 'text' in textBlock ? textBlock.text : getRandomFallback('postRoll');
        } catch (error) {
            console.error('Anthropic post-roll error:', error);
            return getRandomFallback('postRoll');
        }
    }

    async generateTrashTalk(context: PostRollContext): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 60,
                system: SYSTEM_PROMPT,
                messages: [
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
                ],
            });
            const textBlock = response.content.find(block => block.type === 'text');
            return textBlock && 'text' in textBlock ? textBlock.text : getRandomFallback('trashTalk');
        } catch (error) {
            console.error('Anthropic trash talk error:', error);
            return getRandomFallback('trashTalk');
        }
    }

    async validateApiKey(): Promise<boolean> {
        try {
            await this.client.messages.create({
                model: this.model,
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }],
            });
            return true;
        } catch {
            return false;
        }
    }
}
