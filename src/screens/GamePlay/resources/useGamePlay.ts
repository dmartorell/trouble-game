import { useState } from 'react';
import { router } from 'expo-router';

export const useGamePlay = () => {
  const [currentTurn] = useState('Red');

  const exitGame = () => {
    // Go back to home screen (should go back to original home since GameSetup was replaced)
    router.back();
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
