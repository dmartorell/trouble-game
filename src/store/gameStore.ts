import { create } from 'zustand';
import { GameState, Player, Peg, Turn, GameStore, DieRollCallback, MoveValidationResult } from '@/models';
import { GAME_CONFIG, ANIMATION_DURATION } from '@/constants/game';
import { createPersistMiddleware, PersistApi } from './middleware/persistence';
import { generateDiceRoll, applyStreakBreaker, createDieRollResult } from '@/utils/diceUtils';
import { validatePegMove, getValidMoves, hasValidMoves as checkHasValidMoves } from '@/utils/moveValidation';

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
        const { pegs, players } = get();
        const player = players.find(p => p.id === playerId);

        if (!player) return [];

        const validMoves = getValidMoves(playerId, dieRoll, pegs, player.color);
        const selectablePegIds = validMoves.map(move => move.pegId);

        return pegs.filter(peg => selectablePegIds.includes(peg.id));
      },

      isValidMove: (pegId: string, dieRoll: number) => {
        const { pegs, players } = get();
        const peg = pegs.find(p => p.id === pegId);

        if (!peg) return false;

        const player = players.find(p => p.id === peg.playerId);

        if (!player) return false;

        const validationResult = validatePegMove(peg, dieRoll, player.color, pegs);

        return validationResult.isValid;
      },

      getMoveValidation: (pegId: string, dieRoll: number): MoveValidationResult => {
        const { pegs, players } = get();
        const peg = pegs.find(p => p.id === pegId);

        if (!peg) {
          return {
            isValid: false,
            reason: 'Peg not found',
          };
        }

        const player = players.find(p => p.id === peg.playerId);

        if (!player) {
          return {
            isValid: false,
            reason: 'Player not found',
          };
        }

        return validatePegMove(peg, dieRoll, player.color, pegs);
      },

      hasValidMoves: (playerId: string, dieRoll: number) => {
        const { pegs, players } = get();
        const player = players.find(p => p.id === playerId);

        if (!player) return false;

        return checkHasValidMoves(playerId, dieRoll, pegs, player.color);
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
