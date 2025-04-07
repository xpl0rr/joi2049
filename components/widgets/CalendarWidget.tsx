import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '../ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  onEdit?: () => void;
}

interface CalendarEvent {
  id: string;
  date: string; // ISO date string
  title: string;
  type?: 'normal' | 'important';
  note?: string;
}

interface CalendarConfig {
  events: CalendarEvent[];
  view: 'month' | 'year';
  selectedDate: string;
}

interface DayInfo {
  day: number;
  date: Date;
  isToday: boolean;
  hasEvents: boolean;
  hasNote: boolean;
}

const STORAGE_KEY = 'joiapp_calendar_notes';

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ 
  events = [], 
  onUpdate,
  onEdit
}) => {
  const colorScheme = useColorScheme();
  const today = new Date();
  
  const [selectedDate, setSelectedDate] = useState(today.toISOString());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [view, setView] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [calendarNotes, setCalendarNotes] = useState<Record<string, string>>({});
  
  // Modal state for adding notes
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedDateForNote, setSelectedDateForNote] = useState<Date | null>(null);
  const [noteViewModalVisible, setNoteViewModalVisible] = useState(false);
  const [viewingNote, setViewingNote] = useState('');

  // Load saved notes
  useEffect(() => {
    const loadCalendarNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
          setCalendarNotes(JSON.parse(savedNotes));
        }
      } catch (error) {
        console.error('Failed to load calendar notes:', error);
      }
      setIsLoading(false);
    };
    
    loadCalendarNotes();
  }, []);

  // Save notes when updated
  useEffect(() => {
    const saveCalendarNotes = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(calendarNotes));
      } catch (error) {
        console.error('Failed to save calendar notes:', error);
      }
    };
    
    // Only save if calendarNotes is not empty (skip initial load)
    if (Object.keys(calendarNotes).length > 0) {
      saveCalendarNotes();
    }
  }, [calendarNotes]);

  // Format date to string key for storage
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

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
      const currentDate = new Date(year, month, i);
      const dateKey = formatDateKey(currentDate);
      
      days.push({
        day: i,
        date: currentDate,
        isToday: today.getDate() === i && 
                today.getMonth() === month && 
                today.getFullYear() === year,
        hasEvents: events.some(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === i && 
                 eventDate.getMonth() === month && 
                 eventDate.getFullYear() === year;
        }),
        hasNote: !!calendarNotes[dateKey]
      });
    }
    
    return days;
  }, [events, today, calendarNotes]);
  
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
    // Don't update the selected date visually - just open the note editor
    
    // Open note editor for the selected date
    setSelectedDateForNote(date);
    const dateKey = formatDateKey(date);
    setCurrentNote(calendarNotes[dateKey] || '');
    setNoteModalVisible(true);
    
    // Still update the config with the selected date
    onUpdate({
      events,
      view,
      selectedDate: date.toISOString()
    });
  }, [events, view, onUpdate, calendarNotes]);
  
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
  
  // Handle the edit button press
  const handleEditPress = useCallback(() => {
    if (onEdit) {
      onEdit();
    }
    
    // Prepare for adding a note to the selected date
    const date = new Date(selectedDate);
    setSelectedDateForNote(date);
    
    // Pre-fill with existing note if exists
    const dateKey = formatDateKey(date);
    setCurrentNote(calendarNotes[dateKey] || '');
    
    // Show modal
    setNoteModalVisible(true);
  }, [selectedDate, calendarNotes, onEdit]);

  // Save the note
  const saveCalendarNote = useCallback(() => {
    if (!selectedDateForNote) return;
    
    const dateKey = formatDateKey(selectedDateForNote);
    
    if (currentNote.trim()) {
      // Add or update note
      setCalendarNotes(prev => ({
        ...prev,
        [dateKey]: currentNote.trim()
      }));
      Alert.alert('Success', 'Note saved!');
    } else {
      // Remove note if empty
      setCalendarNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[dateKey];
        return newNotes;
      });
    }
    
    // Close modal
    setNoteModalVisible(false);
    setCurrentNote('');
  }, [selectedDateForNote, currentNote]);

  // Count notes for the current month
  const getMonthNotesCount = useCallback(() => {
    let count = 0;
    
    for (const dateKey in calendarNotes) {
      const [year, month, day] = dateKey.split('-').map(Number);
      
      if (month - 1 === currentMonth && year === currentYear) {
        count++;
      }
    }
    
    return count;
  }, [calendarNotes, currentMonth, currentYear]);
  
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
                day?.hasNote && styles.noteDateCell
              ]}
              onPress={() => day?.date && selectDay(day.date)}
              disabled={!day?.date}
            >
              {day?.day && (
                <>
                  <Text style={[
                    styles.dayText,
                    day.isToday && styles.todayText,
                    day.hasNote && styles.noteDateText
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasEvents && <View style={styles.eventDot} />}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.addNoteButton} onPress={handleEditPress}>
          <Text style={styles.addNoteButtonText}>Add Note</Text>
        </TouchableOpacity>
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
      
      {/* Modal for adding notes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDateForNote ? `Note for ${selectedDateForNote.getDate()} ${MONTHS[selectedDateForNote.getMonth()]}` : 'Add Note'}
            </Text>
            
            <TextInput
              style={styles.noteInput}
              placeholder="Enter your note here..."
              value={currentNote}
              onChangeText={setCurrentNote}
              multiline
              numberOfLines={5}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveCalendarNote}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  noteDateCell: {
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
  noteDateText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  addNoteButton: {
    backgroundColor: '#4D82F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  addNoteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4D82F3',
  },
  closeButton: {
    backgroundColor: '#4D82F3',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButtonText: {
    color: 'white',
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