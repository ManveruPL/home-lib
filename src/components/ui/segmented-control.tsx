import { Pressable, View } from 'react-native';

import { Text } from './text';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row overflow-hidden rounded-full border border-outline"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`min-h-touch flex-1 items-center justify-center px-2 ${
              index > 0 ? 'border-l border-outline' : ''
            } ${selected ? 'bg-secondary-container' : 'active:bg-surface-variant'}`}
          >
            <Text
              variant="title"
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`text-sm ${selected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
