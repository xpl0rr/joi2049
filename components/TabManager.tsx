import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useWidgets } from '@/contexts/WidgetContext';
import { IconSymbol } from './ui/IconSymbol';

const TabManager: React.FC = () => {
  const { pages, createPage, removePage } = useWidgets();
  const [newTabName, setNewTabName] = useState('');

  const handleAddTab = () => {
    if (!newTabName.trim()) {
      return;
    }

    createPage(newTabName.trim());
    setNewTabName('');
  };

  const handleRemoveTab = (pageId: string, pageName: string) => {
    Alert.alert(
      "Remove Tab",
      `Are you sure you want to remove the "${pageName}" tab?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removePage(pageId), style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tabs</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New tab name..."
          placeholderTextColor="#94A3B8"
          value={newTabName}
          onChangeText={setNewTabName}
          returnKeyType="done"
          onSubmitEditing={handleAddTab}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTab}>
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {Object.values(pages).map(page => (
          <View key={page.id} style={styles.tabItem}>
            <Text style={styles.tabName}>{page.name}</Text>
            {page.customizable && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveTab(page.id, page.name)}
              >
                <IconSymbol name="xmark" size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#334155',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4D82F3',
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  tabName: {
    fontSize: 14,
    color: '#334155',
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
});

export default TabManager; 