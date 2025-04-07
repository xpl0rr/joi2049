import React from 'react';
import { StyleSheet, View } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams } from 'expo-router';

export default function CustomTabScreen() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams();
  const pageId = typeof id === 'string' ? id : '';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <PageTemplate pageId={pageId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 