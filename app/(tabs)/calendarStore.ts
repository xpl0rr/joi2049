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
      (set, get) => ({
        db: {},
        toggleRing: (date: string, key: ActivityKey) => {
:
