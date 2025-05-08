// app.config.js
export default ({ config }) => ({
    // keep Expo’s defaults plus your customisations
    ...config,
  
    /** ── basic app info ── */
    name: 'Joi2049',
    slug: 'joi2049',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'joi2049',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
  
    /** ── OTA/updates ── */
    updates: {
      enabled: false,
    },
  
    /** ── iOS ── */
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.xplorr.Joi',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
  
    /** ── Android ── */
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.xplorr.Joi',
    },
  
    /** ── Web ── */
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
  
    /** ── Plugins ── */
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
      'expo-dev-client', // ← added so your custom dev client recognises the QR
    ],
  
    /** ── Experiments ── */
    experiments: {
      typedRoutes: true,
    },
  
    /** ── Runtime & assets ── */
    runtimeVersion: '1.0.0',
    assetBundlePatterns: ['**/*'],
  
    /** ── Extra ── */
    
      eas: {
        projectId: 'e37a7eed-7207-4be0-ae58-eb26a8656660',
      },
    },
  
    /** ── Owner (Expo account) ── */
    owner: 'xplorr',
  });