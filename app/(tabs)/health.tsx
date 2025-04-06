import React from 'react';
import { StyleSheet, View } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <PageTemplate pageId="health" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
}); 