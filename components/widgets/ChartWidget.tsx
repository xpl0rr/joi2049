import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ChartData {
  label: string;
  value: number;
}

interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  onUpdate: (config: any) => void;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  title = 'Monthly Sales',
  data = [],
  onUpdate 
}) => {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(0);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 80);

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
    setChartWidth(width - 80); // Adjust for padding/margins
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  // Bar width calculation
  const barWidth = Math.max(25, Math.min(40, (chartWidth / chartData.length) - 10));
  const barSpacing = (chartWidth - (barWidth * chartData.length)) / (chartData.length - 1);

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
      
      <ScrollView 
        horizontal={chartData.length > 6}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chartScrollContent,
          chartData.length <= 6 && { justifyContent: 'space-around', width: '100%' }
        ]}
      >
        <View style={styles.chartContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.value / maxValue) * 100}%`,
                    width: barWidth,
                    backgroundColor: '#4D82F3',
                    marginHorizontal: chartData.length <= 6 ? 0 : barSpacing / 2
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
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
    paddingHorizontal: 10,
    height: 250,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    marginLeft: 40, // Space for Y-axis labels
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 45,
    bottom: 30,
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginRight: 4,
  },
});

export default ChartWidget; 