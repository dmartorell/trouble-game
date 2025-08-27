export const BOARD_CONFIG = {
  // Board dimensions
  VIEWPORT_SIZE: 400,
  BOARD_SIZE: 360,
  CENTER_SIZE: 120,

  // Track configuration - Authentic TROUBLE layout
  TOTAL_SPACES: 28, // Main circular track has 28 spaces
  SPACES_PER_QUARTER: 7, // 7 spaces per quarter (28 total / 4 quarters)
  TRACK_WIDTH: 32,
  SPACE_SIZE: 24,

  // Areas
  HOME_SPACES: 4, // 4 spaces per player HOME area
  FINISH_SPACES: 4, // 4 spaces per player FINISH track

  // Special spaces - Authentic TROUBLE positions
  DOUBLE_TROUBLE_POSITIONS: [0, 7, 14, 21], // Every 7th space starting from 0

  // START spaces are part of the main 28-space track
  START_POSITIONS: [4, 11, 18, 25], // One per player corner, 3 spaces after each XX

  // WARP spaces - positioned right before START spaces, diagonal pairs
  WARP_POSITIONS: [
    { from: 3, to: 17 }, // Space before START 4 connects to space before START 18 (diagonal)
    { from: 10, to: 24 }, // Space before START 11 connects to space before START 25 (diagonal)
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
  // Player starting positions (part of the main 28-space track)
  playerStarts: [25, 4, 11, 18], // Red=25, Blue=4, Green=11, Yellow=18

  // HOME area positions in corners (4 circles each)
  homeAreas: {
    red: { x: -140, y: -140 },    // Top-left corner
    blue: { x: 140, y: -140 },    // Top-right corner
    green: { x: 140, y: 140 },    // Bottom-right corner
    yellow: { x: -140, y: 140 },  // Bottom-left corner
  },

  // FINISH track entry positions (where pegs exit main track toward center)
  finishEntries: {
    red: { trackSpace: 24, direction: 'toCenter' },    // Enters from space 24 (before START 25)
    blue: { trackSpace: 3, direction: 'toCenter' },    // Enters from space 3 (before START 4)
    green: { trackSpace: 10, direction: 'toCenter' },  // Enters from space 10 (before START 11)
    yellow: { trackSpace: 17, direction: 'toCenter' }, // Enters from space 17 (before START 18)
  },
} as const;

// Calculate positions for the 28-space circular track
export const calculateTrackSpacePositions = (): { x: number; y: number; index: number; }[] => {
  const positions = [];
  const centerX = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const centerY = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const trackRadius = 130; // Distance from center to track spaces
  const totalSpaces = BOARD_CONFIG.TOTAL_SPACES; // 28 spaces

  // Calculate positions along a circular path
  for (let i = 0; i < totalSpaces; i++) {
    // Start from top (12 o'clock position) and go clockwise
    const angle = (i / totalSpaces) * Math.PI * 2 - Math.PI / 2;

    const x = centerX + Math.cos(angle) * trackRadius;
    const y = centerY + Math.sin(angle) * trackRadius;

    positions.push({ x, y, index: i });
  }

  return positions;
};

// Get position for a specific space index
export const getSpacePosition = (spaceIndex: number) => {
  const positions = calculateTrackSpacePositions();

  return positions.find(pos => pos.index === spaceIndex);
};

// Get all positions for special spaces
export const getSpecialSpacePositions = () => {
  const positions = calculateTrackSpacePositions();

  const doubleTrouble = positions.filter(pos =>
    BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(pos.index as 0 | 7 | 14 | 21),
  );

  const warpSpaces = positions.filter(pos =>
    BOARD_CONFIG.WARP_POSITIONS.some(warp => warp.from === pos.index || warp.to === pos.index),
  );

  const startSpaces = positions.filter(pos =>
    BOARD_CONFIG.START_POSITIONS.includes(pos.index as 4 | 11 | 18 | 25),
  );

  return { doubleTrouble, warpSpaces, startSpaces };
};

// Helper to get FINISH track positions for each player
export const getFinishTrackPositions = (playerColor: 'red' | 'blue' | 'green' | 'yellow') => {
  const centerX = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const centerY = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const finishSpacing = 20; // Increased spacing between FINISH spaces
  const positions = [];

  // Calculate direction toward point between START space and preceding warp space
  // START spaces: RED=25, BLUE=4, GREEN=11, YELLOW=18
  // Warp spaces: 3, 10, 17, 24
  const finishAngles = {
    // RED: Between START(25) and warp(24) - aim between positions 24.5
    red: (24.5 / 28) * Math.PI * 2 - Math.PI / 2,

    // BLUE: Between START(4) and warp(3) - aim between positions 3.5
    blue: (3.5 / 28) * Math.PI * 2 - Math.PI / 2,

    // GREEN: Between START(11) and warp(10) - aim between positions 10.5
    green: (10.5 / 28) * Math.PI * 2 - Math.PI / 2,

    // YELLOW: Between START(18) and warp(17) - aim between positions 17.5
    yellow: (17.5 / 28) * Math.PI * 2 - Math.PI / 2,
  };

  const angle = finishAngles[playerColor];
  const startDistance = 110; // Distance from center to start of FINISH track

  for (let i = 0; i < BOARD_CONFIG.FINISH_SPACES; i++) {
    const distance = startDistance - (i * finishSpacing);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    positions.push({ x, y, index: i });
  }

  return positions;
};
