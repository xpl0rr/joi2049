import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useWidgets, Widget } from '@/contexts/WidgetContext';
import WidgetCard from '@/components/widgets/WidgetCard';
import { IconSymbol } from '@/components/ui/IconSymbol';

const PageTemplate = ({ pageId }: { pageId: string }) => {
  const { pages, removeWidget, moveWidgetUp, moveWidgetDown } = useWidgets();
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  const page = pages[pageId];
  
  if (!page) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Page not found</Text>
      </View>
    );
  }
  
  const handleEditWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
  };
  
  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(pageId, widgetId);
  };
  
  const handleMoveWidgetUp = (widgetId: string) => {
    moveWidgetUp(pageId, widgetId);
  };
  
  const handleMoveWidgetDown = (widgetId: string) => {
    moveWidgetDown(pageId, widgetId);
  };
  
  const renderWidget = (widget: Widget, index: number) => {
    const isFirstWidget = index === 0;
    const isLastWidget = index === page.widgets.length - 1;
    
    // Style overrides directly inside the widget renderer
    const borderStyle = {
      borderWidth: 2,
      borderColor: '#4D82F3', // App blue theme color
      borderRadius: 12,
      marginBottom: widget.isThumbnail ? 0 : 24, // No bottom margin for thumbnails, handled by thumbnailGrid
    };
    
    if (widget.isThumbnail) {
      return (
        <View key={widget.id} style={[styles.thumbnailWrapper, borderStyle]}>
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
    }
    
    return (
      <View key={widget.id} style={[styles.widgetWrapper, borderStyle]}>
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
  
  // Group widgets by thumbnail status
  const groupWidgets = () => {
    const thumbnails: Widget[] = [];
    const fullWidgets: Widget[] = [];
    
    page.widgets.forEach((widget) => {
      if (widget.isThumbnail) {
        thumbnails.push(widget);
      } else {
        fullWidgets.push(widget);
      }
    });
    
    return { thumbnails, fullWidgets };
  };
  
  const { thumbnails, fullWidgets } = groupWidgets();
  
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4D82F3" />
            <Text style={styles.loadingText}>{loading}</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {page.widgets.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="square.grid.2x2" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>
                No widgets on this page yet.{'\n'}
                Add widgets from the widget store.
              </Text>
            </View>
          ) : (
            <>
              {/* Thumbnail widgets grid */}
              {thumbnails.length > 0 && (
                <View style={styles.thumbnailGrid}>
                  {thumbnails.map((widget, index) => renderWidget(widget, fullWidgets.length + index))}
                </View>
              )}
              
              {/* Full-size widgets */}
              {fullWidgets.map((widget, index) => renderWidget(widget, index))}
              
              {/* Add some bottom padding to ensure scrolling works properly */}
              <View style={styles.bottomPadding} />
            </>
          )}
        </ScrollView>
      )}
      
      {editingWidget && (
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Edit Widget</Text>
            <Pressable style={styles.closeEditor} onPress={() => setEditingWidget(null)}>
              <IconSymbol name="xmark" size={20} color="#64748B" />
            </Pressable>
            <ScrollView 
              style={styles.editScrollView}
              contentContainerStyle={styles.editScrollContent}
            >
              {/* Widget edit form would go here */}
              <Text>Edit form for widget {editingWidget}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 50,
    fontSize: 16,
    color: '#EF4444',
  },
  widgetWrapper: {
    marginBottom: 24,
    width: '100%',
  },
  thumbnailWrapper: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 24,
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
    paddingTop: 0,
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
  editScrollView: {
    maxHeight: 400,
  },
  editScrollContent: {
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    textTransform: 'capitalize',
  },
});

export default PageTemplate; 