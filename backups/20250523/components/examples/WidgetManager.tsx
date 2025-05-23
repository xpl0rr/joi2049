import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useWidgetOperations } from '@/hooks/useWidgetOperations';
import { Widget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

/**
 * Example component that demonstrates how to use the useWidgetOperations hook
 * This can be used as a reference for managing widgets in the app
 */
export function WidgetManager({ pageId }: { pageId: string }) {
  const {
    add,
    remove,
    update,
    moveUp,
    moveDown,
    toggleThumbnail,
    createWidget
  } = useWidgetOperations(pageId);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetType, setWidgetType] = useState<Widget['type']>('notes');
  
  // Function to add a new widget
  const handleAddWidget = () => {
    if (!widgetTitle.trim()) return;
    
    // Create the widget with our helper
    const newWidget = createWidget(widgetType, widgetTitle.trim());
    
    // Add it to the page
    add(newWidget);
    
    // Reset the form
    setWidgetTitle('');
    setModalVisible(false);
  };
  
  // Example of updating a widget config
  const handleUpdateWidgetContent = (widgetId: string, content: string) => {
    update(widgetId, { content });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Widgets</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus" size={20} color="#FFF" />
        </Pressable>
      </View>
      
      {/* Widget Add Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Widget</Text>
            
            <Text style={styles.label}>Widget Type</Text>
            <View style={styles.typeContainer}>
              {(['notes', 'simpletodo', 'calendar', 'chart'] as const).map(type => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeButton,
                    widgetType === type && styles.typeButtonSelected
                  ]}
                  onPress={() => setWidgetType(type)}
                >
                  <Text style={[
                    styles.typeText,
                    widgetType === type && styles.typeTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Text style={styles.label}>Widget Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter widget title"
              value={widgetTitle}
              onChangeText={setWidgetTitle}
            />
            
            <View style={styles.modalActions}>
              <Pressable 
                style={styles.saveButton}
                onPress={handleAddWidget}
              >
                <Text style={styles.saveText}>Add Widget</Text>
              </Pressable>
              
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    margin: 4,
  },
  typeButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  typeText: {
    color: '#000',
  },
  typeTextSelected: {
    color: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
});

export default WidgetManager;
