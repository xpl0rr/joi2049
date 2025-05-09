import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';

const TAB_ITEMS = [
  { name: 'Home',    href: '/',        icon: 'home'   },
  { name: 'Health',  href: '/health',  icon: 'heart'  },
  { name: 'Finance', href: '/finance', icon: 'dollar' },
];

export function CustomTabBar() {
  const router   = useRouter();
  const segments = useSegments();           // e.g. ['/health']

  const activeHref = '/' + (segments[0] ?? ''); // '' when on Home

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map(({ name, href, icon }) => {
        const focused = activeHref === href;
        return (
          <Pressable
            key={name}
            style={styles.tab}
            onPress={() => router.push(href)}
          >
            <FontAwesome
              name={icon as any}
              size={28}
              style={{ opacity: focused ? 1 : 0.35 }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
});