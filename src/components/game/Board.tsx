'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BOARD_CONFIG } from '@/lib/game/board';
import { cn } from '@/lib/utils';

interface BoardProps {
    player1Position: number;
    player2Position: number;
    highlightedSquare?: number;
    lastMove?: {
        player: 1 | 2;
        from: number;
        to: number;
    };
}

// Get grid position for a square number (standard snake pattern)
function getGridPosition(squareNum: number): { row: number; col: number } {
    const row = Math.floor((squareNum - 1) / 10);
    const col = row % 2 === 0 ? (squareNum - 1) % 10 : 9 - ((squareNum - 1) % 10);
    return { row: 9 - row, col };
}

// Get center position of a square in pixels
function getSquareCenter(squareNum: number, squareSize: number): { x: number; y: number } {
    const { row, col } = getGridPosition(squareNum);
    return {
        x: col * squareSize + squareSize / 2,
        y: row * squareSize + squareSize / 2,
    };
}

const LADDER_POSITIONS: Array<{ from: number; to: number }> = [
    { from: 2, to: 38 },
    { from: 7, to: 14 },
    { from: 8, to: 31 },
    { from: 15, to: 26 },
    { from: 21, to: 42 },
    { from: 28, to: 84 },
    { from: 36, to: 44 },
    { from: 51, to: 67 },
    { from: 71, to: 91 },
    { from: 78, to: 98 },
    { from: 87, to: 94 },
];

