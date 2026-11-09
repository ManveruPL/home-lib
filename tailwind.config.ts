import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { colorTokens, fonts, lightColors, toCssVariables } from './src/theme/palette';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Theme-aware colors; values are swapped per color scheme in ThemeRoot.
      colors: Object.fromEntries(
        colorTokens.map((token) => [token, `rgb(var(--color-${token}) / <alpha-value>)`]),
      ),
      fontFamily: {
        serif: [fonts.serif],
        sans: [fonts.sans],
      },
      minHeight: {
        // Minimum touch target size from the design guidelines.
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [
    // Light palette as the default, so classes resolve even outside ThemeRoot.
    plugin(({ addBase }) => addBase({ ':root': toCssVariables(lightColors) })),
  ],
} satisfies Config;
