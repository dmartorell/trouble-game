import { Peg } from '@/models';
import { BOARD_CONFIG, BOARD_POSITIONS } from '@/constants/board';
import { GAME_CONFIG } from '@/constants/game';

/**
 * Utility functions for validating peg movements in the Trouble game
 */

export interface MoveValidationResult {
  isValid: boolean;
  reason?: string;
  newPosition?: number;
  capturedPegId?: string;
  warpSpaceCapturedPegId?: string; // For capturing pegs on the warp space itself
  entersFinish?: boolean;
}

/**
 * Calculate the destination position for a peg given a die roll
 */
export function calculateDestinationPosition(
  peg: Peg,
  dieRoll: number,
  playerColor: string,
  allPegs: Peg[],
): number {
  // Moving from HOME to START requires a roll of 6
  if (peg.isInHome && dieRoll === 6) {
    const startPositions = BOARD_POSITIONS.playerStarts;
    const colorIndex = ['red', 'blue', 'green', 'yellow'].indexOf(playerColor);

    // Invalid color check
    if (colorIndex === -1) {
      return -2; // Invalid color
    }

    return startPositions[colorIndex];
  }

  // If peg is in FINISH area, move within finish track
  if (peg.isInFinish && peg.finishPosition !== undefined) {
    const newFinishPosition = peg.finishPosition + dieRoll;

    // Can't exceed finish area (4 spaces)
    if (newFinishPosition >= BOARD_CONFIG.FINISH_SPACES) {
      return -2; // Invalid - exceeds finish
    }

    return GAME_CONFIG.BOARD_SPACES + newFinishPosition;
  }

  // Normal board movement
  if (peg.position >= 0 && peg.position < BOARD_CONFIG.TOTAL_SPACES) {
    const newPosition = (peg.position + dieRoll) % BOARD_CONFIG.TOTAL_SPACES;
    const playerColorIndex = ['red', 'blue', 'green', 'yellow'].indexOf(playerColor);

    // Invalid color check
    if (playerColorIndex === -1) {
      return -2; // Invalid color
    }

    const finishEntry = Object.values(BOARD_POSITIONS.finishEntries)[playerColorIndex];
    const finishEntrySpace = finishEntry.trackSpace;

    // Check if peg passes THROUGH finish entry (not lands exactly on it)
    if (passesThrough(peg.position, newPosition, finishEntrySpace)) {
      // Calculate which FINISH space to enter
      const finishSpaceIndex = calculateFinishSpace(peg.position, newPosition, finishEntrySpace);

      // Check if FINISH space is available
      if (isFinishSpaceAvailable(peg.playerId, finishSpaceIndex, allPegs)) {
        return GAME_CONFIG.BOARD_SPACES + finishSpaceIndex;
      } else {
        return -2; // Blocked, can't move
      }
    }

    // Check if lands exactly on WARP space (takes priority over FINISH entry)
    const isWarpSpacePosition = BOARD_CONFIG.WARP_POSITIONS.some(warp =>
      warp.from === newPosition || warp.to === newPosition,
    );

    if (isWarpSpacePosition) {
      // WARP takes priority - return normal position for warp processing
      return newPosition;
    }

    return newPosition;
  }

  return -2; // Invalid position
}

/**
 * Check if peg passes THROUGH finish entry (not lands exactly on it)
 */
function passesThrough(currentPos: number, newPos: number, entryPoint: number): boolean {
  // Check if path crosses entry point without landing exactly on it
  return currentPos < entryPoint && newPos > entryPoint;
}

/**
 * Calculate which FINISH space to enter based on movement
 */
function calculateFinishSpace(currentPos: number, newPos: number, entryPoint: number): number {
  // How many spaces past the entry point
  return newPos - entryPoint - 1;
}

/**
 * Check if a specific FINISH space is available
 */
