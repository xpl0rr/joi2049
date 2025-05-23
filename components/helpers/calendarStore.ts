// app/(tabs)/calendarStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple wrapper around AsyncStorage for debugging and error handling
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      console.log(`[Storage] Retrieved ${name}:`, value ? 'data found' : 'no data');
      return value;
    } catch (e) {
      console.error(`[Storage] Error getting ${name}:`, e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
      console.log(`[Storage] Saved ${name} successfully`); 
      return;
    } catch (e) {
      console.error(`[Storage] Error saving ${name}:`, e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
      console.log(`[Storage] Removed ${name} successfully`);
      return;
    } catch (e) {
      console.error(`[Storage] Error removing ${name}:`, e);
    }
  }
};

/** Every type of activity you plan to track */
export type ActivityKey = string;

/** One day’s data: a ring for each activity */
export interface CalendarDB {
  [isoDate: string]: {
    rings: Record<ActivityKey, boolean>;
  };
}

/** Zustand store shape */
export interface CalendarState {
  /** Entire calendar keyed by ISO date (YYYY-MM-DD) */
  db: CalendarDB;
  /** List of tracked activities */
  activities: ActivityKey[];
  /** Toggle an activity ring on a given day */
  toggleRing: (isoDate: string, key: ActivityKey) => void;
  /** Add a new activity to track */
  addActivity: (key: ActivityKey) => void;
  /** Remove an activity */
  removeActivity: (key: ActivityKey) => void;
}

/** ---------- STORE ---------- */
export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        db: {},
        activities: [],
        toggleRing: (isoDate, key) =>
          set(state => {
            const day = state.db[isoDate] ?? { rings: {} };
            
            // Create a new state object to ensure Zustand recognizes the change
            return {
              db: {
                ...state.db,
                [isoDate]: {
                  rings: {
                    ...day.rings,
                    [key]: !day.rings[key],
                  },
                },
              },
            };
          }),
        addActivity: (key) => {
          console.log(`[CalendarStore] Adding activity: ${key}`);
          set(state => {
            // Check if activity already exists to prevent duplicates
            if (state.activities.includes(key)) {
              console.log(`[CalendarStore] Activity ${key} already exists, skipping`);
              return state; // No change needed
            }
            
            // Create a new activities array to ensure Zustand recognizes the change
            const newActivities = [...state.activities, key];
            console.log(`[CalendarStore] New activities list:`, newActivities);
            return { activities: newActivities };
          });
        },
        removeActivity: (key) => {
          console.log(`[CalendarStore] Removing activity: ${key}`);
          set(state => {
            const newActivities = state.activities.filter(a => a !== key);
            console.log(`[CalendarStore] New activities list:`, newActivities);
            return { activities: newActivities };
          });
        },
      }),
      {
        name: 'calendar-db',     // key in AsyncStorage
        getStorage: () => createJSONStorage(() => storage),
        // Set version for migrations if needed in the future
        version: 1,
        // Make this a bit more resilient
        partialize: (state) => ({
          db: state.db,
          activities: state.activities
        }),
      },
    ),
    { name: 'calendarStore' },  // appears in Redux DevTools
  ),
);

// Default export to satisfy Expo Router
export default useCalendarStore;