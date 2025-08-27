export const BOARD_CONFIG = {
  // Board dimensions
  VIEWPORT_SIZE: 400,
  BOARD_SIZE: 360,
  CENTER_SIZE: 120,

  // Track configuration
  TOTAL_SPACES: 56,
  SPACES_PER_SIDE: 14,
  TRACK_WIDTH: 32,
  SPACE_SIZE: 24,

  // Areas
  HOME_SPACES: 4,
  FINISH_SPACES: 4,

  // Special spaces
  DOUBLE_TROUBLE_POSITIONS: [7, 21, 35, 49], // Every 14th space (roughly)
  WARP_POSITIONS: [
    { from: 14, to: 42 }, // Top-right to bottom-left
    { from: 28, to: 0 },  // Bottom-right to top-left
  ],
} as const;

export const BOARD_COLORS = {
  background: '#F1F2F6',
  track: '#FFFFFF',
  trackBorder: '#E0E0E0',
  specialSpace: '#FFD93D',
  warpSpace: '#6C5CE7',
  homeArea: '#F5F5F5',
  finishArea: '#E8F5E8',
} as const;

export const BOARD_POSITIONS = {
  // Player starting positions (where they enter the main track)
  playerStarts: [0, 28], // Player 1 starts at 0, Player 2 starts at 28

  // HOME area positions (relative to board center)
  homeAreas: {
    player1: { x: -180, y: -180 }, // Top-left
    player2: { x: 180, y: 180 },   // Bottom-right
  },

  // FINISH area positions
  finishAreas: {
    player1: { x: -60, y: -60 }, // Near center, top-left
    player2: { x: 60, y: 60 },   // Near center, bottom-right
  },
} as const;
