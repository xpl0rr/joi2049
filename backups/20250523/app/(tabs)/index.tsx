import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import { useCalendarStore } from '@/components/helpers/calendarStore';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DashboardScreen() {
  const [calendarConfig, setCalendarConfig] = useState({ events: [], view: 'month', selectedDate: new Date().toISOString() });
  const db = useCalendarStore(state => state.db);
  const activities = useCalendarStore(state => state.activities);
  const addActivityStore = useCalendarStore(state => state.addActivity);
  const removeActivityStore = useCalendarStore(state => state.removeActivity);
  const [newActivity, setNewActivity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Use local date components to generate ISO date key (YYYY-MM-DD)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const openModal = () => setModalVisible(true);
  const addActivity = () => {
    if (!newActivity.trim()) return;
    addActivityStore(newActivity.trim());
    setNewActivity('');
    setModalVisible(false);
  };
  const removeActivity = (key: string) => removeActivityStore(key);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: Colors.light.background }]}>      
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#000' }]}>Home</Text>
        <Pressable style={styles.addButton} onPress={openModal}>
          <IconSymbol name="plus" size={20} color="#FFF" />
        </Pressable>
      </View>
      <FlatList
        data={activities}
        keyExtractor={item => item}
        ListEmptyComponent={<Text style={styles.emptyText}>No activities yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
            <Pressable onPress={() => removeActivityStore(item)} style={styles.deleteButton}>
              <IconSymbol name="trash" size={20} color="#EF4444" />
            </Pressable>
          </View>
        )}
      />
      <CalendarWidget
        events={calendarConfig.events}
        onUpdate={config => setCalendarConfig(config)}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Activity name"
              value={newActivity}
              onChangeText={setNewActivity}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={addActivity}>
                <Text style={styles.saveText}>Add</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
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
