'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PROVIDER_INFO } from '@/lib/ai/providers/base';
import { AIProvider } from '@/lib/game/types';

interface LeaderboardEntry {
    id: string;
    provider: string;
    model: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
    winRate: number;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard');
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                const data = await response.json();
                setLeaderboard(data.leaderboard);
            } catch (err) {
                setError('Failed to load leaderboard');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankEmoji = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">🏆 Leaderboard</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Which AI model dominates the Snake & Ladder arena?
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-12 text-center">
                            <div className="text-5xl mb-4 animate-bounce">🎲</div>
                            <p className="text-muted-foreground">Loading leaderboard...</p>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-12 text-center">
                            <div className="text-5xl mb-4">😢</div>
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                ) : leaderboard.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <div className="text-6xl mb-4">🎮</div>
                            <CardTitle>No games played yet!</CardTitle>
                            <CardDescription>
                                Be the first to start a match and populate the leaderboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Link href="/game">
                                <Button className="bg-gradient-to-r from-primary to-purple-600">
                                    Start a Match
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-4 text-muted-foreground font-medium">Rank</th>
                                            <th className="text-left p-4 text-muted-foreground font-medium">Model</th>
                                            <th className="text-center p-4 text-muted-foreground font-medium">Games</th>
                                            <th className="text-center p-4 text-muted-foreground font-medium">Wins</th>
                                            <th className="text-center p-4 text-muted-foreground font-medium">Losses</th>
                                            <th className="text-center p-4 text-muted-foreground font-medium">Win Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, index) => (
                                            <motion.tr
                                                key={entry.id}
                                                className="border-b border-border hover:bg-muted/50 transition-colors"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td className="p-4 font-bold text-xl">
                                                    {getRankEmoji(index)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor: PROVIDER_INFO[entry.provider as AIProvider]?.color || '#666'
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="font-medium">{entry.model}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {PROVIDER_INFO[entry.provider as AIProvider]?.name || entry.provider}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">{entry.gamesPlayed}</td>
                                                <td className="p-4 text-center text-green-500 font-medium">{entry.wins}</td>
                                                <td className="p-4 text-center text-red-500 font-medium">{entry.losses}</td>
                                                <td className="p-4 text-center">
                                                    <Badge
                                                        variant="outline"
                                                        style={{
                                                            backgroundColor: entry.winRate >= 50
                                                                ? 'rgba(34, 197, 94, 0.15)'
                                                                : 'rgba(239, 68, 68, 0.15)',
                                                            color: entry.winRate >= 50 ? '#22c55e' : '#ef4444',
                                                            borderColor: entry.winRate >= 50 ? '#22c55e40' : '#ef444440',
                                                        }}
                                                    >
                                                        {entry.winRate}%
                                                    </Badge>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Play CTA */}
                <motion.div
                    className="text-center mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link href="/game">
                        <Button className="bg-gradient-to-r from-primary to-purple-600">
                            🎮 Start a New Match
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
