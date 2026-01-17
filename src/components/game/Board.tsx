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

// Snake and ladder visual data for SVG rendering
const SNAKE_PATHS: Array<{ from: number; to: number; path: string; headRotation: number }> = [
    { from: 99, to: 41, path: 'M 0,0 Q 20,-30 10,-80 Q 0,-130 -10,-180 Q -25,-230 -5,-280 Q 15,-330 0,-380', headRotation: -15 },
    { from: 95, to: 75, path: 'M 0,0 Q -15,-25 -5,-50 Q 10,-80 0,-110 Q -10,-140 5,-170', headRotation: 10 },
    { from: 92, to: 88, path: 'M 0,0 Q 10,-10 5,-25 Q -5,-40 0,-50', headRotation: 0 },
    { from: 89, to: 68, path: 'M 0,0 Q -20,-40 -10,-80 Q 5,-120 -5,-160 Q -15,-180 0,-200', headRotation: -10 },
    { from: 74, to: 53, path: 'M 0,0 Q 15,-40 5,-80 Q -10,-120 0,-160 Q 10,-180 5,-200', headRotation: 5 },
    { from: 64, to: 60, path: 'M 0,0 Q -8,-15 -3,-30 Q 5,-45 0,-55', headRotation: -5 },
    { from: 62, to: 19, path: 'M 0,0 Q 25,-80 10,-160 Q -15,-240 5,-320 Q 20,-400 0,-430', headRotation: 0 },
    { from: 49, to: 11, path: 'M 0,0 Q -20,-60 -5,-120 Q 15,-180 0,-240 Q -15,-300 5,-380', headRotation: 5 },
    { from: 46, to: 25, path: 'M 0,0 Q 15,-40 5,-80 Q -10,-120 0,-160 Q 10,-200 0,-210', headRotation: -5 },
    { from: 16, to: 6, path: 'M 0,0 Q -10,-20 -5,-50 Q 5,-80 0,-100', headRotation: 0 },
];

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

// Get grid position for a square number (standard snake pattern)
function getGridPosition(squareNum: number): { row: number; col: number } {
    const row = Math.floor((squareNum - 1) / 10);
    const col = row % 2 === 0 ? (squareNum - 1) % 10 : 9 - ((squareNum - 1) % 10);
    return { row: 9 - row, col }; // Invert row for display (1 at bottom)
}

// Get center position of a square in pixels
function getSquareCenter(squareNum: number, squareSize: number): { x: number; y: number } {
    const { row, col } = getGridPosition(squareNum);
    return {
        x: col * squareSize + squareSize / 2,
        y: row * squareSize + squareSize / 2,
    };
}

