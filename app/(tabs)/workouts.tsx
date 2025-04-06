import React from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import PageTemplate from '@/components/PageTemplate';

export default function WorkoutsScreen() {
  const handleAddWidget = () => {
    router.push('/widgets');
  };

  return (
    <PageTemplate pageId="workouts" onAddWidget={handleAddWidget} />
  );
} 