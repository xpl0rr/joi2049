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
    <SafeAreaView style={styles.container} edges={['top']}>      
      <Text style={styles.headerText}>Notes</Text>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.cardTitle}>My Notes</Text>
          <Pressable onPress={openModal} style={styles.addButton}>
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        
        <View style={styles.notesCard}>
          <FlatList
            style={styles.notesList}
            data={notes}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No notes yet.</Text>}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                <Text style={styles.itemText}>{item}</Text>
                <Pressable onPress={() => removeNote(index)} style={styles.deleteButton}>
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
          />
        </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Note content"
              value={newNote}
              onChangeText={setNewNote}
            />
            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.primaryButton]} onPress={addNote}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Add</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={closeModal}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Export/Import Buttons at bottom */}
      <View style={styles.totalContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={exportData}
          >
            <IconSymbol name="arrow.up" size={16} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={importData}
          >
            <IconSymbol name="arrow.down" size={16} color="#FFFFFF" style={{marginRight: 8}} />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Import Data</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#000000',
  },
  notesCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flex: 1,
  },
  notesList: {
    flex: 1,
  },
  addButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#4D82F3', 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEEEEE' 
  },
  itemText: { 
    fontSize: 16, 
    color: '#000000',
    flex: 1,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#AAAAAA', 
    marginTop: 20, 
    fontSize: 16 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 16 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16,
    textAlign: 'center',
    color: '#000000'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDDDDD', 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 10, 
    backgroundColor: '#FFFFFF',
    color: '#000000' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16 
  },
  button: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: { 
    backgroundColor: '#4D82F3', 
  },
  secondaryButton: { 
    backgroundColor: '#EEEEEE', 
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: '500', 
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
  },
  secondaryButtonText: { 
    color: '#000000', 
  },
  totalContainer: {
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  deleteButton: { 
    padding: 8,
    marginLeft: 8,
  },
});
