import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import BalanceCard from './BalanceCard';
import AccountCard, { AccountData } from './AccountCard';
import TransactionList, { Transaction } from './TransactionList';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Sample data for demonstration
const sampleAccounts: AccountData[] = [
  { id: '1', name: 'Checking', amount: '2,458.20', color: 'blue' },
  { id: '2', name: 'Savings', amount: '12,042.95', color: 'purple' },
  { id: '3', name: 'Credit Card', amount: '3,240.10', color: 'red' },
];

const sampleTransactions: Transaction[] = [
  { 
    id: '1', 
    title: 'Grocery Store', 
    amount: '85.40', 
    date: 'Today, 12:30 PM', 
    category: 'food', 
    type: 'expense' 
  },
  { 
    id: '2', 
    title: 'Salary Deposit', 
    amount: '3,850.00', 
    date: 'May 22, 2025', 
    category: 'salary', 
    type: 'income' 
  },
  { 
    id: '3', 
    title: 'Taxi Ride', 
    amount: '24.50', 
    date: 'May 21, 2025', 
    category: 'transport', 
    type: 'expense' 
  },
  { 
    id: '4', 
    title: 'Movie Tickets', 
    amount: '32.00', 
    date: 'May 20, 2025', 
    category: 'entertainment', 
    type: 'expense' 
  },
  { 
    id: '5', 
    title: 'Transfer to Savings', 
    amount: '500.00', 
    date: 'May 19, 2025', 
    category: 'transfer', 
    type: 'expense' 
  },
];

export default function WalletScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  
  // Calculate total balance from all accounts
  const totalBalance = sampleAccounts.reduce(
    (sum, account) => sum + parseFloat(account.amount.replace(',', '')), 
    0
  ).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your finances are looking good</Text>
        </View>
        
        <BalanceCard 
          balance={totalBalance} 
          onAddPress={() => console.log('Add funds pressed')} 
        />
        
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accounts</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.accountsList}
            contentContainerStyle={styles.accountsListContent}
          >
            {sampleAccounts.map(account => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onPress={() => console.log(`Account ${account.name} pressed`)} 
              />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.transactionsSection}>
          <TransactionList 
            transactions={sampleTransactions} 
            onTransactionPress={(transaction) => console.log('Transaction pressed:', transaction.title)} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  accountsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  accountsList: {
    marginLeft: -4,
  },
  accountsListContent: {
    paddingLeft: 4,
    paddingRight: 16,
  },
  transactionsSection: {
    flex: 1,
  },
});
