//  AddSheet.tsx  (pseudo-code)
import React from 'react';
import { Switch } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { ActivityKey } from './calendarStore';

export default function AddSheet({ date, rings, visible, onClose, onToggle }) {
  return (
    <BottomSheet index={visible ? 0 : -1} snapPoints={['40%']}>
      {(['workout', 'todo', 'guitar', 'custom4'] as ActivityKey[]).map((k, i) => (
        <Switch
          key={k}
          value={!!rings?.[k]}
          onValueChange={() => onToggle(date, k)}
          thumbColor={ringPalette[i]}
          label={k}
        />
      ))}
    </BottomSheet>
  );
}