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
    <SafeAreaView edges={['top']} style={styles.container}>      
      <Text style={styles.headerText}>Home</Text>
      
      <View style={styles.contentContainer}>
        {/* Activities Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Activities</Text>
            <Pressable style={styles.addButton} onPress={openModal}>
              <IconSymbol name="plus" size={20} color="#FFF" />
            </Pressable>
          </View>
          
          <FlatList
            data={activities}
            keyExtractor={item => item}
            ListEmptyComponent={<Text style={styles.emptyText}>No activities yet.</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.itemText}>{item}</Text>
                <Pressable onPress={() => removeActivityStore(item)} style={styles.deleteButton}>
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
            style={styles.listContainer}
          />
        </View>
        
        {/* Calendar Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calendar</Text>
          <CalendarWidget
            events={calendarConfig.events}
            onUpdate={config => setCalendarConfig(config)}
          />
        </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Activity name"
              value={newActivity}
              onChangeText={setNewActivity}
            />
            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.primaryButton]} onPress={addActivity}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Add</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
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
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  listContainer: {
    marginBottom: 10,
  },
  addButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#4D82F3', 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEEEEE', 
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
    fontSize: 16,
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 16, 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16,
    textAlign: 'center',
    color: '#000000',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDDDDD', 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 10, 
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16, 
  },
  button: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
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
  deleteButton: { 
    padding: 8,
    marginLeft: 8,
  },
});
