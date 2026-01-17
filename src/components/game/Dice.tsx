'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
    onRollComplete?: () => void;
}

const diceFaces: Record<number, React.ReactNode> = {
    1: (
        <div className="grid place-items-center h-full">
            <div className="w-4 h-4 bg-violet-600 rounded-full shadow-lg" />
        </div>
    ),
    2: (
        <div className="grid grid-cols-2 p-3 h-full">
            <div className="w-3 h-3 bg-violet-600 rounded-full self-start justify-self-start shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full self-end justify-self-end col-start-2 shadow-lg" />
        </div>
    ),
    3: (
        <div className="relative h-full p-3">
            <div className="absolute top-3 left-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
        </div>
    ),
    4: (
        <div className="grid grid-cols-2 gap-2 p-3 h-full">
            <div className="w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full justify-self-end shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full self-end shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full self-end justify-self-end shadow-lg" />
        </div>
    ),
    5: (
        <div className="relative h-full p-3">
            <div className="absolute top-3 left-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute top-3 right-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute bottom-3 left-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
        </div>
    ),
    6: (
        <div className="grid grid-cols-2 gap-1 p-3 h-full">
            <div className="w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full justify-self-end shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full justify-self-end shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full shadow-lg" />
            <div className="w-3 h-3 bg-violet-600 rounded-full justify-self-end shadow-lg" />
        </div>
    ),
};

export default function Dice({ value, isRolling, onRollComplete }: DiceProps) {
    const [displayValue, setDisplayValue] = useState<number>(1);

    useEffect(() => {
        if (isRolling) {
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * 6) + 1);
            }, 80);

            const timeout = setTimeout(() => {
                clearInterval(interval);
                if (value) {
                    setDisplayValue(value);
                }
                onRollComplete?.();
            }, 600);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else if (value) {
            setDisplayValue(value);
        }
    }, [isRolling, value, onRollComplete]);

    return (
        <div className="flex flex-col items-center gap-4">
            <motion.div
                className="relative"
                animate={isRolling ? {
                    rotate: [0, 360, 720],
                    scale: [1, 1.15, 1]
                } : { rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${isRolling
                        ? 'bg-violet-500/40 blur-2xl scale-150'
                        : 'bg-violet-500/20 blur-xl scale-125'
                    }`} />

                {/* Dice */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl border border-white/50 overflow-hidden">
                    {/* Inner shadow */}
                    <div className="absolute inset-0.5 rounded-xl bg-white/80" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayValue}
                            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                            transition={{ duration: 0.1 }}
                            className="relative w-full h-full"
                        >
                            {diceFaces[displayValue]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Result Display */}
            <AnimatePresence>
                {value && !isRolling && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/10"
                    >
                        <span className="text-sm text-muted-foreground">Rolled</span>
                        <span className="text-xl font-bold gradient-text">{value}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
