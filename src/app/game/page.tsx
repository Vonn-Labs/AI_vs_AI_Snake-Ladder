'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
            // Execute the turn first to get dice result
            debug.log('GameEngine', 'Executing turn...');
            const turnResult = executeTurn(currentGameState);

            debug.success('Dice', `Rolled: ${turnResult.turn.diceRoll}`, {
                from: turnResult.turn.fromPos,
                to: turnResult.turn.toPos,
                final: turnResult.turn.finalPos,
                event: turnResult.turn.event?.type || 'none'
            });

            setCurrentDiceValue(turnResult.turn.diceRoll);

            // Build contexts for AI commentary
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

            // Generate AI commentary
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

            // Update turn with commentary
            const turnWithCommentary: Turn = {
                ...turnResult.turn,
                preRollCommentary: commentary.preRollCommentary,
                postRollCommentary: commentary.postRollCommentary,
                trashTalk: commentary.trashTalk,
            };

            // Update game state with the new turn
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

            // Check if game is over
            if (turnResult.isGameOver) {
                debug.success('Game', `🎉 GAME OVER! Player ${updatedGameState.winner} wins!`);
                setIsPlaying(false);

                // Save to database
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

    // Game loop effect - runs when isPlaying changes
    useEffect(() => {
        let isMounted = true;

        const runLoop = async () => {
            if (!isPlaying || isPaused) {
                debug.log('GameLoop', 'Loop stopped (not playing or paused)');
                return;
            }

            // Get the current game state from the state
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
                        // Force re-run the effect by triggering a state update
                        setGameState(prev => prev ? { ...prev } : null);
                    }
                }, turnDelay);
            }
        };

        // Only run if we have an active game
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

    // Handle start game button
    const handleStartGame = useCallback(() => {
        debug.log('UI', '🚀 Start Game button clicked');
        const newGame = startGame();
        if (newGame) {
            debug.log('GameLoop', 'Starting game loop in 1 second...');
        }
    }, [startGame]);

    // Toggle pause
    const togglePause = useCallback(() => {
        const newPausedState = !isPaused;
        debug.log('UI', newPausedState ? '⏸️ Game paused' : '▶️ Game resumed');
        setIsPaused(newPausedState);
    }, [isPaused]);

    // Reset game
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
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">AI vs AI</span>
                        <span className="text-foreground"> Snake & Ladder</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Watch AI language models battle it out! 🤖 vs 🤖
                    </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                {/* Main Content - Wider gaps and proper column sizing */}
                <div className="grid lg:grid-cols-[320px_1fr_320px] gap-8 xl:gap-12">
                    {/* Left Column - Player Setup or Game Status */}
                    <div className="space-y-6">
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
                                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                                    size="lg"
                                >
                                    🎮 Start Game
                                </Button>
                            ) : (
                                <>
                                    {gameState.status === 'active' && (
                                        <Button
                                            onClick={togglePause}
                                            variant="outline"
                                            className="flex-1"
                                            size="lg"
                                        >
                                            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                                        </Button>
                                    )}
                                    <Button
                                        onClick={resetGame}
                                        variant="outline"
                                        className="flex-1"
                                        size="lg"
                                    >
                                        🔄 New Game
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Center Column - Game Board */}
                    <div className="lg:col-span-1 flex flex-col items-center">
                        <Board
                            player1Position={gameState?.player1.position || 0}
                            player2Position={gameState?.player2.position || 0}
                        />

                        {/* Dice Display */}
                        {gameState && (
                            <div className="flex justify-center mt-6">
                                <Dice
                                    value={currentDiceValue}
                                    isRolling={isRolling}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Commentary */}
                    <div className="lg:col-span-1">
                        <Commentary
                            turns={gameState?.turns || []}
                            player1Name={gameState?.player1.name || 'Player 1'}
                            player2Name={gameState?.player2.name || 'Player 2'}
                            player1Provider={gameState?.player1.provider || 'openai'}
                            player2Provider={gameState?.player2.provider || 'anthropic'}
                        />
                    </div>
                </div>

                {/* Footer */}
                <motion.div
                    className="text-center mt-12 text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>🔒 API keys are stored locally in your browser and never sent to our servers.</p>
                    <p className="mt-1">
                        Made with ❤️ for AI enthusiasts
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
