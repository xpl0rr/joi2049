// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'heart.fill': 'favorite',
  'dollarsign.circle.fill': 'attach-money',
  'gearshape.fill': 'settings',
  checklist: 'checklist',
  'square.grid.2x2.fill': 'apps',
  'square.grid.2x2': 'view-module',
  ellipsis: 'more-horiz',
  xmark: 'close',
  plus: 'add',
  pencil: 'edit',
  'xmark.circle.fill': 'cancel',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'arrow.up.left.and.arrow.down.right': 'fullscreen',
  'arrow.down.right.and.arrow.up.left': 'fullscreen-exit',
  calendar: 'event',
  'list.bullet': 'format-list-bulleted',
  'note.text': 'notes',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
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
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
