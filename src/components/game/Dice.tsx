'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface DiceProps {
    value: number | null;
    isRolling: boolean;
    onRollComplete?: () => void;
}

const diceFaces: Record<number, React.ReactNode> = {
    1: (
        <div className="grid place-items-center h-full">
            <div className="w-5 h-5 bg-gray-800 rounded-full" />
        </div>
    ),
    2: (
        <div className="grid grid-cols-2 p-3 h-full">
            <div className="w-4 h-4 bg-gray-800 rounded-full self-start justify-self-start" />
            <div className="w-4 h-4 bg-gray-800 rounded-full self-end justify-self-end col-start-2" />
        </div>
    ),
    3: (
        <div className="relative h-full p-3">
            <div className="absolute top-3 left-3 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-gray-800 rounded-full" />
        </div>
    ),
    4: (
        <div className="grid grid-cols-2 gap-2 p-3 h-full">
            <div className="w-4 h-4 bg-gray-800 rounded-full" />
            <div className="w-4 h-4 bg-gray-800 rounded-full justify-self-end" />
            <div className="w-4 h-4 bg-gray-800 rounded-full self-end" />
            <div className="w-4 h-4 bg-gray-800 rounded-full self-end justify-self-end" />
        </div>
    ),
    5: (
        <div className="relative h-full p-3">
            <div className="absolute top-3 left-3 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute top-3 right-3 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-gray-800 rounded-full" />
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-gray-800 rounded-full" />
        </div>
    ),
    6: (
        <div className="grid grid-cols-2 gap-1 p-3 h-full">
            <div className="w-4 h-4 bg-gray-800 rounded-full" />
            <div className="w-4 h-4 bg-gray-800 rounded-full justify-self-end" />
            <div className="w-4 h-4 bg-gray-800 rounded-full" />
            <div className="w-4 h-4 bg-gray-800 rounded-full justify-self-end" />
            <div className="w-4 h-4 bg-gray-800 rounded-full" />
            <div className="w-4 h-4 bg-gray-800 rounded-full justify-self-end" />
        </div>
    ),
};

export default function Dice({ value, isRolling, onRollComplete }: DiceProps) {
    const [displayValue, setDisplayValue] = useState<number>(1);

    useEffect(() => {
        if (isRolling) {
            // Animate through random values while rolling
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * 6) + 1);
            }, 80);

            // Stop after animation duration
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
                    scale: [1, 1.1, 1]
                } : { rotate: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                <Card className="w-24 h-24 bg-white shadow-xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayValue}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.1 }}
                            className="w-full h-full"
                        >
                            {diceFaces[displayValue]}
                        </motion.div>
                    </AnimatePresence>
                </Card>

                {/* Glow effect when rolling */}
                {isRolling && (
                    <div className="absolute inset-0 -z-10 rounded-lg bg-primary/30 blur-xl animate-pulse" />
                )}
            </motion.div>

            {value && !isRolling && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                >
                    Rolled: {value}
                </motion.div>
            )}
        </div>
    );
}
