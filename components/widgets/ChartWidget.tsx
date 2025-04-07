import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ChartData {
  label: string;
  value: number;
}

interface ChartWidgetProps {
  title?: string;
  data: ChartData[];
  onUpdate: (config: any) => void;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LETTER = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  title = 'Bar Chart',
  data = [],
  onUpdate 
}) => {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 60);
  const screenWidth = Dimensions.get('window').width;

  // Sample data if none is provided
  const defaultData: ChartData[] = [
    { label: 'Jan', value: 150 },
    { label: 'Feb', value: 360 },
    { label: 'Mar', value: 180 },
    { label: 'Apr', value: 280 },
    { label: 'May', value: 170 },
    { label: 'Jun', value: 180 },
    { label: 'Jul', value: 270 },
    { label: 'Aug', value: 90 },
    { label: 'Sep', value: 190 },
    { label: 'Oct', value: 370 },
    { label: 'Nov', value: 260 },
    { label: 'Dec', value: 100 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  // Calculate max value for chart scaling
  useEffect(() => {
    if (chartData.length > 0) {
      const max = Math.max(...chartData.map(item => item.value));
      setMaxValue(Math.ceil(max / 100) * 100); // Round up to nearest 100
    }
    
    // Show loading state briefly
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(loadingTimeout);
  }, [chartData]);

  // Function to measure container width
  const onContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setChartWidth(width - 45); // Reduce left margin for more space
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  // Calculate optimal bar width for all 12 months to fit without scrolling
  const getBarWidth = () => {
    // Make sure we have space for all 12 months
    const availableWidth = chartWidth - 30; // Account for some padding
    const minBarSpacing = 3; // Minimum spacing between bars
    const maxBarWidth = (availableWidth / chartData.length) - minBarSpacing;
    
    if (screenWidth < 360) {
      // For very small screens
      return Math.min(maxBarWidth, 14); 
    } else if (screenWidth < 400) {
      // For medium-small screens
      return Math.min(maxBarWidth, 16);
    } else {
      // For larger screens
      return Math.min(maxBarWidth, 18);
    }
  };

  const barWidth = getBarWidth();
  // Calculate dynamic spacing - spacing will adjust to fill available width
  const totalBarsWidth = barWidth * chartData.length;
  const remainingSpace = chartWidth - totalBarsWidth;
  const barSpacing = remainingSpace / (chartData.length + 1);

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.yAxisContainer}>
        <Text style={styles.yAxisLabel}>{maxValue}</Text>
        <Text style={styles.yAxisLabel}>{Math.round(maxValue * 0.75)}</Text>
        <Text style={styles.yAxisLabel}>{Math.round(maxValue * 0.5)}</Text>
        <Text style={styles.yAxisLabel}>{Math.round(maxValue * 0.25)}</Text>
        <Text style={styles.yAxisLabel}>0</Text>
      </View>
      
      <View style={styles.chartScrollContent}>
        <View style={styles.chartContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={[styles.barContainer, { width: barWidth + barSpacing }]}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.value / maxValue) * 100}%`,
                    width: barWidth,
                    backgroundColor: '#4D82F3',
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.label.charAt(0)}</Text>
            </View>
          ))}
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
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
  },
  chartScrollContent: {
    height: 220,
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    marginLeft: 30, // Less space for Y-axis
    paddingRight: 5,
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#6B7280',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 40,
    bottom: 30,
    width: 25,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    marginRight: 4,
  },
});

export default ChartWidget; 