import React from 'react';
import { render, act } from '@testing-library/react-native';
import { WidgetProvider, useWidgets } from './WidgetContext';
import { PersistenceHelper } from '@/helpers/persistenceHelper';

// Mock the PersistenceHelper
jest.mock('@/helpers/persistenceHelper', () => ({
  PersistenceHelper: {
    loadData: jest.fn().mockImplementation((key, defaultValue) => Promise.resolve(defaultValue)),
    saveData: jest.fn().mockImplementation(() => Promise.resolve(true)),
    removeData: jest.fn().mockImplementation(() => Promise.resolve(true)),
  }
}));

// Test component that uses the widget context
const TestComponent = ({ pageId = 'dashboard' }: { pageId?: string }) => {
  const { pages, addWidget } = useWidgets();
  const widgets = pages[pageId]?.widgets || [];
  
  return (
    <>
      <div data-testid="widget-count">{widgets.length}</div>
      <button 
        data-testid="add-widget-btn"
        onPress={() => {
          addWidget(pageId, {
            id: 'test-widget',
            type: 'notes',
            title: 'Test Widget',
            config: { content: 'Test content' },
            size: 'medium',
            isThumbnail: false
          });
        }}
      />
    </>
  );
};

describe('WidgetContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('provides default pages and widgets', async () => {
    const { getByTestId } = render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for the initial data loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(getByTestId('widget-count').props.children).toBe(1);
  });

  test('adds a widget to a page', async () => {
    const { getByTestId } = render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for the initial data loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Initial count
    expect(getByTestId('widget-count').props.children).toBe(1);
    
    // Add a widget
    await act(async () => {
      getByTestId('add-widget-btn').props.onPress();
    });
    
    // Updated count
    expect(getByTestId('widget-count').props.children).toBe(2);
    
    // Verify persistence was called
    expect(PersistenceHelper.saveData).toHaveBeenCalled();
  });
});
