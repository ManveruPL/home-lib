import type { ReactNode, Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/theme/use-theme-colors';

import { FieldError, FieldLabel } from './field-label';
import { Text } from './text';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Already translated error message. */
  error?: string;
  hint?: string;
  /** Rendered inside the field on the right, e.g. a scan button. */
  accessory?: ReactNode;
  ref?: Ref<TextInput>;
};

export function TextField({ label, error, hint, accessory, multiline, ...props }: TextFieldProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-1">
      <FieldLabel>{label}</FieldLabel>
      <View
        className={`min-h-touch flex-row items-center rounded-xl border bg-surface pl-4 ${error ? 'border-error' : 'border-outline'}`}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.outline}
          cursorColor={colors.primary}
          selectionColor={colors['primary-container']}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={`flex-1 py-3 pr-4 font-sans text-base text-on-surface ${multiline ? 'min-h-28' : ''}`}
          {...props}
        />
        {accessory}
      </View>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : hint ? (
        <Text variant="bodySmall" className="text-on-surface-variant">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
