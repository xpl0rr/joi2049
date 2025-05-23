import { useCallback } from 'react';
import { useWidgets } from '@/contexts/WidgetContext';
import type { Widget, WidgetConfig } from '@/contexts/WidgetContext';

/**
 * Custom hook for common widget operations
 * Provides simplified methods for managing widgets with built-in validation
 */
export function useWidgetOperations(pageId: string) {
  const { 
    addWidget, 
    removeWidget, 
    updateWidgetConfig, 
    moveWidgetUp, 
    moveWidgetDown,
    toggleWidgetThumbnail 
  } = useWidgets();

  /**
   * Add a new widget to the current page
   */
  const add = useCallback((widget: Widget) => {
    if (!widget.id) {
      console.error('Cannot add widget without an ID');
      return;
    }
    addWidget(pageId, widget);
  }, [pageId, addWidget]);

  /**
   * Remove a widget from the current page
   */
  const remove = useCallback((widgetId: string) => {
    if (!widgetId) {
      console.error('Cannot remove widget without an ID');
      return;
    }
    removeWidget(pageId, widgetId);
  }, [pageId, removeWidget]);

  /**
   * Update a widget's configuration
   */
  const update = useCallback(<T extends WidgetConfig>(
    widgetId: string, 
    config: Partial<T>
  ) => {
    if (!widgetId) {
      console.error('Cannot update widget without an ID');
      return;
    }
    updateWidgetConfig<T>(pageId, widgetId, config);
  }, [pageId, updateWidgetConfig]);

  /**
   * Move a widget up in the display order
   */
  const moveUp = useCallback((widgetId: string) => {
    moveWidgetUp(pageId, widgetId);
  }, [pageId, moveWidgetUp]);

  /**
   * Move a widget down in the display order
   */
  const moveDown = useCallback((widgetId: string) => {
    moveWidgetDown(pageId, widgetId);
  }, [pageId, moveWidgetDown]);

  /**
   * Toggle a widget's thumbnail state
   */
  const toggleThumbnail = useCallback((widgetId: string) => {
    toggleWidgetThumbnail(pageId, widgetId);
  }, [pageId, toggleWidgetThumbnail]);

  /**
   * Create a new widget with default configuration
   */
  const createWidget = useCallback((
    type: Widget['type'],
    title: string,
    size: Widget['size'] = 'medium'
  ): Widget => {
    // Generate a unique ID
    const id = `${type}-${Date.now()}`;
    
    // Create default configs based on widget type
    let config: WidgetConfig;
    
    switch (type) {
      case 'calendar':
        config = {
          events: [],
          view: 'month',
          selectedDate: new Date().toISOString()
        };
        break;
        
      case 'chart':
        config = {
          data: [],
          primaryColor: '#4D82F3',
          secondaryColor: '#EF4444'
        };
        break;
        
      case 'simpletodo':
        config = {
          items: []
        };
        break;
        
      case 'notes':
        config = {
          content: ''
        };
        break;
        
      case 'activity':
        config = {
          activities: []
        };
        break;
        
      default:
        // Fallback config
        config = {} as WidgetConfig;
    }
    
    return {
      id,
      type,
      title,
      config,
      size,
      isThumbnail: false
    };
  }, []);

  return {
    add,
    remove,
    update,
    moveUp,
    moveDown,
    toggleThumbnail,
    createWidget
  };
}

export default useWidgetOperations;
