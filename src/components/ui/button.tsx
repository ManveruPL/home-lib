import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import type { ColorToken } from '@/theme/palette';
import { useThemeColors } from '@/theme/use-theme-colors';

import { Icon, type IconName } from './icon';
import { Text } from './text';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';

const containerClasses: Record<Variant, string> = {
  filled: 'bg-primary',
  tonal: 'bg-secondary-container',
  outlined: 'border border-outline',
  text: '',
  danger: 'border border-error',
};

const contentColors: Record<Variant, ColorToken> = {
  filled: 'on-primary',
  tonal: 'on-secondary-container',
  outlined: 'primary',
  text: 'primary',
  danger: 'error',
};

const textClasses: Record<Variant, string> = {
  filled: 'text-on-primary',
  tonal: 'text-on-secondary-container',
  outlined: 'text-primary',
  text: 'text-primary',
  danger: 'text-error',
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  className?: string;
};

export function Button({
  label,
  variant = 'filled',
  icon,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`min-h-touch flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-70 ${containerClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors[contentColors[variant]]} />
      ) : (
        icon && <Icon name={icon} size={20} color={contentColors[variant]} />
      )}
      <Text variant="title" className={textClasses[variant]}>
        {label}
      </Text>
    </Pressable>
  );
}
