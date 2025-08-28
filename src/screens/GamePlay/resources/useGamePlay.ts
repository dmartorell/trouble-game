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
    initializeGame,
    getCurrentPlayer,
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

  return {
    currentTurn: currentTurnText,
    exitGame,
    handleDieRoll,
    dieValue,
    rollCount,
    isLocked,
    dieState,
    currentPlayer,
  };
};
