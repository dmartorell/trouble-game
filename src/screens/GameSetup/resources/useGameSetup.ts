import { useState } from 'react';
import { router } from 'expo-router';

import { Player } from '@/models';
import { useGameStore } from '@/store';

export const useGameSetup = () => {
  const initializeGame = useGameStore(state => state.initializeGame);

  const [players, setPlayers] = useState<Player[]>([
    { id: 'player-1', name: 'Player 1', color: 'red', isActive: true },
    { id: 'player-2', name: 'Player 2', color: 'blue', isActive: true },
    { id: 'player-3', name: 'Player 3', color: 'yellow', isActive: false },
    { id: 'player-4', name: 'Player 4', color: 'green', isActive: false },
  ]);

  const togglePlayer = (index: number) => {
    if (index < 2) return; // First two players are always active

    setPlayers(prev => {
      const newPlayers = [...prev];

      newPlayers[index].isActive = !newPlayers[index].isActive;

      return newPlayers;
    });
  };

  const startGame = () => {
    const activePlayers = players.filter(p => p.isActive);

    if (activePlayers.length >= 2) {
      // Initialize game state in store with only active players
      initializeGame(activePlayers);

      // Navigate to game
      router.replace('/game/play');
    }
  };

  const activePlayerCount = players.filter(p => p.isActive).length;

  return {
    players,
    activePlayerCount,
    togglePlayer,
    startGame,
  };
};
