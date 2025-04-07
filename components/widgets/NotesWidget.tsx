import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

interface NotesWidgetProps {
  notes: string;
  onUpdate: (notes: string) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ notes: initialNotes, onUpdate }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isFocused, setIsFocused] = useState(false);

  // Update local state when props change (e.g., when edited through form)
  useEffect(() => {
    try {
      setNotes(initialNotes || '');
    } catch (error) {
      console.error('Error updating notes from props:', error);
    }
  }, [initialNotes]);

  const handleChange = useCallback((text: string) => {
    setNotes(text);
    onUpdate(text);
  }, [onUpdate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Notes
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.focusedInput
        ]}
        placeholder="Type your notes here..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        value={notes}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        scrollEnabled={true}
        editable={true}
        maxLength={1000}
        keyboardType="default"
        returnKeyType="default"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 0,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#334155',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    textAlignVertical: 'top',
    minHeight: 140,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  focusedInput: {
    borderColor: '#4D82F3',
    borderWidth: 1.5,
  },
});

export default NotesWidget; 