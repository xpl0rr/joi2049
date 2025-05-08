// app.config.js  – CommonJS so EAS can require() it
module.exports = {
  /* ── basic app info ── */
  name: 'Joi2049',
  slug: 'joi2049',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'joi2049',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,

  /* ── OTA / updates ── */
  updates: { enabled: false },

  /* ── iOS ── */
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.xplorr.Joi',
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },

  /* ── Android ── */
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.xplorr.Joi',
  },

  /* ── Web ── */
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  /* ── Plugins ── */
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-dev-client',
  ],

  /* ── Experiments ── */
  experiments: { typedRoutes: true },

  /* ── Runtime & assets ── */
  runtimeVersion: '1.0.0',
  assetBundlePatterns: ['**/*'],

  /* ── Extra (includes the NEW projectId) ── */
  extra: {
    router: { origin: false },
    eas: {
      projectId: 'd52e7dc8-b81f-495f-a4c3-15fb85e04cb4', // ← this matches the ID EAS just created
    },
  },

  /* ── Expo owner ── */
  owner: 'xplorr',
};