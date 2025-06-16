import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, TextInput, Pressable, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '@/components/helpers/apiService';
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
        const data = await apiService.getItem(STORAGE_KEY);
        if (data) setNotes(data);
      } catch (e) {
        console.error('Failed to load notes from API', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await apiService.setItem(STORAGE_KEY, notes);
      } catch (e) {
        console.error('Failed to save notes to API', e);
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
      const keys = await apiService.getAllKeys();
      const result = await apiService.multiGet(keys);
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
        await apiService.multiSet(entries);
        
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Notes</Text>
          <Pressable onPress={openModal} style={styles.addButton}>
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        
        {/* Notes List */}
        <View style={styles.card}>
          <FlatList
            data={notes}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No notes yet. Tap + to add one.</Text>
            }
            renderItem={({ item, index }) => (
              <View style={styles.noteItem}>
                <Text style={styles.noteText}>{item}</Text>
                <Pressable 
                  onPress={() => removeNote(index)} 
                  style={({ pressed }) => ({
                    ...styles.deleteButton,
                    opacity: pressed ? 0.5 : 1
                  })}
                >
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
            contentContainerStyle={styles.notesListContent}
            style={styles.notesList}
          />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={exportData}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#4D82F3' }]}>
              <IconSymbol name="arrow.up" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={importData}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#4D82F3' }]}>
              <IconSymbol name="arrow.down" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionButtonText}>Import</Text>
          </TouchableOpacity>
        </View>
      
        {/* Add Note Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Note</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your note here..."
                placeholderTextColor="#9CA3AF"
                value={newNote}
                onChangeText={setNewNote}
                multiline
                autoFocus
              />
              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={addNote}
                  disabled={!newNote.trim()}
                >
                  <Text style={styles.saveButtonText}>Add Note</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4D82F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Card and Notes List
  card: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 8,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4D82F3',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
