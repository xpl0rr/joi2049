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
      console.log('Starting database export...');
      const blob = await apiService.downloadDb();
      const fileUri = FileSystem.documentDirectory + 'cloud.db';

      // Convert blob to base64 to save with FileSystem
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Database saved to:', fileUri);
      await shareAsync(fileUri, { dialogTitle: 'Save cloud.db', UTI: 'public.database', mimeType: 'application/octet-stream' });
    } catch (e) {
      console.error('Export failed:', e);
      Alert.alert('Export Failed', 'Could not export the database.');
    }
  };

  const importData = async () => {
    try {
      console.log('Starting database import...');
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: '*/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        console.log('File picked for upload:', fileUri);

        Alert.alert(
          'Confirm Import',
          'Are you sure you want to overwrite the cloud database with the selected file? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Overwrite',
              style: 'destructive',
              onPress: async () => {
                try {
                  await apiService.uploadDb(fileUri);
                  Alert.alert('Import Successful', 'The database has been imported. The app will now reload.');
                  await Updates.reloadAsync();
                } catch (e) {
                  console.error('Upload failed:', e);
                  Alert.alert('Import Failed', 'Could not import the database: ' + (e instanceof Error ? e.message : String(e)));
                }
              },
            },
          ]
        );
      } else {
        console.log('Document picker canceled.');
      }
    } catch (e) {
      console.error('Import process failed:', e);
      Alert.alert('Import Failed', 'An unexpected error occurred: ' + (e instanceof Error ? e.message : String(e)));
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
