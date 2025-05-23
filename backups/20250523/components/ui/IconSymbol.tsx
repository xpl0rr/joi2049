// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Mapping from SF Symbol names to MaterialIcons names
const MAPPING: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'heart.fill': 'favorite',
  'dollarsign.circle.fill': 'attach-money',
  'gearshape.fill': 'settings',
  'checklist': 'check-box',
  'ellipsis': 'more-horiz',
  'xmark': 'close',
  'calendar': 'calendar-today',
  'list.bullet': 'format-list-bulleted',
  'note.text': 'note',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
  'square.grid.2x2.fill': 'grid-view',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward'
};

export type IconSymbolName = keyof typeof MAPPING | string;

/**
 * Cross-platform icon: maps SF Symbol names to MaterialIcons names.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = (MAPPING[name] ?? name) as React.ComponentProps<typeof MaterialIcons>['name'];
  return <MaterialIcons color={color} size={size} name={iconName} style={style as any} />;
}
