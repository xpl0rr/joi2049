import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
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
  const [selectedPageId, setSelectedPageId] = React.useState<string | null>(null);
  const [showPageSelector, setShowPageSelector] = React.useState(false);

  const handleAddWidget = (widget: Widget) => {
    if (selectedPageId) {
      // Create a unique ID for the widget instance
      const uniqueId = `${widget.id}-${Date.now()}`;
      const widgetInstance = {
        ...widget,
        id: uniqueId
      };
      
      addWidgetToPage(selectedPageId, widgetInstance);
      setShowPageSelector(false);
    } else {
      setShowPageSelector(true);
    }
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

        <ScrollView style={styles.content}>
          <TabManager />
          
          {showPageSelector && !selectedPageId && (
            <View style={styles.pageSelector}>
              <Text style={styles.pageSelectorTitle}>
                Select a page to add widget
              </Text>
              <View style={styles.pageList}>
                {Object.values(pages).map((page) => (
                  <Pressable
                    key={page.id}
                    style={styles.pageItem}
                    onPress={() => setSelectedPageId(page.id)}
                  >
                    <Text style={styles.pageItemText}>
                      {page.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={styles.closePageSelector}
                onPress={() => setShowPageSelector(false)}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#334155" />
              </Pressable>
            </View>
          )}

          {Object.entries(widgetsByType).map(([type, widgets]) => (
            <View key={type} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Widgets
              </Text>
              <View style={styles.widgetGrid}>
                {widgets.map((widget) => (
                  <View key={widget.id} style={styles.widgetContainer}>
                    <WidgetCard widget={widget} />
                    <Pressable
                      style={styles.addButton}
                      onPress={() => handleAddWidget(widget)}
                    >
                      <IconSymbol name="plus" size={16} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add to Page</Text>
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
  selectedPage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectedPageText: {
    marginRight: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#4D82F3',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  widgetGrid: {
    padding: 8,
  },
  widgetContainer: {
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginTop: 8,
    backgroundColor: '#4D82F3',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  pageSelector: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pageSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155',
  },
  pageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pageItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  pageItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  closePageSelector: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
}); 