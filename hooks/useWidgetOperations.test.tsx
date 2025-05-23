import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useWidgetOperations } from './useWidgetOperations';
import { WidgetProvider } from '@/contexts/WidgetContext';

// Mock the useWidgets hook
jest.mock('@/contexts/WidgetContext', () => {
  const originalModule = jest.requireActual('@/contexts/WidgetContext');
  
  return {
    ...originalModule,
    useWidgets: () => ({
      addWidget: jest.fn(),
      removeWidget: jest.fn(),
      updateWidgetConfig: jest.fn(),
      moveWidgetUp: jest.fn(),
      moveWidgetDown: jest.fn(),
      toggleWidgetThumbnail: jest.fn(),
      pages: {
        dashboard: {
          id: 'dashboard',
          name: 'Dashboard',
          customizable: false,
          widgets: []
        }
      }
    })
  };
});

// Wrapper component for the hook tests
const wrapper = ({ children }) => (
  <WidgetProvider>{children}</WidgetProvider>
);

describe('useWidgetOperations', () => {
  const pageId = 'dashboard';
  
  test('creates a widget with correct defaults', () => {
    const { result } = renderHook(() => useWidgetOperations(pageId), { wrapper });
    
    const widget = result.current.createWidget('calendar', 'My Calendar');
    
    expect(widget).toMatchObject({
      type: 'calendar',
      title: 'My Calendar',
      size: 'medium',
      isThumbnail: false
    });
    
    // Verify ID pattern
    expect(widget.id).toMatch(/^calendar-\d+$/);
    
    // Verify default config
    expect(widget.config).toHaveProperty('events');
    expect(widget.config).toHaveProperty('view', 'month');
    expect(widget.config).toHaveProperty('selectedDate');
  });
  
  test('creates different widget types with appropriate configs', () => {
    const { result } = renderHook(() => useWidgetOperations(pageId), { wrapper });
    
    const todoWidget = result.current.createWidget('simpletodo', 'Todo List');
    expect(todoWidget.config).toHaveProperty('items');
    expect(Array.isArray(todoWidget.config.items)).toBe(true);
    
    const notesWidget = result.current.createWidget('notes', 'Notes');
    expect(notesWidget.config).toHaveProperty('content', '');
    
    const chartWidget = result.current.createWidget('chart', 'My Chart');
    expect(chartWidget.config).toHaveProperty('data');
    expect(chartWidget.config).toHaveProperty('primaryColor');
  });
  
  test('calls appropriate context methods when operations are performed', () => {
    const { result } = renderHook(() => useWidgetOperations(pageId), { wrapper });
    
    // Mock the context methods
    const addWidgetMock = jest.spyOn(result.current, 'add');
    const removeWidgetMock = jest.spyOn(result.current, 'remove');
    const updateWidgetMock = jest.spyOn(result.current, 'update');
    
    // Create a test widget
    const widget = result.current.createWidget('notes', 'Test Notes');
    
    // Test add
    act(() => {
      result.current.add(widget);
    });
    expect(addWidgetMock).toHaveBeenCalledWith(widget);
    
    // Test update
    act(() => {
      result.current.update(widget.id, { content: 'Updated content' });
    });
    expect(updateWidgetMock).toHaveBeenCalledWith(widget.id, { content: 'Updated content' });
    
    // Test remove
    act(() => {
      result.current.remove(widget.id);
    });
    expect(removeWidgetMock).toHaveBeenCalledWith(widget.id);
  });
});
