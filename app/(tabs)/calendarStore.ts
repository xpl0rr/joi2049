// app/(tabs)/calendarStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        addActivity: (key) => set(state => ({ activities: [...state.activities, key] })),
        removeActivity: (key) => set(state => ({ activities: state.activities.filter(a => a !== key) })),
      }),
      {
        name: 'calendar-db',     // key in AsyncStorage
        getStorage: () => AsyncStorage,
      },
    ),
    { name: 'calendarStore' },  // appears in Redux DevTools
  ),
);

// Default export to satisfy Expo Router
export default useCalendarStore;