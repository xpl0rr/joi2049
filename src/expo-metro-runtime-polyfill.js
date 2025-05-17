// This is a polyfill to help Metro bundler resolve @expo/metro-runtime
// This workaround helps when there are persistent dependency resolution issues
module.exports = require('@expo/metro-runtime');
