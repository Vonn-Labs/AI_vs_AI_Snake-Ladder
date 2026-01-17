'use client';

import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
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
            <motion.div
                className="glass rounded-3xl p-8 text-center border border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-5xl mb-4">🎮</div>
                <p className="text-muted-foreground">Configure players to start the game</p>
            </motion.div>
        );
    }

    const currentPlayer = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    const currentGradient = gameState.currentPlayer === 1
        ? 'from-emerald-500 to-teal-600'
        : 'from-amber-500 to-orange-600';

    return (
        <motion.div
            className="glass rounded-3xl border border-white/5 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                            {gameState.status === 'completed' ? '🎉' : '⚔️'}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">
                                {gameState.status === 'completed' ? 'Game Over!' : 'Battle in Progress'}
                            </h3>
                            <p className="text-sm text-muted-foreground">Turn {gameState.turns.length + 1}</p>
                        </div>
                    </div>

                    {gameState.status === 'active' && (
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isPlaying
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {isPlaying ? '● Live' : '⏸ Paused'}
                        </div>
                    )}
                </div>
            </div>

            {/* Player Cards */}
            <div className="p-6 space-y-4">
                {/* Player 1 */}
                <div className={`p-4 rounded-2xl transition-all ${gameState.currentPlayer === 1 && gameState.status === 'active'
                        ? 'bg-emerald-500/10 ring-2 ring-emerald-500/50'
                        : 'bg-white/5'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                            1
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{gameState.player1.name}</div>
                            <div
                                className="text-xs truncate"
                                style={{ color: PROVIDER_INFO[gameState.player1.provider as AIProvider].color }}
                            >
                                {gameState.player1.model}
                            </div>
                        </div>
                        {gameState.winner === 1 && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                🏆 Winner
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-emerald-400">{gameState.player1.position}</span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                </div>

                {/* VS Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-sm font-bold text-muted-foreground">VS</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* Player 2 */}
                <div className={`p-4 rounded-2xl transition-all ${gameState.currentPlayer === 2 && gameState.status === 'active'
                        ? 'bg-amber-500/10 ring-2 ring-amber-500/50'
                        : 'bg-white/5'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                            2
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{gameState.player2.name}</div>
                            <div
                                className="text-xs truncate"
                                style={{ color: PROVIDER_INFO[gameState.player2.provider as AIProvider].color }}
                            >
                                {gameState.player2.model}
                            </div>
                        </div>
                        {gameState.winner === 2 && (
                            <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                                🏆 Winner
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-amber-400">{gameState.player2.position}</span>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                </div>

                {/* Turn Speed Control */}
                {gameState.status === 'active' && (
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm text-muted-foreground">Turn Speed</Label>
                            <span className="text-sm font-medium">{turnDelay / 1000}s</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="5000"
                            step="500"
                            value={turnDelay}
                            onChange={(e) => onTurnDelayChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Fast</span>
                            <span>Slow</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Turn Indicator */}
            {gameState.status === 'active' && isPlaying && (
                <div className={`p-4 bg-gradient-to-r ${currentGradient} border-t border-white/10`}>
                    <div className="flex items-center justify-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="font-medium">{currentPlayer.name}&apos;s turn...</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
