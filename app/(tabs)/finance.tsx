import React from 'react';
import { StyleSheet, View } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <PageTemplate pageId="finance" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
}); 