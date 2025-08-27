import { StateCreator } from 'zustand';
import { mmkvStorage } from '@/utils/storage';

export interface PersistOptions<T> {
  name: string;
  storage?: typeof mmkvStorage;
  partialize?: (state: T) => Partial<T>;
}

export interface PersistApi {
  persist: {
    clearStorage: () => void;
    rehydrate: () => void;
    hasHydrated: () => boolean;
  };
}

export const createPersistMiddleware = <T extends object>(
  config: StateCreator<T>,
  options: PersistOptions<T>,
): StateCreator<T & PersistApi> => {
  return (set, get, api) => {
    const { name, storage = mmkvStorage, partialize } = options;

    let hasHydrated = false;

    // Load persisted state on initialization
    const loadPersistedState = () => {
      try {
        const serialized = storage.getItem(name);

        if (serialized) {
          const persistedState = JSON.parse(serialized) as Partial<T>;

          // Use functional update to merge with current state
          set((state) => ({ ...state, ...persistedState } as T & PersistApi));
        }

        hasHydrated = true;
      } catch (error) {
        console.warn(`Failed to load persisted state for ${name}:`, error);
        hasHydrated = true;
      }
    };

    // Save state to storage
    const saveState = () => {
      if (!hasHydrated) return; // Don't save during initial hydration

      try {
        const currentState = get();
        const stateToSave = partialize ? partialize(currentState) : currentState;

        // Remove persist API from saved state
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { persist: _persist, ...cleanState } = stateToSave as T & PersistApi;

        storage.setItem(name, JSON.stringify(cleanState));
      } catch (error) {
        console.warn(`Failed to save state for ${name}:`, error);
      }
    };

    // Create wrapped set function that auto-saves
    const wrappedSet = (
      partial:
        | (T & PersistApi)
        | Partial<T & PersistApi>
        | ((state: T & PersistApi) => (T & PersistApi) | Partial<T & PersistApi>),
      replace?: boolean  ,
    ) => {
      // Handle the overloads properly
      if (replace === true) {
        set(partial as (T & PersistApi) | ((state: T & PersistApi) => T & PersistApi), true);
      } else {
        set(partial as (T & PersistApi) | Partial<T & PersistApi> | ((state: T & PersistApi) => (T & PersistApi) | Partial<T & PersistApi>), replace);
      }
      saveState();
    };

    // Initialize the store with original config
    const storeApi = config(wrappedSet, get, api);

    // Add persist API
    const persistApi: PersistApi['persist'] = {
      clearStorage: () => {
        storage.removeItem(name);
      },
      rehydrate: () => {
        loadPersistedState();
      },
      hasHydrated: () => hasHydrated,
    };

    // Load persisted state
    loadPersistedState();

    return {
      ...storeApi,
      persist: persistApi,
    };
  };
};