export default function Board({
    player1Position,
    player2Position,
    highlightedSquare,
}: BoardProps) {
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const squareSize = 50; // Size of each square in pixels (reduced to prevent overlap)
    const boardSize = squareSize * 10;

    // Generate squares in the correct order
    const squares = [];
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            // Alternate direction for each row (snake pattern)
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
            {/* Board Container with Border */}
            <div
                className="relative rounded-xl shadow-2xl overflow-hidden"
                style={{
                    width: boardSize + 16,
                    height: boardSize + 16,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #f59e0b 100%)',
                    padding: 8,
                }}
            >
                {/* Inner Board */}
                <div
                    className="relative rounded-lg overflow-hidden"
                    style={{ width: boardSize, height: boardSize }}
                >
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
                                        isEven ? 'bg-yellow-400' : 'bg-yellow-300',
                                        isWinSquare && 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
                                        isStartSquare && 'bg-gradient-to-br from-yellow-200 to-yellow-400',
                                        isHighlighted && 'ring-4 ring-purple-500 ring-inset',
                                        isHovered && 'brightness-110 scale-105 z-20'
                                    )}
                                    style={{ width: squareSize, height: squareSize }}
                                    onMouseEnter={() => setHoveredSquare(num)}
                                    onMouseLeave={() => setHoveredSquare(null)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: num * 0.003 }}
                                >
                                    {/* Square Number */}
                                    <span className={cn(
                                        "font-bold text-sm select-none",
                                        isWinSquare ? "text-amber-900" : "text-gray-700"
                                    )}>
                                        {num}
                                    </span>

                                    {/* Win indicator */}
                                    {isWinSquare && (
                                        <div className="absolute top-1 right-1 text-lg">🎉</div>
                                    )}

                                    {/* Player Tokens */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                                        {hasPlayer1 && (
                                            <motion.div
                                                className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500 }}
                                                style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)' }}
                                            >
                                                1
                                            </motion.div>
                                        )}
                                        {hasPlayer2 && (
                                            <motion.div
                                                className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 500 }}
                                                style={{ boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)' }}
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
                            const rungCount = Math.floor(length / 20);

                            return (
                                <g key={`ladder-${from}-${to}`}>
                                    {/* Ladder rails */}
                                    <line
                                        x1={startPos.x - 8 * Math.cos(angle + Math.PI / 2)}
                                        y1={startPos.y - 8 * Math.sin(angle + Math.PI / 2)}
                                        x2={endPos.x - 8 * Math.cos(angle + Math.PI / 2)}
                                        y2={endPos.y - 8 * Math.sin(angle + Math.PI / 2)}
                                        stroke="#38bdf8"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                    <line
                                        x1={startPos.x + 8 * Math.cos(angle + Math.PI / 2)}
                                        y1={startPos.y + 8 * Math.sin(angle + Math.PI / 2)}
                                        x2={endPos.x + 8 * Math.cos(angle + Math.PI / 2)}
                                        y2={endPos.y + 8 * Math.sin(angle + Math.PI / 2)}
                                        stroke="#38bdf8"
                                        strokeWidth="4"
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
                                                x1={rungX - 8 * Math.cos(angle + Math.PI / 2)}
                                                y1={rungY - 8 * Math.sin(angle + Math.PI / 2)}
                                                x2={rungX + 8 * Math.cos(angle + Math.PI / 2)}
                                                y2={rungY + 8 * Math.sin(angle + Math.PI / 2)}
                                                stroke="#38bdf8"
                                                strokeWidth="3"
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

                            // Calculate control points for smooth curve
                            const midY = (startPos.y + endPos.y) / 2;
                            const offsetX = (Math.random() - 0.5) * 40;

                            return (
                                <g key={`snake-${head}-${tail}`}>
                                    {/* Snake body */}
                                    <path
                                        d={`M ${startPos.x} ${startPos.y} 
                        Q ${startPos.x + offsetX} ${startPos.y + 30}, ${(startPos.x + endPos.x) / 2 + offsetX} ${midY}
                        Q ${endPos.x - offsetX} ${endPos.y - 30}, ${endPos.x} ${endPos.y}`}
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        opacity="0.9"
                                    />
                                    {/* Snake pattern */}
                                    <path
                                        d={`M ${startPos.x} ${startPos.y} 
                        Q ${startPos.x + offsetX} ${startPos.y + 30}, ${(startPos.x + endPos.x) / 2 + offsetX} ${midY}
                        Q ${endPos.x - offsetX} ${endPos.y - 30}, ${endPos.x} ${endPos.y}`}
                                        fill="none"
                                        stroke="#166534"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray="2 15"
                                        opacity="0.6"
                                    />
                                    {/* Snake head */}
                                    <circle cx={startPos.x} cy={startPos.y} r="8" fill="#22c55e" />
                                    <circle cx={startPos.x - 3} cy={startPos.y - 2} r="1.5" fill="white" />
                                    <circle cx={startPos.x + 3} cy={startPos.y - 2} r="1.5" fill="white" />
                                    <circle cx={startPos.x - 3} cy={startPos.y - 2} r="0.8" fill="black" />
                                    <circle cx={startPos.x + 3} cy={startPos.y - 2} r="0.8" fill="black" />
                                    {/* Snake tail */}
                                    <circle cx={endPos.x} cy={endPos.y} r="3" fill="#22c55e" />
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-6 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Snake (Down)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-6 bg-sky-400 rounded-sm"></div>
                    <span className="text-gray-300">Ladder (Up)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-gray-300">Player 1</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-gray-300">Player 2</span>
                </div>
            </div>

            {/* Hover tooltip */}
            {hoveredSquare && (
                <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full p-3 bg-gray-900/95 backdrop-blur-sm rounded-lg text-sm shadow-xl border border-gray-700 z-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="font-bold text-white mb-1">Square {hoveredSquare}</div>
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
