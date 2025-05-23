import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // We hide Expo-Router’s own bar because you’re using <CustomTabBar />
        tabBarStyle: { display: 'none' },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{ href: '/' }}
      />

      {/* Health */}
      <Tabs.Screen
        name="health"
        options={{ href: '/health' }}
      />

      {/* Finances */}
      <Tabs.Screen
        name="finance"
        options={{ href: '/finance' }}
      />

      {/* Notes */}
      <Tabs.Screen
        name="notes"
        options={{ href: '/notes' }}
      />
    </Tabs>
  );
}