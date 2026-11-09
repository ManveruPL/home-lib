import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import { darkColors, fonts, lightColors, type ColorToken } from './palette';

function withFonts(base: Theme['fonts']): Theme['fonts'] {
  return {
    regular: { ...base.regular, fontFamily: fonts.sans },
    medium: { ...base.medium, fontFamily: fonts.sans },
    bold: { ...base.bold, fontFamily: fonts.sans },
    heavy: { ...base.heavy, fontFamily: fonts.sans },
  };
}

function buildTheme(base: Theme, colors: Record<ColorToken, string>, dark: boolean): Theme {
  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors['on-surface'],
      border: colors['surface-variant'],
      notification: colors.error,
    },
    fonts: withFonts(base.fonts),
  };
}

// Headers and the tab bar are styled by React Navigation, not NativeWind.
export const lightNavigationTheme = buildTheme(DefaultTheme, lightColors, false);
export const darkNavigationTheme = buildTheme(DarkTheme, darkColors, true);
