import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '../ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';

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
  hasRings: RingData | null;
}

// Structure for ring data
interface RingData {
  outer: boolean; // Red ring
  middle: boolean; // White ring
  center: boolean; // Black dot
  outerNote: string;
  middleNote: string;
  centerNote: string;
}

const STORAGE_KEY = 'joiapp_calendar_rings';

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
  const [calendarRings, setCalendarRings] = useState<Record<string, RingData>>({});
  
  // Modal state for rings and notes
  const [ringsModalVisible, setRingsModalVisible] = useState(false);
  const [selectedDateForRings, setSelectedDateForRings] = useState<Date | null>(null);
  const [currentRingData, setCurrentRingData] = useState<RingData>({
    outer: false,
    middle: false,
    center: false,
    outerNote: '',
    middleNote: '',
    centerNote: ''
  });

  // Load saved ring data
  useEffect(() => {
    const loadCalendarRings = async () => {
      try {
        const savedRings = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedRings) {
          setCalendarRings(JSON.parse(savedRings));
        }
      } catch (error) {
        console.error('Failed to load calendar rings:', error);
      }
      setIsLoading(false);
    };
    
    loadCalendarRings();
  }, []);

  // Save rings when updated
  useEffect(() => {
    const saveCalendarRings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(calendarRings));
        console.log('Saved rings:', JSON.stringify(calendarRings));
      } catch (error) {
        console.error('Failed to save calendar rings:', error);
      }
    };
    
    // Save regardless of whether calendarRings is empty
    saveCalendarRings();
  }, [calendarRings]);

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
      const dayRings = calendarRings[dateKey];
      
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
        hasRings: dayRings || null
      });
    }
    
    return days;
  }, [events, today, calendarRings]);
  
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
    // Open rings selection modal for the selected date
    setSelectedDateForRings(date);
    
    // Get existing ring data or initialize empty
    const dateKey = formatDateKey(date);
    const existingRings = calendarRings[dateKey] || {
      outer: false,
      middle: false,
      center: false,
      outerNote: '',
      middleNote: '',
      centerNote: ''
    };
    
    setCurrentRingData(existingRings);
    setRingsModalVisible(true);
    
    // Still update the config with the selected date
    onUpdate({
      events,
      view,
      selectedDate: date.toISOString()
    });
  }, [events, view, onUpdate, calendarRings]);
  
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
    
    // Prepare for adding rings to the selected date
    const date = new Date(selectedDate);
    setSelectedDateForRings(date);
    
    // Get existing ring data or initialize empty
    const dateKey = formatDateKey(date);
    const existingRings = calendarRings[dateKey] || {
      outer: false,
      middle: false,
      center: false,
      outerNote: '',
      middleNote: '',
      centerNote: ''
    };
    
    setCurrentRingData(existingRings);
    setRingsModalVisible(true);
  }, [selectedDate, calendarRings, onEdit]);

  // Render rings for a date
  const renderDateRings = (ringData: RingData) => {
    console.log('Rendering rings with data:', JSON.stringify(ringData));
    return (
      <Svg height="48" width="48" viewBox="0 0 24 24">
        {/* Outer ring (red) */}
        {ringData.outer && (
          <Circle
            cx="12"
            cy="12"
            r="8"
            stroke="#FF3B30"
            strokeWidth="2"
            fill="transparent"
          />
        )}
        
        {/* Middle ring (blue) */}
        {ringData.middle && (
          <Circle
            cx="12"
            cy="12"
            r="5"
            stroke="#4D82F3"
            strokeWidth="2"
            fill="transparent"
          />
        )}
        
        {/* Center dot (black) */}
        {ringData.center && (
          <Circle
            cx="12"
            cy="12"
            r="2"
            fill="#000000"
          />
        )}
      </Svg>
    );
  };
  
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
          {days.map((day, index) => {
            // Empty cell
            if (!day?.day) {
              return <View key={index} style={styles.dayCell} />;
            }
            
            // If there's a blue ring or black dot, don't show number
            const showNumber = !day.hasRings || !(day.hasRings.middle || day.hasRings.center);
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.dayCell}
                onPress={() => day.date && selectDay(day.date)}
              >
                {day.isToday && <View style={styles.todayIndicator} />}
                
                {showNumber && (
                  <Text style={[
                    styles.dayText,
                    day.isToday && styles.todayText
                  ]}>
                    {day.day}
                  </Text>
                )}
                
                {day.hasEvents && 
                  <View style={styles.eventDot} />
                }
                
                {day.hasRings && (
                  <View style={styles.ringsContainer}>
                    {renderDateRings(day.hasRings)}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity style={styles.addRingsButton} onPress={handleEditPress}>
          <Text style={styles.addRingsButtonText}>Add Rings</Text>
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
  
  // Save the ring data
  const saveRings = useCallback(() => {
    if (!selectedDateForRings) return;
    
    const dateKey = formatDateKey(selectedDateForRings);
    console.log('Saving rings for date:', dateKey, JSON.stringify(currentRingData));
    
    // Check if any ring is active
    const hasAnyRing = currentRingData.outer || currentRingData.middle || currentRingData.center;
    
    if (hasAnyRing) {
      // Add or update rings
      setCalendarRings(prev => {
        const updatedRings = { ...prev };
        updatedRings[dateKey] = { ...currentRingData };
        return updatedRings;
      });
      Alert.alert('Success', 'Rings saved!');
    } else {
      // Remove rings if none are active
      setCalendarRings(prev => {
        const updatedRings = { ...prev };
        if (updatedRings[dateKey]) {
          delete updatedRings[dateKey];
        }
        return updatedRings;
      });
      Alert.alert('Success', 'Rings removed!');
    }
    
    // Close modal
    setRingsModalVisible(false);
  }, [selectedDateForRings, currentRingData]);

  // Update a specific ring toggle
  const toggleRing = (ring: 'outer' | 'middle' | 'center', value: boolean) => {
    setCurrentRingData(prev => ({
      ...prev,
      [ring]: value
    }));
  };
  
  // Update a specific note
  const updateNote = (noteType: 'outerNote' | 'middleNote' | 'centerNote', value: string) => {
    setCurrentRingData(prev => ({
      ...prev,
      [noteType]: value
    }));
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
      
      {/* Modal for activity rings */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ringsModalVisible}
        onRequestClose={() => setRingsModalVisible(false)}
      >
        <View style={styles.modalOuterContainer}>
          <TouchableWithoutFeedback onPress={() => setRingsModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.topSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            
            <Text style={styles.modalTitle}>
              {selectedDateForRings ? `Activity Rings for ${selectedDateForRings.getDate()} ${MONTHS[selectedDateForRings.getMonth()]}` : 'Add Activity Rings'}
            </Text>
            
            <View style={styles.ringOptionsContainer}>
              {/* Red Ring */}
              <View style={styles.ringOptionContainer}>
                <View style={styles.ringOption}>
                  <View style={styles.ringLabelContainer}>
                    <View style={styles.ringColorSample}>
                      <View style={[styles.colorSample, styles.outerRingSample]} />
                    </View>
                    <Text style={styles.ringLabel}>Red Ring</Text>
                  </View>
                  <Switch
                    value={currentRingData.outer}
                    onValueChange={(value) => toggleRing('outer', value)}
                    trackColor={{ false: '#E5E7EB', true: '#FF897A' }}
                    thumbColor={currentRingData.outer ? '#FF3B30' : '#f4f3f4'}
                  />
                </View>
                
                {currentRingData.outer && (
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Note for red ring..."
                    value={currentRingData.outerNote}
                    onChangeText={(text) => updateNote('outerNote', text)}
                  />
                )}
              </View>
              
              {/* Blue Ring */}
              <View style={styles.ringOptionContainer}>
                <View style={styles.ringOption}>
                  <View style={styles.ringLabelContainer}>
                    <View style={styles.ringColorSample}>
                      <View style={[styles.colorSample, styles.middleRingSample]} />
                    </View>
                    <Text style={styles.ringLabel}>Blue Ring</Text>
                  </View>
                  <Switch
                    value={currentRingData.middle}
                    onValueChange={(value) => toggleRing('middle', value)}
                    trackColor={{ false: '#E5E7EB', true: '#A4C1F8' }}
                    thumbColor={currentRingData.middle ? '#4D82F3' : '#f4f3f4'}
                  />
                </View>
                
                {currentRingData.middle && (
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Note for blue ring..."
                    value={currentRingData.middleNote}
                    onChangeText={(text) => updateNote('middleNote', text)}
                  />
                )}
              </View>
              
              {/* Center Dot */}
              <View style={styles.ringOptionContainer}>
                <View style={styles.ringOption}>
                  <View style={styles.ringLabelContainer}>
                    <View style={styles.ringColorSample}>
                      <View style={[styles.colorSample, styles.centerDotSample]} />
                    </View>
                    <Text style={styles.ringLabel}>Center Dot</Text>
                  </View>
                  <Switch
                    value={currentRingData.center}
                    onValueChange={(value) => toggleRing('center', value)}
                    trackColor={{ false: '#E5E7EB', true: '#9B9B9B' }}
                    thumbColor={currentRingData.center ? '#000000' : '#f4f3f4'}
                  />
                </View>
                
                {currentRingData.center && (
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Note for center dot..."
                    value={currentRingData.centerNote}
                    onChangeText={(text) => updateNote('centerNote', text)}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setRingsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveRings}
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
    marginBottom: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  dayText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  todayText: {
    fontWeight: '500',
    color: '#1F2937',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4D82F3',
    marginTop: 2,
  },
  ringsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  addRingsButton: {
    backgroundColor: '#4D82F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  addRingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topSheetContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    paddingTop: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  ringOptionsContainer: {
    marginVertical: 12,
  },
  ringOptionContainer: {
    marginBottom: 12,
    width: '100%',
  },
  ringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
    width: '100%',
  },
  ringLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ringColorSample: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  colorSample: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  outerRingSample: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  middleRingSample: {
    borderWidth: 2,
    borderColor: '#4D82F3',
    backgroundColor: '#F3F4F6',
  },
  centerDotSample: {
    backgroundColor: '#000000',
  },
  ringLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 36,
    width: '100%',
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