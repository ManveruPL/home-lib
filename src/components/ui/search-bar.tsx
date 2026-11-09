import { TextInput, View } from 'react-native';

import { useThemeColors } from '@/theme/use-theme-colors';

import { Icon } from './icon';
import { IconButton } from './icon-button';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  clearLabel: string;
};

export function SearchBar({ value, onChangeText, placeholder, clearLabel }: SearchBarProps) {
  const colors = useThemeColors();

  return (
    <View className="min-h-touch flex-1 flex-row items-center rounded-full bg-surface-variant pl-4">
      <Icon name="search" size={22} color="on-surface-variant" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors['on-surface-variant']}
        cursorColor={colors.primary}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        className="flex-1 px-3 py-2 font-sans text-base text-on-surface"
      />
      {value ? (
        <IconButton icon="close" accessibilityLabel={clearLabel} onPress={() => onChangeText('')} />
      ) : null}
    </View>
  );
}
