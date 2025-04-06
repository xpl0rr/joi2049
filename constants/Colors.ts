/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Application color scheme matching the bright, clean TailAdmin dashboard style
 */

const primaryColor = '#4D82F3'; // Bright blue accent color
const successColor = '#10B981'; // Emerald green for positive trends
const errorColor = '#EF4444'; // Red for negative trends

export const Colors = {
  light: {
    text: '#334155', // Slate-700
    textSecondary: '#64748B', // Slate-500
    background: '#F1F5F9', // Slate-100
    cardBackground: '#FFFFFF',
    tint: primaryColor,
    success: successColor,
    error: errorColor,
    icon: '#94A3B8', // Slate-400
    tabIconDefault: '#94A3B8', // Slate-400
    tabIconSelected: primaryColor,
    border: '#E2E8F0', // Slate-200
  },
  dark: {
    text: '#F8FAFC', // Slate-50
    textSecondary: '#CBD5E1', // Slate-300
    background: '#1E293B', // Slate-800
    cardBackground: '#334155', // Slate-700
    tint: primaryColor,
    success: successColor,
    error: errorColor,
    icon: '#94A3B8', // Slate-400
    tabIconDefault: '#94A3B8', // Slate-400
    tabIconSelected: primaryColor,
    border: '#475569', // Slate-600
  },
};
