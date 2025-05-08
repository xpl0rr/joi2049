import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen 
        name="index" 
        options={{ href: "/" }}
      />
      <Tabs.Screen 
        name="health" 
        options={{ href: "/health" }}
      />
      <Tabs.Screen 
        name="finance" 
        options={{ href: "/finance" }}
      />
      <Tabs.Screen 
        name="todo" 
        options={{ href: "/todo" }}
      />
      <Tabs.Screen 
        name="custom/[id]" 
        options={{ href: null }}
      />
    </Tabs>
  );
}
