import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface ActivityWidgetProps {
  title: string;
  percentage: number;
  onUpdate: (config: any) => void;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  title = 'Track Progress',
  percentage = 66,
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
  }
});

export default ActivityWidget; 