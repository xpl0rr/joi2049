import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, Switch, Pressable, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '@/components/helpers/apiService';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Updates from 'expo-updates';
import { LineChart } from 'react-native-chart-kit';

const STORAGE_KEY = '@bills';
const DISCRETIONARY_KEY = '@discretionary';
const SPENDING_HISTORY_KEY = '@spending_history';

interface Bill {
  id: string;
  name: string;
  amount: number;
  createdMonth: number;
  recurring: boolean;
}

// Interface for storing monthly spending history
interface MonthlySpending {
  month: number; // 0-11 for Jan-Dec
  year: number;
  billsTotal: number;
  discretionaryTotal: number;
}

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  
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
  const [spendingHistory, setSpendingHistory] = useState<MonthlySpending[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getItem(STORAGE_KEY);
        if (data) setBills(data);
      } catch (e) {
        console.error('Failed to load bills', e);
      } finally {
        setIsLoadingBills(false);
      }
    })();
  }, []);
  
  // Load spending history from API
  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getItem(SPENDING_HISTORY_KEY);
        if (data) {
          setSpendingHistory(data);
          console.log('Loaded spending history from API:', data);
        } else {
          // Initialize with demo data for May that shows $1345
          const mayData: MonthlySpending = {
            month: 4, // May (0-indexed)
            year: 2025,
            billsTotal: 345,
            discretionaryTotal: 1000 // Total of $1345
          };
          setSpendingHistory([mayData]);
          await apiService.setItem(SPENDING_HISTORY_KEY, [mayData]);
          console.log('Initialized spending history with May data');
        }
      } catch (e) {
        console.error('Failed to load spending history', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoadingBills) {
      (async () => {
        try {
          await apiService.setItem(STORAGE_KEY, bills);
        } catch (e) {
          console.error('Failed to save bills', e);
        }
      })();
    }
  }, [bills, isLoadingBills]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getItem(DISCRETIONARY_KEY);
        if (data) setDiscretionary(data);
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
          await apiService.setItem(DISCRETIONARY_KEY, discretionary);
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
    const currentMonth = new Date().getMonth();
    setBills(prev => [...prev, { id: Date.now().toString(), name: billName.trim(), amount, createdMonth: currentMonth, recurring: false }]);
    
    // Update spending history when adding a bill
    updateSpendingHistory(amount, 0);
    
    closeModal();
  };

  const removeBill = (id: string) => {
    // No need to update spending history when removing a bill
    // since we're now tracking spending history independently
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  const toggleRecurring = (id: string) => {
    // This toggle just marks bills as recurring for the current month
    // It doesn't auto-populate them into future months
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
    const currentMonth = new Date().getMonth();
    setDiscretionary(prev => [...prev, { id: Date.now().toString(), name: discrName.trim(), amount, createdMonth: currentMonth, recurring: false }]);
    
    // Update spending history when adding a discretionary item
    updateSpendingHistory(0, amount);
    
    closeModalDiscretionary();
  };

  const removeDiscretionary = (id: string) => {
    // No need to update spending history when removing a discretionary item
    // since we're now tracking spending history independently
    setDiscretionary(prev => prev.filter(item => item.id !== id));
  };
  
  // Helper function to update spending history
  const updateSpendingHistory = (billAmount: number, discretionaryAmount: number) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSpendingHistory(prev => {
      // Check if we already have an entry for this month/year
      const existingIndex = prev.findIndex(item => 
        item.month === currentMonth && item.year === currentYear
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        const updatedHistory = [...prev];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          billsTotal: updatedHistory[existingIndex].billsTotal + billAmount,
          discretionaryTotal: updatedHistory[existingIndex].discretionaryTotal + discretionaryAmount
        };
        return updatedHistory;
      } else {
        // Create new entry
        return [...prev, {
          month: currentMonth,
          year: currentYear,
          billsTotal: billAmount,
          discretionaryTotal: discretionaryAmount
        }];
      }
    });
  };
  
  // Save spending history whenever it changes
  useEffect(() => {
    if (spendingHistory.length > 0) {
      (async () => {
        try {
          await apiService.setItem(SPENDING_HISTORY_KEY, spendingHistory);
          console.log('Saved spending history', spendingHistory);
        } catch (e) {
          console.error('Failed to save spending history', e);
        }
      })();
    }
  }, [spendingHistory]);

  // Get the current month (0-11)
  const currentMonth = new Date().getMonth();
  
  // Create a map to store monthly totals for the current year
  const currentYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);
  
  // First, populate data from spending history (this includes all recorded spending)
  spendingHistory.forEach(item => {
    if (item.year === currentYear) {
      monthlyTotals[item.month] += (item.billsTotal + item.discretionaryTotal);
    }
  });
  
  // Now add current bills that are not yet in history
  bills.forEach(bill => {
    // For recurring bills, apply to all months from creation until current
    if (bill.recurring) {
      for (let m = bill.createdMonth; m <= currentMonth; m++) {
        // Only add if this month doesn't already have history data
        const hasHistoryData = spendingHistory.some(item => 
          item.year === currentYear && item.month === m);
          
        if (!hasHistoryData) {
          monthlyTotals[m] += bill.amount;
        }
      }
    } else {
      // For non-recurring bills, only add to the created month if no history
      const hasHistoryData = spendingHistory.some(item => 
        item.year === currentYear && item.month === bill.createdMonth);
        
      if (!hasHistoryData) {
        monthlyTotals[bill.createdMonth] += bill.amount;
      }
    }
  });
  
  // Calculate total bills for current month
  const billsTotal = bills.reduce((acc, bill) => {
    // Only include if it's in the current month
    const include = bill.createdMonth === currentMonth || (bill.recurring && bill.createdMonth <= currentMonth);
    return acc + (include ? bill.amount : 0);
  }, 0);
  
  // Calculate total discretionary spending for current month
  const discretionaryTotal = discretionary.reduce((acc, item) => {
    // Only include if it's in the current month
    const include = item.createdMonth === currentMonth;
    return acc + (include ? item.amount : 0);
  }, 0);
  
  // Total spending for current month
  const totalSpending = billsTotal + discretionaryTotal;

  // Prepare chart data for the current month only
  type BillEntry = {
    date: Date;
    amount: number;
  };

  // We're not using chart entries anymore - using a simple dot instead

  // Exports and imports for backup
  const exportData = async () => {
    try {
      const keys = await apiService.getAllKeys();
      const result = await apiService.multiGet(keys);
      const obj = Object.fromEntries(result);
      
      // Make sure we're also separately exporting the activities for backwards compatibility
      try {
        if (obj['calendar-db']) {
          const calendarData = JSON.parse(obj['calendar-db']);
          if (calendarData.state && calendarData.state.activities) {
            // Store activities separately as well to ensure they're preserved
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
      await Sharing.shareAsync(fileUri, { UTI: 'public.json', mimeType: 'application/json' });
    } catch (e) {
      console.error(e);
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const importData = async () => {
    try {
      console.log('Starting import process...');
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      console.log('Document picker result:', JSON.stringify(result));
      
      // Handle new DocumentPicker API format (SDK 52+)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        console.log('File picked, reading content from:', fileUri);
        
        const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
        console.log('File content length:', content.length);
        
        const obj = JSON.parse(content);
        console.log('Parsed JSON with', Object.keys(obj).length, 'keys');
        
        // Check for required data
        if (!obj[STORAGE_KEY] && !obj[DISCRETIONARY_KEY]) {
          console.log('File missing required data');
          throw new Error('The selected file does not contain valid backup data.');
        }
        
        // Create a new object with unpacked values for selected keys
        const modifiedObj = {...obj};
        
        // Log and manually set key data for debugging
        if (obj['@bills']) {
          console.log('Found @bills in import, length:', obj['@bills'].length);
          try {
            // Set the bills array directly for immediate use
            const billsData = JSON.parse(obj['@bills']);
            console.log('Parsed bills data:', billsData.length, 'items');
            setBills(billsData);
          } catch (e) {
            console.error('Error parsing @bills:', e);
          }
        }
        
        if (obj['@notes']) {
          console.log('Found @notes in import, length:', obj['@notes'].length);
          try {
            const notesData = JSON.parse(obj['@notes']);
            console.log('Parsed notes data:', notesData.length, 'items');
            // Note: We cannot set notes here since it's in a different component
            // It will be loaded after app reload
          } catch (e) {
            console.error('Error parsing @notes:', e);
          }
        }
        
        if (obj['@discretionary']) {
          console.log('Found @discretionary in import');
          try {
            const discretionaryData = JSON.parse(obj['@discretionary']);
            console.log('Parsed discretionary data:', discretionaryData.length, 'items');
            setDiscretionary(discretionaryData);
          } catch (e) {
            console.error('Error parsing @discretionary:', e);
          }
        }
        
        // Convert to entries for API
        const entries = Object.entries(modifiedObj) as [string, string][];
        console.log('Setting', entries.length, 'entries in API');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header with Title */}
        <View style={styles.headerContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000', textAlign: 'center' }]}>Finance</Text>
        </View>
        
        {/* Bills Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => setShowBills(prev => !prev)} style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: '#000000' }]}>Bills</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: '#4D82F3' }]} onPress={openModal}>
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {showBills && (
            <View style={styles.billsList}>
              {bills.length === 0 ? (
                <Text style={[styles.emptyText, { color: '#666666' }]}>No bills added.</Text>
              ) : (
                bills.map(item => (
                  <View key={item.id} style={styles.billItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Switch 
                        value={item.recurring} 
                        onValueChange={() => toggleRecurring(item.id)} 
                        thumbColor={item.recurring ? '#4D82F3' : undefined} 
                      />
                      <Text style={[styles.billText, { color: '#000000', marginLeft: 8 }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.billText, { color: '#000000', marginLeft: 8 }]}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeBill(item.id)} style={{ padding: 4 }}>
                      <IconSymbol name="trash" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
        
        {/* Discretionary Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => setShowDiscretionary(prev => !prev)} style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: '#000000' }]}>Discretionary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: '#4D82F3' }]} onPress={openModalDiscretionary}>
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {showDiscretionary && (
            <View style={styles.billsList}>
              {discretionary.length === 0 ? (
                <Text style={[styles.emptyText, { color: '#666666' }]}>No discretionary items.</Text>
              ) : (
                discretionary.map(item => (
                  <View key={item.id} style={styles.billItem}>
                    <Text style={[styles.billText, { color: '#000000' }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.billText, { color: '#000000' }]}>
                      ${item.amount.toFixed(2)}
                    </Text>
                    <Pressable onPress={() => removeDiscretionary(item.id)} style={{ padding: 4 }}>
                      <IconSymbol name="trash" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
        </ScrollView>
        
        {/* Monthly spending summary */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalTitle}>Spent this month: ${totalSpending.toFixed(2)}</Text>
        </View>
        {/* Chart at bottom */}
        <View style={styles.chartContainer}>
            {/* Main chart */}
            <LineChart
              bezier
              data={{
                labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                datasets: [
                  {
                    data: monthlyTotals, // Use dynamic monthlyTotals
                    color: () => '#4D82F3',
                    strokeWidth: 3
                  }
                ]
              }}
              width={Dimensions.get('window').width - 32} // Adjusted for parent padding
              height={200}
              withDots={true}
              withShadow={false}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(77, 130, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4D82F3'
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              withVerticalLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              fromZero={false}
              yAxisInterval={1}
              formatYLabel={(value) => `$${value}`}
              renderDotContent={({x, y, index, indexData}) => {
                // Only show labels for data points that have values
                if (indexData > 0) {
                  return (
                    <Text 
                      key={index} 
                      style={{
                        position: 'absolute',
                        top: y - 20,
                        left: x - 15,
                        fontSize: 12,
                        color: '#4D82F3'
                      }}
                    >
                      ${indexData}
                    </Text>
                  );
                }
                return null;
              }}
            />
          
        </View>
      </View>
      
      {/* Bill Modal */}
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
              <TouchableOpacity style={styles.saveButton} onPress={addBill}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
              <TouchableOpacity style={styles.saveButton} onPress={addDiscretionary}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModalDiscretionary}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
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
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
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
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  billsList: {
    minHeight: 50,
  },
  billItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(229, 231, 235, 0.3)' 
  },
  billText: { 
    fontSize: 16 
  },
  emptyText: { 
    textAlign: 'center', 
    padding: 20, 
    fontStyle: 'italic' 
  },
  addButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  chartContainer: {
  },
  totalContainer: {
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  totalTitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  modalContainer: { 
    width: '100%', 
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
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  saveButton: { 
    backgroundColor: '#4D82F3', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    width: '48%' 
  },
  saveText: { 
    color: 'white', 
    fontWeight: '600' 
  },
  cancelButton: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    width: '48%' 
  },
  cancelText: { 
    color: '#6B7280', 
    fontWeight: '600' 
  },
});
