import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const [calendarConfig, setCalendarConfig] = useState({
    events: [],
    view: 'month',
    selectedDate: new Date().toISOString(),
  });

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <CalendarWidget
        events={calendarConfig.events}
        onUpdate={config => setCalendarConfig(config)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});