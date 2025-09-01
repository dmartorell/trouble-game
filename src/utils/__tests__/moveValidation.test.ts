import {
  calculateDestinationPosition,
  isDestinationBlocked,
  checkForCapture,
  validatePegMove,
  getValidMoves,
  hasValidMoves,
  canMoveFromHomeToStart,
} from '../moveValidation';
import { Peg } from '@/models';

describe('Move Validation Utils', () => {
  // Helper to create test pegs
  const createPeg = (
    id: string,
    playerId: string,
    position: number,
    isInHome = false,
    isInFinish = false,
    finishPosition?: number,
  ): Peg => ({
    id,
    playerId,
    position,
    isInHome,
    isInFinish,
    finishPosition,
  });

  describe('calculateDestinationPosition', () => {
    it('should move peg from HOME to START with roll of 6', () => {
      const peg = createPeg('red-peg-1', 'player1', -1, true);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 6, 'red', allPegs);

      expect(result).toBe(25); // Red player starts at position 25
    });

    it('should not allow move from HOME with roll other than 6', () => {
      const peg = createPeg('red-peg-1', 'player1', -1, true);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 4, 'red', allPegs);

      expect(result).toBe(-2); // Invalid
    });

    it('should calculate normal board movement', () => {
      const peg = createPeg('red-peg-1', 'player1', 5);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 3, 'red', allPegs);

      expect(result).toBe(8);
    });

    it('should wrap around board correctly', () => {
      const peg = createPeg('red-peg-1', 'player1', 26);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 4, 'red', allPegs);

      expect(result).toBe(2); // (26 + 4) % 28 = 2
    });

    it('should move within FINISH area', () => {
      const peg = createPeg('red-peg-1', 'player1', 56, false, true, 0); // 56 = BOARD_SPACES + 0
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 2, 'red', allPegs);

      expect(result).toBe(58); // 56 + 2
    });

    it('should reject move that exceeds FINISH area', () => {
      const peg = createPeg('red-peg-1', 'player1', 59, false, true, 3); // At last FINISH space
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 2, 'red', allPegs);

      expect(result).toBe(-2); // Invalid - would exceed finish
    });
  });

  describe('isDestinationBlocked', () => {
    it('should detect when destination is blocked by own peg', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('red-peg-2', 'player1', 8), // Blocking position 8
      ];
      const result = isDestinationBlocked(8, 'player1', pegs);

      expect(result.blocked).toBe(true);
      expect(result.blockingPegId).toBe('red-peg-2');
    });

    it('should allow move when destination is free', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
      ];
      const result = isDestinationBlocked(8, 'player1', pegs);

      expect(result.blocked).toBe(false);
    });

    it('should not consider pegs in HOME as blocking', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('red-peg-2', 'player1', -1, true), // In HOME
      ];
      const result = isDestinationBlocked(-1, 'player1', pegs);

      expect(result.blocked).toBe(false); // HOME pegs don't block
    });
  });

  describe('checkForCapture', () => {
    it('should detect opponent peg that can be captured', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('blue-peg-1', 'player2', 8), // Opponent at position 8
      ];
      const result = checkForCapture(8, 'player1', pegs);

      expect(result.canCapture).toBe(true);
      expect(result.capturedPegId).toBe('blue-peg-1');
    });

    it('should not capture pegs in FINISH area', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('blue-peg-1', 'player2', 58, false, true, 2), // Opponent in finish
      ];
      const result = checkForCapture(58, 'player1', pegs);

      expect(result.canCapture).toBe(false);
    });

    it('should not capture pegs in HOME', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('blue-peg-1', 'player2', -1, true), // Opponent in home
      ];
      const result = checkForCapture(-1, 'player1', pegs);

      expect(result.canCapture).toBe(false);
    });

    it('should not capture own pegs', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),
        createPeg('red-peg-2', 'player1', 8), // Own peg at position 8
      ];
      const result = checkForCapture(8, 'player1', pegs);

      expect(result.canCapture).toBe(false);
    });
  });

  describe('validatePegMove', () => {
    it('should validate move from HOME with roll of 6', () => {
      const peg = createPeg('red-peg-1', 'player1', -1, true);
      const allPegs = [peg];
      const result = validatePegMove(peg, 6, 'red', allPegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(25);
    });

    it('should reject move from HOME without roll of 6', () => {
      const peg = createPeg('red-peg-1', 'player1', -1, true);
      const allPegs = [peg];
      const result = validatePegMove(peg, 4, 'red', allPegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Must roll 6 to move peg from HOME');
    });

    it('should reject move when START is blocked by own peg', () => {
      const peg1 = createPeg('red-peg-1', 'player1', -1, true);
      const peg2 = createPeg('red-peg-2', 'player1', 25); // Blocking START
      const allPegs = [peg1, peg2];
      const result = validatePegMove(peg1, 6, 'red', allPegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('START space is blocked by your own peg');
    });

    it('should validate capture move', () => {
      const peg1 = createPeg('red-peg-1', 'player1', 5);
      const peg2 = createPeg('blue-peg-1', 'player2', 8); // Opponent to capture
      const allPegs = [peg1, peg2];
      const result = validatePegMove(peg1, 3, 'red', allPegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(8);
      expect(result.capturedPegId).toBe('blue-peg-1');
    });

    it('should reject move blocked by own peg', () => {
      const peg1 = createPeg('red-peg-1', 'player1', 5);
      const peg2 = createPeg('red-peg-2', 'player1', 8); // Own peg blocking
      const allPegs = [peg1, peg2];
      const result = validatePegMove(peg1, 3, 'red', allPegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is blocked by your own peg');
    });

    it('should validate normal board movement', () => {
      const peg = createPeg('red-peg-1', 'player1', 5);
      const allPegs = [peg];
      const result = validatePegMove(peg, 3, 'red', allPegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(8);
    });

    it('should reject FINISH move that exceeds available spaces', () => {
      const peg = createPeg('red-peg-1', 'player1', 59, false, true, 3); // At last FINISH space
      const allPegs = [peg];
      const result = validatePegMove(peg, 2, 'red', allPegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Move would exceed available spaces or FINISH space is blocked');
    });

    it('should validate move within FINISH area', () => {
      const peg = createPeg('red-peg-1', 'player1', 56, false, true, 0); // First FINISH space
      const allPegs = [peg];
      const result = validatePegMove(peg, 2, 'red', allPegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(58);
      expect(result.entersFinish).toBe(true);
    });
  });

  describe('getValidMoves', () => {
    it('should return all valid moves for a player', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME - can move with 6
        createPeg('red-peg-2', 'player1', 5),       // On board - can move
        createPeg('blue-peg-1', 'player2', 8),      // Opponent
      ];

      const validMoves = getValidMoves('player1', 6, pegs, 'red');
      expect(validMoves).toHaveLength(2); // Both red pegs can move with a 6
    });

    it('should return empty array when no valid moves', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME, needs 6 to move
      ];

      const validMoves = getValidMoves('player1', 3, pegs, 'red');
      expect(validMoves).toHaveLength(0); // Can't move from HOME without 6
    });

    it('should return moves that can capture opponents', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5),       // Can capture blue peg
        createPeg('blue-peg-1', 'player2', 8),      // Opponent to capture
      ];

      const validMoves = getValidMoves('player1', 3, pegs, 'red');
      expect(validMoves).toHaveLength(1);
      expect(validMoves[0].validationResult.capturedPegId).toBe('blue-peg-1');
    });
  });

  describe('hasValidMoves', () => {
    it('should return true when player has valid moves', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5), // Can move
      ];

      const result = hasValidMoves('player1', 3, pegs, 'red');
      expect(result).toBe(true);
    });

    it('should return false when player has no valid moves', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME, can't move without 6
      ];

      const result = hasValidMoves('player1', 3, pegs, 'red');
      expect(result).toBe(false);
    });

    it('should return true when HOME peg can move with 6', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME
      ];

      const result = hasValidMoves('player1', 6, pegs, 'red');
      expect(result).toBe(true);
    });

    it('should handle multiple player colors correctly', () => {
      const pegs = [
        createPeg('blue-peg-1', 'player2', 5), // Blue peg on board
      ];

      const result = hasValidMoves('player2', 2, pegs, 'blue');
      expect(result).toBe(true);
    });
  });

  describe('FINISH entry rules', () => {
    it('should enter FINISH when passing through entry point', () => {
      // Red peg at 22, roll 3: 22→23→24(pass through)→FINISH[0]
      const peg = createPeg('red-peg-1', 'player1', 22);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 3, 'red', allPegs);
      expect(result).toBe(56); // BOARD_SPACES + 0 = 28 + 0 = 28 (but should be 56 based on game config)
    });

    it('should use WARP when landing exactly on entry/warp space', () => {
      // Red peg at 23, roll 1: 23→24(land exactly)→WARP to 10
      const peg = createPeg('red-peg-1', 'player1', 23);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 1, 'red', allPegs);
      expect(result).toBe(24); // Returns warp space position for warp processing
    });

    it('should reject FINISH entry when space is blocked', () => {
      // Red peg at 22, roll 3, but FINISH[0] is occupied
      const peg1 = createPeg('red-peg-1', 'player1', 22);
      const peg2 = createPeg('red-peg-2', 'player1', 56, false, true, 0); // Blocking FINISH[0]
      const allPegs = [peg1, peg2];
      const result = calculateDestinationPosition(peg1, 3, 'red', allPegs);
      expect(result).toBe(-2); // Blocked, can't move
    });

    it('should allow FINISH entry to different spaces when available', () => {
      // Red peg at 21, roll 6: should enter FINISH[2] (skipping blocked spaces)
      const peg1 = createPeg('red-peg-1', 'player1', 21);
      const peg2 = createPeg('red-peg-2', 'player1', 56, false, true, 0); // Blocking FINISH[0]
      const peg3 = createPeg('red-peg-3', 'player1', 57, false, true, 1); // Blocking FINISH[1]
      const allPegs = [peg1, peg2, peg3];
      const result = calculateDestinationPosition(peg1, 6, 'red', allPegs);
      expect(result).toBe(58); // BOARD_SPACES + 2 = FINISH[2]
    });

    it('should work for different player colors', () => {
      // Blue peg at 1, roll 3: 1→2→3(pass through)→BLUE FINISH[0]
      const peg = createPeg('blue-peg-1', 'player2', 1);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 3, 'blue', allPegs);
      expect(result).toBe(56); // BOARD_SPACES + 0
    });

    it('should not enter wrong color FINISH area', () => {
      // Blue peg at 22, roll 3: should go to space 25, not enter red FINISH
      const peg = createPeg('blue-peg-1', 'player2', 22);
      const allPegs = [peg];
      const result = calculateDestinationPosition(peg, 3, 'blue', allPegs);
      expect(result).toBe(25); // Normal movement, not FINISH entry
    });
  });

  describe('edge cases', () => {
    it('should handle empty peg array', () => {
      const result = hasValidMoves('player1', 6, [], 'red');
      expect(result).toBe(false);
    });

    it('should handle invalid player color', () => {
      const pegs = [createPeg('red-peg-1', 'player1', -1, true)];
      const result = validatePegMove(pegs[0], 6, 'invalid' as any, pegs);
      expect(result.isValid).toBe(false);
    });

    it('should handle board wraparound correctly', () => {
      const peg = createPeg('red-peg-1', 'player1', 27); // Last position
      const allPegs = [createPeg('red-peg-1', 'player1', 27)];
      const result = calculateDestinationPosition(peg, 3, 'red', allPegs);
      expect(result).toBe(2); // Should wrap to position 2
    });
  });

  describe('canMoveFromHomeToStart (Roll of 1 rule)', () => {
    it('should return true when player has pegs in HOME and START is free', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME
        createPeg('blue-peg-1', 'player2', 5), // On track, not blocking
      ];
      const result = canMoveFromHomeToStart('player1', 'red', pegs);
      expect(result.canMove).toBe(true);
      expect(result.pegId).toBe('red-peg-1');
    });

    it('should return false when player has no pegs in HOME', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 5), // On track
        createPeg('red-peg-2', 'player1', 10), // On track
      ];
      const result = canMoveFromHomeToStart('player1', 'red', pegs);
      expect(result.canMove).toBe(false);
      expect(result.pegId).toBeUndefined();
    });

    it('should return false when START space is blocked by own peg', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // In HOME
        createPeg('red-peg-2', 'player1', 25), // Blocking red START (position 25)
      ];
      const result = canMoveFromHomeToStart('player1', 'red', pegs);
      expect(result.canMove).toBe(false);
      expect(result.pegId).toBeUndefined();
    });

    it('should work correctly for different player colors', () => {
      const pegs = [
        createPeg('blue-peg-1', 'player2', -1, true), // Blue player in HOME
        createPeg('red-peg-1', 'player1', 25), // Red peg not blocking blue START
      ];
      const result = canMoveFromHomeToStart('player2', 'blue', pegs);
      expect(result.canMove).toBe(true);
      expect(result.pegId).toBe('blue-peg-1');
    });

    it('should handle invalid player color', () => {
      const pegs = [createPeg('test-peg-1', 'player1', -1, true)];
      const result = canMoveFromHomeToStart('player1', 'invalid' as any, pegs);
      expect(result.canMove).toBe(false);
      expect(result.pegId).toBeUndefined();
    });

    it('should return first available HOME peg when multiple exist', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', -1, true), // First HOME peg
        createPeg('red-peg-2', 'player1', -1, true), // Second HOME peg
        createPeg('red-peg-3', 'player1', 10), // On track
      ];
      const result = canMoveFromHomeToStart('player1', 'red', pegs);
      expect(result.canMove).toBe(true);
      expect(result.pegId).toBe('red-peg-1'); // Should return first one
    });
  });

  describe('Warp Space Validation', () => {
    it('should block move to warp space if destination has same player peg', () => {
      // Warp positions from BOARD_CONFIG: { from: 3, to: 17, id: 'warp1' }
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
        createPeg('red-peg-2', 'player1', 17), // Blocking warp destination
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot use warp - destination is blocked by your own peg');
    });

    it('should allow move to warp space if destination is empty', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(3); // Lands on warp space
    });

    it('should allow move to warp and capture opponent at destination', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
        createPeg('blue-peg-1', 'player2', 17), // Opponent at warp destination
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(3); // Lands on warp space
      expect(result.capturedPegId).toBe('blue-peg-1'); // Will capture opponent at destination
    });

    it('should block move to second warp space if destination has same player peg', () => {
      // Testing with second warp pair: { from: 10, to: 24, id: 'warp2' }
      const pegs = [
        createPeg('blue-peg-1', 'player2', 8), // Can move to position 10 (warp) with roll of 2
        createPeg('blue-peg-2', 'player2', 24), // Blocking warp destination
      ];

      const result = validatePegMove(pegs[0], 2, 'blue', pegs);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot use warp - destination is blocked by your own peg');
    });

    it('should handle warp validation when landing on "to" position of warp pair', () => {
      // Landing on position 17 (which is the "to" of warp1) should warp to position 3
      const pegs = [
        createPeg('green-peg-1', 'player3', 15), // Can move to position 17 with roll of 2
        createPeg('green-peg-2', 'player3', 3), // Blocking the other end of warp
      ];

      const result = validatePegMove(pegs[0], 2, 'green', pegs);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Cannot use warp - destination is blocked by your own peg');
    });

    it('should not apply warp validation for non-warp spaces', () => {
      const pegs = [
        createPeg('yellow-peg-1', 'player4', 5), // Moving to position 8 (not a warp)
        createPeg('yellow-peg-2', 'player4', 8), // Blocking destination
      ];

      const result = validatePegMove(pegs[0], 3, 'yellow', pegs);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is blocked by your own peg'); // Regular blocking message
    });

    it('should capture opponent on warp space itself before warping', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
        createPeg('blue-peg-1', 'player2', 3), // Opponent ON the warp space
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(3); // Lands on warp space
      expect(result.warpSpaceCapturedPegId).toBe('blue-peg-1'); // Should capture opponent on warp space
      expect(result.capturedPegId).toBeUndefined(); // No capture at destination
    });

    it('should capture opponent at both warp space and destination', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
        createPeg('blue-peg-1', 'player2', 3), // Opponent ON the warp space
        createPeg('green-peg-1', 'player3', 17), // Opponent at warp destination
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(3); // Lands on warp space
      expect(result.warpSpaceCapturedPegId).toBe('blue-peg-1'); // Should capture opponent on warp space
      expect(result.capturedPegId).toBe('green-peg-1'); // Should also capture opponent at destination
    });

    it('should handle warp space capture with second warp pair', () => {
      // Testing with second warp pair: { from: 10, to: 24, id: 'warp2' }
      const pegs = [
        createPeg('blue-peg-1', 'player2', 8), // Can move to position 10 (warp) with roll of 2
        createPeg('red-peg-1', 'player1', 10), // Opponent on the warp space
      ];

      const result = validatePegMove(pegs[0], 2, 'blue', pegs);
      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(10); // Lands on warp space
      expect(result.warpSpaceCapturedPegId).toBe('red-peg-1'); // Should capture opponent on warp space
    });

    it('should block warp if own peg is on warp space', () => {
      const pegs = [
        createPeg('red-peg-1', 'player1', 0), // Can move to position 3 (warp) with roll of 3
        createPeg('red-peg-2', 'player1', 3), // Own peg blocking the warp space
      ];

      const result = validatePegMove(pegs[0], 3, 'red', pegs);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is blocked by your own peg');
    });
  });
});
