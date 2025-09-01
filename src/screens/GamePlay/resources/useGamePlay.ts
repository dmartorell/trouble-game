import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
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
    winner,
    getCurrentPlayer,
    getPlayerPegs,
    getSelectablePegs,
    isValidMove,
    executePegMove,
    getMoveValidation,
    resetGame,
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const currentTurnText = currentPlayer?.name || 'Unknown';

  // Validate game is properly initialized, redirect if not
  useEffect(() => {
    // Only redirect if game state is invalid and no players
    if (gameState !== 'playing' && gameState !== 'finished' && players.length < 2) {
      // Game not properly initialized, redirect to setup
      router.replace('/game/setup');
    }
  }, [gameState, players.length]);

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

  const handlePlayAgain = useCallback(() => {
    resetGame();
    router.replace('/game/setup');
  }, [resetGame]);


  // Get winner as Player object
  const winnerPlayer = winner ? players.find(p => p.id === winner) : null;

  const handleDieRoll = useCallback((value: number) => {
    // Update local state
    setDieValue(value);
    setRollCount(prev => prev + 1);
  }, []);

  const executeMoveAsync = useCallback(async (pegId: string) => {
    if (!currentTurn || !currentTurn.dieRoll) return;

    const validation = getMoveValidation(pegId, currentTurn.dieRoll.value);

    if (validation.isValid && validation.newPosition !== undefined) {
      await executePegMove(pegId, validation.newPosition);
    }
  }, [currentTurn, getMoveValidation, executePegMove]);

  const handlePegPress = useCallback((pegId: string) => {
    if (!currentTurn || !currentTurn.dieRoll) {
      return;
    }

    // Check if this peg can be moved with current die roll
    if (!isValidMove(pegId, currentTurn.dieRoll.value)) {
      return;
    }

    // Execute move immediately on first click
    executeMoveAsync(pegId).catch(() => {
      // Silently handle errors
    });
  }, [currentTurn, isValidMove, executeMoveAsync]);

  // Calculate board dimensions once for consistent scaling
  const boardDimensions = useMemo(() => calculateBoardDimensions(), []);

  // Get current player's pegs and their selectability
  const currentPlayerPegs = currentPlayer ? getPlayerPegs(currentPlayer.id) : [];
  const selectablePegIds = currentPlayer && currentTurn?.dieRoll && currentTurn.dieRoll.value !== 1
    ? getSelectablePegs(currentPlayer.id, currentTurn.dieRoll.value).map(p => p.id)
    : [];

  return {
    currentTurn: currentTurnText,
    exitGame,
    handleDieRoll,
    handlePegPress,
    handlePlayAgain,
    dieValue,
    rollCount,
    isLocked,
    dieState,
    currentPlayer,
    players,
    pegs,
    winner: winnerPlayer,
    currentPlayerPegs,
    selectablePegIds,
    currentDieRoll: currentTurn?.dieRoll?.value,
    extraTurnsRemaining: currentTurn?.extraTurnsRemaining || 0,
    rollsThisTurn: currentTurn?.rollsThisTurn || 0,
    hasMovedSinceRoll: currentTurn?.hasMovedSinceRoll ?? true,
    startTime: currentTurn?.startTime || 0,
    boardDimensions,
  };
};
