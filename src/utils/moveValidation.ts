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
  entersFinish?: boolean;
}

/**
 * Calculate the destination position for a peg given a die roll
 */
export function calculateDestinationPosition(
  peg: Peg,
  dieRoll: number,
  playerColor: string,
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

    // Check if peg should enter FINISH area instead of continuing around board
    const playerColorIndex = ['red', 'blue', 'green', 'yellow'].indexOf(playerColor);

    // Invalid color check
    if (playerColorIndex === -1) {
      return -2; // Invalid color
    }

    const finishEntry = Object.values(BOARD_POSITIONS.finishEntries)[playerColorIndex];

    // If passing through finish entry point, enter FINISH if peg has completed full lap
    if (shouldEnterFinish(peg.position, newPosition, finishEntry.trackSpace)) {
      const spacesIntoFinish = dieRoll - (finishEntry.trackSpace - peg.position + 1);

      if (spacesIntoFinish >= 0 && spacesIntoFinish < BOARD_CONFIG.FINISH_SPACES) {
        return GAME_CONFIG.BOARD_SPACES + spacesIntoFinish;
      }

      // If would exceed finish, invalid move
      return -2;
    }

    return newPosition;
  }

  return -2; // Invalid position
}

/**
 * Check if a peg should enter FINISH area based on movement
 */
function shouldEnterFinish(
  currentPosition: number,
  newPosition: number,
  finishEntrySpace: number,
): boolean {
  // Only enter finish if peg has completed at least one full lap
  // This is simplified - in a full implementation, we'd track lap completion

  // Check if moving past or onto the finish entry point
  if (currentPosition <= finishEntrySpace && newPosition >= finishEntrySpace) {
    return true;
  }

  // Handle wraparound case
  if (currentPosition > finishEntrySpace && newPosition < currentPosition) {
    return newPosition >= finishEntrySpace;
  }

  return false;
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
    const startPosition = calculateDestinationPosition(peg, dieRoll, playerColor);

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
  const newPosition = calculateDestinationPosition(peg, dieRoll, playerColor);

  if (newPosition === -2) {
    return {
      isValid: false,
      reason: 'Move would exceed available spaces',
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
  // Check if blocked by own peg
  const { blocked } = isDestinationBlocked(newPosition, peg.playerId, allPegs);

  if (blocked) {
    return {
      isValid: false,
      reason: 'Destination is blocked by your own peg',
    };
  }

  // Check for opponent capture
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
