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
      const result = calculateDestinationPosition(peg, 6, 'red');

      expect(result).toBe(25); // Red player starts at position 25
    });

    it('should not allow move from HOME with roll other than 6', () => {
      const peg = createPeg('red-peg-1', 'player1', -1, true);
      const result = calculateDestinationPosition(peg, 4, 'red');

      expect(result).toBe(-2); // Invalid
    });

    it('should calculate normal board movement', () => {
      const peg = createPeg('red-peg-1', 'player1', 5);
      const result = calculateDestinationPosition(peg, 3, 'red');

      expect(result).toBe(8);
    });

    it('should wrap around board correctly', () => {
      const peg = createPeg('red-peg-1', 'player1', 26);
      const result = calculateDestinationPosition(peg, 4, 'red');

      expect(result).toBe(2); // (26 + 4) % 28 = 2
    });

    it('should move within FINISH area', () => {
      const peg = createPeg('red-peg-1', 'player1', 56, false, true, 0); // 56 = BOARD_SPACES + 0
      const result = calculateDestinationPosition(peg, 2, 'red');

      expect(result).toBe(58); // 56 + 2
    });

    it('should reject move that exceeds FINISH area', () => {
      const peg = createPeg('red-peg-1', 'player1', 59, false, true, 3); // At last FINISH space
      const result = calculateDestinationPosition(peg, 2, 'red');

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
      expect(result.reason).toBe('Move would exceed available spaces');
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
      const result = calculateDestinationPosition(peg, 3, 'red');
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
});
