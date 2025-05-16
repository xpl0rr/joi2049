// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Custom resolver configuration to handle missing modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'web-streams-polyfill': path.resolve(__dirname, 'src/polyfills.js'),
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
  
  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
