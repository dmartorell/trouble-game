import {
  calculateAnimationPath,
  getEasingFunction,
  calculateMoveDuration,
} from '../animationPaths';

// Mock the board constants
jest.mock('@/constants/board', () => ({
  getSpacePosition: (index: number) => {
    // Mock circular positions for testing
    const centerX = 200;
    const centerY = 200;
    const radius = 130;
    const angle = (index / 28) * Math.PI * 2 - Math.PI / 2;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      index,
    };
  },
}));

describe('animationPaths', () => {
  describe('calculateAnimationPath', () => {
    it('should create path for simple forward movement', () => {
      const path = calculateAnimationPath(0, 3, 4);

      expect(path).toHaveLength(5); // 0 to segments inclusive
      expect(path[0].progress).toBe(0);
      expect(path[4].progress).toBe(1);
    });

    it('should handle HOME to track movement', () => {
      const path = calculateAnimationPath(-1, 0);

      expect(path).toHaveLength(1);
      expect(path[0].progress).toBe(1);
    });

    it('should handle wraparound movement', () => {
      const path = calculateAnimationPath(26, 2, 10);

      expect(path.length).toBeGreaterThan(0);
      expect(path[0].progress).toBe(0);
      expect(path[path.length - 1].progress).toBe(1);
    });
  });

  describe('getEasingFunction', () => {
    it('should return correct easing functions', () => {
      const easeOut = getEasingFunction('easeOut');
      const easeInOut = getEasingFunction('easeInOut');
      const linear = getEasingFunction('linear');

      // Test that functions return expected values
      expect(linear(0.5)).toBe(0.5);
      expect(easeOut(0)).toBe(0);
      expect(easeOut(1)).toBe(1);
      expect(easeInOut(0)).toBe(0);
      expect(easeInOut(1)).toBe(1);
    });
  });

  describe('calculateMoveDuration', () => {
    it('should calculate duration based on distance', () => {
      expect(calculateMoveDuration(1)).toBe(350); // 300 + 1*50
      expect(calculateMoveDuration(3)).toBe(450); // 300 + 3*50
      expect(calculateMoveDuration(0)).toBe(300); // minimum
    });

    it('should respect custom base speed', () => {
      expect(calculateMoveDuration(2, 500)).toBe(600); // 500 + 2*50
    });
  });
});
