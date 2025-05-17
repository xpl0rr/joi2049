// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Custom resolver configuration to handle missing modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'web-streams-polyfill': path.resolve(__dirname, 'src/polyfills.js'),
  '@expo/metro-runtime': path.resolve(__dirname, 'src/expo-metro-runtime-polyfill.js'),
};

// Add resolver for problematic imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle specific problematic modules
  if (moduleName.includes('web-streams-polyfill')) {
    return {
      filePath: path.resolve(__dirname, 'src/polyfills.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle @expo/metro-runtime resolution issues
  if (moduleName === '@expo/metro-runtime' || moduleName.includes('@expo/metro-runtime')) {
    return {
      filePath: path.resolve(__dirname, 'src/expo-metro-runtime-polyfill.js'),
      type: 'sourceFile',
    };
  }
  
  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
