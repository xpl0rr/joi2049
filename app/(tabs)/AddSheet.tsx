import React from 'react';
import { View, Text, Switch } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { ActivityKey } from './calendarStore';
import { ringPalette } from '@/constants/ringPalette';

export default function AddSheet(
  { date, rings, visible, onClose, onToggle }: {
    date: string;
    rings?: Record<ActivityKey, boolean>;
    visible: boolean;
    onClose: () => void;
    onToggle: (date: string, key: ActivityKey) => void;
  }
) {
  return (
    <BottomSheet index={visible ? 0 : -1} snapPoints={['40%']}>
      {(['workout', 'todo', 'guitar', 'custom4'] as ActivityKey[]).map((k, i) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 }}>
          <Text style={{ fontSize: 16 }}>{k}</Text>
          <Switch
            value={!!rings?.[k]}
            onValueChange={() => onToggle(date, k)}
            thumbColor={ringPalette[i]}
          />
        </View>
      ))}
    </BottomSheet>
  );
}