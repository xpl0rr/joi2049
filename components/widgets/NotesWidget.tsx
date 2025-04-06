import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

interface NotesWidgetProps {
  notes: string;
  onUpdate: (notes: string) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ notes: initialNotes, onUpdate }) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleChange = (text: string) => {
    setNotes(text);
    onUpdate(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Quick Notes
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Type your notes here..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        value={notes}
        onChangeText={handleChange}
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
});

export default NotesWidget; 