import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TextInput, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import { useCalendarStore } from '@/components/helpers/calendarStore';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DashboardScreen() {
  const [calendarConfig, setCalendarConfig] = useState({ events: [], view: 'month', selectedDate: new Date().toISOString() });
  const [newActivity, setNewActivity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showActivities, setShowActivities] = useState(true);
  
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Home</Text>
          </View>
          
          {/* Calendar Section */}
          <View style={styles.sectionContainer}>
            <CalendarWidget onUpdate={() => {}} />
          </View>
          
          {/* Activities Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Pressable 
                onPress={() => setShowActivities(!showActivities)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={styles.sectionTitle}>Activities</Text>
                <IconSymbol 
                  name={showActivities ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#666666"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
              <Pressable 
                onPress={openModal}
                style={[styles.addButton, { backgroundColor: '#4D82F3' }]}
              >
                <IconSymbol name="plus" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            
            {showActivities && (
              <View style={styles.activitiesList}>
                {activities.length === 0 ? (
                  <Text style={styles.emptyText}>No activities added.</Text>
                ) : (
                  activities.map((item) => (
                    <View key={item} style={styles.activityItem}>
                      <Text style={styles.activityText}>{String(item)}</Text>
                      <Pressable 
                        onPress={() => removeActivity(item)} 
                        style={({ pressed }) => ({
                          padding: 4,
                          opacity: pressed ? 0.6 : 1
                        })}
                      >
                        <IconSymbol name="trash" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Activity Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter activity name"
              value={newActivity}
              onChangeText={setNewActivity}
              onSubmitEditing={addActivity}
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
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    marginLeft: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#4D82F3',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  activitiesList: {
    minHeight: 50,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
    padding: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    padding: 16,
    fontStyle: 'italic',
    fontSize: 16,
  },
});
