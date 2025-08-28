import { create } from 'zustand';
import { GameState, Player, Peg, Turn, GameStore, DieRollCallback } from '@/models';
import { GAME_CONFIG, ANIMATION_DURATION } from '@/constants/game';
import { createPersistMiddleware, PersistApi } from './middleware/persistence';
import { generateDiceRoll, applyStreakBreaker, createDieRollResult } from '@/utils/diceUtils';

export const useGameStore = create<GameStore & PersistApi>(
  createPersistMiddleware<GameStore>(
    (set, get) => ({
      // Initial State
      gameState: 'setup',
      players: [],
      pegs: [],
      currentTurn: null,
      winner: null,
      dieState: {
        lastRoll: null,
        consecutiveRepeats: 0,
        isRolling: false,
        rollCallbacks: [],
      },

      // Actions
      initializeGame: (selectedPlayers: Player[]) => {
        const activePlayers = selectedPlayers.filter(p => p.isActive);

        if (activePlayers.length < GAME_CONFIG.MIN_PLAYERS) {
          console.warn('Not enough players to start game');

          return;
        }

        // Create pegs for all active players
        const pegs: Peg[] = [];

        activePlayers.forEach((player) => {
          for (let i = 0; i < GAME_CONFIG.PEGS_PER_PLAYER; i++) {
            pegs.push({
              id: `${player.id}-peg-${i}`,
              playerId: player.id,
              position: -1, // -1 means in HOME
              isInHome: true,
              isInFinish: false,
            });
          }
        });

        // Set first player's turn
        const firstTurn: Turn = {
          playerId: activePlayers[0].id,
          dieRoll: null,
          movesAvailable: 0,
          extraTurnsRemaining: 0,
          selectedPegId: null,
        };

        set({
          gameState: 'playing',
          players: activePlayers,
          pegs,
          currentTurn: firstTurn,
          winner: null,
        });
      },

      setGameState: (state: GameState) => {
        set({ gameState: state });
      },

      setCurrentTurn: (turn: Turn) => {
        set({ currentTurn: turn });
      },

      rollDie: (): Promise<number> => {
        return new Promise((resolve, reject) => {
          const { dieState, currentTurn } = get();

          // Check if die is already rolling
          if (dieState.isRolling) {
            reject(new Error('Die is already rolling'));

            return;
          }

          // Generate roll with streak breaker logic immediately
          const initialRoll = generateDiceRoll();
          const { result, consecutiveRepeats } = applyStreakBreaker(initialRoll, dieState);

          // Lock the die and immediately return the result for animation
          set({
            dieState: {
              ...dieState,
              isRolling: true,
              // Don't update lastRoll yet - wait for animation to complete
            },
          });

          // Immediately resolve with the result so animation can start
          resolve(result);

          // Schedule state update for after animation completes
          setTimeout(() => {
            const { dieState: currentDieState } = get();

            // Update die state and unlock after animation
            set({
              dieState: {
                ...currentDieState,
                lastRoll: result,
                consecutiveRepeats,
                isRolling: false,
              },
            });

            // Update current turn if exists
            if (currentTurn) {
              set({
                currentTurn: {
                  ...currentTurn,
                  dieRoll: createDieRollResult(result),
                  movesAvailable: result,
                  selectedPegId: null, // Clear selection on new roll
                },
              });
            }

            // Execute all registered callbacks
            currentDieState.rollCallbacks.forEach(callback => callback(result));
          }, ANIMATION_DURATION.dieRoll);
        });
      },

      setDieRolling: (isRolling: boolean) => {
        const { dieState } = get();

        set({
          dieState: {
            ...dieState,
            isRolling,
          },
        });
      },

      registerDieCallback: (callback: DieRollCallback) => {
        const { dieState } = get();

        // Add callback to the list
        set({
          dieState: {
            ...dieState,
            rollCallbacks: [...dieState.rollCallbacks, callback],
          },
        });

        // Return unregister function
        return () => {
          const { dieState: currentDieState } = get();

          set({
            dieState: {
              ...currentDieState,
              rollCallbacks: currentDieState.rollCallbacks.filter(cb => cb !== callback),
            },
          });
        };
      },

      movePeg: (pegId: string, newPosition: number) => {
        const { pegs } = get();

        set({
          pegs: pegs.map(peg => {
            if (peg.id === pegId) {
              const isInFinish = newPosition >= GAME_CONFIG.BOARD_SPACES;
              const finishPosition = isInFinish ? newPosition - GAME_CONFIG.BOARD_SPACES : undefined;

              return {
                ...peg,
                position: newPosition,
                isInHome: newPosition === -1,
                isInFinish,
                finishPosition,
              };
            }

            return peg;
          }),
        });
      },

      selectPeg: (pegId: string | null) => {
        const { currentTurn } = get();

        if (!currentTurn) return;

        set({
          currentTurn: {
            ...currentTurn,
            selectedPegId: pegId,
          },
        });
      },

      endTurn: () => {
        const { players, currentTurn } = get();

        if (!currentTurn) return;

        const currentPlayerIndex = players.findIndex(p => p.id === currentTurn.playerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        const nextPlayer = players[nextPlayerIndex];

        const newTurn: Turn = {
          playerId: nextPlayer.id,
          dieRoll: null,
          movesAvailable: 0,
          extraTurnsRemaining: 0,
          selectedPegId: null,
        };

        set({ currentTurn: newTurn });
      },

      resetGame: () => {
        set({
          gameState: 'setup',
          players: [],
          pegs: [],
          currentTurn: null,
          winner: null,
          dieState: { lastRoll: null, consecutiveRepeats: 0, isRolling: false, rollCallbacks: [] },
        });
      },

      // Getters
      getActivePlayers: () => {
        return get().players.filter(p => p.isActive);
      },

      getCurrentPlayer: () => {
        const { players, currentTurn } = get();

        if (!currentTurn) return null;

        return players.find(p => p.id === currentTurn.playerId) || null;
      },

      getPlayerPegs: (playerId: string) => {
        return get().pegs.filter(peg => peg.playerId === playerId);
      },

      getSelectablePegs: (playerId: string, dieRoll: number) => {
        const { pegs } = get();
        const playerPegs = pegs.filter(peg => peg.playerId === playerId);

        return playerPegs.filter(peg => {
          // Can move from HOME if rolled a 6
          if (peg.isInHome) {
            return dieRoll === 6;
          }

          // Can't move pegs in FINISH (for now - this will be enhanced later)
          if (peg.isInFinish) {
            return false;
          }

          // Normal pegs on the board can always move (for now - collision detection will be added later)
          return true;
        });
      },

      isValidMove: (pegId: string, dieRoll: number) => {
        const { pegs } = get();
        const peg = pegs.find(p => p.id === pegId);

        if (!peg) return false;

        // Can move from HOME only with a 6
        if (peg.isInHome) {
          return dieRoll === 6;
        }

        // Can't move pegs in FINISH (for now)
        if (peg.isInFinish) {
          return false;
        }

        // Normal board pieces can move (basic validation)
        return true;
      },
    }),
    {
      name: 'trouble-game-store',
      partialize: (state) => ({
        gameState: state.gameState,
        players: state.players,
        pegs: state.pegs,
        currentTurn: state.currentTurn,
        winner: state.winner,
        dieState: state.dieState,
      }),
    },
  ),
);
