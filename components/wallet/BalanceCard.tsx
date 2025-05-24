import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface BalanceCardProps {
  balance: string;
  onAddPress?: () => void;
}

export default function BalanceCard({ balance, onAddPress }: BalanceCardProps) {
  // Format the date in a readable format (e.g., "May 23, 2025")
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <LinearGradient
      colors={['#36D6B7', '#25BECA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceDate}>{formattedDate}</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonLabel}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceValue}>
        <Text style={styles.balancePrefix}>$</Text>
        <Text style={styles.balanceAmount}>{balance}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    height: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  balanceDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    left: 0,
    top: 24,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 40,
  },
  balancePrefix: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
    marginRight: 4,
    marginTop: 12,
  },
  balanceAmount: {
    fontSize: 56,
    fontWeight: '600',
    color: 'white',
  },
});
