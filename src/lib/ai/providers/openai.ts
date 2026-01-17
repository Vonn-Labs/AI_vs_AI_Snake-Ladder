import OpenAI from 'openai';
import { BaseAIProvider, GameContext, PostRollContext } from './base';
import { SYSTEM_PROMPT, getPreRollPrompt, getPostRollPrompt, getTrashTalkPrompt, getRandomFallback } from '../prompts';

export class OpenAIProvider implements BaseAIProvider {
    name = 'OpenAI';
    provider = 'openai' as const;
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = 'gpt-5') {
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async generatePreRollCommentary(context: GameContext): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
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
                ],
                max_tokens: 100,
                temperature: 0.8,
            });
            return response.choices[0]?.message?.content || getRandomFallback('preRoll');
        } catch (error) {
            console.error('OpenAI pre-roll error:', error);
            return getRandomFallback('preRoll');
        }
    }

    async generatePostRollCommentary(context: PostRollContext): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
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
                ],
                max_tokens: 100,
                temperature: 0.8,
            });
            return response.choices[0]?.message?.content || getRandomFallback('postRoll');
        } catch (error) {
            console.error('OpenAI post-roll error:', error);
            return getRandomFallback('postRoll');
        }
    }

    async generateTrashTalk(context: PostRollContext): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
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
                ],
                max_tokens: 60,
                temperature: 0.9,
            });
            return response.choices[0]?.message?.content || getRandomFallback('trashTalk');
        } catch (error) {
            console.error('OpenAI trash talk error:', error);
            return getRandomFallback('trashTalk');
        }
    }

    async validateApiKey(): Promise<boolean> {
        try {
            await this.client.models.list();
            return true;
        } catch {
            return false;
        }
    }
}
