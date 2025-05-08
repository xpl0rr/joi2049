import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityKey = 'workout' | 'todo' | 'guitar' | 'custom4';

export interface CalendarDB {
  [date: string]: {
    rings: Record<ActivityKey, boolean>;
  };
}

export interface CalendarState {
  db: CalendarDB;
  toggleRing: (date: string, key: ActivityKey) => void;
}

export const useCalendarStore = create<CalendarState>(
  devtools(
    persist<CalendarState>(
      (set: (partial: Partial<CalendarState> | ((state: CalendarState) => Partial<CalendarState>), replace?: boolean) => void, get: () => CalendarState) => ({
        db: {},
        toggleRing: (date: string, key: ActivityKey) => {
          const { db } = get();
          const day = db[date] ?? { rings: {} as Record<ActivityKey, boolean> };
          const rings = { ...day.rings, [key]: !day.rings[key] };
          set({ db: { ...db, [date]: { rings } } });
        },
      }),
      {
        name: 'calendar',
        getStorage: () => AsyncStorage,
      }
    ),
    { name: 'calendar-devtools' }
  )
);
