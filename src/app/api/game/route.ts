import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { GameState } from '@/lib/game/types';

// POST - Save a completed game
export async function POST(request: NextRequest) {
    try {
        const gameState: GameState = await request.json();

        // Create the game record
        const game = await prisma.game.create({
            data: {
                id: gameState.id,
                status: gameState.status,
                winner: gameState.winner ? `player${gameState.winner}` : null,
                player1Provider: gameState.player1.provider,
                player1Model: gameState.player1.model,
                player1Name: gameState.player1.name,
                player1Position: gameState.player1.position,
                player2Provider: gameState.player2.provider,
                player2Model: gameState.player2.model,
                player2Name: gameState.player2.name,
                player2Position: gameState.player2.position,
                currentPlayer: gameState.currentPlayer,
                completedAt: gameState.status === 'completed' ? new Date() : null,
                turns: {
                    create: gameState.turns.map((turn) => ({
                        id: turn.id,
                        turnNumber: turn.turnNumber,
                        playerNum: turn.playerNum,
                        provider: turn.provider,
                        model: turn.model,
                        diceRoll: turn.diceRoll,
                        fromPos: turn.fromPos,
                        toPos: turn.toPos,
                        finalPos: turn.finalPos,
                        event: turn.event?.type || null,
                        eventFrom: turn.event?.from || null,
                        eventTo: turn.event?.to || null,
                        preRollCommentary: turn.preRollCommentary,
                        postRollCommentary: turn.postRollCommentary,
                        trashTalk: turn.trashTalk,
                    })),
                },
            },
        });

        // Update leaderboard for player 1
        await prisma.leaderboard.upsert({
            where: {
                provider_model: {
                    provider: gameState.player1.provider,
                    model: gameState.player1.model,
                },
            },
            update: {
                gamesPlayed: { increment: 1 },
                wins: gameState.winner === 1 ? { increment: 1 } : undefined,
                losses: gameState.winner === 2 ? { increment: 1 } : undefined,
            },
            create: {
                provider: gameState.player1.provider,
                model: gameState.player1.model,
                gamesPlayed: 1,
                wins: gameState.winner === 1 ? 1 : 0,
                losses: gameState.winner === 2 ? 1 : 0,
            },
        });

        // Update leaderboard for player 2
        await prisma.leaderboard.upsert({
            where: {
                provider_model: {
                    provider: gameState.player2.provider,
                    model: gameState.player2.model,
                },
            },
            update: {
                gamesPlayed: { increment: 1 },
                wins: gameState.winner === 2 ? { increment: 1 } : undefined,
                losses: gameState.winner === 1 ? { increment: 1 } : undefined,
            },
            create: {
                provider: gameState.player2.provider,
                model: gameState.player2.model,
                gamesPlayed: 1,
                wins: gameState.winner === 2 ? 1 : 0,
                losses: gameState.winner === 1 ? 1 : 0,
            },
        });

        return NextResponse.json({ success: true, gameId: game.id });
    } catch (error) {
        console.error('Failed to save game:', error);
        return NextResponse.json(
            { error: 'Failed to save game' },
            { status: 500 }
        );
    }
}

// GET - List recent games
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const games = await prisma.game.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: {
                turns: {
                    orderBy: { turnNumber: 'asc' },
                },
            },
        });

        const total = await prisma.game.count();

        return NextResponse.json({
            games,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Failed to fetch games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
