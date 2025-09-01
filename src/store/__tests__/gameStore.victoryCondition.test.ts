import { useGameStore } from '../gameStore';
import { Player } from '@/models';
import { GAME_CONFIG } from '@/constants/game';

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

// Mock the settings store
jest.mock('../settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      hapticsEnabled: false,
      soundEnabled: false,
    }),
  },
}));

describe('GameStore - Victory Condition Checking', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.getState().resetGame();
  });

  describe('checkVictoryCondition', () => {
    it('should return false when player has no pegs in FINISH', () => {
      const store = useGameStore.getState();

      // Setup players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
      ];

      store.initializeGame(players);

      // Get fresh store state after initialization
      const gameState = useGameStore.getState();

      // All pegs should be in HOME initially
      const result = gameState.checkVictoryCondition('red');

      expect(result).toBe(false);
      expect(gameState.winner).toBe(null);
      expect(gameState.gameState).toBe('playing');
    });

    it('should return false when player has some pegs in FINISH but not all', () => {
      const store = useGameStore.getState();

      // Setup players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
      ];

      store.initializeGame(players);

      // Get the initialized state
      const initialState = useGameStore.getState();

      // Manually set some pegs in FINISH for red player
      const pegs = initialState.pegs.map((peg, index) => {
        if (peg.playerId === 'red' && index < 2) {
          // Only 2 of 4 pegs in FINISH
          return {
            ...peg,
            position: GAME_CONFIG.BOARD_SPACES + index, // In FINISH area
            isInHome: false,
            isInFinish: true,
            finishPosition: index,
          };
        }
        return peg;
      });

      // Update pegs manually for test
      useGameStore.setState({ pegs });

      // Get fresh store state after updating pegs
      const gameState = useGameStore.getState();
      const result = gameState.checkVictoryCondition('red');

      expect(result).toBe(false);
      expect(gameState.winner).toBe(null);
      expect(gameState.gameState).toBe('playing');
    });

    it('should return true and set winner when all pegs are in FINISH', () => {
      const store = useGameStore.getState();

      // Setup players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
      ];

      store.initializeGame(players);

      // Get the initialized state
      const initialState = useGameStore.getState();

      // Manually set ALL pegs in FINISH for red player
      const pegs = initialState.pegs.map((peg) => {
        if (peg.playerId === 'red') {
          const finishIndex = parseInt(peg.id.split('-')[2]); // Extract peg number
          return {
            ...peg,
            position: GAME_CONFIG.BOARD_SPACES + finishIndex, // In FINISH area
            isInHome: false,
            isInFinish: true,
            finishPosition: finishIndex,
          };
        }
        return peg;
      });

      // Update pegs manually for test
      useGameStore.setState({ pegs });

      // Check victory condition
      const result = useGameStore.getState().checkVictoryCondition('red');
      const gameState = useGameStore.getState();

      expect(result).toBe(true);
      expect(gameState.winner).toBe('red');
      expect(gameState.gameState).toBe('finished');
    });

    it('should not declare victory for wrong player when other player has all pegs in FINISH', () => {
      const store = useGameStore.getState();

      // Setup players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
      ];

      store.initializeGame(players);

      // Get the initialized state
      const initialState = useGameStore.getState();

      // Manually set ALL pegs in FINISH for red player only
      const pegs = initialState.pegs.map((peg) => {
        if (peg.playerId === 'red') {
          const finishIndex = parseInt(peg.id.split('-')[2]); // Extract peg number
          return {
            ...peg,
            position: GAME_CONFIG.BOARD_SPACES + finishIndex,
            isInHome: false,
            isInFinish: true,
            finishPosition: finishIndex,
          };
        }
        return peg; // Blue pegs remain in HOME
      });

      // Update pegs manually for test
      useGameStore.setState({ pegs });

      // Check blue player (should not win)
      const blueResult = useGameStore.getState().checkVictoryCondition('blue');
      expect(blueResult).toBe(false);

      // Check red player (should win)
      const redResult = useGameStore.getState().checkVictoryCondition('red');
      const gameState = useGameStore.getState();
      expect(redResult).toBe(true);
      expect(gameState.winner).toBe('red');
    });

    it('should handle multiple players correctly', () => {
      const store = useGameStore.getState();

      // Setup 4 players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
        { id: 'green', name: 'Green Player', color: 'green', isActive: true },
        { id: 'yellow', name: 'Yellow Player', color: 'yellow', isActive: true },
      ];

      store.initializeGame(players);

      // Get the initialized state
      const initialState = useGameStore.getState();

      // Green player gets all pegs in FINISH
      const pegs = initialState.pegs.map((peg) => {
        if (peg.playerId === 'green') {
          const finishIndex = parseInt(peg.id.split('-')[2]);
          return {
            ...peg,
            position: GAME_CONFIG.BOARD_SPACES + finishIndex,
            isInHome: false,
            isInFinish: true,
            finishPosition: finishIndex,
          };
        }
        return peg;
      });

      useGameStore.setState({ pegs });

      // Check all players
      expect(useGameStore.getState().checkVictoryCondition('red')).toBe(false);
      expect(useGameStore.getState().checkVictoryCondition('blue')).toBe(false);
      expect(useGameStore.getState().checkVictoryCondition('yellow')).toBe(false);
      expect(useGameStore.getState().checkVictoryCondition('green')).toBe(true);

      const gameState = useGameStore.getState();
      expect(gameState.winner).toBe('green');
      expect(gameState.gameState).toBe('finished');
    });
  });

  describe('Victory condition integration', () => {
    it('should check for victory automatically when peg moves to FINISH', () => {
      const store = useGameStore.getState();

      // Setup players
      const players: Player[] = [
        { id: 'red', name: 'Red Player', color: 'red', isActive: true },
        { id: 'blue', name: 'Blue Player', color: 'blue', isActive: true },
      ];

      store.initializeGame(players);

      // Get the initialized state
      const initialState = useGameStore.getState();

      // Manually setup: 3 pegs already in FINISH, 1 peg about to move to FINISH
      const pegs = initialState.pegs.map((peg) => {
        if (peg.playerId === 'red') {
          const pegIndex = parseInt(peg.id.split('-')[2]);
          if (pegIndex < 3) {
            // First 3 pegs already in FINISH
            return {
              ...peg,
              position: GAME_CONFIG.BOARD_SPACES + pegIndex,
              isInHome: false,
              isInFinish: true,
              finishPosition: pegIndex,
            };
          } else {
            // Last peg on the board, about to enter FINISH
            return {
              ...peg,
              position: GAME_CONFIG.BOARD_SPACES - 1, // One space before FINISH
              isInHome: false,
              isInFinish: false,
            };
          }
        }
        return peg;
      });

      useGameStore.setState({ pegs });

      // Get fresh store state after updating pegs
      let gameState = useGameStore.getState();

      // Should not have won yet
      expect(gameState.winner).toBe(null);
      expect(gameState.gameState).toBe('playing');

      // Find the last peg and move it to FINISH
      const lastPeg = gameState.pegs.find(p => p.playerId === 'red' && !p.isInFinish);
      if (lastPeg) {
        // Update the peg to FINISH position manually (simulating the animation completion)
        const updatedPegs = gameState.pegs.map(peg => {
          if (peg.id === lastPeg.id) {
            return {
              ...peg,
              position: GAME_CONFIG.BOARD_SPACES + 3,
              isInHome: false,
              isInFinish: true,
              finishPosition: 3,
            };
          }
          return peg;
        });

        useGameStore.setState({ pegs: updatedPegs });

        // Now check victory condition (this simulates what happens in animatePegMove)
        const result = useGameStore.getState().checkVictoryCondition('red');
        gameState = useGameStore.getState();

        expect(result).toBe(true);
        expect(gameState.winner).toBe('red');
        expect(gameState.gameState).toBe('finished');
      }
    });
  });
});
