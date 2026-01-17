'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Board, Dice, PlayerSetup, Commentary, GameStatus } from '@/components/game';
import { Button } from '@/components/ui/button';
import { GameState, Turn, AIProvider } from '@/lib/game/types';
import { createGame, executeTurn } from '@/lib/game/engine';
import { generateTurnCommentary, PostRollContext, GameContext } from '@/lib/ai/router';

interface PlayerConfig {
    provider: AIProvider;
    model: string;
    name: string;
    apiKey: string;
}

// Debug logger
const debug = {
    log: (context: string, message: string, data?: unknown) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
        console.log(`[${timestamp}] 🎮 ${context}: ${message}`, data !== undefined ? data : '');
    },
    error: (context: string, message: string, error?: unknown) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
        console.error(`[${timestamp}] ❌ ${context}: ${message}`, error !== undefined ? error : '');
    },
    success: (context: string, message: string, data?: unknown) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
        console.log(`[${timestamp}] ✅ ${context}: ${message}`, data !== undefined ? data : '');
    }
};

export default function GamePage() {
    const [player1Config, setPlayer1Config] = useState<PlayerConfig | null>(null);
    const [player2Config, setPlayer2Config] = useState<PlayerConfig | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentDiceValue, setCurrentDiceValue] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [turnDelay, setTurnDelay] = useState(2000);
    const [error, setError] = useState<string | null>(null);

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const isExecutingTurn = useRef(false);

    // Start a new game
    const startGame = useCallback(() => {
        debug.log('StartGame', 'Attempting to start game...');

        if (!player1Config || !player2Config) {
            debug.error('StartGame', 'Missing player configuration');
            setError('Please configure both players');
            return null;
        }

        if (!player1Config.apiKey || !player2Config.apiKey) {
            debug.error('StartGame', 'Missing API keys');
            setError('Please provide API keys for both players');
            return null;
        }

        debug.log('StartGame', 'Player 1 config', {
            provider: player1Config.provider,
            model: player1Config.model,
            hasApiKey: !!player1Config.apiKey
        });
        debug.log('StartGame', 'Player 2 config', {
            provider: player2Config.provider,
            model: player2Config.model,
            hasApiKey: !!player2Config.apiKey
        });

        const newGame = createGame(player1Config, player2Config);
        debug.success('StartGame', 'Game created successfully', {
            gameId: newGame.id,
            status: newGame.status,
            currentPlayer: newGame.currentPlayer
        });

        setGameState(newGame);
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);

        return newGame;
    }, [player1Config, player2Config]);

    // Execute a single turn
    const executeSingleTurn = useCallback(async (currentGameState: GameState) => {
        if (isExecutingTurn.current) {
            debug.log('ExecuteTurn', 'Already executing a turn, skipping...');
            return;
        }

        if (!currentGameState || currentGameState.status !== 'active') {
            debug.log('ExecuteTurn', 'Game not active', { status: currentGameState?.status });
            return;
        }

        isExecutingTurn.current = true;
        debug.log('ExecuteTurn', `Starting turn ${currentGameState.turns.length + 1}`, {
            currentPlayer: currentGameState.currentPlayer,
            p1Pos: currentGameState.player1.position,
            p2Pos: currentGameState.player2.position
        });

        const currentPlayer = currentGameState.currentPlayer === 1 ? currentGameState.player1 : currentGameState.player2;
        const opponent = currentGameState.currentPlayer === 1 ? currentGameState.player2 : currentGameState.player1;

        setIsRolling(true);
        debug.log('Dice', 'Starting dice roll animation...');

        try {
            debug.log('GameEngine', 'Executing turn...');
            const turnResult = executeTurn(currentGameState);

            debug.success('Dice', `Rolled: ${turnResult.turn.diceRoll}`, {
                from: turnResult.turn.fromPos,
                to: turnResult.turn.toPos,
                final: turnResult.turn.finalPos,
                event: turnResult.turn.event?.type || 'none'
            });

            setCurrentDiceValue(turnResult.turn.diceRoll);

            const gameContext: GameContext = {
                playerName: currentPlayer.name,
                playerNumber: currentGameState.currentPlayer,
                opponentName: opponent.name,
                opponentModel: opponent.model,
                currentPosition: currentPlayer.position,
                opponentPosition: opponent.position,
                turnNumber: currentGameState.turns.length + 1,
                lastTurnEvent: currentGameState.turns.length > 0 ? {
                    playerNumber: currentGameState.turns[currentGameState.turns.length - 1].playerNum as 1 | 2,
                    diceRoll: currentGameState.turns[currentGameState.turns.length - 1].diceRoll,
                    event: currentGameState.turns[currentGameState.turns.length - 1].event?.type || null,
                    fromPos: currentGameState.turns[currentGameState.turns.length - 1].fromPos,
                    toPos: currentGameState.turns[currentGameState.turns.length - 1].finalPos,
                } : null,
                gameHistory: currentGameState.turns.map(t => ({
                    playerNumber: t.playerNum as 1 | 2,
                    diceRoll: t.diceRoll,
                    fromPos: t.fromPos,
                    toPos: t.toPos,
                    event: t.event?.type || null,
                })),
            };

            const postRollContext: PostRollContext = {
                ...gameContext,
                diceRoll: turnResult.turn.diceRoll,
                newPosition: turnResult.turn.finalPos,
                event: turnResult.turn.event?.type || null,
                eventFrom: turnResult.turn.event?.from,
                eventTo: turnResult.turn.event?.to,
                isWinningMove: turnResult.isGameOver,
            };

            debug.log('AI', `Requesting commentary from ${currentPlayer.provider}/${currentPlayer.model}...`);
            let commentary = {
                preRollCommentary: 'Rolling the dice...',
                postRollCommentary: 'Interesting move!',
                trashTalk: 'Game on!',
            };

            try {
                commentary = await generateTurnCommentary(
                    currentPlayer.provider,
                    currentPlayer.apiKey,
                    currentPlayer.model,
                    gameContext,
                    postRollContext
                );
                debug.success('AI', 'Commentary generated successfully');
            } catch (aiError) {
                debug.error('AI', 'Failed to generate commentary', aiError);
            }

            const turnWithCommentary: Turn = {
                ...turnResult.turn,
                preRollCommentary: commentary.preRollCommentary,
                postRollCommentary: commentary.postRollCommentary,
                trashTalk: commentary.trashTalk,
            };

            const updatedGameState: GameState = {
                ...turnResult.gameState,
                turns: [...currentGameState.turns, turnWithCommentary],
            };

            debug.success('GameState', 'Turn completed', {
                turnNumber: updatedGameState.turns.length,
                nextPlayer: updatedGameState.currentPlayer,
                status: updatedGameState.status,
                winner: updatedGameState.winner
            });

            setGameState(updatedGameState);
            setIsRolling(false);
            isExecutingTurn.current = false;

            if (turnResult.isGameOver) {
                debug.success('Game', `🎉 GAME OVER! Player ${updatedGameState.winner} wins!`);
                setIsPlaying(false);

                try {
                    debug.log('Database', 'Saving game to database...');
                    await fetch('/api/game', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedGameState),
                    });
                    debug.success('Database', 'Game saved successfully');
                } catch (saveError) {
                    debug.error('Database', 'Failed to save game', saveError);
                }
                return null;
            }

            return updatedGameState;
        } catch (err) {
            debug.error('ExecuteTurn', 'Turn execution failed', err);
            setError('Failed to execute turn. Please check your API keys.');
            setIsRolling(false);
            setIsPlaying(false);
            isExecutingTurn.current = false;
            return null;
        }
    }, []);

    // Game loop effect
    useEffect(() => {
        let isMounted = true;

        const runLoop = async () => {
            if (!isPlaying || isPaused) {
                debug.log('GameLoop', 'Loop stopped (not playing or paused)');
                return;
            }

            const currentState = gameState;
            if (!currentState || currentState.status !== 'active') {
                debug.log('GameLoop', 'No active game state');
                return;
            }

            debug.log('GameLoop', '--- Starting new turn cycle ---');
            const newState = await executeSingleTurn(currentState);

            if (!isMounted) return;

            if (newState && newState.status === 'active') {
                debug.log('GameLoop', `Scheduling next turn in ${turnDelay}ms`);
                gameLoopRef.current = setTimeout(() => {
                    if (isMounted) {
                        setGameState(prev => prev ? { ...prev } : null);
                    }
                }, turnDelay);
            }
        };

        if (isPlaying && !isPaused && gameState?.status === 'active' && !isExecutingTurn.current) {
            runLoop();
        }

        return () => {
            isMounted = false;
            if (gameLoopRef.current) {
                clearTimeout(gameLoopRef.current);
            }
        };
    }, [isPlaying, isPaused, gameState, turnDelay, executeSingleTurn]);

    const handleStartGame = useCallback(() => {
        debug.log('UI', '🚀 Start Game button clicked');
        const newGame = startGame();
        if (newGame) {
            debug.log('GameLoop', 'Starting game loop in 1 second...');
        }
    }, [startGame]);

    const togglePause = useCallback(() => {
        const newPausedState = !isPaused;
        debug.log('UI', newPausedState ? '⏸️ Game paused' : '▶️ Game resumed');
        setIsPaused(newPausedState);
    }, [isPaused]);

    const resetGame = useCallback(() => {
        debug.log('UI', '🔄 Resetting game');
        if (gameLoopRef.current) {
            clearTimeout(gameLoopRef.current);
        }
        isExecutingTurn.current = false;
        setGameState(null);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentDiceValue(null);
        setError(null);
        debug.success('UI', 'Game reset complete');
    }, []);

    const canStartGame = player1Config?.apiKey && player2Config?.apiKey;

    return (
        <div className="min-h-screen noise">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
                <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
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
                    <div className="flex items-center gap-4">
                        <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Leaderboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        <span className="gradient-text">AI Battle</span>
                        <span className="text-foreground"> Arena</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Configure your AI fighters and watch them compete! 🤖 ⚔️ 🤖
                    </p>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="mb-8 p-4 glass rounded-2xl border border-red-500/30 text-red-400 text-center max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <span className="mr-2">⚠️</span>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Game Layout */}
                <div className="grid lg:grid-cols-[380px_1fr_380px] gap-8">
                    {/* Left Column - Player Setup or Game Status */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {!gameState ? (
                            <>
                                <PlayerSetup
                                    playerNumber={1}
                                    onConfigChange={setPlayer1Config}
                                    disabled={isPlaying}
                                />
                                <PlayerSetup
                                    playerNumber={2}
                                    onConfigChange={setPlayer2Config}
                                    disabled={isPlaying}
                                />
                            </>
                        ) : (
                            <GameStatus
                                gameState={gameState}
                                isPlaying={isPlaying && !isPaused}
                                turnDelay={turnDelay}
                                onTurnDelayChange={setTurnDelay}
                            />
                        )}

                        {/* Control Buttons */}
                        <div className="flex gap-4">
                            {!gameState ? (
                                <Button
                                    onClick={handleStartGame}
                                    disabled={!canStartGame}
                                    className="flex-1 btn-premium py-6 text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="lg"
                                >
                                    <span className="mr-2">⚔️</span>
                                    Start Battle
                                </Button>
                            ) : (
                                <>
                                    {gameState.status === 'active' && (
                                        <Button
                                            onClick={togglePause}
                                            variant="outline"
                                            className="flex-1 py-6 text-lg rounded-2xl glass border-white/10 hover:bg-white/5"
                                            size="lg"
                                        >
                                            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                                        </Button>
                                    )}
                                    <Button
                                        onClick={resetGame}
                                        variant="outline"
                                        className="flex-1 py-6 text-lg rounded-2xl glass border-white/10 hover:bg-white/5"
                                        size="lg"
                                    >
                                        🔄 New Game
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Center Column - Game Board */}
                    <motion.div
                        className="flex flex-col items-center justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Board
                            player1Position={gameState?.player1.position || 0}
                            player2Position={gameState?.player2.position || 0}
                        />

                        {/* Dice Display */}
                        <AnimatePresence>
                            {gameState && (
                                <motion.div
                                    className="mt-8"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Dice
                                        value={currentDiceValue}
                                        isRolling={isRolling}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right Column - Commentary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Commentary
                            turns={gameState?.turns || []}
                            player1Name={gameState?.player1.name || 'Player 1'}
                            player2Name={gameState?.player2.name || 'Player 2'}
                            player1Provider={gameState?.player1.provider || 'openai'}
                            player2Provider={gameState?.player2.provider || 'anthropic'}
                        />
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    className="text-center mt-16 text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>🔒 API keys are stored locally in your browser and never sent to our servers.</p>
                </motion.div>
            </main>
        </div>
    );
}
