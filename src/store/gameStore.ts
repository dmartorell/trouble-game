import { create } from 'zustand';
import { GameState, Player, Peg, Turn, GameStore, DieRollCallback, MoveValidationResult } from '@/models';
import { GAME_CONFIG, ANIMATION_DURATION, TIMEOUT_CONFIG } from '@/constants/game';
import { BOARD_CONFIG, isWarpSpace, getWarpDestination } from '@/constants/board';
import { createPersistMiddleware, PersistApi } from './middleware/persistence';
import { generateDiceRoll, applyStreakBreaker, createDieRollResult } from '@/utils/diceUtils';
import { validatePegMove, getValidMoves, hasValidMoves as checkHasValidMoves, canMoveFromHomeToStart, checkForCapture } from '@/utils/moveValidation';
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
      warningTimer: null,

      // Actions
      initializeGame: (selectedPlayers: Player[]) => {
        const activePlayers = selectedPlayers.filter(p => p.isActive);

        if (activePlayers.length < GAME_CONFIG.MIN_PLAYERS) {
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
          timeoutWarning: false, // Ensure clean state
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
          const { dieState, currentTurn } = get();

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

          // Enforce maximum 2 rolls per turn sequence for 6-roll bonuses only
          // Double Trouble (XX) bonuses can override this limit
          if (currentTurn && currentTurn.rollsThisTurn >= 2 && currentTurn.extraTurnsRemaining === 0) {
            reject(new Error('Maximum 2 rolls per turn sequence reached'));

            return;
          }

          // Generate roll with streak breaker logic immediately
          const initialRoll = generateDiceRoll();
          const { result, consecutiveRepeats } = applyStreakBreaker(initialRoll, dieState);

          // Don't start timer yet - wait for die animation to complete

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
              }

              // Grant extra turn ONLY on first roll of turn sequence
              if (rolledSix && isFirstRoll) {
                newExtraTurns += 1;
              }

              const updatedTurn = {
                ...latestTurn,
                dieRoll: createDieRollResult(result),
                movesAvailable: result,
                selectedPegId: null,
                extraTurnsRemaining: newExtraTurns,
                rollsThisTurn: newRollCount,
                hasMovedSinceRoll: false,
              };

              set({
                currentTurn: updatedTurn,
              });

              // Special handling for Roll of 1 - auto-move other players' pegs
              if (result === 1) {
                const { handleRollOfOne } = get();

                // Keep timer invisible by not setting startTime
                const rollOfOneTurn: Turn = {
                  ...updatedTurn,
                  startTime: 0, // Keep timer invisible for Roll of 1
                  timeoutWarning: false,
                };

                set({ currentTurn: rollOfOneTurn });

                // Execute Roll of 1 rule - this will handle turn ending
                handleRollOfOne(latestTurn.playerId);
              } else {
                // Normal roll logic - check if player has any valid moves
                const { hasValidMoves, endTurn, startTurnTimer } = get();

                if (!hasValidMoves(latestTurn.playerId, result)) {
                  // Don't start timer - auto-end turn immediately
                  // Use setTimeout to allow UI to update with the die roll first
                  setTimeout(() => {
                    endTurn();
                  }, 1000); // 1 second delay to show the die roll result
                } else {
                  // Player has valid moves - start fresh timer for each roll
                  // Always create a clean timer state to avoid warning persistence
                  const timerUpdatedTurn: Turn = {
                    ...updatedTurn,
                    startTime: Date.now(),
                    timeoutWarning: false, // Always ensure warning state is clear
                  };

                  set({ currentTurn: timerUpdatedTurn });
                  startTurnTimer();
                }
              }
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

      animatePegMove: (pegId: string, targetPosition: number, animationType: 'normal' | 'warp' | 'capture' = 'normal'): Promise<void> => {
        return new Promise((resolve) => {
          const { pegs } = get();
          const peg = pegs.find(p => p.id === pegId);

          if (!peg) {
            resolve();

            return;
          }

          // Complete the move after animation
          const handleMoveComplete = () => {
            const { pegs } = get();

            // Update peg position AND clear animation state in a single update
            const isInFinish = targetPosition >= GAME_CONFIG.BOARD_SPACES;
            const finishPosition = isInFinish ? targetPosition - GAME_CONFIG.BOARD_SPACES : undefined;

            set({
              pegs: pegs.map(pegToUpdate => {
                if (pegToUpdate.id === pegId) {
                  return {
                    ...pegToUpdate,
                    position: targetPosition,
                    isInHome: targetPosition === -1,
                    isInFinish,
                    finishPosition,
                    // Clear animation state
                    isAnimating: false,
                    targetPosition: undefined,
                    animationCallback: undefined,
                    animationType: undefined,
                  };
                }

                return pegToUpdate;
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
                  animationType, // Add animation type for warp effects
                }
                : p,
            ),
          });

        });
      },

      // Animate a peg being captured and sent home
      animateCapture: (capturedPegId: string): Promise<void> => {
        return new Promise((resolve) => {
          const { pegs } = get();

          // Mark peg as captured for animation
          set({
            pegs: pegs.map(peg =>
              peg.id === capturedPegId
                ? { ...peg, isCaptured: true, isAnimating: true, animationType: 'capture' }
                : peg,
            ),
          });

          // After capture animation, send peg home
          setTimeout(() => {
            set({
              pegs: get().pegs.map(peg => {
                if (peg.id === capturedPegId) {
                  return {
                    ...peg,
                    position: -1,
                    isInHome: true,
                    isInFinish: false,
                    finishPosition: undefined,
                    isCaptured: false,
                    isAnimating: false,
                    animationType: undefined,
                  };
                }

                return peg;
              }),
            });
            resolve();
          }, ANIMATION_DURATION.pegCapture); // 800ms capture animation
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

        // Check if player has extra turns remaining (XX bonuses can override 2-roll limit)
        if (currentTurn.extraTurnsRemaining > 0) {
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

          return;
        }

        // Reset any unused extra turns when turn ends

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
          timeoutWarning: false, // Ensure clean state for new turn
        };

        set({ currentTurn: newTurn });

      },

      // Enhanced method to check if turn should end after a move
      checkTurnEnd: () => {
        const { currentTurn, hasValidMoves } = get();

        if (!currentTurn || !currentTurn.dieRoll) return false;

        // If no moves available after using the die roll, check if turn should end
        if (currentTurn.movesAvailable <= 0) {
          // Check if player has reached maximum rolls (2) for turn sequence AND has no extra turns
          // Double Trouble (XX) extra turns can override the 2-roll limit
          if (currentTurn.rollsThisTurn >= 2 && currentTurn.extraTurnsRemaining === 0) {

            return true;
          }

          // If player has extra turns remaining, don't end turn yet
          if (currentTurn.extraTurnsRemaining > 0) {

            return false;
          }

          // No extra turns remaining, end the turn
          return true;
        }

        // Check if player has any valid moves remaining
        if (!hasValidMoves(currentTurn.playerId, currentTurn.movesAvailable)) {

          return true;
        }

        return false;
      },

      // Enhanced method to execute a peg move and handle turn logic
      executePegMove: async (pegId: string, targetPosition: number) => {
        const { currentTurn, getMoveValidation, animatePegMove, animateCapture, checkTurnEnd, endTurn } = get();

        if (!currentTurn || !currentTurn.dieRoll) {

          return false;
        }

        // Validate the move
        const validation = getMoveValidation(pegId, currentTurn.dieRoll.value);

        if (!validation.isValid) {

          return false;
        }

        try {
          // Clear and hide timer immediately when player makes a move
          const { clearTurnTimer } = get();

          clearTurnTimer();

          // Handle opponent capture first if there's one
          if (validation.capturedPegId) {
            console.log(`⚔️ Capture! Peg ${pegId} captures ${validation.capturedPegId} at position ${targetPosition}`);

            // Animate the capture - this will send the peg home after animation
            await animateCapture(validation.capturedPegId);
          }

          // Check if peg will land on a Warp space
          const landsOnWarp = isWarpSpace(targetPosition);
          let finalPosition = targetPosition;

          if (landsOnWarp) {
            // Animate to the Warp space first with normal animation
            await animatePegMove(pegId, targetPosition, 'normal');

            // Get the warp destination
            const warpDestination = getWarpDestination(targetPosition);

            if (warpDestination !== null) {
              finalPosition = warpDestination;
              console.log(`🌀 Warp teleportation! From space ${targetPosition} to space ${warpDestination}`);

              // Check if warp destination has an opponent that needs to be captured
              const { pegs } = get();
              const movingPeg = pegs.find(p => p.id === pegId);

              if (movingPeg) {
                const captureResult = checkForCapture(warpDestination, movingPeg.playerId, pegs);

                if (captureResult.canCapture && captureResult.capturedPegId) {
                  console.log(`⚔️ Warp Capture! Peg ${pegId} captures ${captureResult.capturedPegId} at warp destination ${warpDestination}`);

                  // Animate the capture at the warp destination
                  await animateCapture(captureResult.capturedPegId);
                }
              }

              // Trigger warp trail effect by updating peg with warp info
              set({
                pegs: get().pegs.map(p =>
                  p.id === pegId
                    ? { ...p, warpFrom: targetPosition, warpTo: warpDestination }
                    : p,
                ),
              });

              // Then do the warp teleportation animation
              await animatePegMove(pegId, warpDestination, 'warp');

              // Clear warp info after animation
              set({
                pegs: get().pegs.map(p =>
                  p.id === pegId
                    ? { ...p, warpFrom: undefined, warpTo: undefined }
                    : p,
                ),
              });
            }
          } else {
            // Normal move animation
            await animatePegMove(pegId, targetPosition, 'normal');
          }

          // Check if peg landed on a Double Trouble space
          const landedOnDoubleTrouble = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(finalPosition as 0 | 7 | 14 | 21);

          // Decrement moves available and mark that a move was made
          const newMovesAvailable = currentTurn.movesAvailable - currentTurn.dieRoll.value;

          // Calculate extra turns: Double Trouble bonus (unlimited)
          let extraTurnsToAdd = 0;

          if (landedOnDoubleTrouble) {
            // Grant 1 extra turn for landing on Double Trouble space
            // Double Trouble spaces grant unlimited extra turns (not limited by 2-roll rule)
            // The 2-roll limit only applies to consecutive 6s, not to XX spaces
            extraTurnsToAdd = 1;
          }

          // If moves are exhausted but player has extra turns, prepare for next roll
          const shouldPrepareForNextRoll = newMovesAvailable <= 0 && (currentTurn.extraTurnsRemaining + extraTurnsToAdd) > 0;

          set({
            currentTurn: {
              ...currentTurn,
              movesAvailable: newMovesAvailable,
              selectedPegId: null,
              hasMovedSinceRoll: true,
              startTime: 0, // Reset timer to make it invisible
              timeoutWarning: false, // Clear warning state
              // Apply Double Trouble extra turns
              extraTurnsRemaining: currentTurn.extraTurnsRemaining + extraTurnsToAdd,
              // If preparing for next roll, clear the die roll to force a new roll
              dieRoll: shouldPrepareForNextRoll ? null : currentTurn.dieRoll,
            },
          });

          // Log Double Trouble activation for debugging
          if (landedOnDoubleTrouble && extraTurnsToAdd > 0) {
            console.log(`🎯 Double Trouble! Peg landed on space ${targetPosition}, granted ${extraTurnsToAdd} extra turn(s)`);
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
        const warningTimer = setTimeout(() => {
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

        // Store both timers so they can be cleared together
        set({
          turnTimer: mainTimer,
          warningTimer,
        });
      },

      clearTurnTimer: () => {
        const { turnTimer, warningTimer } = get();

        if (turnTimer) {
          clearTimeout(turnTimer);
        }

        if (warningTimer) {
          clearTimeout(warningTimer);
        }

        set({
          turnTimer: null,
          warningTimer: null,
        });
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

        // Clear the timer
        clearTurnTimer();

        // End the turn
        endTurn();
      },

      // Handle Roll of 1 rule - automatically move other players' pegs from HOME to START
      handleRollOfOne: (currentPlayerId: string): void => {
        const { players, pegs, animatePegMove, endTurn } = get();

        // Get all other players (exclude the current player who rolled 1)
        const otherPlayers = players.filter(player => player.id !== currentPlayerId);

        const movements: { playerId: string; pegId: string; playerColor: string }[] = [];

        // Check each other player for possible movements
        otherPlayers.forEach(player => {
          const result = canMoveFromHomeToStart(player.id, player.color, pegs);

          if (result.canMove && result.pegId) {
            movements.push({
              playerId: player.id,
              pegId: result.pegId,
              playerColor: player.color,
            });
          }
        });

        // If no movements are possible, just end the turn
        if (movements.length === 0) {
          setTimeout(() => {
            endTurn();
          }, ANIMATION_DURATION.rollOfOneMessage);

          return;
        }

        // Execute movements sequentially with animations
        let delay = ANIMATION_DURATION.rollOfOneMessage; // Initial delay to show message

        for (const movement of movements) {
          setTimeout(() => {
            // Get player's START position
            const colorIndex = ['red', 'blue', 'green', 'yellow'].indexOf(movement.playerColor);

            if (colorIndex !== -1) {
              const startPosition = [25, 4, 11, 18][colorIndex]; // Red=25, Blue=4, Green=11, Yellow=18

              // Animate the peg movement
              animatePegMove(movement.pegId, startPosition).catch(error => {
                console.error(`Failed to animate peg ${movement.pegId}:`, error);
              });
            }
          }, delay);

          delay += ANIMATION_DURATION.rollOfOnePegMove + ANIMATION_DURATION.rollOfOneDelay;
        }

        // End turn after all animations complete
        setTimeout(() => {
          endTurn();
        }, delay);
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
          warningTimer: null,
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
