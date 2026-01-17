'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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

    const getRankDisplay = (index: number) => {
        switch (index) {
            case 0: return { emoji: '🥇', gradient: 'from-yellow-400 to-amber-500' };
            case 1: return { emoji: '🥈', gradient: 'from-gray-300 to-gray-400' };
            case 2: return { emoji: '🥉', gradient: 'from-orange-400 to-orange-500' };
            default: return { emoji: `${index + 1}`, gradient: 'from-violet-500 to-purple-600' };
        }
    };

    return (
        <div className="min-h-screen noise">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
                <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">
                            🎲
                        </div>
                        <span className="font-bold text-lg tracking-tight">AI Arena</span>
                    </Link>
                    <Link href="/game">
                        <Button className="btn-premium px-6">
                            Play Now
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                        <span className="gradient-text">🏆 Leaderboard</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Which AI model dominates the arena?
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <motion.div
                        className="glass rounded-3xl p-16 text-center border border-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-4 animate-float">🎲</div>
                        <p className="text-xl font-medium mb-2">Loading rankings...</p>
                        <p className="text-muted-foreground">Please wait while we fetch the latest stats</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        className="glass rounded-3xl p-16 text-center border border-red-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-4">😢</div>
                        <p className="text-xl font-medium text-red-400 mb-2">{error}</p>
                        <p className="text-muted-foreground">Please try again later</p>
                    </motion.div>
                ) : leaderboard.length === 0 ? (
                    <motion.div
                        className="glass rounded-3xl p-16 text-center border border-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-6 animate-float">🎮</div>
                        <h2 className="text-2xl font-bold mb-3">No battles yet!</h2>
                        <p className="text-muted-foreground mb-8">Be the first to pit AI models against each other</p>
                        <Link href="/game">
                            <Button className="btn-premium text-lg px-8 py-6 rounded-2xl">
                                Start First Match
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="glass rounded-3xl border border-white/5 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Table Header */}
                        <div className="grid grid-cols-[80px_1fr_100px_100px_100px_120px] gap-4 p-6 border-b border-white/5 bg-white/5">
                            <span className="text-sm font-medium text-muted-foreground">Rank</span>
                            <span className="text-sm font-medium text-muted-foreground">Model</span>
                            <span className="text-sm font-medium text-muted-foreground text-center">Games</span>
                            <span className="text-sm font-medium text-muted-foreground text-center">Wins</span>
                            <span className="text-sm font-medium text-muted-foreground text-center">Losses</span>
                            <span className="text-sm font-medium text-muted-foreground text-center">Win Rate</span>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            {leaderboard.map((entry, index) => {
                                const rank = getRankDisplay(index);
                                return (
                                    <motion.div
                                        key={entry.id}
                                        className="grid grid-cols-[80px_1fr_100px_100px_100px_120px] gap-4 p-6 items-center hover:bg-white/5 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {/* Rank */}
                                        <div className="flex items-center justify-center">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rank.gradient} flex items-center justify-center font-bold text-white shadow-lg`}>
                                                {index < 3 ? rank.emoji : rank.emoji}
                                            </div>
                                        </div>

                                        {/* Model */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: PROVIDER_INFO[entry.provider as AIProvider]?.color || '#666' }}
                                            />
                                            <div>
                                                <div className="font-semibold">{entry.model}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {PROVIDER_INFO[entry.provider as AIProvider]?.name || entry.provider}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Games */}
                                        <div className="text-center font-medium">{entry.gamesPlayed}</div>

                                        {/* Wins */}
                                        <div className="text-center font-bold text-emerald-400">{entry.wins}</div>

                                        {/* Losses */}
                                        <div className="text-center font-bold text-red-400">{entry.losses}</div>

                                        {/* Win Rate */}
                                        <div className="text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${entry.winRate >= 60
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : entry.winRate >= 40
                                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {entry.winRate}%
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link href="/game">
                        <Button className="btn-premium text-lg px-10 py-6 rounded-2xl">
                            <span className="mr-2">⚔️</span>
                            Start a New Battle
                        </Button>
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Made with 💜 for AI enthusiasts
                    </p>
                </div>
            </footer>
        </div>
    );
}
