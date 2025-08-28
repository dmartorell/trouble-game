import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { Player } from '@/models';

export const useGamePlay = () => {
  const [dieValue, setDieValue] = useState<number | null>(null);
  const [rollCount, setRollCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const {
    gameState,
    dieState,
    currentTurn,
    initializeGame,
    getCurrentPlayer,
    getPlayerPegs,
    getSelectablePegs,
    isValidMove,
    selectPeg,
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const currentTurnText = currentPlayer?.name || 'Unknown';

  // Initialize game if not already playing
  useEffect(() => {
    if (gameState !== 'playing') {
      // Create test players
      const testPlayers: Player[] = [
        { id: 'p1', name: 'Red', color: 'red', isActive: true },
        { id: 'p2', name: 'Blue', color: 'blue', isActive: true },
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

    // Toggle selection
    if (currentTurn.selectedPegId === pegId) {
      selectPeg(null); // Deselect if already selected
    } else {
      selectPeg(pegId); // Select peg
    }
  }, [currentTurn, isValidMove, selectPeg]);

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
    currentPlayerPegs,
    selectablePegIds,
    selectedPegId: currentTurn?.selectedPegId,
    currentDieRoll: currentTurn?.dieRoll?.value,
  };
};
