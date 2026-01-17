'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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

    // Auto-scroll to bottom on new turns
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [turns]);

    const getPlayerName = (playerNum: 1 | 2) => playerNum === 1 ? player1Name : player2Name;
    const getPlayerColor = (playerNum: 1 | 2) => playerNum === 1 ? 'emerald' : 'amber';
    const getProvider = (playerNum: 1 | 2) => playerNum === 1 ? player1Provider : player2Provider;

    return (
        <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    💬 Game Commentary
                </CardTitle>
                <CardDescription>Live reactions from the AI players</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[500px] px-4 pb-4">
                    <div ref={scrollRef} className="space-y-4">
                        <AnimatePresence>
                            {turns.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">
                                    <div className="text-5xl mb-4 animate-bounce">🎲</div>
                                    <p className="text-lg">Start the game to see AI commentary!</p>
                                </div>
                            ) : (
                                turns.map((turn) => (
                                    <motion.div
                                        key={turn.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3"
                                    >
                                        {/* Turn Header */}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-8 h-8 rounded-full bg-${getPlayerColor(turn.playerNum as 1 | 2)}-500 flex items-center justify-center text-white text-sm font-bold shadow-md`}
                                            >
                                                {turn.playerNum}
                                            </div>
                                            <span className="font-semibold">{getPlayerName(turn.playerNum as 1 | 2)}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                                style={{
                                                    backgroundColor: `${PROVIDER_INFO[getProvider(turn.playerNum as 1 | 2)].color}15`,
                                                    borderColor: PROVIDER_INFO[getProvider(turn.playerNum as 1 | 2)].color,
                                                    color: PROVIDER_INFO[getProvider(turn.playerNum as 1 | 2)].color,
                                                }}
                                            >
                                                {turn.model}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                Turn {turn.turnNumber}
                                            </span>
                                        </div>

                                        {/* Pre-roll Commentary */}
                                        {turn.preRollCommentary && (
                                            <div className="pl-10 py-2 px-3 rounded-lg bg-muted/30 border-l-2 border-muted-foreground/30">
                                                <p className="text-xs text-muted-foreground mb-1">Before rolling:</p>
                                                <p className="text-sm">{turn.preRollCommentary}</p>
                                            </div>
                                        )}

                                        {/* Dice Roll Result */}
                                        <div className="pl-10 flex items-center gap-4 py-2 px-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🎲</span>
                                                <span className="font-bold text-2xl text-primary">{turn.diceRoll}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {turn.fromPos} → {turn.toPos}
                                                {turn.event && (
                                                    <span className={turn.event.type === 'snake' ? 'text-red-500' : 'text-green-500'}>
                                                        {' '}→ {turn.finalPos} {turn.event.type === 'snake' ? '🐍' : '🪜'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Post-roll Commentary */}
                                        {turn.postRollCommentary && (
                                            <div className={`pl-10 py-2 px-3 rounded-lg border-l-2 bg-${getPlayerColor(turn.playerNum as 1 | 2)}-500/10 border-${getPlayerColor(turn.playerNum as 1 | 2)}-500/50`}>
                                                <p className="text-xs text-muted-foreground mb-1">Reaction:</p>
                                                <p className="text-sm">{turn.postRollCommentary}</p>
                                            </div>
                                        )}

                                        {/* Trash Talk */}
                                        {turn.trashTalk && (
                                            <div className="pl-10 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-2 border-purple-500/50">
                                                <p className="text-xs text-purple-400 mb-1">💬 Trash Talk:</p>
                                                <p className="text-sm italic">&quot;{turn.trashTalk}&quot;</p>
                                            </div>
                                        )}

                                        {/* Separator */}
                                        <div className="border-t border-border/50 my-4" />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
