import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import apiService from '@/components/helpers/apiService';

// Define widget configuration interfaces for each widget type
export interface CalendarWidgetConfig {
  events: Array<any>;
  view: 'month' | 'week' | 'day';
  selectedDate: string;
}

export interface ChartWidgetConfig {
  data: Array<{date: Date; amount: number}>;
  secondaryData?: Array<{date: Date; amount: number}>;
  primaryColor: string;
  secondaryColor?: string;
}

export interface SimpleTodoWidgetConfig {
  items: Array<{id: string; text: string; completed: boolean}>;
}

export interface NotesWidgetConfig {
  content: string;
}

export interface ActivityWidgetConfig {
  activities: string[];
}

// Union type for all possible widget configs
export type WidgetConfig = 
  | CalendarWidgetConfig 
  | ChartWidgetConfig 
  | SimpleTodoWidgetConfig 
  | NotesWidgetConfig 
  | ActivityWidgetConfig;

// Define the widget data structure
export interface Widget {
  id: string;
  type: 'todo' | 'simpletodo' | 'notes' | 'activity' | 'calendar' | 'chart';
  title: string;
  config: WidgetConfig;
  size: 'small' | 'medium' | 'large';
  isThumbnail: boolean;
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
  addWidget: (pageId: string, widget: Widget) => void;
  removeWidget: (pageId: string, widgetId: string) => void;
  updateWidgetConfig: <T extends WidgetConfig>(pageId: string, widgetId: string, config: Partial<T>) => void;
  moveWidgetUp: (pageId: string, widgetId: string) => void;
  moveWidgetDown: (pageId: string, widgetId: string) => void;
  addPage: (page: Page) => void;
  removePage: (pageId: string) => void;
  updatePageName: (pageId: string, name: string) => void;
  allWidgetTypes: Widget[];
  toggleWidgetThumbnail: (pageId: string, widgetId: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Sample widgets
const defaultWidgets: Widget[] = [
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendar',
    config: {
      events: [],
      view: 'month',
      selectedDate: new Date().toISOString()
    },
    size: 'medium',
    isThumbnail: false
  },
];

// Default pages with some widgets already added
const defaultPages: Record<string, Page> = {
  dashboard: {
    id: 'dashboard',
    name: 'Relentless',
    customizable: false,
    widgets: [{ ...defaultWidgets[0], id: `${defaultWidgets[0].id}-1`, size: 'medium' }],
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
    widgets: [] 
  },
};

// Storage keys
const STORAGE_KEYS = {
  PAGES: 'app_pages',
};

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Record<string, Page>>(defaultPages);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from API...');
        const storedPages = await apiService.getItem(STORAGE_KEYS.PAGES);
        const pagesToLoad = storedPages || defaultPages;

        // Ensure dashboard title and widgets are up-to-date
        if (pagesToLoad.dashboard) {
          pagesToLoad.dashboard.name = defaultPages.dashboard.name;
          pagesToLoad.dashboard.widgets = defaultPages.dashboard.widgets;
        }
        
        // Clear todo widgets
        if (pagesToLoad.todo) {
          pagesToLoad.todo.widgets = [];
        }
        
        setPages(pagesToLoad);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data from API:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to API when pages structure changes
  useEffect(() => {
    if (!isLoaded) {
      return; // Don't save during initial load
    }
    
    // We're already saving widget config changes separately in updateWidgetConfig
    // This will handle other changes like adding/removing pages or widgets
    apiService.setItem(STORAGE_KEYS.PAGES, pages);
  }, [pages, isLoaded]);

  // Add a widget to a page
  const addWidget = (pageId: string, widget: Widget) => {
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
  const removeWidget = (pageId: string, widgetId: string) => {
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
  const updateWidgetConfig = <T extends WidgetConfig>(pageId: string, widgetId: string, config: Partial<T>) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;

      // Find the widget to update
      const widgetToUpdate = prevPages[pageId].widgets.find(w => w.id === widgetId);
      if (!widgetToUpdate) {
        console.error('Widget not found:', widgetId);
        return prevPages;
      }

      // Special handling for todo widget items
      if (widgetToUpdate.type === 'simpletodo' && 'items' in config) {
        // Type assertion is safe here since we've checked that 'items' is in config
        const todoConfig = config as Partial<SimpleTodoWidgetConfig>;
        if (todoConfig.items) {
          console.log(`Saving todo items for widget ${widgetId}:`, todoConfig.items.length);
        }
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
      
      // Immediately save the updated data to the API
      apiService.setItem(STORAGE_KEYS.PAGES, updatedPages);
      console.log(`Saving widget ${widgetId} update to API`);
      
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
      await apiService.removeItem(STORAGE_KEYS.PAGES);
      setPages(defaultPages);
    } catch (error) {
      console.error('Failed to remove data for reset:', error);
    }
  };

  // Add a method to move a widget up
  const moveWidgetUp = (pageId: string, widgetId: string) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      const widgets = prevPages[pageId].widgets;
      const index = widgets.findIndex(w => w.id === widgetId);
      
      // Can't move up if already at the top
      if (index <= 0) return prevPages;
      
      // Create a new array with the widgets swapped
      const newWidgets = [...widgets];
      const temp = newWidgets[index];
      newWidgets[index] = newWidgets[index - 1];
      newWidgets[index - 1] = temp;
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: newWidgets
        }
      };
    });
  };

  // Add a method to move a widget down
  const moveWidgetDown = (pageId: string, widgetId: string) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      const widgets = prevPages[pageId].widgets;
      const index = widgets.findIndex(w => w.id === widgetId);
      
      // Can't move down if already at the bottom
      if (index < 0 || index >= widgets.length - 1) return prevPages;
      
      // Create a new array with the widgets swapped
      const newWidgets = [...widgets];
      const temp = newWidgets[index];
      newWidgets[index] = newWidgets[index + 1];
      newWidgets[index + 1] = temp;
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          widgets: newWidgets
        }
      };
    });
  };

  // Add a method to update a page's name
  const updatePageName = (pageId: string, name: string) => {
    setPages(prevPages => {
      if (!prevPages[pageId]) return prevPages;
      
      return {
        ...prevPages,
        [pageId]: {
          ...prevPages[pageId],
          name: name
        }
      };
    });
  };

  // Add a method to toggle a widget's thumbnail state
  const toggleWidgetThumbnail = async (pageId: string, widgetId: string) => {
    setPages(prevPages => {
      const page = prevPages[pageId];
      if (!page) return prevPages;

      const updatedWidgets = page.widgets.map(widget => {
        if (widget.id === widgetId) {
          return { ...widget, isThumbnail: !widget.isThumbnail };
        }
        return widget;
      });

      const updatedPages = {
        ...prevPages,
        [pageId]: {
          ...page,
          widgets: updatedWidgets
        }
      };

      // Save updated pages to API
      apiService.setItem(STORAGE_KEYS.PAGES, updatedPages);
      console.log(`Saving widget ${widgetId} thumbnail toggle to API`);
      
      return updatedPages;
    });
  };

  // Value for the context provider
  const value = {
    pages,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    moveWidgetUp,
    moveWidgetDown,
    addPage,
    removePage,
    updatePageName,
    allWidgetTypes: defaultWidgets,
    toggleWidgetThumbnail
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