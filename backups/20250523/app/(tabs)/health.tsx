import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

export default function HealthScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Health</Text>
      </View>
    </SafeAreaView>
  );
}