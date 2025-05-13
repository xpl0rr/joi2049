import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, TextInput, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartWidget, { BillEntry } from '@/components/widgets/ChartWidget';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

const STORAGE_KEY = '@bills';
const DISCRETIONARY_KEY = '@discretionary';

interface Bill {
  id: string;
  name: string;
  amount: number;
  createdMonth: number;
  recurring: boolean;
}

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const [bills, setBills] = useState<Bill[]>([]);
  const [showBills, setShowBills] = useState(true);
  const [showDiscretionary, setShowDiscretionary] = useState(true);
  const [discretionary, setDiscretionary] = useState<Bill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDiscretionary, setModalVisibleDiscretionary] = useState(false);
  const [billName, setBillName] = useState('');
  const [discrName, setDiscrName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [discrAmount, setDiscrAmount] = useState('');
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const [isLoadingDiscr, setIsLoadingDiscr] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setBills(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load bills', e);
      } finally {
        setIsLoadingBills(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoadingBills) {
      (async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
        } catch (e) {
          console.error('Failed to save bills', e);
        }
      })();
    }
  }, [bills, isLoadingBills]);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(DISCRETIONARY_KEY);
        if (json) setDiscretionary(JSON.parse(json));
      } catch (e) {
        console.error('Failed to load discretionary', e);
      } finally {
        setIsLoadingDiscr(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoadingDiscr) {
      (async () => {
        try {
          await AsyncStorage.setItem(DISCRETIONARY_KEY, JSON.stringify(discretionary));
        } catch (e) {
          console.error('Failed to save discretionary', e);
        }
      })();
    }
  }, [discretionary, isLoadingDiscr]);

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    setBillName('');
    setBillAmount('');
  };

  const addBill = () => {
    if (!billName.trim() || !billAmount) return;
    const amount = parseFloat(billAmount);
    if (isNaN(amount)) return;
    setBills(prev => [...prev, { id: Date.now().toString(), name: billName.trim(), amount, createdMonth: new Date().getMonth(), recurring: false }]);
    closeModal();
  };

  const removeBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  const toggleRecurring = (id: string) => {
    setBills(prev => prev.map(bill => bill.id === id ? { ...bill, recurring: !bill.recurring } : bill));
  };

  const openModalDiscretionary = () => setModalVisibleDiscretionary(true);
  const closeModalDiscretionary = () => {
    setModalVisibleDiscretionary(false);
    setDiscrName('');
    setDiscrAmount('');
  };

  const addDiscretionary = () => {
    if (!discrName.trim() || !discrAmount) return;
    const amount = parseFloat(discrAmount);
    if (isNaN(amount)) return;
    setDiscretionary(prev => [...prev, { id: Date.now().toString(), name: discrName.trim(), amount, createdMonth: new Date().getMonth(), recurring: false }]);
    closeModalDiscretionary();
  };

  const removeDiscretionary = (id: string) => {
    setDiscretionary(prev => prev.filter(item => item.id !== id));
  };

  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    const sum = bills.reduce((acc, bill) => {
      const include = bill.createdMonth === i || (bill.recurring && bill.createdMonth <= i);
      return acc + (include ? bill.amount : 0);
    }, 0);
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return { label: labels[i], value: parseFloat(sum.toFixed(2)) };
  });

  const chartEntries: BillEntry[] = monthlyData.map((item, i) => ({
    date: new Date(new Date().getFullYear(), i, 1),
    amount: item.value,
  }));

  // Compute secondary (discretionary) series for chart
  const chartEntriesSecondary: BillEntry[] = Array.from({ length: 12 }).map((_, i) => {
    const sum = discretionary.reduce((acc, item) => {
      const include = item.createdMonth === i || (item.recurring && item.createdMonth <= i);
      return acc + (include ? item.amount : 0);
    }, 0);
    return { date: new Date(new Date().getFullYear(), i, 1), amount: sum };
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: Colors.light.background }]}>      
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => setShowBills(prev => !prev)} style={{ flex: 1 }}>
            <Text style={[styles.title, { color: '#000' }]}>Bills</Text>
          </Pressable>
          <Pressable onPress={openModal} style={styles.addButton}>
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        {showBills && (
          <FlatList
            style={{ flex: 1 }}
            data={bills}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.billItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch value={item.recurring} onValueChange={() => toggleRecurring(item.id)} thumbColor={item.recurring ? '#4D82F3' : undefined} />
                  <Text style={[styles.billText, { color: '#000', marginLeft: 8 }]}>{item.name}</Text>
                  <Text style={[styles.billText, { color: '#000', marginLeft: 8 }]}>{`$${item.amount.toFixed(2)}`}</Text>
                </View>
                <Pressable onPress={() => removeBill(item.id)} style={{ padding: 4 }}>
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No bills added.</Text>}
            contentContainerStyle={bills.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
          />
        )}
        {/* Discretionary Section */}
        <View style={styles.header}>
          <Pressable onPress={() => setShowDiscretionary(prev => !prev)} style={{ flex: 1 }}>
            <Text style={[styles.title, { color: '#EF4444' }]}>Discretionary</Text>
          </Pressable>
          <Pressable onPress={openModalDiscretionary} style={styles.addButton}>
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>
        {showDiscretionary && (
          <FlatList
            style={{ flex: 1 }}
            data={discretionary}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.billItem}>
                <Text style={[styles.billText, { color: '#000' }]}>{item.name}</Text>
                <Text style={[styles.billText, { color: '#000' }]}>{`$${item.amount.toFixed(2)}`}</Text>
                <Pressable onPress={() => removeDiscretionary(item.id)} style={{ padding: 4 }}>
                  <IconSymbol name="trash" size={20} color="#EF4444" />
                </Pressable>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No discretionary items.</Text>}
            contentContainerStyle={discretionary.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
          />
        )}
      </View>
      <ChartWidget
        title="Bills Over Time"
        data={chartEntries}
        secondaryData={chartEntriesSecondary}
        primaryColor="#000"
        secondaryColor="#EF4444"
        onUpdate={() => {}}
      />
      {/* Discretionary Modal */}
      <Modal visible={modalVisibleDiscretionary} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Discretionary</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={discrName}
              onChangeText={setDiscrName}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="decimal-pad"
              value={discrAmount}
              onChangeText={setDiscrAmount}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={addDiscretionary}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={closeModalDiscretionary}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#4D82F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, marginRight: 8 },
  saveText: { color: '#FFF', fontWeight: '600' },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: '#4D82F3', fontWeight: '600' },
});