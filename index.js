// Main entry point for the app with explicit root component registration
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import 'react-native-gesture-handler';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

// Register the root component explicitly
registerRootComponent(App);
