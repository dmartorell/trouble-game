import { DieState } from '@/models';

/**
 * Generates a random dice roll (1-6)
 */
export const generateDiceRoll = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Applies streak breaker logic to prevent excessive consecutive rolls
 * @param initialRoll - The initial random roll
 * @param dieState - Current die state with last roll and streak info
 * @returns Object with final result and updated streak count
 */
export const applyStreakBreaker = (
  initialRoll: number,
  dieState: DieState,
): { result: number; consecutiveRepeats: number } => {
  // If different number, reset streak
  if (initialRoll !== dieState.lastRoll) {
    return {
      result: initialRoll,
      consecutiveRepeats: 0,
    };
  }

  // Same number - calculate reroll chance
  const newRepeats = dieState.consecutiveRepeats + 1;
  const rerollChance = Math.min(0.7, 0.4 + (newRepeats - 1) * 0.3);

  // Decide whether to reroll
  if (Math.random() < rerollChance) {
    // Reroll to a different number
    const otherNumbers = [1, 2, 3, 4, 5, 6].filter(n => n !== dieState.lastRoll);
    const rerolledResult = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];

    return {
      result: rerolledResult,
      consecutiveRepeats: 0, // Reset streak after reroll
    };
  }

  // Allow the repeat
  return {
    result: initialRoll,
    consecutiveRepeats: newRepeats,
  };
};

/**
 * Creates die roll result object with timestamp
 */
export const createDieRollResult = (value: number) => ({
  value,
  timestamp: Date.now(),
});
