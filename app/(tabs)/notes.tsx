import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, TextInput, Pressable, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { shareAsync } from 'expo-sharing';
import * as Updates from 'expo-updates';

const STORAGE_KEY = '@notes';

export default function NotesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const [notes, setNotes] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setNotes(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load notes', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (e) {
        console.error('Failed to save notes', e);
      }
    })();
  }, [notes]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setNewNote('');
  };
  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, newNote.trim()]);
    closeModal();
  };
  const removeNote = (index: number) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
  };

  // Export and imports for backup - moved from finance page
  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      const obj = Object.fromEntries(result);
      
      try {
        if (obj['calendar-db']) {
          const calendarData = JSON.parse(obj['calendar-db']);
          if (calendarData.state && calendarData.state.activities) {
            obj['calendar-activities'] = JSON.stringify(calendarData.state.activities);
            console.log('Exported activities separately:', calendarData.state.activities.length, 'items');
          }
        }
      } catch (e) {
        console.error('Error extracting activities for export:', e);
      }
      
      const json = JSON.stringify(obj);
      const fileUri = FileSystem.documentDirectory + 'joi_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await shareAsync(fileUri, { UTI: 'public.json', mimeType: 'application/json' });
    } catch (e) {
      console.error(e);
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const importData = async () => {
    try {
      console.log('Starting import process...');
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        console.log('File picked, reading content from:', fileUri);
        
        const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
        console.log('File content length:', content.length);
        
        const obj = JSON.parse(content);
        console.log('Parsed JSON with', Object.keys(obj).length, 'keys');
        
        // Create a new object with unpacked values for selected keys
        const modifiedObj = {...obj};
        
        if (obj['@notes']) {
          console.log('Found @notes in import, length:', obj['@notes'].length);
          try {
            const notesData = JSON.parse(obj['@notes']);
            console.log('Parsed notes data:', notesData.length, 'items');
            setNotes(notesData);
          } catch (e) {
            console.error('Error parsing @notes:', e);
          }
        }
        
        // Convert to entries for AsyncStorage
        const entries = Object.entries(modifiedObj) as [string, string][];
        console.log('Setting', entries.length, 'entries in AsyncStorage');
        await AsyncStorage.multiSet(entries);
        
        Alert.alert('Import Successful', 'Data has been imported. The app will now reload.');
        console.log('Reloading app with Updates.reloadAsync()...');
        await Updates.reloadAsync();
      } else {
        console.log('Document picker canceled');
      }
    } catch (e) {
      console.error('Import failed with error:', e);
      Alert.alert('Import Failed', 'Could not import data: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>      
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: '#000000', textAlign: 'center' }]}>Notes</Text>
          <Pressable onPress={openModal} style={[styles.addButton, { backgroundColor: '#4D82F3' }]}>
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        
        <FlatList
          style={styles.notesList}
          data={notes}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: '#666666' }]}>No notes yet.</Text>}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <Text style={[styles.itemText, { color: '#000000' }]}>{item}</Text>
              <Pressable onPress={() => removeNote(index)} style={styles.deleteButton}>
                <IconSymbol name="trash" size={20} color="#EF4444" />
              </Pressable>
            </View>
          )}
        />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Note content"
              value={newNote}
              onChangeText={setNewNote}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={addNote}>
                <Text style={styles.saveText}>Add</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Export/Import Buttons at bottom */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWithLabel}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: '#4D82F3' }]} 
            onPress={exportData}
          >
            <IconSymbol name="arrow.up" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Export</Text>
        </View>
        <View style={styles.buttonWithLabel}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: '#4D82F3' }]} 
            onPress={importData}
          >
            <IconSymbol name="arrow.down" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Import</Text>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 16, 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  notesList: {
    flex: 1,
  },
  addButton: { 
    width: 32, 
    height: 32, 
    backgroundColor: '#4D82F3', 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  itemText: { 
    fontSize: 16, 
    color: '#000000' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#6B7280', 
    marginTop: 20, 
    fontSize: 16 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    width: '90%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    padding: 16 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12,
    color: '#000000'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: 4, 
    padding: 8, 
    marginBottom: 12,
    color: '#000000' 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12 
  },
  saveButton: { 
    backgroundColor: '#4D82F3', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 8 
  },
  saveText: { 
    color: 'white', 
    fontWeight: '600' 
  },
  cancelButton: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    flex: 1, 
    marginLeft: 8 
  },
  cancelText: { 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: -5,
    paddingTop: 10,
    marginTop: 'auto',
  },
  buttonWithLabel: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  buttonLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  iconButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginLeft: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButton: { 
    padding: 4 
  },
});
