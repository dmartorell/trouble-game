import { create } from 'zustand';
import { GameState, Player, Peg, Turn, GameStore, DieRollCallback, MoveValidationResult } from '@/models';
import { GAME_CONFIG, ANIMATION_DURATION, TIMEOUT_CONFIG } from '@/constants/game';
import { createPersistMiddleware, PersistApi } from './middleware/persistence';
import { generateDiceRoll, applyStreakBreaker, createDieRollResult } from '@/utils/diceUtils';
import { validatePegMove, getValidMoves, hasValidMoves as checkHasValidMoves } from '@/utils/moveValidation';
import { useSettingsStore } from './settingsStore';

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
      turnTimer: null,

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
          rollsThisTurn: 0,
          hasMovedSinceRoll: true,
          startTime: 0, // No timer until they roll
        };

        set({
          gameState: 'playing',
          players: activePlayers,
          pegs,
          currentTurn: firstTurn,
          winner: null,
        });

        // Don't start timer - it will start when player rolls die
      },

      setGameState: (state: GameState) => {
        set({ gameState: state });
      },

      setCurrentTurn: (turn: Turn) => {
        set({ currentTurn: turn });
      },

      rollDie: (): Promise<number> => {
        return new Promise((resolve, reject) => {
          const { dieState, currentTurn, resetTurnTimer } = get();

          // Check if die is already rolling
          if (dieState.isRolling) {
            reject(new Error('Die is already rolling'));

            return;
          }

          // Enforce move requirement: Can't roll again without making a move first
          if (currentTurn && currentTurn.rollsThisTurn > 0 && (!currentTurn.hasMovedSinceRoll || currentTurn.extraTurnsRemaining === 0)) {
            reject(new Error('Must make a move before rolling again, or no extra turns remaining'));

            return;
          }

          // Enforce maximum 2 rolls per turn sequence
          if (currentTurn && currentTurn.rollsThisTurn >= 2) {
            reject(new Error('Maximum 2 rolls per turn sequence reached'));

            return;
          }

          // Generate roll with streak breaker logic immediately
          const initialRoll = generateDiceRoll();
          const { result, consecutiveRepeats } = applyStreakBreaker(initialRoll, dieState);

          // Start or reset turn timer since player is taking action
          if (currentTurn && currentTurn.startTime === 0) {
            // First roll of the turn - start timer
            const { startTurnTimer } = get();

            const updatedTurn: Turn = {
              ...currentTurn,
              startTime: Date.now(),
            };

            set({ currentTurn: updatedTurn });
            startTurnTimer();
          } else {
            // Subsequent roll - reset timer
            resetTurnTimer();
          }

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
            const { dieState: currentDieState, currentTurn: latestTurn } = get();

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
            if (latestTurn) {
              const rolledSix = result === 6;
              const newRollCount = latestTurn.rollsThisTurn + 1;

              // Correct TROUBLE rules: Only first 6 grants extra turn
              const isFirstRoll = latestTurn.rollsThisTurn === 0;

              // Calculate extra turns based on correct rules
              let newExtraTurns = latestTurn.extraTurnsRemaining;

              // Consume extra turn if this is a second+ roll
              if (!isFirstRoll) {
                newExtraTurns -= 1;
                console.log(`Player ${latestTurn.playerId} used an extra turn. Remaining: ${newExtraTurns}`);
              }

              // Grant extra turn ONLY on first roll of turn sequence
              if (rolledSix && isFirstRoll) {
                newExtraTurns += 1;
                console.log(`Player ${latestTurn.playerId} rolled 6 on first roll - extra turn granted!`);
              } else if (rolledSix && !isFirstRoll) {
                console.log(`Player ${latestTurn.playerId} rolled 6 on extra turn - no additional extra turn granted`);
              }

              set({
                currentTurn: {
                  ...latestTurn,
                  dieRoll: createDieRollResult(result),
                  movesAvailable: result,
                  selectedPegId: null,
                  extraTurnsRemaining: newExtraTurns,
                  rollsThisTurn: newRollCount,
                  hasMovedSinceRoll: false,
                },
              });

              console.log(`Player ${latestTurn.playerId} roll ${newRollCount}/2, extra turns: ${newExtraTurns}`);
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

      animatePegMove: (pegId: string, targetPosition: number): Promise<void> => {
        return new Promise((resolve) => {
          console.log(`animatePegMove called: pegId=${pegId}, targetPosition=${targetPosition}`);
          const { pegs } = get();
          const peg = pegs.find(p => p.id === pegId);

          if (!peg) {
            console.warn(`Peg not found: ${pegId}`);
            resolve();

            return;
          }

          console.log(`Found peg, current position: ${peg.position}, isInHome: ${peg.isInHome}`);

          // Complete the move after animation
          const handleMoveComplete = () => {
            const { pegs } = get();

            // Update peg position AND clear animation state in a single update
            const isInFinish = targetPosition >= GAME_CONFIG.BOARD_SPACES;
            const finishPosition = isInFinish ? targetPosition - GAME_CONFIG.BOARD_SPACES : undefined;

            set({
              pegs: pegs.map(peg => {
                if (peg.id === pegId) {
                  return {
                    ...peg,
                    position: targetPosition,
                    isInHome: targetPosition === -1,
                    isInFinish,
                    finishPosition,
                    // Clear animation state
                    isAnimating: false,
                    targetPosition: undefined,
                    animationCallback: undefined,
                  };
                }

                return peg;
              }),
            });

            resolve();
          };

          // Mark peg as animating AND store callback in one update
          set({
            pegs: pegs.map(p =>
              p.id === pegId
                ? {
                  ...p,
                  isAnimating: true,
                  targetPosition,
                  animationCallback: handleMoveComplete,
                }
                : p,
            ),
          });

          // Don't resolve immediately - the callback will resolve when animation completes
          console.log('Animation setup complete, waiting for callback...');
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
        const { players, currentTurn, clearTurnTimer } = get();

        if (!currentTurn) return;

        // Check if player has extra turns remaining AND hasn't reached max rolls
        if (currentTurn.extraTurnsRemaining > 0 && currentTurn.rollsThisTurn < 2) {
          // Continue with same player - keep existing timer running
          set({
            currentTurn: {
              ...currentTurn,
              dieRoll: null,
              movesAvailable: 0,
              selectedPegId: null,
              hasMovedSinceRoll: true,
              // Don't reset startTime - keep timer running for extra turn
              timeoutWarning: false, // Clear warning but keep timer
            },
          });

          console.log(`Player ${currentTurn.playerId} continues with ${currentTurn.extraTurnsRemaining} extra turns remaining (roll ${currentTurn.rollsThisTurn}/2)`);

          return;
        }

        // Reset any unused extra turns when turn ends
        if (currentTurn.extraTurnsRemaining > 0) {
          console.log(`Player ${currentTurn.playerId} lost ${currentTurn.extraTurnsRemaining} unused extra turns`);
        }

        // Clear current timer before switching players
        clearTurnTimer();

        // Advance to next player
        const currentPlayerIndex = players.findIndex(p => p.id === currentTurn.playerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        const nextPlayer = players[nextPlayerIndex];

        const newTurn: Turn = {
          playerId: nextPlayer.id,
          dieRoll: null,
          movesAvailable: 0,
          extraTurnsRemaining: 0,
          selectedPegId: null,
          rollsThisTurn: 0,
          hasMovedSinceRoll: true,
          startTime: 0, // No timer until they roll
        };

        set({ currentTurn: newTurn });

        // Don't start timer - it will start when player rolls die

        console.log(`Turn switched from ${currentTurn.playerId} to ${nextPlayer.id}`);
      },

      // Enhanced method to check if turn should end after a move
      checkTurnEnd: () => {
        const { currentTurn, hasValidMoves } = get();

        if (!currentTurn || !currentTurn.dieRoll) return false;

        // If no moves available after using the die roll, check if turn should end
        if (currentTurn.movesAvailable <= 0) {
          // Check if player has reached maximum rolls (2) for turn sequence
          if (currentTurn.rollsThisTurn >= 2) {
            console.log(`Player ${currentTurn.playerId} has reached maximum rolls (2) for this turn`);

            return true;
          }

          // If player has extra turns remaining, don't end turn yet
          if (currentTurn.extraTurnsRemaining > 0) {
            console.log(`Player ${currentTurn.playerId} has ${currentTurn.extraTurnsRemaining} extra turns remaining`);

            return false;
          }

          // No extra turns remaining, end the turn
          return true;
        }

        // Check if player has any valid moves remaining
        if (!hasValidMoves(currentTurn.playerId, currentTurn.movesAvailable)) {
          console.log(`No valid moves remaining for player ${currentTurn.playerId}`);

          return true;
        }

        return false;
      },

      // Enhanced method to execute a peg move and handle turn logic
      executePegMove: async (pegId: string, targetPosition: number) => {
        const { currentTurn, getMoveValidation, animatePegMove, checkTurnEnd, endTurn } = get();

        if (!currentTurn || !currentTurn.dieRoll) {
          console.warn('Cannot execute move: No current turn or die roll');

          return false;
        }

        // Validate the move
        const validation = getMoveValidation(pegId, currentTurn.dieRoll.value);

        if (!validation.isValid) {
          console.warn('Invalid move:', validation.reason);

          return false;
        }

        try {
          // Animate the move
          await animatePegMove(pegId, targetPosition);

          // Decrement moves available and mark that a move was made
          const newMovesAvailable = currentTurn.movesAvailable - currentTurn.dieRoll.value;

          // If moves are exhausted but player has extra turns, prepare for next roll
          const shouldPrepareForNextRoll = newMovesAvailable <= 0 && currentTurn.extraTurnsRemaining > 0;

          set({
            currentTurn: {
              ...currentTurn,
              movesAvailable: newMovesAvailable,
              selectedPegId: null,
              hasMovedSinceRoll: true,
              // If preparing for next roll, clear the die roll to force a new roll
              dieRoll: shouldPrepareForNextRoll ? null : currentTurn.dieRoll,
            },
          });

          console.log(`Peg ${pegId} moved to position ${targetPosition}`);

          if (shouldPrepareForNextRoll) {
            console.log(`Player ${currentTurn.playerId} has extra turns remaining. Cleared die roll for next roll.`);
          }

          // Check if turn should end
          if (checkTurnEnd()) {
            endTurn();
          }

          return true;
        } catch (error) {
          console.error('Error executing peg move:', error);

          return false;
        }
      },

      startTurnTimer: () => {
        const { currentTurn, clearTurnTimer } = get();

        if (!currentTurn) return;

        // Clear any existing timer
        clearTurnTimer();

        // Get timeout setting from settings store
        const { settings } = useSettingsStore.getState();
        const timeoutDuration = settings.turnTimeout * 1000; // Convert to milliseconds
        const warningThreshold = TIMEOUT_CONFIG.WARNING_THRESHOLD * 1000;

        // Set warning timer
        setTimeout(() => {
          const { currentTurn: latestTurn } = get();

          if (latestTurn && latestTurn.playerId === currentTurn.playerId) {
            set({
              currentTurn: {
                ...latestTurn,
                timeoutWarning: true,
              },
            });
          }
        }, timeoutDuration - warningThreshold);

        // Set main timeout timer
        const mainTimer = setTimeout(() => {
          const { handleTurnTimeout } = get();

          handleTurnTimeout();
        }, timeoutDuration);

        // Store the main timer (we don't need to track warning timer separately)
        set({ turnTimer: mainTimer });
      },

      clearTurnTimer: () => {
        const { turnTimer } = get();

        if (turnTimer) {
          clearTimeout(turnTimer);
          set({ turnTimer: null });
        }
      },

      resetTurnTimer: () => {
        const { currentTurn } = get();

        if (!currentTurn) return;

        // Update turn start time and clear warning
        set({
          currentTurn: {
            ...currentTurn,
            startTime: Date.now(),
            timeoutWarning: false,
          },
        });

        // Restart the timer
        const { startTurnTimer } = get();

        startTurnTimer();
      },

      handleTurnTimeout: () => {
        const { currentTurn, endTurn, clearTurnTimer } = get();

        if (!currentTurn) return;

        console.log(`Turn timeout for player ${currentTurn.playerId} - auto-passing turn`);

        // Clear the timer
        clearTurnTimer();

        // End the turn
        endTurn();
      },

      resetGame: () => {
        const { clearTurnTimer } = get();

        // Clear any active timer
        clearTurnTimer();

        set({
          gameState: 'setup',
          players: [],
          pegs: [],
          currentTurn: null,
          winner: null,
          dieState: { lastRoll: null, consecutiveRepeats: 0, isRolling: false, rollCallbacks: [] },
          turnTimer: null,
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

      getRemainingTurnTime: () => {
        const { currentTurn } = get();

        if (!currentTurn || currentTurn.startTime === 0) return 0; // No timer if not started

        const { settings } = useSettingsStore.getState();
        const timeoutDuration = settings.turnTimeout * 1000; // Convert to milliseconds
        const elapsed = Date.now() - currentTurn.startTime;
        const remaining = Math.max(0, timeoutDuration - elapsed);

        return Math.ceil(remaining / 1000); // Return in seconds
      },

      shouldShowTimeoutWarning: () => {
        const { currentTurn } = get();

        if (!currentTurn || currentTurn.startTime === 0) return false;

        return currentTurn.timeoutWarning === true;
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
