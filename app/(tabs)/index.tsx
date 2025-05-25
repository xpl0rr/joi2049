import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import { useCalendarStore } from '@/components/helpers/calendarStore';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DashboardScreen() {
  const [calendarConfig, setCalendarConfig] = useState({ events: [], view: 'month', selectedDate: new Date().toISOString() });
  const [newActivity, setNewActivity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Get store functions and state
  const initialize = useCalendarStore(state => state.initialize);
  const db = useCalendarStore(state => state.db);
  const activities = useCalendarStore(state => state.activities);
  const addActivityStore = useCalendarStore(state => state.addActivity);
  const removeActivityStore = useCalendarStore(state => state.removeActivity);
  const initialized = useCalendarStore(state => state.initialized);
  
  // Initialize the store when the component mounts
  useEffect(() => {
    console.log('DashboardScreen: initializing calendar store');
    initialize();
  }, [initialize]);

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
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Home</Text>
          <Pressable 
            onPress={openModal} 
            style={({ pressed }) => ({
              ...styles.addButton,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        
        {/* Activities List */}
        <View style={styles.card}>
          <FlatList
            data={activities}
            keyExtractor={item => item}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No activities yet. Tap + to add one.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{String(item)}</Text>
                <Pressable 
                  onPress={() => removeActivity(item)} 
                  style={({ pressed }) => ({
                    ...styles.deleteButton,
                    opacity: pressed ? 0.5 : 1
                  })}
                >
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
            contentContainerStyle={styles.activitiesListContent}
            style={styles.activitiesList}
          />
        </View>
        
        {/* Calendar Widget */}
        <View style={styles.calendarWrapper}>
          <CalendarWidget
            events={calendarConfig.events}
            onUpdate={config => setCalendarConfig(config)}
          />
        </View>
      </View>
      
      {/* Add Activity Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter activity name..."
              placeholderTextColor="#9CA3AF"
              value={newActivity}
              onChangeText={setNewActivity}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addActivity}
                disabled={!newActivity.trim()}
              >
                <Text style={styles.saveButtonText}>Add Activity</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container styles
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
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
  
  // Card and Activities List
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flex: 1,
  },
  activitiesList: {
    flex: 1,
  },
  activitiesListContent: {
    paddingBottom: 8,
  },
  activityItem: {
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
  activityText: {
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
  
  // Calendar Wrapper
  calendarWrapper: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
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
