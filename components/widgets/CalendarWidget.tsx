import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '../ui/IconSymbol';

// Days of week abbreviations
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// Month names
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onUpdate: (config: any) => void;
}

interface CalendarEvent {
  id: string;
  date: string; // ISO date string
  title: string;
  type?: 'normal' | 'important';
}

interface CalendarConfig {
  events: CalendarEvent[];
  view: 'month' | 'year';
  selectedDate: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ 
  events = [], 
  onUpdate 
}) => {
  const colorScheme = useColorScheme();
  const today = new Date();
  
  const [selectedDate, setSelectedDate] = useState(today.toISOString());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [view, setView] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  // Show loading state briefly when first mounted
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Short loading time to give feedback
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Generate days for the current month
  const generateDaysForMonth = useCallback((month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Create array with empty placeholders for days from previous month
    const days = Array(startingDayOfWeek).fill(null);
    
    // Add the days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isToday: today.getDate() === i && 
                today.getMonth() === month && 
                today.getFullYear() === year,
        hasEvents: events.some(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === i && 
                 eventDate.getMonth() === month && 
                 eventDate.getFullYear() === year;
        })
      });
    }
    
    return days;
  }, [events, today]);
  
  // Move to previous month
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth, currentYear]);
  
  // Move to next month
  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth, currentYear]);
  
  // Toggle between month and year view
  const toggleView = useCallback(() => {
    const newView = view === 'month' ? 'year' : 'month';
    setView(newView);
    
    // Update the parent component with the new view
    onUpdate({
      events,
      view: newView,
      selectedDate
    });
  }, [view, events, selectedDate, onUpdate]);
  
  // Handle day selection
  const selectDay = useCallback((date: Date) => {
    setSelectedDate(date.toISOString());
    
    // Update the parent component with the selected date
    onUpdate({
      events,
      view,
      selectedDate: date.toISOString()
    });
  }, [events, view, onUpdate]);
  
  // Handle month selection in year view
  const selectMonth = useCallback((month: number) => {
    setCurrentMonth(month);
    setView('month');
    
    // Update the parent component with the new view
    onUpdate({
      events,
      view: 'month',
      selectedDate
    });
  }, [events, selectedDate, onUpdate]);
  
  // Render the month view
  const renderMonthView = () => {
    const days = generateDaysForMonth(currentMonth, currentYear);
    
    return (
      <View style={styles.monthContainer}>
        <View style={styles.weekdaysRow}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={index} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day?.isToday && styles.todayCell,
                day?.date && new Date(selectedDate).getDate() === day.day && 
                new Date(selectedDate).getMonth() === currentMonth &&
                new Date(selectedDate).getFullYear() === currentYear && styles.selectedCell
              ]}
              onPress={() => day?.date && selectDay(day.date)}
              disabled={!day?.date}
            >
              {day?.day && (
                <>
                  <Text style={[
                    styles.dayText,
                    day.isToday && styles.todayText,
                    day.date && new Date(selectedDate).getDate() === day.day && 
                    new Date(selectedDate).getMonth() === currentMonth &&
                    new Date(selectedDate).getFullYear() === currentYear && styles.selectedText
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasEvents && <View style={styles.eventDot} />}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render the year view
  const renderYearView = () => {
    return (
      <View style={styles.yearContainer}>
        <FlatList
          data={MONTHS}
          numColumns={3}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.monthCell,
                currentMonth === index && styles.selectedMonthCell
              ]}
              onPress={() => selectMonth(index)}
            >
              <Text style={[
                styles.monthText,
                currentMonth === index && styles.selectedMonthText
              ]}>
                {item.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `month-${index}`}
          contentContainerStyle={styles.monthsGrid}
        />
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D82F3" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <IconSymbol name="chevron.left" size={20} color="#4D82F3" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleView} style={styles.titleButton}>
          <Text style={styles.title}>
            {view === 'month'
              ? `${MONTHS[currentMonth]} ${currentYear}`
              : currentYear.toString()}
          </Text>
          <IconSymbol name={view === 'month' ? 'calendar' : 'list.bullet'} size={16} color="#4D82F3" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <IconSymbol name="chevron.right" size={20} color="#4D82F3" />
        </TouchableOpacity>
      </View>
      
      {view === 'month' ? renderMonthView() : renderYearView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  monthContainer: {
    flex: 1,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  todayCell: {
    backgroundColor: '#EBF5FF',
  },
  selectedCell: {
    backgroundColor: '#4D82F3',
  },
  dayText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  todayText: {
    fontWeight: '700',
    color: '#4D82F3',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4D82F3',
    marginTop: 2,
  },
  yearContainer: {
    flex: 1,
  },
  monthsGrid: {
    alignItems: 'center',
  },
  monthCell: {
    width: '33%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedMonthCell: {
    backgroundColor: '#EBF5FF',
  },
  monthText: {
    fontSize: 16,
    color: '#334155',
  },
  selectedMonthText: {
    color: '#4D82F3',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D82F3',
    marginTop: 16,
  },
});

export default CalendarWidget; 