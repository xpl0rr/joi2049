import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Svg, { Circle, G } from 'react-native-svg';

interface ActivityWidgetProps {
  percentage: number;
  average: number;
  clicks: { value: number, trend: 'up' | 'down' };
  downloads: { value: number, trend: 'up' | 'down' };
  revenue: { value: number, trend: 'up' | 'down' };
  onUpdate: (config: any) => void;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  percentage,
  average,
  clicks,
  downloads,
  revenue,
  onUpdate
}) => {
  const colorScheme = useColorScheme();
  
  // SVG parameters for the progress circle
  const size = 180;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;
  
  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? '↑' : '↓';
  };
  
  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Daily User Activity
        </Text>
        <Text style={styles.subtitle}>
          How active is your site today?
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
          <Text style={styles.averageText}>
            You average {average.toLocaleString()} clicks per day
          </Text>
        </View>
      </View>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Clicks</Text>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricValue}>{clicks.value.toLocaleString()}</Text>
            <Text style={[styles.trendIcon, { color: getTrendColor(clicks.trend) }]}>
              {getTrendIcon(clicks.trend)}
            </Text>
          </View>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Downloads</Text>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricValue}>{downloads.value.toLocaleString()}</Text>
            <Text style={[styles.trendIcon, { color: getTrendColor(downloads.trend) }]}>
              {getTrendIcon(downloads.trend)}
            </Text>
          </View>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Revenue</Text>
          <View style={styles.metricValueContainer}>
            <Text style={styles.metricValue}>${revenue.value.toLocaleString()}</Text>
            <Text style={[styles.trendIcon, { color: getTrendColor(revenue.trend) }]}>
              {getTrendIcon(revenue.trend)}
            </Text>
          </View>
        </View>
      </View>
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
  subtitle: {
    fontSize: 14,
    color: '#64748B',
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
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ActivityWidget; 