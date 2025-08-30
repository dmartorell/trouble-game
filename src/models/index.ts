export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export type GameState = 'setup' | 'playing' | 'paused' | 'finished';

export type SpaceType = 'normal' | 'start' | 'home' | 'finish' | 'double-trouble' | 'warp';

export interface MoveValidationResult {
  isValid: boolean;
  reason?: string;
  newPosition?: number;
  capturedPegId?: string;
  entersFinish?: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isActive: boolean;
  isAI?: boolean;
}

export interface Peg {
  id: string;
  playerId: string;
  position: number;
  isInHome: boolean;
  isInFinish: boolean;
  finishPosition?: number;
  // Animation properties
  isAnimating?: boolean;
  targetPosition?: number;
  animationCallback?: () => void;
}

export interface Space {
  id: number;
  type: SpaceType;
  x: number;
  y: number;
  warpPairId?: number;
}

export interface SpacePosition {
  x: number;
  y: number;
  index: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean;
  turnTimeout: number; // in seconds
}

export interface DieRollResult {
  value: number;
  timestamp: number;
}

export interface Turn {
  playerId: string;
  dieRoll: DieRollResult | null;
  movesAvailable: number;
  extraTurnsRemaining: number;
  selectedPegId?: string | null;
  rollsThisTurn: number;
  hasMovedSinceRoll: boolean;
  startTime: number;
  timeoutWarning?: boolean;
}

export interface DieState {
  lastRoll: number | null;
  consecutiveRepeats: number;
  isRolling: boolean;
  rollCallbacks: DieRollCallback[];
}

export type DieRollCallback = (result: number) => void;

// Store Interfaces
export interface GameStore {
  // Game State
  gameState: GameState;
  players: Player[];
  pegs: Peg[];
  currentTurn: Turn | null;
  winner: string | null;
  dieState: DieState;
  turnTimer: ReturnType<typeof setTimeout> | null;
  warningTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  initializeGame: (selectedPlayers: Player[]) => void;
  setGameState: (state: GameState) => void;
  setCurrentTurn: (turn: Turn) => void;
  rollDie: () => Promise<number>;
  setDieRolling: (isRolling: boolean) => void;
  registerDieCallback: (callback: DieRollCallback) => () => void;
  movePeg: (pegId: string, newPosition: number) => void;
  animatePegMove: (pegId: string, targetPosition: number) => Promise<void>;
  selectPeg: (pegId: string | null) => void;
  endTurn: () => void;
  checkTurnEnd: () => boolean;
  executePegMove: (pegId: string, targetPosition: number) => Promise<boolean>;
  resetGame: () => void;
  startTurnTimer: () => void;
  clearTurnTimer: () => void;
  resetTurnTimer: () => void;
  handleTurnTimeout: () => void;

  // Getters
  getActivePlayers: () => Player[];
  getCurrentPlayer: () => Player | null;
  getPlayerPegs: (playerId: string) => Peg[];
  getSelectablePegs: (playerId: string, dieRoll: number) => Peg[];
  isValidMove: (pegId: string, dieRoll: number) => boolean;
  getMoveValidation: (pegId: string, dieRoll: number) => MoveValidationResult;
  hasValidMoves: (playerId: string, dieRoll: number) => boolean;
  getRemainingTurnTime: () => number;
  shouldShowTimeoutWarning: () => boolean;
}

export interface TurnTimerProps {
  visible: boolean;
}

export interface SettingsStore {
  // Settings State
  settings: GameSettings;

  // Actions
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleDarkMode: () => void;
  resetSettings: () => void;
}
