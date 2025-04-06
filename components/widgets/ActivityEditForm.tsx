import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface ActivityConfig {
  percentage: number;
  average: number;
  clicks: { value: number, trend: 'up' | 'down' };
  downloads: { value: number, trend: 'up' | 'down' };
  revenue: { value: number, trend: 'up' | 'down' };
}

interface ActivityEditFormProps {
  config: ActivityConfig;
  onUpdate: (config: ActivityConfig) => void;
  onCancel: () => void;
}

const ActivityEditForm: React.FC<ActivityEditFormProps> = ({ config, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<ActivityConfig>({
    percentage: config.percentage || 0,
    average: config.average || 0,
    clicks: {
      value: config.clicks?.value || 0,
      trend: config.clicks?.trend || 'up',
    },
    downloads: {
      value: config.downloads?.value || 0,
      trend: config.downloads?.trend || 'up',
    },
    revenue: {
      value: config.revenue?.value || 0,
      trend: config.revenue?.trend || 'up',
    },
  });

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'percentage' || field === 'average') {
      setFormData({
        ...formData,
        [field]: parseFloat(value) || 0,
      });
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof ActivityConfig],
          [child]: child === 'value' ? (parseFloat(value) || 0) : value,
        },
      });
    }
  };

  const toggleTrend = (field: 'clicks' | 'downloads' | 'revenue') => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        trend: formData[field].trend === 'up' ? 'down' : 'up',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Activity Information</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Percentage</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={formData.percentage.toString()}
          onChangeText={(value) => handleInputChange('percentage', value)}
          placeholder="Enter percentage"
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Average Clicks</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={formData.average.toString()}
          onChangeText={(value) => handleInputChange('average', value)}
          placeholder="Enter average clicks"
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <Text style={styles.sectionTitle}>Metrics</Text>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Clicks</Text>
        <View style={styles.metricInputContainer}>
          <TextInput
            style={styles.metricInput}
            keyboardType="numeric"
            value={formData.clicks.value.toString()}
            onChangeText={(value) => handleInputChange('clicks.value', value)}
            placeholder="Clicks"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity 
            style={[
              styles.trendButton, 
              { backgroundColor: formData.clicks.trend === 'up' ? '#4CAF50' : '#F44336' }
            ]}
            onPress={() => toggleTrend('clicks')}
          >
            <Text style={styles.trendText}>
              {formData.clicks.trend === 'up' ? '↑' : '↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Downloads</Text>
        <View style={styles.metricInputContainer}>
          <TextInput
            style={styles.metricInput}
            keyboardType="numeric"
            value={formData.downloads.value.toString()}
            onChangeText={(value) => handleInputChange('downloads.value', value)}
            placeholder="Downloads"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity 
            style={[
              styles.trendButton, 
              { backgroundColor: formData.downloads.trend === 'up' ? '#4CAF50' : '#F44336' }
            ]}
            onPress={() => toggleTrend('downloads')}
          >
            <Text style={styles.trendText}>
              {formData.downloads.trend === 'up' ? '↑' : '↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formRow}>
        <Text style={styles.label}>Revenue</Text>
        <View style={styles.metricInputContainer}>
          <TextInput
            style={styles.metricInput}
            keyboardType="numeric"
            value={formData.revenue.value.toString()}
            onChangeText={(value) => handleInputChange('revenue.value', value)}
            placeholder="Revenue"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity 
            style={[
              styles.trendButton, 
              { backgroundColor: formData.revenue.trend === 'up' ? '#4CAF50' : '#F44336' }
            ]}
            onPress={() => toggleTrend('revenue')}
          >
            <Text style={styles.trendText}>
              {formData.revenue.trend === 'up' ? '↑' : '↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    marginTop: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FFFFFF',
  },
  metricInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FFFFFF',
  },
  trendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4D82F3',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ActivityEditForm; 