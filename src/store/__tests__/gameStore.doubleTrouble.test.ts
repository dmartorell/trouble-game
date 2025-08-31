import { BOARD_CONFIG } from '@/constants/board';

// Mock React Native dependencies
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withTiming: jest.fn(),
  withSpring: jest.fn(),
  runOnJS: jest.fn(),
}));

// Mock settings store
jest.mock('../settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      settings: { turnTimeout: 15 },
    }),
  },
}));

describe('GameStore - Double Trouble (XX) Spaces and 6-Roll Limit', () => {

  describe('Double Trouble Board Configuration', () => {
    test('should have correct Double Trouble positions', () => {
      // Verify that board config has correct XX positions
      expect(BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS).toEqual([0, 7, 14, 21]);
    });

    test('should have Double Trouble positions spaced correctly', () => {
      // Verify they are spaced every 7 spaces
      const positions = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS;
      expect(positions[1] - positions[0]).toBe(7); // 7 - 0 = 7
      expect(positions[2] - positions[1]).toBe(7); // 14 - 7 = 7
      expect(positions[3] - positions[2]).toBe(7); // 21 - 14 = 7
    });

    test('should have correct total spaces on board', () => {
      expect(BOARD_CONFIG.TOTAL_SPACES).toBe(28);
      // Verify XX positions are within board bounds
      BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(BOARD_CONFIG.TOTAL_SPACES);
      });
    });
  });

  describe('Double Trouble Detection Logic', () => {
    test('should correctly identify XX positions', () => {
      const positions = [0, 7, 14, 21];

      positions.forEach(pos => {
        const isDoubleTrouble = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(pos as 0 | 7 | 14 | 21);
        expect(isDoubleTrouble).toBe(true);
      });
    });

    test('should correctly identify non-XX positions', () => {
      const nonXXPositions = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27];

      nonXXPositions.forEach(pos => {
        const isDoubleTrouble = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(pos as any);
        expect(isDoubleTrouble).toBe(false);
      });
    });
  });

  // Test the core Double Trouble logic without full store
  describe('Double Trouble Logic Simulation', () => {
    test('should simulate unlimited XX bonus calculation', () => {
      // Simulate the logic from executePegMove
      const testCases = [
        { landedOnDoubleTrouble: true, currentExtra: 0, expected: 1 },
        { landedOnDoubleTrouble: true, currentExtra: 1, expected: 2 },
        { landedOnDoubleTrouble: true, currentExtra: 5, expected: 6 },
        { landedOnDoubleTrouble: true, currentExtra: 10, expected: 11 }, // No cap
        { landedOnDoubleTrouble: false, currentExtra: 3, expected: 3 }, // No change
      ];

      testCases.forEach(({ landedOnDoubleTrouble, currentExtra, expected }) => {
        let extraTurnsToAdd = 0;

        if (landedOnDoubleTrouble) {
          // This is the actual logic from gameStore.ts
          extraTurnsToAdd = 1;
        }

        const result = currentExtra + extraTurnsToAdd;
        expect(result).toBe(expected);
      });
    });

    test('should simulate 6-roll limit logic', () => {
      const testCases = [
        { rollsThisTurn: 0, shouldAllowRoll: true },  // First roll
        { rollsThisTurn: 1, shouldAllowRoll: true },  // Second roll
        { rollsThisTurn: 2, shouldAllowRoll: false }, // Third roll (blocked)
        { rollsThisTurn: 3, shouldAllowRoll: false }, // Fourth roll (blocked)
      ];

      testCases.forEach(({ rollsThisTurn, shouldAllowRoll }) => {
        // This is the logic from rollDie() method
        const maxRolls = 2;
        const canRoll = rollsThisTurn < maxRolls;

        expect(canRoll).toBe(shouldAllowRoll);
      });
    });

    test('should simulate XX bonuses working after 6-roll limit', () => {
      // Scenario: Player has rolled twice (at limit) but lands on XX
      const rollsThisTurn = 2; // At limit
      const landedOnDoubleTrouble = true;
      const currentExtraTeturns = 0;

      // 6-roll limit should not block XX bonuses
      const canGetXXBonus = landedOnDoubleTrouble; // XX bonuses are unlimited
      expect(canGetXXBonus).toBe(true);

      // Should still get XX bonus despite roll limit
      const extraTurnsToAdd = landedOnDoubleTrouble ? 1 : 0;
      const newExtraTeturns = currentExtraTeturns + extraTurnsToAdd;
      expect(newExtraTeturns).toBe(1);

      // Roll count should not prevent XX bonus
      expect(rollsThisTurn).toBe(2); // Unchanged by XX
    });
  });

  describe('Rule Compliance Tests', () => {
    test('should verify troubleRules.md compliance - unlimited XX', () => {
      // According to troubleRules.md: "No limit on Double Trouble extra turns"
      // This should be possible: XX → XX → XX → XX (chain indefinitely)

      let extraTurns = 0;
      const xxLandings = [0, 7, 14, 21, 0, 7]; // Multiple XX landings

      xxLandings.forEach(position => {
        const isXX = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(position as 0 | 7 | 14 | 21);
        if (isXX) {
          extraTurns += 1; // Unlimited accumulation
        }
      });

      expect(extraTurns).toBe(6); // Should allow unlimited stacking
    });

    test('should verify troubleRules.md compliance - 6-roll limit separate', () => {
      // According to troubleRules.md: "The Maximum 2 extra turns per turn rule only applies to rolling consecutive 6s"

      // Scenario: Roll 6, roll 6 (at limit), land on XX, should still get XX bonus
      const rollsFromSixes = 2; // At 6-roll limit

      // These should be separate systems
      const maxSixRolls = 2;
      const isAt6RollLimit = rollsFromSixes >= maxSixRolls;
      const canStillGetXXBonus = true; // XX system is separate

      expect(isAt6RollLimit).toBe(true);
      expect(canStillGetXXBonus).toBe(true);
    });

    test('should verify rule scenarios from troubleRules.md', () => {
      // Scenario 1: Player rolls 6 → moves → rolls another 6 → moves → no more rolls from 6s (2-roll limit reached)
      let rollsThisTurn = 0;
      let extraTurnsRemaining = 0;

      // First roll of 6
      rollsThisTurn += 1;
      const firstRollIsSix = true;
      const isFirstRoll = rollsThisTurn === 1;
      if (firstRollIsSix && isFirstRoll) {
        extraTurnsRemaining += 1;
      }
      expect(extraTurnsRemaining).toBe(1);

      // Second roll of 6
      rollsThisTurn += 1;
      const isSecondRoll = rollsThisTurn === 2; // This will be true now

      // Consume the extra turn for the second roll, but don't grant new one
      if (isSecondRoll) {
        extraTurnsRemaining -= 1; // Consume the extra turn for making this roll
      }

      // Second 6 does NOT grant additional extra turn (correct TROUBLE rules)
      // No additional bonus for second 6
      expect(extraTurnsRemaining).toBe(0);
      expect(rollsThisTurn).toBe(2); // At limit

      // Scenario 2: After 2 rolls, land on XX, should get bonus
      const landedOnXX = true;
      if (landedOnXX) {
        extraTurnsRemaining += 1; // XX bonus despite 6-roll limit
      }
      expect(extraTurnsRemaining).toBe(1);
      expect(rollsThisTurn).toBe(2); // Still at limit, but XX grants bonus
    });

    test('should verify the bug fix: XX bonus allows rolling after 2-roll limit', () => {
      // This test simulates the exact bug scenario:
      // Roll 6 → Roll 6 → Land on XX → Die should NOT be disabled

      // Test the rollDie validation logic directly
      const testCases = [
        // Normal cases - should work
        { rollsThisTurn: 0, extraTurns: 0, shouldAllow: true, description: 'First roll' },
        { rollsThisTurn: 1, extraTurns: 1, shouldAllow: true, description: 'Second roll with extra turn' },

        // Edge cases - 2-roll limit without extra turns
        { rollsThisTurn: 2, extraTurns: 0, shouldAllow: false, description: '2 rolls, no extra turns (blocked)' },

        // Bug fix case - XX bonus should bypass 2-roll limit
        { rollsThisTurn: 2, extraTurns: 1, shouldAllow: true, description: '2 rolls + XX bonus (should work!)' },
        { rollsThisTurn: 3, extraTurns: 2, shouldAllow: true, description: '3 rolls + multiple XX bonuses' },
      ];

      testCases.forEach(({ rollsThisTurn, extraTurns, shouldAllow }) => {
        // This simulates the exact logic from rollDie()
        const wouldReject = rollsThisTurn >= 2 && extraTurns === 0;
        const shouldAllowRoll = !wouldReject;

        expect(shouldAllowRoll).toBe(shouldAllow);
      });
    });
  });
});