export default function Board({
    player1Position,
    player2Position,
    highlightedSquare,
}: BoardProps) {
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const squareSize = 48;
    const boardSize = squareSize * 10;

    // Generate squares in the correct order
    const squares = [];
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const invertedRow = 9 - row;
            const actualCol = invertedRow % 2 === 0 ? col : 9 - col;
            const squareNum = invertedRow * 10 + actualCol + 1;
            squares.push({
                num: squareNum,
                row,
                col,
                isEven: (row + col) % 2 === 0,
            });
        }
    }

    const isSnakeHead = (num: number) => num in BOARD_CONFIG.snakes;
    const isLadderBottom = (num: number) => num in BOARD_CONFIG.ladders;

    return (
        <div className="relative flex flex-col items-center">
            {/* Board Container with Glow */}
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/20 blur-2xl scale-110" />

                <div
                    className="relative glass rounded-3xl p-3 border border-white/10"
                    style={{ width: boardSize + 24, height: boardSize + 24 }}
                >
                    {/* Inner Board */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl"
                        style={{ width: boardSize, height: boardSize }}
                    >
                        {/* Classic gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500" />

                        {/* Grid Squares */}
                        <div
                            className="grid absolute inset-0"
                            style={{
                                gridTemplateColumns: `repeat(10, ${squareSize}px)`,
                                gridTemplateRows: `repeat(10, ${squareSize}px)`,
                            }}
                        >
                            {squares.map(({ num, row, col, isEven }) => {
                                const hasPlayer1 = player1Position === num;
                                const hasPlayer2 = player2Position === num;
                                const isHighlighted = highlightedSquare === num;
                                const isHovered = hoveredSquare === num;
                                const isWinSquare = num === 100;
                                const isStartSquare = num === 1;

                                return (
                                    <motion.div
                                        key={num}
                                        className={cn(
                                            "relative flex items-end justify-start p-1 cursor-pointer transition-all duration-200",
                                            isEven ? 'bg-amber-300/80' : 'bg-amber-400/80',
                                            isWinSquare && 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
                                            isStartSquare && 'bg-gradient-to-br from-emerald-300 to-emerald-400',
                                            isHighlighted && 'ring-2 ring-violet-500 ring-inset',
                                            isHovered && 'brightness-110 z-20'
                                        )}
                                        style={{ width: squareSize, height: squareSize }}
                                        onMouseEnter={() => setHoveredSquare(num)}
                                        onMouseLeave={() => setHoveredSquare(null)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: num * 0.002 }}
                                    >
                                        {/* Square Number */}
                                        <span className={cn(
                                            "font-bold text-xs select-none",
                                            isWinSquare ? "text-amber-900" : "text-amber-800/70"
                                        )}>
                                            {num}
                                        </span>

                                        {/* Win indicator */}
                                        {isWinSquare && (
                                            <div className="absolute top-1 right-1 text-sm">🎉</div>
                                        )}

                                        {/* Start indicator */}
                                        {isStartSquare && (
                                            <div className="absolute top-1 right-1 text-sm">🚀</div>
                                        )}

                                        {/* Player Tokens */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
                                            {hasPlayer1 && (
                                                <motion.div
                                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500 }}
                                                    style={{ boxShadow: '0 4px 15px rgba(16, 185, 129, 0.5)' }}
                                                >
                                                    1
                                                </motion.div>
                                            )}
                                            {hasPlayer2 && (
                                                <motion.div
                                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500 }}
                                                    style={{ boxShadow: '0 4px 15px rgba(245, 158, 11, 0.5)' }}
                                                >
                                                    2
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* SVG Overlay for Snakes and Ladders */}
                        <svg
                            className="absolute inset-0 pointer-events-none"
                            width={boardSize}
                            height={boardSize}
                            style={{ overflow: 'visible' }}
                        >
                            {/* Ladders */}
                            {LADDER_POSITIONS.map(({ from, to }) => {
                                const startPos = getSquareCenter(from, squareSize);
                                const endPos = getSquareCenter(to, squareSize);
                                const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
                                const length = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
                                const rungCount = Math.floor(length / 18);

                                return (
                                    <g key={`ladder-${from}-${to}`}>
                                        {/* Ladder rails */}
                                        <line
                                            x1={startPos.x - 6 * Math.cos(angle + Math.PI / 2)}
                                            y1={startPos.y - 6 * Math.sin(angle + Math.PI / 2)}
                                            x2={endPos.x - 6 * Math.cos(angle + Math.PI / 2)}
                                            y2={endPos.y - 6 * Math.sin(angle + Math.PI / 2)}
                                            stroke="#0ea5e9"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                        <line
                                            x1={startPos.x + 6 * Math.cos(angle + Math.PI / 2)}
                                            y1={startPos.y + 6 * Math.sin(angle + Math.PI / 2)}
                                            x2={endPos.x + 6 * Math.cos(angle + Math.PI / 2)}
                                            y2={endPos.y + 6 * Math.sin(angle + Math.PI / 2)}
                                            stroke="#0ea5e9"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                        {/* Rungs */}
                                        {Array.from({ length: rungCount }).map((_, i) => {
                                            const t = (i + 1) / (rungCount + 1);
                                            const rungX = startPos.x + t * (endPos.x - startPos.x);
                                            const rungY = startPos.y + t * (endPos.y - startPos.y);
                                            return (
                                                <line
                                                    key={i}
                                                    x1={rungX - 6 * Math.cos(angle + Math.PI / 2)}
                                                    y1={rungY - 6 * Math.sin(angle + Math.PI / 2)}
                                                    x2={rungX + 6 * Math.cos(angle + Math.PI / 2)}
                                                    y2={rungY + 6 * Math.sin(angle + Math.PI / 2)}
                                                    stroke="#0ea5e9"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                    </g>
                                );
                            })}

                            {/* Snakes */}
                            {Object.entries(BOARD_CONFIG.snakes).map(([head, tail]) => {
                                const startPos = getSquareCenter(Number(head), squareSize);
                                const endPos = getSquareCenter(Number(tail), squareSize);
                                const midY = (startPos.y + endPos.y) / 2;
                                const offsetX = ((Number(head) % 5) - 2) * 15;

                                return (
                                    <g key={`snake-${head}-${tail}`}>
                                        {/* Snake body */}
                                        <path
                                            d={`M ${startPos.x} ${startPos.y} 
                                                Q ${startPos.x + offsetX} ${startPos.y + 25}, ${(startPos.x + endPos.x) / 2 + offsetX} ${midY}
                                                Q ${endPos.x - offsetX} ${endPos.y - 25}, ${endPos.x} ${endPos.y}`}
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            opacity="0.9"
                                        />
                                        {/* Snake pattern */}
                                        <path
                                            d={`M ${startPos.x} ${startPos.y} 
                                                Q ${startPos.x + offsetX} ${startPos.y + 25}, ${(startPos.x + endPos.x) / 2 + offsetX} ${midY}
                                                Q ${endPos.x - offsetX} ${endPos.y - 25}, ${endPos.x} ${endPos.y}`}
                                            fill="none"
                                            stroke="#15803d"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeDasharray="2 12"
                                            opacity="0.6"
                                        />
                                        {/* Snake head */}
                                        <circle cx={startPos.x} cy={startPos.y} r="7" fill="#22c55e" />
                                        <circle cx={startPos.x - 2.5} cy={startPos.y - 1.5} r="1.5" fill="white" />
                                        <circle cx={startPos.x + 2.5} cy={startPos.y - 1.5} r="1.5" fill="white" />
                                        <circle cx={startPos.x - 2.5} cy={startPos.y - 1.5} r="0.8" fill="black" />
                                        <circle cx={startPos.x + 2.5} cy={startPos.y - 1.5} r="0.8" fill="black" />
                                        {/* Snake tail */}
                                        <circle cx={endPos.x} cy={endPos.y} r="3" fill="#22c55e" />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 px-6 py-3 glass rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-2.5 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">Snake ↓</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-5 bg-sky-500 rounded-sm" />
                    <span className="text-muted-foreground">Ladder ↑</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">1</div>
                    <span className="text-muted-foreground">P1</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">2</div>
                    <span className="text-muted-foreground">P2</span>
                </div>
            </div>

            {/* Hover tooltip */}
            {hoveredSquare && (
                <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full p-3 glass rounded-xl text-sm border border-white/10 z-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="font-bold mb-1">Square {hoveredSquare}</div>
                    {hoveredSquare in BOARD_CONFIG.snakes && (
                        <div className="text-red-400 flex items-center gap-1">
                            🐍 Slides to {BOARD_CONFIG.snakes[hoveredSquare]}
                        </div>
                    )}
                    {hoveredSquare in BOARD_CONFIG.ladders && (
                        <div className="text-green-400 flex items-center gap-1">
                            🪜 Climbs to {BOARD_CONFIG.ladders[hoveredSquare]}
                        </div>
                    )}
                    {player1Position === hoveredSquare && (
                        <div className="text-emerald-400">Player 1 is here</div>
                    )}
                    {player2Position === hoveredSquare && (
                        <div className="text-amber-400">Player 2 is here</div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
