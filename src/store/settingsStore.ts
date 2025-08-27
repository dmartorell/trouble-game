import { create } from 'zustand';
import { GameSettings, SettingsStore } from '@/models';

const defaultSettings: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  darkMode: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial State
  settings: defaultSettings,

  // Actions
  updateSettings: (newSettings: Partial<GameSettings>) => {
    set(state => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },

  toggleSound: () => {
    set(state => ({
      settings: {
        ...state.settings,
        soundEnabled: !state.settings.soundEnabled,
      },
    }));
  },

  toggleHaptics: () => {
    set(state => ({
      settings: {
        ...state.settings,
        hapticsEnabled: !state.settings.hapticsEnabled,
      },
    }));
  },

  toggleDarkMode: () => {
    set(state => ({
      settings: {
        ...state.settings,
        darkMode: !state.settings.darkMode,
      },
    }));
  },

  resetSettings: () => {
    set({ settings: defaultSettings });
  },
}));

