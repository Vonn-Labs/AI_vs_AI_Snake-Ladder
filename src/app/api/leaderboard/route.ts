import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const leaderboard = await prisma.leaderboard.findMany({
            take: limit,
            orderBy: [
                { wins: 'desc' },
                { gamesPlayed: 'desc' },
            ],
        });

        // Calculate win rates
        const leaderboardWithRates = leaderboard.map((entry: { id: string; provider: string; model: string; wins: number; losses: number; gamesPlayed: number }) => ({
            ...entry,
            winRate: entry.gamesPlayed > 0
                ? Math.round((entry.wins / entry.gamesPlayed) * 100)
                : 0,
        }));

        return NextResponse.json({
            leaderboard: leaderboardWithRates,
            total: leaderboard.length,
        });
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
