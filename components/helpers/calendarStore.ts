// app/(tabs)/calendarStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiService from './apiService';

// Storage keys
const STORAGE_KEY = 'calendar-db';
const ACTIVITIES_KEY = 'calendar-activities';

/** Every type of activity you plan to track */
export type ActivityKey = string;

/** One day's data: a ring for each activity */
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
  /** Initialize the store from storage */
  initialize: () => Promise<void>;
  /** Is the store initialized? */
  initialized: boolean;
}

// Helper function to save state to API
const saveState = async (db: CalendarDB, activities: ActivityKey[]) => {
  try {
    // Save calendar data
    const calendarData = JSON.stringify({ db });
    await apiService.setItem(STORAGE_KEY, { db });
    
    // Save activities separately to ensure they're preserved
    await apiService.setItem(ACTIVITIES_KEY, activities);
    
    console.log('Saved calendar data and activities to API');
  } catch (error) {
    console.error('Failed to save calendar data to API:', error);
  }
};

// Helper function to load state from API
const loadState = async (): Promise<{ db: CalendarDB; activities: ActivityKey[] }> => {
  try {
    // Default empty state
    const defaultState = { db: {}, activities: [] };
    
    // Load calendar data
    const calendarData = await apiService.getItem(STORAGE_KEY);
    let db = {};
    if (calendarData) {
      try {
        // API service already parses JSON
        db = calendarData.db || {};
        console.log('Loaded calendar data successfully from API');
      } catch (e) {
        console.error('Error processing calendar data from API:', e);
      }
    }
    
    // Load activities (with fallback)
    const activities = await apiService.getItem(ACTIVITIES_KEY) || [];
    if (activities && Array.isArray(activities)) {
      console.log(`Loaded ${activities.length} activities from API`);
    } else {
      console.warn('No activities found or invalid format from API');
    }
    
    return { 
      db: db || {}, 
      activities: Array.isArray(activities) ? activities : [] 
    };
  } catch (error) {
    console.error('Failed to load calendar data from API:', error);
    return { db: {}, activities: [] };
  }
};

/** ---------- STORE ---------- */
export const useCalendarStore = create<CalendarState>()(
  devtools(
    (set, get) => ({
      db: {},
      activities: [],
      initialized: false,
      
      initialize: async () => {
        // Only initialize once
        if (get().initialized) return;
        
        console.log('Initializing calendar store...');
        const { db, activities } = await loadState();
        set({ db, activities, initialized: true });
        console.log('Calendar store initialized');
      },
      
      toggleRing: (isoDate, key) => {
        const state = get();
        const day = state.db[isoDate] ?? { rings: {} };
        
        // Create updated state
        const newDb = {
          ...state.db,
          [isoDate]: {
            rings: {
              ...day.rings,
              [key]: !day.rings[key],
            },
          },
        };
        
        // Update state
        set({ db: newDb });
        
        // Save to storage
        saveState(newDb, state.activities);
      },
      
      addActivity: (key) => {
        const state = get();
        console.log(`Adding activity: ${key}`);
        
        // Check if activity already exists
        if (state.activities.includes(key)) {
          console.log(`Activity ${key} already exists, skipping`);
          return;
        }
        
        // Create new activities array
        const newActivities = [...state.activities, key];
        console.log(`New activities list:`, newActivities);
        
        // Update state
        set({ activities: newActivities });
        
        // Save to storage
        saveState(state.db, newActivities);
      },
      
      removeActivity: (key) => {
        const state = get();
        console.log(`Removing activity: ${key}`);
        
        // Filter out the activity
        const newActivities = state.activities.filter(a => a !== key);
        console.log(`New activities list:`, newActivities);
        
        // Update state
        set({ activities: newActivities });
        
        // Save to storage
        saveState(state.db, newActivities);
      },
    }),
    { name: 'calendarStore' },  // appears in Redux DevTools
  ),
);

// Default export to satisfy Expo Router
export default useCalendarStore;