function isFinishSpaceAvailable(playerId: string, spaceIndex: number, allPegs: Peg[]): boolean {
  // Check if spaceIndex is valid (0-3)
  if (spaceIndex < 0 || spaceIndex >= BOARD_CONFIG.FINISH_SPACES) {
    return false;
  }

  // Check if the specific FINISH space is occupied by own peg
  const blockingPeg = allPegs.find(peg =>
    peg.playerId === playerId &&
    peg.isInFinish &&
    peg.finishPosition === spaceIndex,
  );

  return !blockingPeg;
}

/**
 * Check if destination space is blocked by own peg
 */
export function isDestinationBlocked(
  destinationPosition: number,
  playerId: string,
  allPegs: Peg[],
): { blocked: boolean; blockingPegId?: string } {
  const blockingPeg = allPegs.find(
    peg => peg.playerId === playerId &&
           peg.position === destinationPosition &&
           !peg.isInHome,
  );

  return {
    blocked: !!blockingPeg,
    blockingPegId: blockingPeg?.id,
  };
}

/**
 * Check if there's an opponent peg at destination that can be captured
 */
export function checkForCapture(
  destinationPosition: number,
  playerId: string,
  allPegs: Peg[],
): { canCapture: boolean; capturedPegId?: string } {
  const opponentPeg = allPegs.find(
    peg => peg.playerId !== playerId &&
           peg.position === destinationPosition &&
           !peg.isInHome &&
           !peg.isInFinish, // Can't capture pegs in finish area
  );

  return {
    canCapture: !!opponentPeg,
    capturedPegId: opponentPeg?.id,
  };
}

/**
 * Validate if a peg can move with the given die roll
 */
export function validatePegMove(
  peg: Peg,
  dieRoll: number,
  playerColor: string,
  allPegs: Peg[],
): MoveValidationResult {
  // Can only move from HOME with a 6
  if (peg.isInHome) {
    if (dieRoll !== 6) {
      return {
        isValid: false,
        reason: 'Must roll 6 to move peg from HOME',
      };
    }

    // Check if START space is blocked by own peg
    const startPosition = calculateDestinationPosition(peg, dieRoll, playerColor, allPegs);

    // Check for invalid color
    if (startPosition === -2) {
      return {
        isValid: false,
        reason: 'Invalid player color',
      };
    }

    const { blocked } = isDestinationBlocked(startPosition, peg.playerId, allPegs);

    if (blocked) {
      return {
        isValid: false,
        reason: 'START space is blocked by your own peg',
      };
    }

    // Check for opponent capture at START
    const { capturedPegId } = checkForCapture(startPosition, peg.playerId, allPegs);

    return {
      isValid: true,
      newPosition: startPosition,
      capturedPegId,
    };
  }

  // Calculate destination
  const newPosition = calculateDestinationPosition(peg, dieRoll, playerColor, allPegs);

  if (newPosition === -2) {
    return {
      isValid: false,
      reason: 'Move would exceed available spaces or FINISH space is blocked',
    };
  }

  // Check if moving into FINISH area
  const entersFinish = newPosition >= GAME_CONFIG.BOARD_SPACES;

  if (entersFinish) {
    // Finish area moves require exact count
    const finishPosition = newPosition - GAME_CONFIG.BOARD_SPACES;

    if (finishPosition >= BOARD_CONFIG.FINISH_SPACES) {
      return {
        isValid: false,
        reason: 'Must roll exact count to enter FINISH space',
      };
    }

    // Check if finish space is blocked by own peg
    const { blocked } = isDestinationBlocked(newPosition, peg.playerId, allPegs);

    if (blocked) {
      return {
        isValid: false,
        reason: 'FINISH space is blocked by your own peg',
      };
    }

    return {
      isValid: true,
      newPosition,
      entersFinish: true,
    };
  }

  // Normal board movement
  // First check if landing on warp space - need special validation
  const isWarpSpace = BOARD_CONFIG.WARP_POSITIONS.some(warp =>
    warp.from === newPosition || warp.to === newPosition,
  );

  if (isWarpSpace) {
    // Get the warp destination
    const warpPair = BOARD_CONFIG.WARP_POSITIONS.find(warp =>
      warp.from === newPosition || warp.to === newPosition,
    );

    if (warpPair) {
      const warpDestination = warpPair.from === newPosition ? warpPair.to : warpPair.from;

      // Check if warp destination is blocked by own peg
      const { blocked: warpBlocked } = isDestinationBlocked(warpDestination, peg.playerId, allPegs);

      if (warpBlocked) {
        return {
          isValid: false,
          reason: 'Cannot use warp - destination is blocked by your own peg',
        };
      }

      // Check if the warp space itself is blocked by own peg
      const { blocked } = isDestinationBlocked(newPosition, peg.playerId, allPegs);

      if (blocked) {
        return {
          isValid: false,
          reason: 'Destination is blocked by your own peg',
        };
      }

      // Check for opponent capture at the warp space itself (before warping)
      const { capturedPegId: warpSpaceCapturedPegId } = checkForCapture(newPosition, peg.playerId, allPegs);

      // Check for opponent capture at warp destination (after warping)
      const { capturedPegId: warpDestinationCapturedPegId } = checkForCapture(warpDestination, peg.playerId, allPegs);

      // Return the original position with both capture possibilities
      return {
        isValid: true,
        newPosition,
        warpSpaceCapturedPegId, // This will be the peg at the warp space itself if any
        capturedPegId: warpDestinationCapturedPegId, // This will be the peg at warp destination if any
      };
    }
  }

  // Non-warp space: Check if blocked by own peg
  const { blocked } = isDestinationBlocked(newPosition, peg.playerId, allPegs);

  if (blocked) {
    return {
      isValid: false,
      reason: 'Destination is blocked by your own peg',
    };
  }

  // Check for opponent capture at direct destination
  const { capturedPegId } = checkForCapture(newPosition, peg.playerId, allPegs);

  return {
    isValid: true,
    newPosition,
    capturedPegId,
  };
}

/**
 * Get all valid moves for a player's pegs given a die roll
 */
export function getValidMoves(
  playerId: string,
  dieRoll: number,
  allPegs: Peg[],
  playerColor: string,
): { pegId: string; validationResult: MoveValidationResult }[] {
  const playerPegs = allPegs.filter(peg => peg.playerId === playerId);
  const validMoves: { pegId: string; validationResult: MoveValidationResult }[] = [];

  playerPegs.forEach(peg => {
    const validationResult = validatePegMove(peg, dieRoll, playerColor, allPegs);

    if (validationResult.isValid) {
      validMoves.push({ pegId: peg.id, validationResult });
    }
  });

  return validMoves;
}

/**
 * Check if a player has any valid moves
 */
export function hasValidMoves(
  playerId: string,
  dieRoll: number,
  allPegs: Peg[],
  playerColor: string,
): boolean {
  const validMoves = getValidMoves(playerId, dieRoll, allPegs, playerColor);

  return validMoves.length > 0;
}

/**
 * Check if a player can move a peg from HOME to START for Roll of 1 rule
 * Returns the first available peg that can be moved
 */
export function canMoveFromHomeToStart(
  playerId: string,
  playerColor: string,
  allPegs: Peg[],
): { canMove: boolean; pegId?: string } {
  // Find player's pegs that are in HOME
  const homePegs = allPegs.filter(peg =>
    peg.playerId === playerId && peg.isInHome,
  );

  if (homePegs.length === 0) {
    return { canMove: false };
  }

  // Get player's START position based on color
  const colorIndex = ['red', 'blue', 'green', 'yellow'].indexOf(playerColor);

  if (colorIndex === -1) {
    return { canMove: false };
  }

  const startPosition = BOARD_POSITIONS.playerStarts[colorIndex];

  // Check if START space is blocked by player's own peg
  const { blocked } = isDestinationBlocked(startPosition, playerId, allPegs);

  if (blocked) {
    return { canMove: false };
  }

  // Return the first available peg to move
  return {
    canMove: true,
    pegId: homePegs[0].id,
  };
}
