import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the widget data structure
export interface Widget {
  id: string;
  type: 'todo' | 'simpletodo' | 'notes' | 'activity';
  title: string;
  config: any;
  size: 'small' | 'medium' | 'large';
}

// Define page data structure
export interface Page {
  id: string;
  name: string;
  widgets: Widget[];
  customizable?: boolean; // Flag to indicate if this page can be deleted
}

interface WidgetContextType {
  pages: Record<string, Page>;
  availableWidgets: Widget[];
  addWidgetToPage: (pageId: string, widget: Widget) => void;
  removeWidgetFromPage: (pageId: string, widgetId: string) => void;
  updateWidgetConfig: (pageId: string, widgetId: string, config: any) => void;
  createPage: (name: string) => string;
  removePage: (pageId: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Sample widgets
const defaultWidgets: Widget[] = [
  { 
    id: 'notes', 
    type: 'notes', 
    title: 'Quick Notes', 
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

export const WidgetProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [pages, setPages] = useState<Record<string, Page>>(defaultPages);
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>(defaultWidgets);

  const addWidgetToPage = (pageId: string, widget: Widget) => {
    setPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        widgets: [...prev[pageId].widgets, { ...widget, id: `${widget.id}-${Date.now()}` }],
      },
    }));
  };

  const removeWidgetFromPage = (pageId: string, widgetId: string) => {
    setPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        widgets: prev[pageId].widgets.filter(w => w.id !== widgetId),
      },
    }));
  };

  const updateWidgetConfig = (pageId: string, widgetId: string, config: any) => {
    setPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        widgets: prev[pageId].widgets.map(w => 
          w.id === widgetId ? { ...w, config } : w
        ),
      },
    }));
  };

  const createPage = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setPages(prev => {
      // Check if page with this ID already exists
      if (prev[id]) {
        return prev; // Don't create duplicate
      }
      
      return {
        ...prev,
        [id]: { 
          id, 
          name, 
          widgets: [],
          customizable: true 
        },
      };
    });
    return id;
  };

  const removePage = (pageId: string) => {
    setPages(prev => {
      // Don't allow removing non-customizable pages
      if (!prev[pageId]?.customizable) {
        return prev;
      }
      
      const newPages = { ...prev };
      delete newPages[pageId];
      return newPages;
    });
  };

  return (
    <WidgetContext.Provider
      value={{
        pages,
        availableWidgets,
        addWidgetToPage,
        removeWidgetFromPage,
        updateWidgetConfig,
        createPage,
        removePage,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}; 