// ChartWidget.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';

/* ──────────── types ──────────── */
export interface BillEntry {
  /** ISO string or Date object. Optional to avoid crashes on bad data. */
  date?: string | Date;
  amount: number;
}

/* ──────────── props ──────────── */
interface ChartWidgetProps {
  title?: string;
  /** raw list of bills */
  data: BillEntry[];
  onUpdate: (cfg: any) => void;
}

/* ──────────── constants ──────────── */
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const CHART_H = 180;
const PAD_H = 30;          // horizontal screen padding

/* ──────────── helpers ──────────── */
const safeMonth = (input?: string | Date): number | null => {
  if (!input) return null;
  const d = typeof input === 'string' ? new Date(input) : input;
  return isNaN(d.getTime()) ? null : d.getMonth(); // 0-11 | null
};

const roundMax = (n: number) => {
  if (n <= 10) return 10;
  if (n <= 50) return 50;
  if (n <= 100) return 100;
  if (n <= 500) return 500;
  return Math.ceil(n / 100) * 100;
};

/* ──────────── component ──────────── */
const ChartWidget: React.FC<ChartWidgetProps> = ({
  title = 'Bills Over Time',
  data = [],
  onUpdate,
}) => {
  /* 1. Aggregate totals by month, skip bad data */
  const monthlyTotals = useMemo(() => {
    const t = Array(12).fill(0);
    data.forEach(({ date, amount }) => {
      const idx = safeMonth(date);
      if (idx !== null && amount > 0) t[idx] += amount;
    });
    return t;
  }, [data]);

  /* Total across all months */
  const total = monthlyTotals.reduce((sum, v) => sum + v, 0);

  /* 2. Chart dimensions & scaling */
  const [chartW, setChartW] = useState(
    Dimensions.get('window').width - PAD_H * 2 - 20,
  );
  const maxVal = Math.max(...monthlyTotals);
  const yMax = roundMax(maxVal);
  const yTicks = Array.from({ length: 6 }, (_, i) => yMax - (yMax / 5) * i);

  /* 3. Build line segments (skip gaps) */
  type Pt = { x: number; y: number };
  const segments: Pt[][] = [];
  let cur: Pt[] = [];

  monthlyTotals.forEach((val, i) => {
    const x = (i * chartW) / (MONTHS.length - 1);
    const y = yMax > 0 ? CHART_H - (val / yMax) * CHART_H : CHART_H;

    if (val > 0) {
      cur.push({ x, y });
    } else if (cur.length) {
      segments.push(cur);
      cur = [];
    }
  });
  if (cur.length) segments.push(cur);

  /* 4. Render */
  return (
    <View
      style={styles.container}
      onLayout={e =>
        setChartW(e.nativeEvent.layout.width - PAD_H * 2 - 20)
      }
    >
      <Text style={styles.title}>{`${title}: $${total.toFixed(2)}`}</Text>

      {/* Y-axis */}
      <View style={styles.yAxis}>
        {yTicks.map(t => (
          <Text key={t} style={styles.yLabel}>
            {t.toFixed(0)}
          </Text>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        <Svg width={chartW} height={CHART_H}>
          {segments.map((seg, i) => (
            <Polyline
              key={i}
              points={seg.map(p => `${p.x},${p.y}`).join(' ')}
              stroke="#4D82F3"
              strokeWidth={2}
              fill="none"
            />
          ))}
          {segments.flat().map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#4D82F3" />
          ))}
        </Svg>
      </View>

      {/* X-axis */}
      <View style={styles.xAxis}>
        {MONTHS.map(m => (
          <Text key={m} style={styles.xLabel}>
            {m[0]}
          </Text>
        ))}
      </View>
    </View>
  );
};

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: PAD_H,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  yAxis: {
    position: 'absolute',
    left: 5,
    top: 32,
    bottom: 32,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chartArea: {
    height: CHART_H,
    marginLeft: 20,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginTop: 6,
  },
  xLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
});

export default ChartWidget;