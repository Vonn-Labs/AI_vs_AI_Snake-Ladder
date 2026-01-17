// Game Types
export interface Position {
  square: number;
  row: number;
  col: number;
}

export interface SnakeLadderEvent {
  type: 'snake' | 'ladder';
  from: number;
  to: number;
}

export interface Player {
  number: 1 | 2;
  provider: AIProvider;
  model: string;
  name: string;
  position: number;
  apiKey: string;
}

export interface Turn {
  id: string;
  turnNumber: number;
  playerNum: 1 | 2;
  provider: string;
  model: string;
  diceRoll: number;
  fromPos: number;
  toPos: number;
  finalPos: number;
  event: SnakeLadderEvent | null;
  preRollCommentary: string | null;
  postRollCommentary: string | null;
  trashTalk: string | null;
  timestamp: Date;
}

export interface GameState {
  id: string;
  status: 'pending' | 'active' | 'completed';
  player1: Player;
  player2: Player;
  currentPlayer: 1 | 2;
  turns: Turn[];
  winner: 1 | 2 | null;
  createdAt: Date;
  updatedAt: Date;
}

// AI Provider Types
export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'openrouter' 
  | 'groq' 
  | 'grok';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface AIResponse {
  preRollCommentary: string;
  postRollCommentary: string;
  trashTalk: string;
}

// Board Types
export interface BoardConfig {
  size: number;
  snakes: Record<number, number>;
  ladders: Record<number, number>;
}

// API Types
export interface CreateGameRequest {
  player1: {
    provider: AIProvider;
    model: string;
    name: string;
  };
  player2: {
    provider: AIProvider;
    model: string;
    name: string;
  };
}

export interface ExecuteTurnRequest {
  gameId: string;
  apiKeys: {
    player1?: string;
    player2?: string;
  };
}

export interface GameEvent {
  type: 'turn_start' | 'dice_roll' | 'move' | 'snake' | 'ladder' | 'win' | 'commentary' | 'trash_talk';
  data: unknown;
  timestamp: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  provider: string;
  model: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
}

// WebSocket Event Types
export interface GameUpdateEvent {
  gameId: string;
  type: 'state_update' | 'turn_complete' | 'game_over';
  state: GameState;
  latestTurn?: Turn;
}
