import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface NotesConfig {
  notes: string;
}

interface NotesEditFormProps {
  config: NotesConfig;
  onUpdate: (config: NotesConfig) => void;
  onCancel: () => void;
}

const NotesEditForm: React.FC<NotesEditFormProps> = ({ config, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<NotesConfig>({
    notes: config.notes || '',
  });

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleInputChange = (value: string) => {
    setFormData({
      ...formData,
      notes: value
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Notes</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.textarea}
          value={formData.notes}
          onChangeText={handleInputChange}
          placeholder="Type your notes here..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 12,
  },
  formRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FFFFFF',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#4D82F3',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotesEditForm; 