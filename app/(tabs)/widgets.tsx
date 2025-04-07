import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWidgets, Widget } from '@/contexts/WidgetContext';
import WidgetCard from '@/components/widgets/WidgetCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabManager from '@/components/TabManager';

export default function Settings() {
  const colorScheme = useColorScheme();
  const { availableWidgets, pages, addWidgetToPage } = useWidgets();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [addingWidgetType, setAddingWidgetType] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAddWidgetButtonPress = (widget: Widget) => {
    setSelectedWidget(widget);
    setShowPageSelector(true);
    
    // Scroll to the top where the page selector is shown
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 100);
  };

  const handleAddWidget = (pageId: string, widget: Widget) => {
    // Set loading state
    setIsAddingWidget(true);
    setAddingWidgetType(widget.type);
    
    // Create a unique ID for the widget instance
    const uniqueId = `${widget.id}-${Date.now()}`;
    const widgetInstance = {
      ...widget,
      id: uniqueId
    };
    
    // Add widget with a small delay to show the loading indicator
    setTimeout(() => {
      addWidgetToPage(pageId, widgetInstance);
      setIsAddingWidget(false);
      setAddingWidgetType(null);
      setShowPageSelector(false);
      setSelectedWidget(null);
      setSelectedPageId(null);
    }, 800); // Short delay to show loading state
  };

  // Group widgets by type
  const widgetsByType: Record<string, Widget[]> = availableWidgets.reduce((acc, widget) => {
    const type = widget.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Settings
          </Text>
          {selectedPageId && (
            <Pressable style={styles.selectedPage} onPress={() => setSelectedPageId(null)}>
              <Text style={styles.selectedPageText}>
                {pages[selectedPageId]?.name}
              </Text>
              <IconSymbol name="xmark" size={14} color="#4D82F3" />
            </Pressable>
          )}
        </View>

        <ScrollView 
          style={styles.content}
          ref={scrollViewRef}
        >
          <TabManager />
          
          {showPageSelector && selectedWidget && (
            <View style={styles.pageSelector}>
              <Text style={styles.pageSelectorTitle}>
                Select a page to add {selectedWidget.title}
              </Text>
              <View style={styles.pageList}>
                {Object.values(pages).map((page) => (
                  <Pressable
                    key={page.id}
                    style={[
                      styles.pageItem,
                      isAddingWidget && addingWidgetType === selectedWidget.type && styles.pageItemDisabled
                    ]}
                    onPress={() => !isAddingWidget && handleAddWidget(page.id, selectedWidget)}
                    disabled={isAddingWidget}
                  >
                    <Text style={styles.pageItemText}>
                      {page.name}
                    </Text>
                    {isAddingWidget && addingWidgetType === selectedWidget.type && (
                      <ActivityIndicator size="small" color="#4D82F3" style={styles.pageItemLoader} />
                    )}
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={styles.closePageSelector}
                onPress={() => {
                  setShowPageSelector(false);
                  setSelectedWidget(null);
                }}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#334155" />
              </Pressable>
            </View>
          )}

          {isAddingWidget && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4D82F3" />
                <Text style={styles.loadingText}>
                  Adding {addingWidgetType} widget...
                </Text>
              </View>
            </View>
          )}

          {Object.entries(widgetsByType).map(([type, widgets]) => (
            <View key={type} style={styles.section}>
              <View style={styles.widgetGrid}>
                {widgets.map((widget) => (
                  <View key={widget.id} style={styles.widgetContainer}>
                    <WidgetCard widget={widget} />
                    <Pressable
                      style={[
                        styles.addButton,
                        (isAddingWidget && addingWidgetType === widget.type) && styles.addButtonDisabled
                      ]}
                      onPress={() => !isAddingWidget && handleAddWidgetButtonPress(widget)}
                      disabled={isAddingWidget}
                    >
                      {isAddingWidget && addingWidgetType === widget.type ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <IconSymbol name="plus" size={16} color="#FFFFFF" />
                          <Text style={styles.addButtonText}>Add to Page</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  widgetContainer: {
    width: '100%',
    marginBottom: 24,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#4D82F3',
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  selectedPage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedPageText: {
    color: '#4D82F3',
    marginRight: 6,
    fontWeight: '500',
  },
  pageSelector: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#EBF5FF',
  },
  pageSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageList: {
    gap: 10,
  },
  pageItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageItemDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  pageItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  pageItemLoader: {
    marginLeft: 8,
  },
  closePageSelector: {
    position: 'absolute',
    top: 12,
    right: 12,
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