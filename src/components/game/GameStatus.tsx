'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GameState } from '@/lib/game/types';
import { PROVIDER_INFO } from '@/lib/ai/providers/base';
import { AIProvider } from '@/lib/game/types';

interface GameStatusProps {
    gameState: GameState | null;
    isPlaying: boolean;
    turnDelay: number;
    onTurnDelayChange: (delay: number) => void;
}

export default function GameStatus({
    gameState,
    isPlaying,
    turnDelay,
    onTurnDelayChange
}: GameStatusProps) {
    if (!gameState) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="py-8 text-center">
                    <div className="text-4xl mb-3">🎮</div>
                    <p className="text-muted-foreground">Configure players to start the game</p>
                </CardContent>
            </Card>
        );
    }

    const currentPlayer = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const playerColor = gameState.currentPlayer === 1 ? 'emerald' : 'amber';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {gameState.status === 'completed' ? '🎉 Game Over!' : '🎮 Game in Progress'}
                            </CardTitle>
                            <CardDescription>Turn {gameState.turns.length + 1}</CardDescription>
                        </div>

                        {gameState.status === 'active' && (
                            <Badge
                                variant="outline"
                                className={`animate-pulse bg-${playerColor}-500/20 border-${playerColor}-500 text-${playerColor}-500`}
                            >
                                {isPlaying ? `${currentPlayer.name}'s turn...` : 'Paused'}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Player Scores */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Player 1 */}
                        <div className={`p-4 rounded-xl bg-emerald-500/10 ${gameState.currentPlayer === 1 && gameState.status === 'active' ? 'ring-2 ring-emerald-500' : ''}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                                    1
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-medium text-sm truncate">{gameState.player1.name}</div>
                                    <div
                                        className="text-xs truncate"
                                        style={{ color: PROVIDER_INFO[gameState.player1.provider as AIProvider].color }}
                                    >
                                        {gameState.player1.model}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-emerald-500">
                                {gameState.player1.position}
                                <span className="text-sm font-normal text-muted-foreground"> / 100</span>
                            </div>
                            {gameState.winner === 1 && (
                                <Badge className="mt-2 bg-emerald-500">🏆 Winner!</Badge>
                            )}
                        </div>

                        {/* Player 2 */}
                        <div className={`p-4 rounded-xl bg-amber-500/10 ${gameState.currentPlayer === 2 && gameState.status === 'active' ? 'ring-2 ring-amber-500' : ''}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                                    2
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-medium text-sm truncate">{gameState.player2.name}</div>
                                    <div
                                        className="text-xs truncate"
                                        style={{ color: PROVIDER_INFO[gameState.player2.provider as AIProvider].color }}
                                    >
                                        {gameState.player2.model}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-amber-500">
                                {gameState.player2.position}
                                <span className="text-sm font-normal text-muted-foreground"> / 100</span>
                            </div>
                            {gameState.winner === 2 && (
                                <Badge className="mt-2 bg-amber-500">🏆 Winner!</Badge>
                            )}
                        </div>
                    </div>

                    {/* Turn Delay Control */}
                    {gameState.status === 'active' && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    Turn Delay: {turnDelay / 1000}s
                                </Label>
                                <input
                                    type="range"
                                    min="1000"
                                    max="5000"
                                    step="500"
                                    value={turnDelay}
                                    onChange={(e) => onTurnDelayChange(parseInt(e.target.value))}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Fast (1s)</span>
                                    <span>Slow (5s)</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
