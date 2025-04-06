import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWidgets, Widget } from '@/contexts/WidgetContext';
import WidgetCard from '@/components/widgets/WidgetCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function WidgetsStore() {
  const colorScheme = useColorScheme();
  const { availableWidgets, pages, addWidgetToPage } = useWidgets();
  const [selectedPageId, setSelectedPageId] = React.useState<string | null>(null);
  const [showPageSelector, setShowPageSelector] = React.useState(false);

  const handleAddWidget = (widget: Widget) => {
    if (selectedPageId) {
      addWidgetToPage(selectedPageId, widget);
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
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Widget Store
        </Text>
        {selectedPageId && (
          <Pressable
            onPress={() => setSelectedPageId(null)}
            style={styles.selectedPage}
          >
            <Text style={[styles.selectedPageText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Adding to: {pages[selectedPageId].name}
            </Text>
            <IconSymbol name="xmark.circle.fill" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          </Pressable>
        )}
      </View>

      {showPageSelector && !selectedPageId && (
        <View style={[styles.pageSelector, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <Text style={[styles.pageSelectorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Select a page to add widget
          </Text>
          <View style={styles.pageList}>
            {Object.values(pages).map((page) => (
              <Pressable
                key={page.id}
                style={[
                  styles.pageItem,
                  { backgroundColor: Colors[colorScheme ?? 'light'].background }
                ]}
                onPress={() => setSelectedPageId(page.id)}
              >
                <Text style={[styles.pageItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {page.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.closePageSelector}
            onPress={() => setShowPageSelector(false)}
          >
            <IconSymbol name="xmark.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.content}>
        {Object.entries(widgetsByType).map(([type, widgets]) => (
          <View key={type} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Widgets
            </Text>
            <View style={styles.widgetGrid}>
              {widgets.map((widget) => (
                <View key={widget.id} style={styles.widgetContainer}>
                  <WidgetCard widget={widget} />
                  <Pressable
                    style={[
                      styles.addButton,
                      { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                    ]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedPage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedPageText: {
    marginRight: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
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
    marginTop: -4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  pageSelector: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pageSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  pageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pageItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pageItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closePageSelector: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
}); 