import { MMKV } from 'react-native-mmkv';

// Fallback storage for development/debugging when JSI is not available
class FallbackStorage {
  private data = new Map<string, string>();

  set(key: string, value: string) {
    this.data.set(key, value);
  }

  getString(key: string): string | undefined {
    return this.data.get(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }

  clearAll() {
    this.data.clear();
  }
}

// Try to create MMKV instance, fallback to in-memory storage if it fails
let storage: MMKV | FallbackStorage;

try {
  storage = new MMKV();
} catch (error) {
  console.warn(
    'MMKV is not available (likely due to remote debugging). Using fallback in-memory storage. ' +
    'For production builds or on-device debugging, MMKV will work normally.',
    error,
  );
  storage = new FallbackStorage();
}

export { storage };

export const mmkvStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string): string | null => {
    const value = storage.getString(name);

    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};
