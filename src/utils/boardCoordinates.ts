import { Peg, PlayerColor } from '@/models';
import { BOARD_CONFIG, getSpacePosition, getFinishTrackPositions } from '@/constants/board';
import { Dimensions } from 'react-native';

export interface BoardCoordinate {
  x: number;
  y: number;
}

export interface PegOverlayData extends Peg {
  coordinate: BoardCoordinate;
  playerColor: PlayerColor;
}

export interface BoardDimensions {
  width: number;
  height: number;
  scaleFactor: number;
}

/**
 * Calculate responsive board dimensions matching BoardSVG logic
 */
export const calculateBoardDimensions = (): BoardDimensions => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Apply same logic as BoardSVG
  const availableWidth = Math.min(screenWidth * 0.95, 400);
  const availableHeight = Math.min(screenHeight * 0.7, 400);
  const boardSize = Math.min(availableWidth, availableHeight);

  const scaleFactor = boardSize / BOARD_CONFIG.VIEWPORT_SIZE;

  return {
    width: boardSize,
    height: boardSize,
    scaleFactor,
  };
};

/**
 * Check if a position is within the boundary of a player's corner
 */
export const isWithinBoundary = (pos: BoardCoordinate, playerColor: PlayerColor): boolean => {
  const size = BOARD_CONFIG.VIEWPORT_SIZE;
  const pegRadius = 10;
  const cornerSize = size * 0.35;

  switch (playerColor) {
  case 'red':
    return pos.x + pos.y <= cornerSize - pegRadius;
  case 'blue':
    return (size - pos.x) + pos.y <= cornerSize - pegRadius;
  case 'green':
    return (size - pos.x) + (size - pos.y) <= cornerSize - pegRadius;
  case 'yellow':
    return pos.x + (size - pos.y) <= cornerSize - pegRadius;
  default:
    return false;
  }
};

/**
 * Scale coordinate from 400x400 system to actual board size
 */
export const scaleCoordinate = (coordinate: BoardCoordinate, scaleFactor: number): BoardCoordinate => {
  return {
    x: coordinate.x * scaleFactor,
    y: coordinate.y * scaleFactor,
  };
};

/**
 * Get HOME area positions for a specific player and peg index
 * Returns coordinates for 2x2 grid layout in each corner
 */
export const getHomePosition = (playerColor: PlayerColor, pegIndex: number): BoardCoordinate => {
  const size = BOARD_CONFIG.VIEWPORT_SIZE; // 400
  const spacing = 30;
  const margin = 30;

  // Position arrays for 2x2 grid in each corner
  const allPlayerPositions = {
    red: [
      { x: margin, y: margin },
      { x: margin + spacing, y: margin },
      { x: margin, y: margin + spacing },
      { x: margin + spacing, y: margin + spacing },
    ],
    blue: [
      { x: size - margin - spacing, y: margin },
      { x: size - margin, y: margin },
      { x: size - margin - spacing, y: margin + spacing },
      { x: size - margin, y: margin + spacing },
    ],
    green: [
      { x: size - margin - spacing, y: size - margin - spacing },
      { x: size - margin, y: size - margin - spacing },
      { x: size - margin - spacing, y: size - margin },
      { x: size - margin, y: size - margin },
    ],
    yellow: [
      { x: margin, y: size - margin - spacing },
      { x: margin + spacing, y: size - margin - spacing },
      { x: margin, y: size - margin },
      { x: margin + spacing, y: size - margin },
    ],
  };

  const positions = allPlayerPositions[playerColor] || allPlayerPositions.red;
  const position = positions[pegIndex % 4] || positions[0];

  return {
    x: position.x,
    y: position.y,
  };
};

/**
 * Get main track position for a space index (0-27)
 */
export const getTrackPosition = (spaceIndex: number): BoardCoordinate | null => {
  const position = getSpacePosition(spaceIndex);

  if (!position) return null;

  return {
    x: position.x,
    y: position.y,
  };
};

/**
 * Get FINISH track position for a player and finish index (0-3)
 */
export const getFinishPosition = (playerColor: PlayerColor, finishIndex: number): BoardCoordinate | null => {
  const positions = getFinishTrackPositions(playerColor);
  const position = positions[finishIndex];

  if (!position) return null;

  return {
    x: position.x,
    y: position.y,
  };
};

/**
 * Convert peg data to board coordinate for rendering
 */
export const getPegCoordinate = (peg: Peg, playerColor: PlayerColor): BoardCoordinate => {
  // Peg is in HOME
  if (peg.isInHome) {
    // Extract peg index from ID format: player-id-peg-index
    const pegIndex = parseInt(peg.id.split('-')[3]) || 0; // Extract peg index from ID

    return getHomePosition(playerColor, pegIndex);
  }

  // Peg is in FINISH
  if (peg.isInFinish && peg.finishPosition !== undefined) {
    const finishCoord = getFinishPosition(playerColor, peg.finishPosition);

    if (finishCoord) return finishCoord;
  }

  // Peg is on main track
  if (peg.position >= 0 && peg.position < BOARD_CONFIG.TOTAL_SPACES) {
    const trackCoord = getTrackPosition(peg.position);

    if (trackCoord) return trackCoord;
  }

  // Fallback to center if position is invalid
  return {
    x: BOARD_CONFIG.VIEWPORT_SIZE / 2,
    y: BOARD_CONFIG.VIEWPORT_SIZE / 2,
  };
};

/**
 * Prepare all pegs with their board coordinates for overlay rendering
 * Includes boundary checking to filter valid positions
 */
export const preparePegOverlayData = (
  pegs: Peg[],
  players: Array<{ id: string; color: PlayerColor }>,
  scaleFactor: number = 1,
): PegOverlayData[] => {
  return pegs
    .map((peg) => {
      const player = players.find(p => p.id === peg.playerId);
      const playerColor = player?.color || 'red';

      const baseCoordinate = getPegCoordinate(peg, playerColor);

      // Apply boundary check for HOME pegs
      if (peg.isInHome && !isWithinBoundary(baseCoordinate, playerColor)) {
        return null; // Filter out pegs that don't pass boundary check
      }

      const scaledCoordinate = scaleCoordinate(baseCoordinate, scaleFactor);

      return {
        ...peg,
        playerColor,
        coordinate: scaledCoordinate,
      };
    })
    .filter((peg): peg is PegOverlayData => peg !== null); // Remove null entries
};

/**
 * Check if two pegs are at the same position (for stacking)
 */
export const getPegsAtSamePosition = (pegData: PegOverlayData[]): PegOverlayData[][] => {
  const groups: { [key: string]: PegOverlayData[] } = {};

  pegData.forEach(peg => {
    const key = `${Math.round(peg.coordinate.x)},${Math.round(peg.coordinate.y)}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(peg);
  });

  return Object.values(groups);
};

/**
 * Calculate stacked positions for pegs at the same coordinate
 * Only stack pegs that are truly at the same position (not HOME pegs in different circles)
 */
export const getStackedPegPositions = (pegsAtSameSpot: PegOverlayData[], pegSize: number = 24, scaleFactor: number = 1): PegOverlayData[] => {
  if (pegsAtSameSpot.length <= 1) return pegsAtSameSpot;

  // Pegs in HOME should be in different circles, not stacked

  const baseCoord = pegsAtSameSpot[0].coordinate;
  const stackOffset = (pegSize / 3) * scaleFactor; // Scale the offset as well

  return pegsAtSameSpot.map((peg, index) => ({
    ...peg,
    coordinate: {
      x: baseCoord.x + (index * stackOffset),
      y: baseCoord.y + (index * stackOffset),
    },
  }));
};
