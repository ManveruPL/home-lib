import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorToken } from './palette';

/** Palette hex values, for props that do not accept NativeWind classes (icons, placeholders). */
export function useThemeColors(): Record<ColorToken, string> {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
