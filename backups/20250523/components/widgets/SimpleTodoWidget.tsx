import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as FileSystem from 'expo-file-system';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface CompletedItem extends TodoItem {
  completedAt: string;
}

interface SimpleTodoWidgetProps {
  items: TodoItem[];
  onUpdate: (items: TodoItem[]) => void;
}

const SimpleTodoWidget: React.FC<SimpleTodoWidgetProps> = ({ items: initialItems, onUpdate }) => {
  const colorScheme = useColorScheme();
  const [items, setItems] = useState<TodoItem[]>(initialItems || []);
  const [text, setText] = useState('');
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  
  // Update local state when props change (e.g., when loaded from storage)
  useEffect(() => {
    console.log('SimpleTodoWidget: initialItems changed', initialItems?.length);
    
    // Only update state if the items are different
    if (JSON.stringify(initialItems) !== JSON.stringify(items)) {
      setItems(initialItems || []);
    }
  }, [initialItems]);
  
  // Path to store completed items
  const completedItemsPath = FileSystem.documentDirectory + 'completed_todos.json';

  // Load completed items from storage when component mounts
  React.useEffect(() => {
    loadCompletedItems();
  }, []);

  // Load completed items from file
  const loadCompletedItems = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(completedItemsPath);
      if (fileInfo.exists) {
        const fileContents = await FileSystem.readAsStringAsync(completedItemsPath);
        setCompletedItems(JSON.parse(fileContents));
      }
    } catch (error) {
      console.error('Error loading completed items:', error);
    }
  };

  // Save completed items to file
  const saveCompletedItems = async (updatedItems: CompletedItem[]) => {
    try {
      await FileSystem.writeAsStringAsync(
        completedItemsPath,
        JSON.stringify(updatedItems)
      );
    } catch (error) {
      console.error('Error saving completed items:', error);
    }
  };

  const handleAddTodo = useCallback(() => {
    if (text.trim() === '') return;

    const newItem = { 
      id: Date.now().toString(), 
      text: text.trim(), 
      completed: false,
      createdAt: new Date().toISOString()
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate(newItems);
    setText('');
  }, [text, items, onUpdate]);

  const toggleTodo = useCallback((id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(newItems);
    onUpdate(newItems);
  }, [items, onUpdate]);

  const removeTodo = useCallback((id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (itemToRemove) {
      // Add to completed items if it was completed
      if (itemToRemove.completed) {
        const completedItem: CompletedItem = {
          ...itemToRemove,
          completedAt: new Date().toISOString()
        };
        const newCompletedItems = [...completedItems, completedItem];
        setCompletedItems(newCompletedItems);
        saveCompletedItems(newCompletedItems);
      }
      
      // Remove from current items
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      onUpdate(newItems);
    }
  }, [items, completedItems, onUpdate]);

  const viewCompletedItems = useCallback(() => {
    try {
      if (completedItems.length === 0) {
        Alert.alert("No completed items", "You haven't completed any items yet!");
      } else {
        let message = completedItems
          .map(item => `• ${item.text}`)
          .join('\n');
        
        Alert.alert(
          "Completed Items",
          message,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
    } catch (error) {
      console.error('Error viewing completed items:', error);
      Alert.alert("Error", "Could not view completed items");
    }
  }, [completedItems]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Todo
        </Text>
        <TouchableOpacity 
          style={styles.viewCompletedButton} 
          onPress={viewCompletedItems}
          activeOpacity={0.7}
        >
          <Text style={styles.viewCompletedText}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          placeholderTextColor="#94A3B8"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAddTodo}
          returnKeyType="done"
        />
      </View>

      <ScrollView 
        style={styles.listContainer}
        nestedScrollEnabled={true}
        bounces={false}
        showsVerticalScrollIndicator={true}
        overScrollMode="never">
        {!items || items.length === 0 ? (
          <Text style={styles.emptyText}>
            No tasks yet. Add one above!
          </Text>
        ) : (
          items.map(item => (
            <View 
              key={item.id} 
              style={[
                styles.todoItem,
                item.completed && styles.completedItem
              ]}
            >
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => toggleTodo(item.id)}
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.checkboxInner, 
                    item.completed && { backgroundColor: '#4D82F3' }
                  ]} 
                />
              </TouchableOpacity>
              
              <Text 
                style={[
                  styles.todoText,
                  item.completed && styles.completedText
                ]}
                numberOfLines={2}
              >
                {item.text}
              </Text>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => removeTodo(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  viewCompletedButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  viewCompletedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4D82F3',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    fontSize: 14,
    color: '#334155',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    height: 150,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  completedItem: {
    opacity: 0.7,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  todoText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default SimpleTodoWidget; 