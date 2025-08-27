import { useSettingsStore } from '@/store';

export const useSettings = () => {
  const {
    settings,
    toggleSound,
    toggleHaptics,
    toggleDarkMode,
  } = useSettingsStore();

  const resetStatistics = () => {
    // TODO: Implement statistics reset
    console.log('Statistics reset!');
  };

  return {
    soundEnabled: settings.soundEnabled,
    hapticsEnabled: settings.hapticsEnabled,
    darkMode: settings.darkMode,
    toggleSound,
    toggleHaptics,
    toggleDarkMode,
    resetStatistics,
  };
};
