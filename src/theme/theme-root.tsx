import { ThemeProvider } from 'expo-router';
import { vars } from 'nativewind';
import type { PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';

import { lightNavigationTheme, darkNavigationTheme } from './navigation-theme';
import { darkColors, lightColors, toCssVariables } from './palette';

const lightVars = vars(toCssVariables(lightColors));
const darkVars = vars(toCssVariables(darkColors));

/** Applies the brand palette for the system color scheme to NativeWind classes and navigation. */
export function ThemeRoot({ children }: PropsWithChildren) {
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemeProvider value={isDark ? darkNavigationTheme : lightNavigationTheme}>
      <View style={isDark ? darkVars : lightVars} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeProvider>
  );
}
