'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AVAILABLE_MODELS, PROVIDER_INFO } from '@/lib/ai/providers/base';
import { AIProvider } from '@/lib/game/types';

interface PlayerSetupProps {
    playerNumber: 1 | 2;
    onConfigChange: (config: {
        provider: AIProvider;
        model: string;
        name: string;
        apiKey: string;
    }) => void;
    disabled?: boolean;
}

const providers: AIProvider[] = ['openai', 'anthropic', 'gemini', 'openrouter', 'groq', 'grok'];

export default function PlayerSetup({ playerNumber, onConfigChange, disabled }: PlayerSetupProps) {
    const [provider, setProvider] = useState<AIProvider>('openai');
    const [model, setModel] = useState<string>('');
    const [name, setName] = useState<string>(`AI Player ${playerNumber}`);
    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem(`ai-snakeladder-${provider}-key`);
            if (savedKey) setApiKey(savedKey);
        }
    }, [provider]);

    useEffect(() => {
        const models = AVAILABLE_MODELS[provider];
        if (models.length > 0) {
            setModel(models[0].id);
        }
    }, [provider]);

    useEffect(() => {
        if (apiKey && typeof window !== 'undefined') {
            localStorage.setItem(`ai-snakeladder-${provider}-key`, apiKey);
        }
        onConfigChange({ provider, model, name, apiKey });
    }, [provider, model, name, apiKey, onConfigChange]);

    const playerGradient = playerNumber === 1
        ? 'from-emerald-500 to-teal-600'
        : 'from-amber-500 to-orange-600';
    const playerGlow = playerNumber === 1
        ? 'shadow-emerald-500/20'
        : 'shadow-amber-500/20';

    return (
        <motion.div
            className="glass rounded-3xl p-6 border border-white/5 card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${playerGradient} flex items-center justify-center text-white font-bold text-xl shadow-lg ${playerGlow}`}>
                    {playerNumber}
                </div>
                <div>
                    <h3 className="font-bold text-lg">Player {playerNumber}</h3>
                    <p className="text-sm text-muted-foreground">Configure AI fighter</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Display Name */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Display Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={disabled}
                        placeholder="Enter player name"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-muted-foreground/50"
                    />
                </div>

                {/* AI Provider Selection */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">AI Provider</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {providers.map((p) => (
                            <motion.button
                                key={p}
                                onClick={() => setProvider(p)}
                                disabled={disabled}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl text-xs font-medium transition-all border ${provider === p
                                        ? 'border-2 shadow-lg'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={provider === p ? {
                                    background: `linear-gradient(135deg, ${PROVIDER_INFO[p].color}20, ${PROVIDER_INFO[p].color}10)`,
                                    borderColor: PROVIDER_INFO[p].color,
                                    color: PROVIDER_INFO[p].color,
                                    boxShadow: `0 4px 20px -5px ${PROVIDER_INFO[p].color}40`,
                                } : {}}
                            >
                                {PROVIDER_INFO[p].name.split(' ')[0]}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Model</Label>
                    <Select value={model} onValueChange={setModel} disabled={disabled}>
                        <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10 rounded-xl">
                            {AVAILABLE_MODELS[provider].map((m) => (
                                <SelectItem key={m.id} value={m.id} className="rounded-lg">
                                    <div className="flex flex-col items-start py-1">
                                        <span className="font-medium">{m.name}</span>
                                        <span className="text-xs text-muted-foreground">{m.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">API Key</Label>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>🔐</span> Stored locally
                        </span>
                    </div>
                    <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        disabled={disabled}
                        placeholder={`Enter ${PROVIDER_INFO[provider].name} API key`}
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-muted-foreground/50"
                    />
                    {!apiKey && (
                        <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-2">
                            <span>⚠️</span> Required to play
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
