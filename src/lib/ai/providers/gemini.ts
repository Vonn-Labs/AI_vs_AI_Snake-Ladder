import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider, GameContext, PostRollContext } from './base';
import { SYSTEM_PROMPT, getPreRollPrompt, getPostRollPrompt, getTrashTalkPrompt, getRandomFallback } from '../prompts';

export class GeminiProvider implements BaseAIProvider {
    name = 'Google Gemini';
    provider = 'gemini' as const;
    private client: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, model: string = 'gemini-3-flash') {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async generatePreRollCommentary(context: GameContext): Promise<string> {
        try {
            const genModel = this.client.getGenerativeModel({ model: this.model });
            const prompt = `${SYSTEM_PROMPT}\n\n${getPreRollPrompt({
                playerName: context.playerName,
                opponentName: context.opponentName,
                currentPosition: context.currentPosition,
                opponentPosition: context.opponentPosition,
                turnNumber: context.turnNumber,
            })}`;

            const result = await genModel.generateContent(prompt);
            return result.response.text() || getRandomFallback('preRoll');
        } catch (error) {
            console.error('Gemini pre-roll error:', error);
            return getRandomFallback('preRoll');
        }
    }

    async generatePostRollCommentary(context: PostRollContext): Promise<string> {
        try {
            const genModel = this.client.getGenerativeModel({ model: this.model });
            const prompt = `${SYSTEM_PROMPT}\n\n${getPostRollPrompt({
                playerName: context.playerName,
                opponentName: context.opponentName,
                diceRoll: context.diceRoll,
                fromPos: context.currentPosition,
                toPos: context.newPosition,
                event: context.event,
                eventFrom: context.eventFrom,
                eventTo: context.eventTo,
                isWinning: context.isWinningMove,
            })}`;

            const result = await genModel.generateContent(prompt);
            return result.response.text() || getRandomFallback('postRoll');
        } catch (error) {
            console.error('Gemini post-roll error:', error);
            return getRandomFallback('postRoll');
        }
    }

    async generateTrashTalk(context: PostRollContext): Promise<string> {
        try {
            const genModel = this.client.getGenerativeModel({ model: this.model });
            const prompt = `${SYSTEM_PROMPT}\n\n${getTrashTalkPrompt({
                playerName: context.playerName,
                playerModel: this.model,
                opponentName: context.opponentName,
                opponentModel: context.opponentModel,
                playerPosition: context.newPosition,
                opponentPosition: context.opponentPosition,
                event: context.event,
                isWinning: context.isWinningMove,
            })}`;

            const result = await genModel.generateContent(prompt);
            return result.response.text() || getRandomFallback('trashTalk');
        } catch (error) {
            console.error('Gemini trash talk error:', error);
            return getRandomFallback('trashTalk');
        }
    }

    async validateApiKey(): Promise<boolean> {
        try {
            const genModel = this.client.getGenerativeModel({ model: this.model });
            await genModel.generateContent('Hi');
            return true;
        } catch {
            return false;
        }
    }
}
