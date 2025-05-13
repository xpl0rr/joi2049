import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

const STORAGE_KEY = '@notes';

export default function NotesScreen() {
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

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: Colors.light.background }]}>      
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#000' }]}>Notes</Text>
        <Pressable onPress={openModal} style={styles.addButton}>
          <IconSymbol name="plus" size={20} color="#FFF" />
        </Pressable>
      </View>
      <FlatList
        data={notes}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No notes yet.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  title: { position: 'absolute', left: 16, right: 16, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  addButton: { width: 32, height: 32, backgroundColor: '#4D82F3', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  itemText: { fontSize: 16, color: '#000' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: '#FFF', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, padding: 8, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#4D82F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, marginRight: 8 },
  saveText: { color: '#FFF', fontWeight: '600' },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: '#4D82F3', fontWeight: '600' },
  deleteButton: { padding: 4 },
});
