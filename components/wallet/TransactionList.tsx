import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface Transaction {
  id: string;
  title: string;
  amount: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onTransactionPress }: TransactionListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return 'fast-food';
      case 'shopping': return 'cart';
      case 'transport': return 'car';
      case 'entertainment': return 'film';
      case 'health': return 'medical';
      case 'salary': return 'wallet';
      case 'transfer': return 'swap-horizontal';
      default: return 'ellipsis-horizontal-circle';
    }
  };

  const getAmountColor = (type: 'income' | 'expense') => {
    return type === 'income' ? '#36D6B7' : '#FF5C5C';
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => onTransactionPress && onTransactionPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Ionicons name={getCategoryIcon(item.category)} size={20} color={colors.tint} />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{item.date}</Text>
      </View>
      
      <Text style={[
        styles.transactionAmount, 
        { color: getAmountColor(item.type) }
      ]}>
        {item.type === 'income' ? '+' : '-'}${item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: colors.tint }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No transactions yet
          </Text>
        </View>
      ) : (
        transactions.map(item => (
          <React.Fragment key={item.id}>
            {renderTransactionItem({ item })}
          </React.Fragment>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
  },
});
