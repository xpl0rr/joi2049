//  DayRings.tsx
import Svg, { Circle, Text } from 'react-native-svg';
const size = 34;
const stroke = 3;
const gap = 1.5;

export default function DayRings({
  rings,
  date,
}: {
  rings?: Record<ActivityKey, boolean>;
  date: { day: number };
}) {
  const active = rings ? Object.values(rings) : [];
  return (
    <Svg width={size} height={size}>
      {ringPalette.map((c, i) => (
        <Circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - stroke / 2 - i * (stroke + gap)}
          stroke={c}
          strokeOpacity={active[i] ? 1 : 0.15}
          strokeWidth={stroke}
          fill="none"
        />
      ))}
      <Text
        x="50%"
        y="55%"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        fill="#fff">
        {date.day}
      </Text>
    </Svg>
  );
}