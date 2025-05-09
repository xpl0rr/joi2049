import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import CalendarWidget from '@/components/widgets/CalendarWidget';

export default function DashboardScreen() {
  const [calendarConfig, setCalendarConfig] = useState({
    events: [],
    view: 'month',
    selectedDate: new Date().toISOString(),
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: Colors.light.background }]}>      
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#000' }]}>Home</Text>
      </View>
      <CalendarWidget
        events={calendarConfig.events}
        onUpdate={config => setCalendarConfig(config)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  title: {
    position: 'absolute',
    left: 16,
    right: 16,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
