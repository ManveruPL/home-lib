import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { ColorToken } from '@/theme/palette';
import { useThemeColors } from '@/theme/use-theme-colors';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
};

export function Icon({ name, size = 24, color = 'on-surface' }: IconProps) {
  const colors = useThemeColors();
  return <MaterialIcons name={name} size={size} color={colors[color]} />;
}
