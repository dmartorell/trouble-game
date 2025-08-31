import { checkForCapture, validatePegMove } from '../moveValidation';
import { Peg } from '@/models';

describe('Capture Validation', () => {
  const createTestPeg = (id: string, playerId: string, position: number, isInHome = false, isInFinish = false): Peg => ({
    id,
    playerId,
    position,
    isInHome,
    isInFinish,
  });

  describe('checkForCapture', () => {
    it('should detect opponent peg that can be captured', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', 10), // Opponent at position 10
      ];

      const result = checkForCapture(10, 'player1', pegs);

      expect(result.canCapture).toBe(true);
      expect(result.capturedPegId).toBe('blue-1');
    });

    it('should not capture own pegs', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('red-2', 'player1', 10), // Own peg at position 10
      ];

      const result = checkForCapture(10, 'player1', pegs);

      expect(result.canCapture).toBe(false);
      expect(result.capturedPegId).toBeUndefined();
    });

    it('should not capture pegs in HOME', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', -1, true), // Opponent in HOME
      ];

      const result = checkForCapture(-1, 'player1', pegs);

      expect(result.canCapture).toBe(false);
      expect(result.capturedPegId).toBeUndefined();
    });

    it('should not capture pegs in FINISH', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', 58, false, true), // Opponent in FINISH
      ];

      const result = checkForCapture(58, 'player1', pegs);

      expect(result.canCapture).toBe(false);
      expect(result.capturedPegId).toBeUndefined();
    });

    it('should return false when no peg at destination', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', 15),
      ];

      const result = checkForCapture(10, 'player1', pegs);

      expect(result.canCapture).toBe(false);
      expect(result.capturedPegId).toBeUndefined();
    });
  });

  describe('validatePegMove with capture', () => {
    it('should return capturedPegId when move captures opponent', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', 8), // Opponent 3 spaces ahead
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 3, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(8);
      expect(result.capturedPegId).toBe('blue-1');
    });

    it('should handle capture from HOME to START', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', -1, true), // Red peg in HOME
        createTestPeg('blue-1', 'player2', 25), // Blue peg on Red's START position (25)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(25);
      expect(result.capturedPegId).toBe('blue-1');
    });

    it('should not capture when blocked by own peg', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('red-2', 'player1', 8), // Own peg blocking
        createTestPeg('blue-1', 'player2', 8), // Opponent at same position (shouldn't happen in real game)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 3, 'red', pegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is blocked by your own peg');
      expect(result.capturedPegId).toBeUndefined();
    });

    it('should handle multiple opponents at different positions', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('blue-1', 'player2', 7),
        createTestPeg('green-1', 'player3', 8), // Target position
        createTestPeg('yellow-1', 'player4', 9),
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 3, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(8);
      expect(result.capturedPegId).toBe('green-1'); // Only captures the peg at destination
    });
  });

  describe('capture edge cases', () => {
    it('should handle board wraparound with capture', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 26), // Near end of board
        createTestPeg('blue-1', 'player2', 2), // Opponent at wraparound position
      ];

      const movingPeg = pegs[0];
      // Move 4 spaces: 26 -> 27 -> 0 -> 1 -> 2 (wraparound)
      const result = validatePegMove(movingPeg, 4, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(2);
      expect(result.capturedPegId).toBe('blue-1');
    });

    it('should prioritize blocking over capture', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', 5),
        createTestPeg('red-2', 'player1', 8), // Own peg blocking
        createTestPeg('blue-1', 'player2', 8), // Opponent at same position
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 3, 'red', pegs);

      // Should be blocked by own peg, not capture opponent
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Destination is blocked by your own peg');
    });
  });
});
