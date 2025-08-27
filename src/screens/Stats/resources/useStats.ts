import { useState } from 'react';

export const useStats = () => {
  const [gamesPlayed] = useState(0);
  const [wins] = useState(0);
  const [winRate] = useState(0);
  const [bestTime] = useState('--:--');

  return {
    gamesPlayed,
    wins,
    winRate,
    bestTime,
  };
};
