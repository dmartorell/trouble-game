// Basic test setup without React Native Testing Library for now

// Mock React Native modules that aren't available in test environment
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock haptic patterns utility
jest.mock('@/utils/hapticPatterns', () => ({
  HapticPatterns: {
    selection: jest.fn().mockResolvedValue(undefined),
    movement: jest.fn().mockResolvedValue(undefined),
    capture: jest.fn().mockResolvedValue(undefined),
    warp: jest.fn().mockResolvedValue(undefined),
    doubleTrouble: jest.fn().mockResolvedValue(undefined),
    victory: jest.fn().mockResolvedValue(undefined),
    diePress: jest.fn().mockResolvedValue(undefined),
    dieTumble: jest.fn().mockResolvedValue(undefined),
    dieLanding: jest.fn().mockResolvedValue(undefined),
  },
  triggerHapticPattern: jest.fn().mockResolvedValue(undefined),
  getHapticPatternDescription: jest.fn().mockReturnValue('Mock description'),
  getAvailableHapticPatterns: jest.fn().mockReturnValue([]),
}));

// Mock React Native MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
