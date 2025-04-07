import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the widget data structure
export interface Widget {
  id: string;
  type: 'todo' | 'simpletodo' | 'notes' | 'activity' | 'calendar' | 'chart';
  title: string;
  config: any;
  size: 'small' | 'medium' | 'large';
}

// Define the page data structure
export interface Page {
  id: string;
  name: string;
  customizable: boolean;
  widgets: Widget[];
}

// Define the widget context type
interface WidgetContextType {
  pages: Record<string, Page>;
  addWidgetToPage: (pageId: string, widget: Widget) => void;
  removeWidgetFromPage: (pageId: string, widgetId: string) => void;
  updateWidgetConfig: (pageId: string, widgetId: string, config: any) => void;
  reorderWidgets: (pageId: string, widgetIds: string[]) => void;
  addPage: (page: Page) => void;
  removePage: (pageId: string) => void;
  availableWidgets: Widget[];
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Sample widgets
const defaultWidgets: Widget[] = [
  { 
    id: 'notes', 
    type: 'notes', 
    title: 'Notes', 
    config: { notes: 'Add your notes, ideas, and reminders here...' }, 
    size: 'medium' 
  },
  { 
    id: 'todo-list', 
    type: 'simpletodo', 
    title: 'Todo', 
    config: { 
      items: [
        { id: '1', text: 'Buy groceries', completed: false, createdAt: new Date().toISOString() },
        { id: '2', text: 'Finish project', completed: false, createdAt: new Date().toISOString() }
      ] 
    }, 
    size: 'medium' 
  },
  { 
    id: 'activity-tracker', 
    type: 'activity', 
    title: 'Daily Activity', 
    config: { 
      title: 'Track Progress',
      percentage: 66
    }, 
    size: 'medium' 
  },
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendar',
    config: {
      events: [],
      view: 'month',
      selectedDate: new Date().toISOString()
    },
    size: 'medium'
  },
  {
    id: 'chart',
    type: 'chart',
    title: 'Monthly Sales',
    config: {
      data: [
        { label: 'Jan', value: 150 },
        { label: 'Feb', value: 360 },
        { label: 'Mar', value: 180 },
        { label: 'Apr', value: 280 },
        { label: 'May', value: 170 },
        { label: 'Jun', value: 180 },
        { label: 'Jul', value: 270 },
        { label: 'Aug', value: 90 },
        { label: 'Sep', value: 190 },
        { label: 'Oct', value: 370 },
        { label: 'Nov', value: 260 },
        { label: 'Dec', value: 100 },
      ]
    },
    size: 'medium'
  },
];

// Default pages with some widgets already added
const defaultPages: Record<string, Page> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    customizable: false, // Can't delete the dashboard
    widgets: [
      { ...defaultWidgets[2], id: `${defaultWidgets[2].id}-1`, size: 'medium' },
      { ...defaultWidgets[0], id: `${defaultWidgets[0].id}-1`, size: 'medium' },
      { ...defaultWidgets[1], id: `${defaultWidgets[1].id}-1`, size: 'medium' },
    ],
  },
  health: { 
    id: 'health', 
    name: 'Health', 
    customizable: true,
    widgets: [] 
  },
  finance: { 
    id: 'finance', 
    name: 'Finance', 
    customizable: true,
    widgets: [] 
  },
  todo: { 
    id: 'todo', 
    name: 'Todo', 
    customizable: true,
    widgets: [
      { ...defaultWidgets[1], id: `${defaultWidgets[1].id}-2`, size: 'medium' },
    ] 
  },
};

// Storage keys
const STORAGE_KEYS = {
  PAGES: 'app_pages',
};

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Record<string, Page>>(defaultPages);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from AsyncStorage...');
        const storedPagesJson = await AsyncStorage.getItem(STORAGE_KEYS.PAGES);
        if (storedPagesJson) {
          console.log('Found stored data in AsyncStorage');
          const storedPages = JSON.parse(storedPagesJson);
          setPages(storedPages);
        } else {
          console.log('No stored data found, using defaults');
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage when pages structure changes
  useEffect(() => {
    if (!isLoaded) {
      return; // Don't save during initial load
    }
    
    // We're already saving widget config changes separately in updateWidgetConfig
    // This will handle other changes like adding/removing pages or widgets
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
        console.log('Saved page structure changes to AsyncStorage');
      } catch (error) {
        console.error('Error saving page structure:', error);
      }
    })();
  }, [pages, isLoaded]);

  // Add a widget to a page
  const addWidgetToPage = (pageId: string, widget: Widget) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: [...prevPages[pageId].widgets, widget]
        }
      };
    });
  };

  // Remove a widget from a page
  const removeWidgetFromPage = (pageId: string, widgetId: string) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: prevPages[pageId].widgets.filter(w => w.id !== widgetId)
        }
      };
    });
  };

  // Update a widget's config
  const updateWidgetConfig = (pageId: string, widgetId: string, config: any) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;

      // Find the widget to update
      const widgetToUpdate = prevPages[pageId].widgets.find(w => w.id === widgetId);
      if (!widgetToUpdate) {
        console.error('Widget not found:', widgetId);
        return prevPages;
      }

      // Special handling for todo widget items
      if (widgetToUpdate.type === 'simpletodo' && config.items) {
        console.log(`Saving todo items for widget ${widgetId}:`, config.items.length);
      }
      
      // Create a new pages object with the updated widget config
      const updatedPages = {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: prevPages[pageId].widgets.map(w => 
            w.id === widgetId 
              ? { ...w, config: { ...w.config, ...config } }
              : w
          )
        }
      };
      
      // Immediately save the updated data to AsyncStorage
      (async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(updatedPages));
          console.log(`Saved widget ${widgetId} update to AsyncStorage successfully`);
        } catch (error) {
          console.error('Failed to save widget update:', error);
        }
      })();
      
      return updatedPages;
    });
  };

  // Add a new page
  const addPage = (page: Page) => {
    setPages(prevPages => ({
      ...prevPages,
      [page.id]: page
    }));
  };

  // Remove a page
  const removePage = (pageId: string) => {
    setPages(prevPages => {
      const newPages = { ...prevPages };
      // Only delete if the page is customizable
      if (newPages[pageId] && newPages[pageId].customizable) {
        delete newPages[pageId];
      }
      return newPages;
    });
  };

  // Reset all data to defaults (for debugging)
  const resetToDefaults = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PAGES);
      setPages(defaultPages);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  // Add a function to reorder widgets on a page
  const reorderWidgets = (pageId: string, widgetIds: string[]) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      // Create a map of the current widgets by ID for easy lookup
      const widgetMap = prevPages[pageId].widgets.reduce((map, widget) => {
        map[widget.id] = widget;
        return map;
      }, {} as Record<string, Widget>);
      
      // Create a new array of widgets in the order specified by widgetIds
      const reorderedWidgets = widgetIds
        .filter(id => widgetMap[id]) // Filter out any IDs that don't exist
        .map(id => widgetMap[id]);
      
      // Add any widgets that weren't in the widgetIds array (shouldn't happen, but just in case)
      const remainingWidgets = prevPages[pageId].widgets.filter(
        widget => !widgetIds.includes(widget.id)
      );
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: [...reorderedWidgets, ...remainingWidgets]
        }
      };
    });
  };

  // Value for the context provider
  const value = {
    pages,
    addWidgetToPage,
    removeWidgetFromPage,
    updateWidgetConfig,
    reorderWidgets,
    addPage,
    removePage,
    availableWidgets: defaultWidgets
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}

// Hook to use the widget context
export function useWidgets() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
} 