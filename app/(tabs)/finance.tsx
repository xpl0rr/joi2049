import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartWidget from '@/components/widgets/ChartWidget';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

const STORAGE_KEY = '@bills';

type Frequency = 'monthly' | 'annual';

interface Bill {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
}

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setBills(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load bills', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
      } catch (e) {
        console.error('Failed to save bills', e);
      }
    })();
  }, [bills]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setBillName('');
    setBillAmount('');
    setFrequency('monthly');
  };

  const addBill = () => {
    if (!billName.trim() || !billAmount) return;
    const amount = parseFloat(billAmount);
    if (isNaN(amount)) return;
    setBills(prev => [...prev, { id: Date.now().toString(), name: billName.trim(), amount, frequency }]);
    closeModal();
  };

  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    const sum = bills.reduce(
      (acc, bill) => acc + (bill.frequency === 'monthly' ? bill.amount : bill.amount / 12),
      0
    );
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return { label: labels[i], value: parseFloat(sum.toFixed(2)) };
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background }]}>      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text }]}>Bills</Text>
        <Pressable onPress={openModal} style={styles.addButton}>
          <IconSymbol name="plus" size={20} color="#FFF" />
        </Pressable>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={bills}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.billItem}>
            <Text style={[styles.billText, { color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text }]}>
              {item.name} ({item.frequency})
            </Text>
            <Text style={[styles.billText, { color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text }]}>${item.amount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No bills added.</Text>}
        contentContainerStyle={bills.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
      />
      <ChartWidget data={monthlyData} onUpdate={() => {}} />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Bill</Text>
            <TextInput
              style={styles.input}
              placeholder="Bill Name"
              value={billName}
              onChangeText={setBillName}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="decimal-pad"
              value={billAmount}
              onChangeText={setBillAmount}
            />
            <View style={styles.frequencyContainer}>
              <Pressable
                style={[styles.freqButton, frequency === 'monthly' && styles.freqButtonActive]}
                onPress={() => setFrequency('monthly')}
              >
                <Text style={[styles.freqText, frequency === 'monthly' && styles.freqTextActive]}>Monthly</Text>
              </Pressable>
              <Pressable
                style={[styles.freqButton, frequency === 'annual' && styles.freqButtonActive]}
                onPress={() => setFrequency('annual')}
              >
                <Text style={[styles.freqText, frequency === 'annual' && styles.freqTextActive]}>Annual</Text>
              </Pressable>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={addBill}>
                <Text style={styles.saveText}>Save</Text>
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
  billItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  billText: { fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: '#FFF', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, padding: 8, marginBottom: 12 },
  frequencyContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  freqButton: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4 },
  freqButtonActive: { backgroundColor: '#4D82F3', borderColor: '#4D82F3' },
  freqText: { fontSize: 14, color: '#1F2937' },
  freqTextActive: { color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#4D82F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, marginRight: 8 },
  saveText: { color: '#FFF', fontWeight: '600' },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: '#4D82F3', fontWeight: '600' },
});