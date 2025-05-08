import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Svg, { Polyline } from 'react-native-svg';

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
  title = 'Line Chart',
  data = [],
  onUpdate 
}) => {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(1);
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
      const values = chartData.map(item => item.value);
      const maxVal = Math.max(...values);
      let roundedMax = 1;
      if (maxVal > 0) {
        const exponent = Math.floor(Math.log10(maxVal));
        const magnitude = Math.pow(10, exponent);
        roundedMax = Math.ceil(maxVal / magnitude) * magnitude;
      }
      setMaxValue(roundedMax);
    }

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(loadingTimeout);
  }, [chartData]);

  const onContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setChartWidth(width - 45);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

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

      <View style={[styles.chartScrollContent, { paddingLeft: 30, paddingRight: 5 }]}>        
        <Svg width={chartWidth} height={180}>
          <Polyline
            points={chartData.map((item, index) => {
              const x = index * (chartWidth / (chartData.length - 1));
              const y = maxValue > 0 ? (180 - (item.value / maxValue) * 180) : 180;
              if (isNaN(x) || isNaN(y)) return `0,0`;
              return `${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(' ')}
            fill="none"
            stroke="#4D82F3"
            strokeWidth={2}
          />
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 30, paddingRight: 5 }}>
        {chartData.map((item, index) => (
          <Text key={index} style={styles.barLabel}>{item.label.charAt(0)}</Text>
        ))}
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
    color: '#000',
    textAlign: 'center',
    alignSelf: 'center',
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
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#6B7280',
  },
});

export default ChartWidget;