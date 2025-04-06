import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
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
  onDragEnd?: (position: { x: number; y: number }) => void;
  onDragStart?: (isDragging: boolean) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ 
  widget, 
  onRemove, 
  onEdit,
  draggable = false,
  onDragEnd,
  onDragStart
}) => {
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const { updateWidgetConfig, pages } = useWidgets();

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
      updateWidgetConfig(pageId, widget.id, newConfig);
    }
  };

  // Animated values for dragging
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Widget size styles
  const sizeStyles = {
    small: { width: '100%', height: 130 },
    medium: { width: '100%', height: 350 },
    large: { width: '100%', height: 400 },
  };
  
  // Use standard styles for all widgets
  const widgetStyles = sizeStyles[widget.size];

  // Handle gesture for dragging
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
      onDragStart?.(true);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      if (onDragEnd) {
        onDragEnd({ x: translateX.value, y: translateY.value });
      }
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      onDragStart?.(false);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
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
        return <SimpleTodoWidget 
          items={widget.config.items || []} 
          onUpdate={(items) => handleUpdateConfig({...widget.config, items})} 
        />;
      case 'notes':
        return <NotesWidget 
          notes={widget.config.notes || ''} 
          onUpdate={(notes) => handleUpdateConfig({...widget.config, notes})} 
        />;
      case 'activity':
        return <ActivityWidget
          title={widget.config.title || 'Daily Activity'}
          subtitle={widget.config.subtitle || 'How active is your site today?'}
          percentage={widget.config.percentage || 0}
          average={widget.config.average || 0}
          metrics={widget.config.metrics || []}
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

  const WidgetContent = () => {
    return (
      <View style={[
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
    );
  };

  if (draggable) {
    return (
      <PanGestureHandler 
        onGestureEvent={gestureHandler}
        // We'll use only one of activeOffsetX or activeOffsetY to avoid conflicts
        activeOffsetX={[-20, 20]}>
        <Animated.View style={animatedStyle}>
          <WidgetContent />
        </Animated.View>
      </PanGestureHandler>
    );
  }

  return <WidgetContent />;
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