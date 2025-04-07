import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWidgets, Page, Widget } from '@/contexts/WidgetContext';
import WidgetCard from './widgets/WidgetCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';
import ActivityEditForm from './widgets/ActivityEditForm';
import NotesEditForm from './widgets/NotesEditForm';

interface PageTemplateProps {
  pageId: string;
  onAddWidget?: () => void;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ pageId, onAddWidget }) => {
  const colorScheme = useColorScheme();
  const { pages, removeWidgetFromPage, updateWidgetConfig, reorderWidgets } = useWidgets();
  const page = pages[pageId];
  const [editingWidget, setEditingWidget] = useState<string | null>(null);

  // Handle moving a widget up in order
  const handleMoveWidgetUp = (widgetId: string) => {
    if (!page) return;
    
    try {
      // Find the current index of the widget
      const currentIndex = page.widgets.findIndex(w => w.id === widgetId);
      if (currentIndex <= 0 || page.widgets.length <= 1) return; // Already at the top
      
      // Create a new widget order
      const newWidgetOrder = [...page.widgets];
      
      // Remove the widget from its current position
      const [movedWidget] = newWidgetOrder.splice(currentIndex, 1);
      
      // Insert it one position up
      const targetIndex = currentIndex - 1;
      newWidgetOrder.splice(targetIndex, 0, movedWidget);
      
      // Update the widget order in context
      console.log('Moving widget up', { from: currentIndex, to: targetIndex });
      reorderWidgets(pageId, newWidgetOrder.map(w => w.id));
    } catch (error) {
      console.error('Error moving widget up:', error);
    }
  };
  
  // Handle moving a widget down in order
  const handleMoveWidgetDown = (widgetId: string) => {
    if (!page) return;
    
    try {
      // Find the current index of the widget
      const currentIndex = page.widgets.findIndex(w => w.id === widgetId);
      if (currentIndex === -1 || currentIndex >= page.widgets.length - 1) return; // Already at the bottom
      
      // Create a new widget order
      const newWidgetOrder = [...page.widgets];
      
      // Remove the widget from its current position
      const [movedWidget] = newWidgetOrder.splice(currentIndex, 1);
      
      // Insert it one position down
      const targetIndex = currentIndex + 1;
      newWidgetOrder.splice(targetIndex, 0, movedWidget);
      
      // Update the widget order in context
      console.log('Moving widget down', { from: currentIndex, to: targetIndex });
      reorderWidgets(pageId, newWidgetOrder.map(w => w.id));
    } catch (error) {
      console.error('Error moving widget down:', error);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidgetFromPage(pageId, widgetId);
  };

  const handleEditWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
  };

  // Render the appropriate edit form based on widget type
  const renderEditForm = () => {
    if (!editingWidget) return null;
    
    const widget = page.widgets.find(w => w.id === editingWidget);
    if (!widget) return null;
    
    switch (widget.type) {
      case 'activity':
        return (
          <ActivityEditForm 
            config={widget.config} 
            onUpdate={(newConfig) => {
              updateWidgetConfig(pageId, editingWidget, newConfig);
              setEditingWidget(null);
            }}
            onCancel={() => setEditingWidget(null)}
          />
        );
      case 'notes':
        return (
          <NotesEditForm 
            config={widget.config} 
            onUpdate={(newConfig) => {
              updateWidgetConfig(pageId, editingWidget, newConfig);
              setEditingWidget(null);
            }}
            onCancel={() => setEditingWidget(null)}
          />
        );
      default:
        return (
          <Text style={{ color: '#64748B', textAlign: 'center' }}>
            Edit options for this widget type are not yet available.
          </Text>
        );
    }
  };

  if (!page) {
    return (
      <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
        <Text style={[styles.error, { color: '#EF4444' }]}>
          Page not found
        </Text>
      </View>
    );
  }

  // Render each widget with appropriate props
  const renderWidget = (widget: Widget, index: number) => {
    const isFirstWidget = index === 0;
    const isLastWidget = index === page.widgets.length - 1;
    
    return (
      <View
        key={widget.id}
        style={styles.widgetWrapper}
      >
        <WidgetCard
          widget={widget}
          onRemove={() => handleRemoveWidget(widget.id)}
          onEdit={() => handleEditWidget(widget.id)}
          draggable={true}
          onMoveUp={!isFirstWidget ? () => handleMoveWidgetUp(widget.id) : undefined}
          onMoveDown={!isLastWidget ? () => handleMoveWidgetDown(widget.id) : undefined}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {page.name}
          </Text>
          {onAddWidget && (
            <Pressable
              style={styles.addButton}
              onPress={onAddWidget}
            >
              <IconSymbol name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Widget</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          style={styles.content}
          showsVerticalScrollIndicator={true}
        >
          {page.widgets.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="square.grid.2x2" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>
                No widgets on this page yet.{'\n'}
                Add widgets from the widget store.
              </Text>
              {onAddWidget && (
                <Pressable
                  style={styles.emptyAddButton}
                  onPress={onAddWidget}
                >
                  <Text style={styles.emptyAddButtonText}>Add Widget</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.widgetsContainer}>
              {page.widgets.map((widget, index) => 
                renderWidget(widget, index)
              )}
            </View>
          )}
          {/* Add some bottom padding to ensure scrolling works properly */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Widget Editor Modal */}
        {editingWidget && (
          <View style={styles.editOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>
                Edit Widget
              </Text>
              <Pressable
                style={styles.closeEditor}
                onPress={() => setEditingWidget(null)}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#94A3B8" />
              </Pressable>
              
              <ScrollView 
                style={styles.editScrollView}
                contentContainerStyle={styles.editScrollContent}
              >
                {renderEditForm()}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4D82F3',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 16,
    gap: 16,
    minHeight: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#64748B',
  },
  emptyAddButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4D82F3',
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 50,
    fontSize: 16,
    color: '#EF4444',
  },
  widgetWrapper: {
    marginBottom: 16,
    borderRadius: 12,
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModal: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    paddingBottom: 0,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#334155',
  },
  closeEditor: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  widgetsContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
  editScrollView: {
    maxHeight: 400,
  },
  editScrollContent: {
    paddingBottom: 20,
  },
});

export default PageTemplate; 