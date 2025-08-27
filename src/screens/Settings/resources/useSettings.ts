import { useState } from 'react';

export const useSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleHaptics = () => setHapticsEnabled(!hapticsEnabled);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const resetStatistics = () => {
    // TODO: Implement statistics reset
    console.log('Statistics reset!');
  };

  return {
    soundEnabled,
    hapticsEnabled,
    darkMode,
    toggleSound,
    toggleHaptics,
    toggleDarkMode,
    resetStatistics,
  };
};
