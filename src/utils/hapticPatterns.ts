import * as Haptics from 'expo-haptics';

/**
 * Comprehensive haptic feedback patterns for Trouble Game
 * Provides structured haptic patterns for different game events
 */

export interface HapticConfig {
  enabled: boolean;
}

/**
 * Individual haptic impact definition
 */
export interface HapticImpact {
  type: 'impact';
  style: Haptics.ImpactFeedbackStyle;
  delay: number;
}

/**
 * Single impact pattern
 */
export interface SingleImpactPattern {
  type: 'impact';
  style: Haptics.ImpactFeedbackStyle;
  description: string;
}

/**
 * Sequence of impacts pattern
 */
export interface SequencePattern {
  type: 'sequence';
  pattern: HapticImpact[];
  description: string;
}

/**
 * Union type for all pattern definitions
 */
export type HapticPatternDefinition = SingleImpactPattern | SequencePattern;

/**
 * Enhanced haptic pattern types beyond basic Expo Haptics
 */
export type HapticPatternType =
  | 'selection'
  | 'movement'
  | 'capture'
  | 'warp'
  | 'doubleTrouble'
  | 'victory'
  | 'diePress'
  | 'dieTumble'
  | 'dieLanding';

/**
 * Haptic pattern definitions with timing and intensity
 */
const HAPTIC_PATTERNS: Record<HapticPatternType, HapticPatternDefinition> = {
  // Basic interactions
  selection: {
    type: 'impact' as const,
    style: Haptics.ImpactFeedbackStyle.Light,
    description: 'Light tap for peg selection',
  },

  // Movement patterns
  movement: {
    type: 'sequence' as const,
    pattern: [
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 0 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 150 },
    ],
    description: 'Double tap for peg movement',
  },

  // Capture patterns - more dramatic
  capture: {
    type: 'sequence' as const,
    pattern: [
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 0 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 100 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 200 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 300 },
    ],
    description: 'Dramatic sequence for capturing opponent',
  },

  // Warp teleportation - mystical feeling
  warp: {
    type: 'sequence' as const,
    pattern: [
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 0 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 100 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 200 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 400 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 500 },
    ],
    description: 'Dissolve and materialize pattern for warp teleportation',
  },

  // Double Trouble - excitement burst
  doubleTrouble: {
    type: 'sequence' as const,
    pattern: [
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 0 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 80 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 160 },
    ],
    description: 'Triple burst for landing on Double Trouble space',
  },

  // Victory celebration - triumphant pattern
  victory: {
    type: 'sequence' as const,
    pattern: [
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 0 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 100 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 200 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 300 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Medium, delay: 400 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Heavy, delay: 500 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 600 },
      { type: 'impact', style: Haptics.ImpactFeedbackStyle.Light, delay: 700 },
    ],
    description: 'Celebratory burst pattern for victory',
  },

  // Die interactions (existing patterns, kept for consistency)
  diePress: {
    type: 'impact' as const,
    style: Haptics.ImpactFeedbackStyle.Medium,
    description: 'Pop sensation for die press',
  },

  dieTumble: {
    type: 'impact' as const,
    style: Haptics.ImpactFeedbackStyle.Light,
    description: 'Light tumble during die roll',
  },

  dieLanding: {
    type: 'impact' as const,
    style: Haptics.ImpactFeedbackStyle.Heavy,
    description: 'Strong impact for die landing',
  },
};

/**
 * Execute a single haptic impact
 */
async function executeHapticImpact(
  style: Haptics.ImpactFeedbackStyle,
  delay: number = 0,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      Haptics.impactAsync(style).catch((error) => {
        // Haptic feedback failed - continue silently
        console.warn('Haptic feedback failed:', error);
      }).finally(() => {
        resolve();
      });
    }, delay);
  });
}

/**
 * Execute a sequence of haptic impacts
 */
async function executeHapticSequence(
  pattern: HapticImpact[],
): Promise<void> {
  const promises = pattern.map(({ style, delay }) =>
    executeHapticImpact(style, delay),
  );

  // Execute all impacts according to their delays
  await Promise.all(promises);
}

/**
 * Main haptic feedback function
 * @param patternType The type of haptic pattern to execute
 * @param config Haptic configuration (enabled/disabled)
 */
export async function triggerHapticPattern(
  patternType: HapticPatternType,
  config: HapticConfig,
): Promise<void> {
  // Check if haptics are enabled
  if (!config.enabled) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[patternType];

  if (!pattern) {
    console.warn(`Unknown haptic pattern: ${patternType}`);

    return;
  }

  try {
    if (pattern.type === 'impact') {
      await executeHapticImpact(pattern.style);
    } else if (pattern.type === 'sequence') {
      await executeHapticSequence(pattern.pattern);
    }
  } catch (error) {
    console.warn(`Failed to execute haptic pattern ${patternType}:`, error);
  }
}

/**
 * Convenience functions for common haptic patterns
 */
export const HapticPatterns = {
  /**
   * Light tap feedback for selections
   */
  selection: (config: HapticConfig) => triggerHapticPattern('selection', config),

  /**
   * Movement feedback for peg animations
   */
  movement: (config: HapticConfig) => triggerHapticPattern('movement', config),

  /**
   * Dramatic feedback for capturing opponents
   */
  capture: (config: HapticConfig) => triggerHapticPattern('capture', config),

  /**
   * Mystical feedback for warp teleportation
   */
  warp: (config: HapticConfig) => triggerHapticPattern('warp', config),

  /**
   * Excitement burst for Double Trouble spaces
   */
  doubleTrouble: (config: HapticConfig) => triggerHapticPattern('doubleTrouble', config),

  /**
   * Triumphant pattern for victory
   */
  victory: (config: HapticConfig) => triggerHapticPattern('victory', config),

  /**
   * Die interaction patterns (existing)
   */
  diePress: (config: HapticConfig) => triggerHapticPattern('diePress', config),
  dieTumble: (config: HapticConfig) => triggerHapticPattern('dieTumble', config),
  dieLanding: (config: HapticConfig) => triggerHapticPattern('dieLanding', config),
};

/**
 * Get haptic pattern description for debugging
 */
export function getHapticPatternDescription(patternType: HapticPatternType): string {
  const pattern = HAPTIC_PATTERNS[patternType];

  return pattern?.description || 'Unknown pattern';
}

/**
 * List all available haptic patterns
 */
export function getAvailableHapticPatterns(): HapticPatternType[] {
  return Object.keys(HAPTIC_PATTERNS) as HapticPatternType[];
}

