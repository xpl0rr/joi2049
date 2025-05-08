//  CalendarDashboard.tsx
import { Calendar } from 'react-native-calendars';
import { View, TouchableOpacity } from 'react-native';
import { useCalendarStore, ActivityKey, CalendarState } from './calendarStore';
import { Ionicons } from '@expo/vector-icons';
import DayRings from './DayRings';          // ring component (see below)
import AddSheet from './AddSheet';          // bottom-sheet component
import { useState } from 'react';

export default function CalendarDashboard() {
  const db = useCalendarStore((state: CalendarState) => state.db);
  const toggleRing = useCalendarStore((state: CalendarState) => state.toggleRing);
  const [selected, setSelected] = useState<string>();

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={Object.fromEntries(
          Object.entries(db ?? {}).map(([date, entry]) => [
            date,
            { customStyles: { container: {}, text: {} } }, // keep default style
          ])
        )}
        dayComponent={({ date }) => (
          <TouchableOpacity onPress={() => setSelected(date.dateString)}>
            <DayRings rings={db?.[date.dateString]?.rings} date={date} />
          </TouchableOpacity>
        )}
      />

      {/* ➕ FAB */}
      <TouchableOpacity
        onPress={() => setSelected(new Date().toISOString().slice(0, 10))}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 40,
          backgroundColor: '#1e90ff',
          borderRadius: 28,
          padding: 18,
        }}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <AddSheet
        date={selected!}
        visible={!!selected}
        rings={db?.[selected!]?.rings}
        onClose={() => setSelected(undefined)}
        onToggle={toggleRing}
      />
    </View>
  );
}