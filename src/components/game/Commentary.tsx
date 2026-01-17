'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Turn } from '@/lib/game/types';
import { PROVIDER_INFO } from '@/lib/ai/providers/base';
import { AIProvider } from '@/lib/game/types';

interface CommentaryProps {
    turns: Turn[];
    player1Name: string;
    player2Name: string;
    player1Provider: AIProvider;
    player2Provider: AIProvider;
}

export default function Commentary({
    turns,
    player1Name,
    player2Name,
    player1Provider,
    player2Provider
}: CommentaryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [turns]);

    const getPlayerName = (playerNum: 1 | 2) => playerNum === 1 ? player1Name : player2Name;
    const getPlayerGradient = (playerNum: 1 | 2) => playerNum === 1
        ? 'from-emerald-500 to-teal-600'
        : 'from-amber-500 to-orange-600';
    const getProvider = (playerNum: 1 | 2) => playerNum === 1 ? player1Provider : player2Provider;

    return (
        <motion.div
            className="glass rounded-3xl border border-white/5 h-full flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                        💬
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Live Commentary</h3>
                        <p className="text-sm text-muted-foreground">AI reactions & trash talk</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
                <div ref={scrollRef} className="space-y-6">
                    <AnimatePresence>
                        {turns.length === 0 ? (
                            <motion.div
                                className="text-center py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="text-6xl mb-4 animate-float">🎲</div>
                                <p className="text-lg font-medium mb-2">No moves yet</p>
                                <p className="text-muted-foreground text-sm">Start the game to see AI commentary!</p>
                            </motion.div>
                        ) : (
                            turns.map((turn, index) => (
                                <motion.div
                                    key={turn.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="space-y-3"
                                >
                                    {/* Turn Header */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getPlayerGradient(turn.playerNum as 1 | 2)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                                            {turn.playerNum}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">{getPlayerName(turn.playerNum as 1 | 2)}</div>
                                            <div
                                                className="text-xs truncate"
                                                style={{ color: PROVIDER_INFO[getProvider(turn.playerNum as 1 | 2)].color }}
                                            >
                                                {turn.model}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">
                                            Turn {turn.turnNumber}
                                        </span>
                                    </div>

                                    {/* Dice Roll */}
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🎲</span>
                                            <span className="font-bold text-3xl gradient-text">{turn.diceRoll}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="text-foreground font-medium">{turn.fromPos}</span>
                                            <span className="mx-2">→</span>
                                            <span className="text-foreground font-medium">{turn.toPos}</span>
                                            {turn.event && (
                                                <>
                                                    <span className="mx-2">→</span>
                                                    <span className={turn.event.type === 'snake' ? 'text-red-400' : 'text-green-400'}>
                                                        {turn.finalPos} {turn.event.type === 'snake' ? '🐍' : '🪜'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pre-roll Commentary */}
                                    {turn.preRollCommentary && (
                                        <div className="p-4 rounded-2xl bg-white/5 border-l-2 border-muted-foreground/30">
                                            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                                                <span>🤔</span> Before rolling
                                            </p>
                                            <p className="text-sm leading-relaxed">{turn.preRollCommentary}</p>
                                        </div>
                                    )}

                                    {/* Post-roll Commentary */}
                                    {turn.postRollCommentary && (
                                        <div className={`p-4 rounded-2xl border-l-2 ${turn.playerNum === 1
                                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                                : 'bg-amber-500/10 border-amber-500/50'
                                            }`}>
                                            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                                                <span>😄</span> Reaction
                                            </p>
                                            <p className="text-sm leading-relaxed">{turn.postRollCommentary}</p>
                                        </div>
                                    )}

                                    {/* Trash Talk */}
                                    {turn.trashTalk && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 border-l-2 border-pink-500/50">
                                            <p className="text-xs text-pink-400 mb-1.5 flex items-center gap-1">
                                                <span>🔥</span> Trash Talk
                                            </p>
                                            <p className="text-sm italic leading-relaxed">&ldquo;{turn.trashTalk}&rdquo;</p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    {index < turns.length - 1 && (
                                        <div className="border-t border-white/5 my-4" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </motion.div>
    );
}
