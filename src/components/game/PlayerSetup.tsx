'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

    // Load saved API key on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem(`ai-snakeladder-${provider}-key`);
            if (savedKey) setApiKey(savedKey);
        }
    }, [provider]);

    // Set default model when provider changes
    useEffect(() => {
        const models = AVAILABLE_MODELS[provider];
        if (models.length > 0) {
            setModel(models[0].id);
        }
    }, [provider]);

    // Save API key and notify parent
    useEffect(() => {
        if (apiKey && typeof window !== 'undefined') {
            localStorage.setItem(`ai-snakeladder-${provider}-key`, apiKey);
        }
        onConfigChange({ provider, model, name, apiKey });
    }, [provider, model, name, apiKey, onConfigChange]);

    const playerColor = playerNumber === 1 ? 'emerald' : 'amber';
    const playerBg = playerNumber === 1 ? 'from-emerald-500/10 to-emerald-600/5' : 'from-amber-500/10 to-amber-600/5';
    const playerBorder = playerNumber === 1 ? 'border-emerald-500/30' : 'border-amber-500/30';

    return (
        <Card className={`bg-gradient-to-br ${playerBg} ${playerBorder} border backdrop-blur-sm`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${playerColor}-500 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {playerNumber}
                    </div>
                    <div>
                        <CardTitle className="text-lg">Player {playerNumber}</CardTitle>
                        <CardDescription>Configure AI opponent</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor={`name-${playerNumber}`}>Display Name</Label>
                    <Input
                        id={`name-${playerNumber}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={disabled}
                        placeholder="Enter player name"
                        className="bg-background/50"
                    />
                </div>

                {/* AI Provider Selection */}
                <div className="space-y-2">
                    <Label>AI Provider</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {providers.map((p) => (
                            <button
                                key={p}
                                onClick={() => setProvider(p)}
                                disabled={disabled}
                                className={`p-2 rounded-lg text-xs font-medium transition-all border ${provider === p
                                        ? `bg-opacity-20 border-2`
                                        : 'border-border hover:border-primary/50 bg-background/30'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={provider === p ? {
                                    backgroundColor: `${PROVIDER_INFO[p].color}20`,
                                    borderColor: PROVIDER_INFO[p].color,
                                    color: PROVIDER_INFO[p].color,
                                } : {}}
                            >
                                {PROVIDER_INFO[p].name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                    <Label>Model</Label>
                    <Select value={model} onValueChange={setModel} disabled={disabled}>
                        <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_MODELS[provider].map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    <div className="flex flex-col items-start">
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
                        <Label htmlFor={`apikey-${playerNumber}`}>API Key</Label>
                        <Badge variant="outline" className="text-xs">
                            🔒 Stored locally
                        </Badge>
                    </div>
                    <Input
                        id={`apikey-${playerNumber}`}
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        disabled={disabled}
                        placeholder={`Enter your ${PROVIDER_INFO[provider].name} API key`}
                        className="bg-background/50"
                    />
                    {!apiKey && (
                        <p className="text-xs text-amber-500 flex items-center gap-1">
                            ⚠️ API key required to play
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
