import { Platform } from 'react-native';

/**
 * Universal Typography System for SUT Canteen Express
 * Prevents Android React Native from falling back to System Serif (Droid Serif / Noto Serif)
 * when bold weights (800, 900) are used without explicit font family.
 */

export const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: 'sans-serif',
});

// Safe weight resolver for Android
export const getSafeWeight = (weight) => {
  if (Platform.OS === 'android') {
    if (weight === '900' || weight === '800' || weight === 'heavy' || weight === 'black') {
      return 'bold';
    }
    if (weight === '600' || weight === '700') {
      return 'bold';
    }
  }
  return weight;
};

export const TYPOGRAPHY = {
  fontFamily: FONT_FAMILY,
  regular: {
    fontFamily: FONT_FAMILY,
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: FONT_FAMILY,
    fontWeight: Platform.OS === 'android' ? 'bold' : '600',
  },
  bold: {
    fontFamily: FONT_FAMILY,
    fontWeight: Platform.OS === 'android' ? 'bold' : '700',
  },
  extraBold: {
    fontFamily: FONT_FAMILY,
    fontWeight: Platform.OS === 'android' ? 'bold' : '800',
  },
  black: {
    fontFamily: FONT_FAMILY,
    fontWeight: Platform.OS === 'android' ? 'bold' : '900',
  },
};

export default TYPOGRAPHY;
