import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface ActivityConfig {
  title: string;
  percentage: number;
}

interface ActivityEditFormProps {
  config: ActivityConfig;
  onUpdate: (config: ActivityConfig) => void;
  onCancel: () => void;
}

const ActivityEditForm: React.FC<ActivityEditFormProps> = ({ config, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<ActivityConfig>({
    title: config.title || 'Track Progress',
    percentage: config.percentage || 66,
  });

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'title') {
      setFormData({
        ...formData,
        [field]: value
      });
    } else if (field === 'percentage') {
      setFormData({
        ...formData,
        [field]: parseFloat(value) || 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Widget Display</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholder="Enter widget title"
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <Text style={styles.sectionTitle}>Progress Circle</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Percentage</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={formData.percentage.toString()}
          onChangeText={(value) => handleInputChange('percentage', value)}
          placeholder="Enter percentage (0-100)"
          placeholderTextColor="#94A3B8"
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
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FFFFFF',
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

export default ActivityEditForm; 