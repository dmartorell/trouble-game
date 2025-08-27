import { useState } from 'react';
import { router } from 'expo-router';

export const useGamePlay = () => {
  const [currentTurn] = useState('Red');

  const exitGame = () => {
    router.replace('/');
  };

  const popDie = () => {
    // TODO: Implement die roll logic
    console.log('Die popped!');
  };

  return {
    currentTurn,
    exitGame,
    popDie,
  };
};
