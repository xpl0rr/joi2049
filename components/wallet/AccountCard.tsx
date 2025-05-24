import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface AccountData {
  id: string;
  name: string;
  amount: string;
  color: string;
}

interface AccountCardProps {
  account: AccountData;
  onPress?: () => void;
}

export default function AccountCard({ account, onPress }: AccountCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  
  // Get color based on account type
  const getIconColor = () => {
    switch(account.color) {
      case 'red': return '#FF5C5C';
      case 'blue': return '#4F7BF3';
      case 'purple': return '#C24DF3';
      default: return colors.primary;
    }
  };

  return (
    <View 
      style={[styles.accountCard, { backgroundColor: colors.cardBackground }]}
    >
      <View 
        style={[
          styles.accountIcon, 
          { backgroundColor: getIconColor() }
        ]}
      >
        <Text style={styles.accountIconText}>$</Text>
      </View>
      
      <View style={styles.accountDetails}>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountAmount, { color: colors.text }]}>
            ${account.amount}
          </Text>
          <Text style={[styles.accountName, { color: colors.textSecondary }]}>
            {account.name}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.optionsButton} onPress={onPress}>
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIconText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 20,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accountInfo: {
    flex: 1,
  },
  accountAmount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
  },
  optionsButton: {
    padding: 4,
  },
});
