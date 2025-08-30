import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { Player } from '@/models';
import { calculateBoardDimensions } from '@/utils/boardCoordinates';

export const useGamePlay = () => {
  const [dieValue, setDieValue] = useState<number | null>(null);
  const [rollCount, setRollCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const {
    gameState,
    dieState,
    currentTurn,
    players,
    pegs,
    initializeGame,
    getCurrentPlayer,
    getPlayerPegs,
    getSelectablePegs,
    isValidMove,
    selectPeg,
    executePegMove,
    getMoveValidation,
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const currentTurnText = currentPlayer?.name || 'Unknown';

  // Initialize game if not already playing
  useEffect(() => {
    if (gameState !== 'playing') {
      // Create test players with 4 players for better testing
      const testPlayers: Player[] = [
        { id: 'p1', name: 'Red Player', color: 'red', isActive: true },
        { id: 'p2', name: 'Blue Player', color: 'blue', isActive: true },
        { id: 'p3', name: 'Yellow Player', color: 'yellow', isActive: true },
        { id: 'p4', name: 'Green Player', color: 'green', isActive: true },
      ];

      initializeGame(testPlayers);
    }
  }, [gameState, initializeGame]);

  // Track die value changes from the store
  useEffect(() => {
    if (dieState.lastRoll !== null) {
      setDieValue(dieState.lastRoll);
    }
  }, [dieState.lastRoll]);

  // Track die lock state
  useEffect(() => {
    setIsLocked(dieState.isRolling);
  }, [dieState.isRolling]);

  const exitGame = () => {
    router.back();
  };

  const handleDieRoll = useCallback((value: number) => {
    // Update local state
    setDieValue(value);
    setRollCount(prev => prev + 1);
  }, []);

  const executeMoveAsync = useCallback(async (pegId: string) => {
    if (!currentTurn || !currentTurn.dieRoll) return;

    const validation = getMoveValidation(pegId, currentTurn.dieRoll.value);

    console.log('Move validation:', { pegId, validation });

    if (validation.isValid && validation.newPosition !== undefined) {
      console.log(`Executing move for peg ${pegId} to position ${validation.newPosition}`);
      const success = await executePegMove(pegId, validation.newPosition);

      if (success) {
        console.log(`Move executed successfully for peg ${pegId}`);
      } else {
        console.log(`Move failed for peg ${pegId}`);
      }
    } else {
      console.log('Move not valid or no new position:', validation);
    }
  }, [currentTurn, getMoveValidation, executePegMove]);

  const handlePegPress = useCallback((pegId: string) => {
    if (!currentTurn || !currentTurn.dieRoll) {
      console.log('No die roll available');

      return;
    }

    // Check if this peg can be moved with current die roll
    if (!isValidMove(pegId, currentTurn.dieRoll.value)) {
      console.log('Invalid move for peg:', pegId);

      return;
    }

    // If peg is already selected, execute the move asynchronously
    if (currentTurn.selectedPegId === pegId) {
      executeMoveAsync(pegId).catch(console.error);
    } else {
      // Select the peg
      selectPeg(pegId);
    }
  }, [currentTurn, isValidMove, selectPeg, executeMoveAsync]);



  // Calculate board dimensions once for consistent scaling
  const boardDimensions = useMemo(() => calculateBoardDimensions(), []);

  // Get current player's pegs and their selectability
  const currentPlayerPegs = currentPlayer ? getPlayerPegs(currentPlayer.id) : [];
  const selectablePegIds = currentPlayer && currentTurn?.dieRoll
    ? getSelectablePegs(currentPlayer.id, currentTurn.dieRoll.value).map(p => p.id)
    : [];

  return {
    currentTurn: currentTurnText,
    exitGame,
    handleDieRoll,
    handlePegPress,
    dieValue,
    rollCount,
    isLocked,
    dieState,
    currentPlayer,
    players,
    pegs,
    currentPlayerPegs,
    selectablePegIds,
    selectedPegId: currentTurn?.selectedPegId,
    currentDieRoll: currentTurn?.dieRoll?.value,
    extraTurnsRemaining: currentTurn?.extraTurnsRemaining || 0,
    rollsThisTurn: currentTurn?.rollsThisTurn || 0,
    hasMovedSinceRoll: currentTurn?.hasMovedSinceRoll ?? true,
    boardDimensions,
  };
};
