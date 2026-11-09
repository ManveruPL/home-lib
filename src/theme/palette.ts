// HomeLib brand palette and Material 3 tokens, from .ai-data/branding (branding.md, colors.xml).
// Shared by tailwind.config.ts (utility classes) and the navigation theme, so keep it framework-free.

export const brand = {
  evergreen: '#144C3A',
  evergreenDark: '#0E382A',
  evergreenLight: '#1B5542',
  gold: '#DEB25B',
  goldLight: '#ECC678',
  parchment: '#F6EAD0',
  espresso: '#221811',
  walnut: '#121A16',
  sage: '#7E9F8E',
} as const;

export type ColorToken =
  | 'primary'
  | 'on-primary'
  | 'primary-container'
  | 'on-primary-container'
  | 'secondary'
  | 'on-secondary'
  | 'secondary-container'
  | 'on-secondary-container'
  | 'tertiary'
  | 'on-tertiary'
  | 'background'
  | 'on-background'
  | 'surface'
  | 'on-surface'
  | 'surface-variant'
  | 'on-surface-variant'
  | 'outline'
  | 'error'
  | 'on-error'
  | 'accent';

export const lightColors: Record<ColorToken, string> = {
  primary: '#144C3A',
  'on-primary': '#FFFFFF',
  'primary-container': '#BAE8D4',
  'on-primary-container': '#002117',
  secondary: '#7A5900',
  'on-secondary': '#FFFFFF',
  'secondary-container': '#FFDF9E',
  'on-secondary-container': '#261A00',
  tertiary: '#3E6554',
  'on-tertiary': '#FFFFFF',
  background: '#FAF6EE',
  'on-background': '#191C1B',
  surface: '#FAF6EE',
  'on-surface': '#191C1B',
  'surface-variant': '#DBE5DF',
  'on-surface-variant': '#3F4945',
  outline: '#707975',
  // Not in the brand kit: Material 3 baseline error colors.
  error: '#BA1A1A',
  'on-error': '#FFFFFF',
  // Star ratings, active filters.
  accent: brand.gold,
};

export const darkColors: Record<ColorToken, string> = {
  primary: '#9ED2BD',
  'on-primary': '#003829',
  'primary-container': '#00513C',
  'on-primary-container': '#BAE8D4',
  secondary: '#FAC05E',
  'on-secondary': '#412D00',
  'secondary-container': '#5C4200',
  'on-secondary-container': '#FFDF9E',
  tertiary: '#A4CDAE',
  'on-tertiary': '#0E3722',
  background: '#121A16',
  'on-background': '#E1E3DF',
  surface: '#121A16',
  'on-surface': '#E1E3DF',
  'surface-variant': '#3F4945',
  'on-surface-variant': '#BFC9C3',
  outline: '#89938E',
  error: '#FFB4AB',
  'on-error': '#690005',
  accent: brand.gold,
};

export const colorTokens = Object.keys(lightColors) as ColorToken[];

/** "#144C3A" -> "20 76 58", the format used by `rgb(var(--x) / <alpha-value>)`. */
export function hexToRgbChannels(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

/** CSS variables (`--color-primary` etc.) for a palette. */
export function toCssVariables(colors: Record<ColorToken, string>): Record<string, string> {
  return Object.fromEntries(
    colorTokens.map((token) => [`--color-${token}`, hexToRgbChannels(colors[token])]),
  );
}

// Font families embedded via the expo-font config plugin in app.json.
export const fonts = {
  serif: 'Lora',
  sans: 'PlusJakartaSans',
} as const;
