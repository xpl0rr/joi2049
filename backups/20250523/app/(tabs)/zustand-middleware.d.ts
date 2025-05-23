// Shim for Zustand middleware typings
import { StateCreator } from 'zustand';

declare module 'zustand/middleware' {
  export function persist<T>(
    config: StateCreator<T>,
    options: {
      name: string;
      getStorage?: () => unknown;
      serialize?: (state: Partial<T>) => string;
      deserialize?: (str: string) => Partial<T>;
      version?: number;
      migrate?: (persistedState: unknown, version: number) => Promise<T> | T;
      partialize?: (state: T) => Partial<T>;
    }
  ): StateCreator<T>;

  export function devtools<T>(
    config: StateCreator<T>,
    options?: {
      name?: string;
      store?: unknown;
      serialize?: unknown;
    }
  ): StateCreator<T>;
}

// Default exports to satisfy Expo Router
export default {};
