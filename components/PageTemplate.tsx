import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWidgets, Page, Widget } from '@/contexts/WidgetContext';
import WidgetCard from './widgets/WidgetCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';
import { useDrop } from './hooks/useDrop';
import ActivityEditForm from './widgets/ActivityEditForm';

interface PageTemplateProps {
  pageId: string;
  onAddWidget?: () => void;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ pageId, onAddWidget }) => {
  const colorScheme = useColorScheme();
  const { pages, removeWidgetFromPage, updateWidgetConfig } = useWidgets();
  const page = pages[pageId];
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  // Logic for receiving dropped widgets would go here
  const handleDrop = (widgetId: string, position: { x: number; y: number }) => {
    // This would handle widgets being dragged in from other pages
    console.log('Dropped widget', widgetId, 'at', position);
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidgetFromPage(pageId, widgetId);
  };

  const handleEditWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
  };

  // Add a function to render the appropriate edit form based on widget type
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
      // Add cases for other widget types as needed
      default:
        return (
          <Text style={{ color: '#64748B', textAlign: 'center' }}>
            Edit options for this widget type are not yet available.
          </Text>
        );
    }
  };

  // This would be called when a drag operation starts/ends
  const handleDragStateChange = (isDragging: boolean) => {
    setIsScrollEnabled(!isDragging);
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

  // Group widgets by size to optimize layout
  const smallWidgets = page.widgets.filter(w => w.size === 'small');
  const mediumWidgets = page.widgets.filter(w => w.size === 'medium');
  const largeWidgets = page.widgets.filter(w => w.size === 'large');

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
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          onTouchStart={(e) => {
            // We simply ensure scrolling is enabled when user touches the screen
            setIsScrollEnabled(true);
          }}
          // Disable all fancy props that might be causing conflicts
          overScrollMode="auto"
          bounces={true}
          simultaneousHandlers={null}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}>
          {page.widgets.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="square.grid.2x2" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>
                No widgets added to this page yet
              </Text>
              {onAddWidget && (
                <Pressable
                  style={styles.emptyAddButton}
                  onPress={onAddWidget}
                >
                  <Text style={styles.emptyAddButtonText}>Add Your First Widget</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.widgetsContainer}>
              {/* Large widgets - full width */}
              {largeWidgets.length > 0 && (
                <View style={styles.widgetSection}>
                  {largeWidgets.map(widget => (
                    <WidgetCard
                      key={widget.id}
                      widget={widget}
                      onRemove={() => handleRemoveWidget(widget.id)}
                      onEdit={() => handleEditWidget(widget.id)}
                      draggable={false}
                    />
                  ))}
                </View>
              )}

              {/* Medium widgets - full width */}
              {mediumWidgets.length > 0 && (
                <View style={[styles.widgetSection, {marginBottom: 20}]}>
                  {mediumWidgets.map(widget => (
                    <WidgetCard
                      key={widget.id}
                      widget={widget}
                      onRemove={() => handleRemoveWidget(widget.id)}
                      onEdit={() => handleEditWidget(widget.id)}
                      draggable={false}
                    />
                  ))}
                </View>
              )}

              {mediumWidgets.length > 0 && smallWidgets.length > 0 && (
                <View style={styles.widgetSeparator} />
              )}

              {/* Small widgets - single column layout for simplicity */}
              {smallWidgets.length > 0 && (
                <View style={styles.widgetSection}>
                  {smallWidgets.map(widget => (
                    <WidgetCard
                      key={widget.id}
                      widget={widget}
                      onRemove={() => handleRemoveWidget(widget.id)}
                      onEdit={() => handleEditWidget(widget.id)}
                      draggable={false}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          {/* Add some bottom padding to ensure scrolling works properly */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Widget Editor Modal would go here */}
        {editingWidget && (
          <Pressable
            style={styles.editOverlay}
            onPress={() => setEditingWidget(null)}
          >
            <View
              style={[styles.editModal, { backgroundColor: '#FFFFFF' }]}
            >
              <Text style={[styles.editTitle, { color: '#334155' }]}>
                Edit Widget
              </Text>
              <Pressable style={styles.closeEditor} onPress={() => setEditingWidget(null)}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#334155" />
              </Pressable>
              {renderEditForm()}
            </View>
          </Pressable>
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
  widgetSection: {
    marginBottom: 16,
    gap: 16,
  },
  widgetSeparator: {
    height: 12,
    width: '100%',
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
    maxHeight: '80%',
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
    marginBottom: 16,
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
});

export default PageTemplate; 