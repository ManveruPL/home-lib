import { Pressable, type PressableProps } from 'react-native';

import type { ColorToken } from '@/theme/palette';

import { Icon, type IconName } from './icon';

type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: IconName;
  /** Required: icon-only buttons need a label for screen readers. */
  accessibilityLabel: string;
  color?: ColorToken;
  size?: number;
  className?: string;
};

export function IconButton({
  icon,
  color = 'on-surface-variant',
  size = 24,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={4}
      className={`min-h-touch min-w-touch items-center justify-center rounded-full active:bg-surface-variant ${className ?? ''}`}
      {...props}
    >
      <Icon name={icon} size={size} color={color} />
    </Pressable>
  );
}
