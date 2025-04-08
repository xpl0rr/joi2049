import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Widget, useWidgets } from '@/contexts/WidgetContext';
import NotesWidget from './NotesWidget';
import SimpleTodoWidget from './SimpleTodoWidget';
import ActivityWidget from './ActivityWidget';
import CalendarWidget from './CalendarWidget';
import ChartWidget from './ChartWidget';

interface WidgetCardProps {
  widget: Widget;
  onRemove?: () => void;
  onEdit?: () => void;
  draggable?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ 
  widget, 
  onRemove, 
  onEdit,
  draggable = false,
  onMoveUp,
  onMoveDown
}) => {
  const colorScheme = useColorScheme();
  const { updateWidgetConfig, pages, toggleWidgetThumbnail } = useWidgets();
  
  // Animated values for visual feedback
  const scale = useSharedValue(1);

  // Find which page this widget belongs to
  const findPageId = () => {
    for (const [pageId, page] of Object.entries(pages)) {
      if (page.widgets.some(w => w.id === widget.id)) {
        return pageId;
      }
    }
    return null;
  };
  
  const pageId = findPageId();

  // Handle widget config updates
  const handleUpdateConfig = (newConfig: any) => {
    if (pageId) {
      console.log('Updating widget config:', { pageId, widgetId: widget.id, newConfig });
      updateWidgetConfig(pageId, widget.id, newConfig);
    } else {
      console.error('Cannot update widget config: pageId not found for widget', widget.id);
    }
  };
  
  // Handle thumbnail toggle
  const handleToggleThumbnail = () => {
    if (pageId) {
      toggleWidgetThumbnail(pageId, widget.id);
    }
  };
  
  // Widget size styles
  const sizeStyles = {
    small: { width: '100%', height: 130 },
    medium: { width: '100%', height: 350 },
    large: { width: '100%', height: 400 },
  };
  
  // Thumbnail style - approximately 1/2 of screen width
  const thumbnailStyle = { width: '100%', height: 110 };
  
  // Use thumbnail or standard styles based on widget state
  const widgetStyles = widget.isThumbnail ? thumbnailStyle : sizeStyles[widget.size];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Widget type icon mapping
  const getTypeIcon = () => {
    switch(widget.type) {
      case 'todo': return 'checklist';
      case 'simpletodo': return 'list.bullet';
      case 'notes': return 'note.text';
      case 'activity': return 'chart.bar.fill';
      case 'calendar': return 'calendar';
      case 'chart': return 'chart.bar';
      default: return 'square.grid.2x2.fill';
    }
  };

  // Render widget content based on type
  const renderWidgetContent = () => {
    // If widget is in thumbnail mode, render a simple preview instead
    if (widget.isThumbnail) {
      return null; // No content for thumbnail mode, just the header
    }
    
    // Check if this is a preview widget in the widget selection screen
    // We can detect this by checking if the onEdit and onRemove props are undefined
    const isPreviewWidget = onEdit === undefined && onRemove === undefined;
    
    // Render the full widget content
    switch(widget.type) {
      case 'todo':
      case 'simpletodo':
        console.log('Rendering SimpleTodoWidget with items:', widget.config.items?.length || 0);
        return <SimpleTodoWidget 
          items={widget.config.items || []} 
          onUpdate={(items) => {
            console.log('Todo items updated, saving:', items.length);
            handleUpdateConfig({...widget.config, items});
          }} 
        />;
      case 'notes':
        return <NotesWidget 
          notes={widget.config.notes || ''} 
          onUpdate={(notes) => handleUpdateConfig({...widget.config, notes})}
          readOnly={isPreviewWidget} // Set readOnly to true for preview widgets
        />;
      case 'activity':
        return <ActivityWidget
          title={widget.config.title || 'Daily Activity'}
          percentage={widget.config.percentage || 0}
          onUpdate={(config) => handleUpdateConfig({...widget.config, ...config})}
        />;
      case 'calendar':
        return <CalendarWidget
          events={widget.config.events || []}
          onUpdate={(config) => handleUpdateConfig({...widget.config, ...config})}
          onEdit={onEdit}
        />;
      case 'chart':
        return <ChartWidget
          title={widget.config.title || widget.title || 'Bar Chart'}
          data={widget.config.data || []}
          onUpdate={(config) => handleUpdateConfig({...widget.config, ...config})}
        />;
      default:
        return (
          <Text style={[styles.placeholder, { color: '#64748B' }]}>
            {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} widget
          </Text>
        );
    }
  };

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <View 
        style={[
          styles.container, 
          { backgroundColor: '#FFFFFF' },
          widgetStyles,
          widget.isThumbnail && styles.thumbnailContainer
        ]}>
        <View style={[styles.header, widget.isThumbnail && styles.thumbnailHeader]}>
          <View style={[styles.titleContainer, widget.isThumbnail && styles.thumbnailTitleContainer]}>
            {!widget.isThumbnail && (
              <IconSymbol name={getTypeIcon()} size={22} color={Colors[colorScheme ?? 'light'].tint} />
            )}
            <Text 
              style={[
                styles.title, 
                { color: Colors[colorScheme ?? 'light'].text },
                widget.isThumbnail && styles.thumbnailTitleText,
                !widget.isThumbnail && { marginLeft: 8 }
              ]}
              numberOfLines={widget.isThumbnail ? (widget.title.includes(' ') ? 2 : 1) : 1}
            >
              {widget.title}
            </Text>
          </View>
          <View style={styles.actions}>
            {draggable && onMoveUp && !widget.isThumbnail && (
              <Pressable onPress={onMoveUp} style={styles.iconButton}>
                <IconSymbol name="arrow.up" size={16} color="#1F2937" />
              </Pressable>
            )}
            {draggable && onMoveDown && !widget.isThumbnail && (
              <Pressable onPress={onMoveDown} style={styles.iconButton}>
                <IconSymbol name="arrow.down" size={16} color="#1F2937" />
              </Pressable>
            )}
            <Pressable onPress={handleToggleThumbnail} style={styles.iconButton}>
              <IconSymbol 
                name={widget.isThumbnail ? "arrow.up.left.and.arrow.down.right" : "arrow.down.right.and.arrow.up.left"} 
                size={16} 
                color="#1F2937" 
              />
            </Pressable>
            {onEdit && !widget.isThumbnail && (
              <Pressable onPress={onEdit} style={styles.iconButton}>
                <IconSymbol name="pencil" size={16} color="#1F2937" />
              </Pressable>
            )}
            {onRemove && !widget.isThumbnail && (
              <Pressable onPress={onRemove} style={styles.iconButton}>
                <IconSymbol name="xmark" size={16} color="#1F2937" />
              </Pressable>
            )}
          </View>
        </View>
        {!widget.isThumbnail && (
          <View style={styles.content}>
            {renderWidgetContent()}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    margin: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailContainer: {
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnailTitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  thumbnailTitleText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 0,
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    color: '#64748B',
  },
  // Remove unused styles
  thumbnailContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  thumbnailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  thumbnailHeader: {
    marginBottom: 0,
    paddingVertical: 0,
  },
});

export default WidgetCard; 