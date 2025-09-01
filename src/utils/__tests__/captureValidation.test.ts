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

  describe('START space capture scenarios (Bug Fix)', () => {
    it('should capture opponent on Red START space when Red peg moves from HOME', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', -1, true), // Red peg in HOME
        createTestPeg('green-1', 'player3', 25), // Green peg on Red's START (25)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(25); // Red's START position
      expect(result.capturedPegId).toBe('green-1');
    });

    it('should capture opponent on Blue START space when Blue peg moves from HOME', () => {
      const pegs = [
        createTestPeg('blue-1', 'player2', -1, true), // Blue peg in HOME
        createTestPeg('yellow-1', 'player4', 4), // Yellow peg on Blue's START (4)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'blue', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(4); // Blue's START position
      expect(result.capturedPegId).toBe('yellow-1');
    });

    it('should capture opponent on Green START space when Green peg moves from HOME', () => {
      const pegs = [
        createTestPeg('green-1', 'player3', -1, true), // Green peg in HOME
        createTestPeg('red-1', 'player1', 11), // Red peg on Green's START (11)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'green', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(11); // Green's START position
      expect(result.capturedPegId).toBe('red-1');
    });

    it('should capture opponent on Yellow START space when Yellow peg moves from HOME', () => {
      const pegs = [
        createTestPeg('yellow-1', 'player4', -1, true), // Yellow peg in HOME
        createTestPeg('blue-1', 'player2', 18), // Blue peg on Yellow's START (18)
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'yellow', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(18); // Yellow's START position
      expect(result.capturedPegId).toBe('blue-1');
    });

    it('should handle multiple opponents on different START spaces (Roll of 1 scenario)', () => {
      const pegs = [
        // All players have pegs in HOME
        createTestPeg('red-1', 'player1', -1, true),
        createTestPeg('blue-1', 'player2', -1, true),
        createTestPeg('green-1', 'player3', -1, true),

        // Opponents are on various START spaces
        createTestPeg('yellow-1', 'player4', 25), // On Red's START
        createTestPeg('red-2', 'player1', 4),     // On Blue's START
        createTestPeg('blue-2', 'player2', 11),   // On Green's START
      ];

      // Test Red peg capturing Yellow peg on Red's START
      const redResult = validatePegMove(pegs[0], 6, 'red', pegs);
      expect(redResult.isValid).toBe(true);
      expect(redResult.newPosition).toBe(25);
      expect(redResult.capturedPegId).toBe('yellow-1');

      // Test Blue peg capturing Red peg on Blue's START
      const blueResult = validatePegMove(pegs[1], 6, 'blue', pegs);
      expect(blueResult.isValid).toBe(true);
      expect(blueResult.newPosition).toBe(4);
      expect(blueResult.capturedPegId).toBe('red-2');

      // Test Green peg capturing Blue peg on Green's START
      const greenResult = validatePegMove(pegs[2], 6, 'green', pegs);
      expect(greenResult.isValid).toBe(true);
      expect(greenResult.newPosition).toBe(11);
      expect(greenResult.capturedPegId).toBe('blue-2');
    });

    it('should still be blocked by own peg on START space', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', -1, true), // Red peg in HOME
        createTestPeg('red-2', 'player1', 25), // Own peg on Red's START
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'red', pegs);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('START space is blocked by your own peg');
      expect(result.capturedPegId).toBeUndefined();
    });

    it('should allow movement to empty START space', () => {
      const pegs = [
        createTestPeg('red-1', 'player1', -1, true), // Red peg in HOME
      ];

      const movingPeg = pegs[0];
      const result = validatePegMove(movingPeg, 6, 'red', pegs);

      expect(result.isValid).toBe(true);
      expect(result.newPosition).toBe(25); // Red's START position
      expect(result.capturedPegId).toBeUndefined();
    });
  });
});
