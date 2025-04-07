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
  const { updateWidgetConfig, pages } = useWidgets();
  
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
  
  // Widget size styles
  const sizeStyles = {
    small: { width: '100%', height: 130 },
    medium: { width: '100%', height: 350 },
    large: { width: '100%', height: 400 },
  };
  
  // Use standard styles for all widgets
  const widgetStyles = sizeStyles[widget.size];

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
      default: return 'square.grid.2x2.fill';
    }
  };

  // Render widget content based on type
  const renderWidgetContent = () => {
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
        />;
      case 'activity':
        return <ActivityWidget
          title={widget.config.title || 'Daily Activity'}
          percentage={widget.config.percentage || 0}
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
          widgetStyles
        ]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <IconSymbol name={getTypeIcon()} size={22} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              {widget.title}
            </Text>
          </View>
          <View style={styles.actions}>
            {draggable && onMoveUp && (
              <Pressable onPress={onMoveUp} style={styles.iconButton}>
                <IconSymbol name="arrow.up" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </Pressable>
            )}
            {draggable && onMoveDown && (
              <Pressable onPress={onMoveDown} style={styles.iconButton}>
                <IconSymbol name="arrow.down" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </Pressable>
            )}
            {onEdit && (
              <Pressable onPress={onEdit} style={styles.iconButton}>
                <IconSymbol name="pencil" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </Pressable>
            )}
            {onRemove && (
              <Pressable onPress={onRemove} style={styles.iconButton}>
                <IconSymbol name="xmark" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.content}>
          {renderWidgetContent()}
        </View>
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
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#334155',
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
  }
});

export default WidgetCard; 