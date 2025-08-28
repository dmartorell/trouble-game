export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  PEGS_PER_PLAYER: 4,
  BOARD_SPACES: 56,
  FINISH_SPACES: 4,
  HOME_SPACES: 4,
} as const;

export const PLAYER_COLORS = {
  red: '#FF4757',
  blue: '#3742FA',
  yellow: '#FFA502',
  green: '#2ED573',
} as const;

export const THEME_COLORS = {
  primary: '#FF4757',
  secondary: '#FFA502',
  background: '#16213e',
  surface: '#1a1a2e',
  text: '#FFFFFF',
  textSecondary: '#999',
  border: '#333',
} as const;

export const ANIMATION_DURATION = {
  fast: 200,
  medium: 400,
  slow: 600,
  verySlow: 1000,
  dieRoll: 1500,
} as const;
