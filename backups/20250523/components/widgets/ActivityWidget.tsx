import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface ActivityWidgetProps {
  title: string;
  percentage: number;
  average?: number;
  metrics?: any[];
  onUpdate: (config: any) => void;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  title = 'Track Progress',
  percentage = 66,
  average = 0,
  metrics = [],
  onUpdate
}) => {
  // SVG parameters for the progress circle
  const size = 180;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <Circle
            stroke="#EEF2FF"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              stroke="#4D82F3"
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        <View style={styles.progressTextContainer}>
          <Text style={styles.percentageText}>
            {percentage.toFixed(0)}%
          </Text>
          {average > 0 && (
            <Text style={styles.averageText}>
              Average: {average.toFixed(0)}%
            </Text>
          )}
        </View>
      </View>
      
      {/* Display metrics if provided */}
      {metrics && metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 0,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#334155',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  averageText: {
    fontSize: 14,
    color: '#64748B',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  }
});

export default ActivityWidget; 