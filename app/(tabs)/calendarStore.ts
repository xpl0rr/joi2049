// app/(tabs)/calendarStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Every type of activity you plan to track */
export type ActivityKey = 'workout' | 'todo' | 'guitar' | 'custom4';

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

  /** Toggle an activity ring on a given day */
  toggleRing: (isoDate: string, key: ActivityKey) => void;
}

/** ---------- STORE ---------- */
export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        db: {},

        toggleRing: (isoDate, key) =>
          set(state => {
            const day = state.db[isoDate] ?? {
              rings: {
                workout: false,
                todo: false,
                guitar: false,
                custom4: false,
              },
            };

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
      }),
      {
        name: 'calendar-db',     // key in AsyncStorage
        getStorage: () => AsyncStorage,
      },
    ),
    { name: 'calendarStore' },  // appears in Redux DevTools
  ),
);