import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';

import { foldText, normalizeForCompare } from '@/lib/text';
import { useThemeColors } from '@/theme/use-theme-colors';

import { Button } from './button';
import { Icon } from './icon';
import { Sheet } from './sheet';
import { Text } from './text';

export type SelectOption<T> = { value: T; label: string; description?: string };

type SelectSheetProps<T> = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  /** Multi-select with a Done button; single-select closes on tap. */
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Offers "+ Add …" for a search text that matches no option. */
  onCreate?: (text: string) => void;
  createLabel?: (text: string) => string;
  emptyLabel?: string;
  /** Extra content above the Done button, e.g. "+ Add new author". */
  footerExtra?: ReactNode;
};

type OptionRowProps<T> = {
  option: SelectOption<T>;
  multiple: boolean;
  selected: boolean;
  onPress: () => void;
};

function OptionRow<T>({ option, multiple, selected, onPress }: OptionRowProps<T>) {
  const icon = multiple
    ? selected
      ? 'check-box'
      : 'check-box-outline-blank'
    : selected
      ? 'radio-button-checked'
      : 'radio-button-unchecked';

  return (
    <Pressable
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className="min-h-touch flex-row items-center gap-3 px-6 py-2 active:bg-surface-variant"
    >
      <Icon name={icon} color={selected ? 'primary' : 'on-surface-variant'} />
      <View className="flex-1">
        <Text>{option.label}</Text>
        {option.description ? (
          <Text variant="bodySmall" className="text-on-surface-variant">
            {option.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SelectSheet<T extends string | number>({
  visible,
  onClose,
  title,
  options,
  selected,
  onChange,
  multiple = false,
  searchable = false,
  searchPlaceholder,
  onCreate,
  createLabel,
  emptyLabel,
  footerExtra,
}: SelectSheetProps<T>) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const folded = foldText(query.trim());
    return folded ? options.filter((o) => foldText(o.label).includes(folded)) : options;
  }, [options, query]);

  const trimmed = query.trim();
  const canCreate =
    !!onCreate &&
    !!trimmed &&
    !options.some((o) => normalizeForCompare(o.label) === normalizeForCompare(trimmed));

  const close = () => {
    setQuery('');
    onClose();
  };

  const toggle = (value: T) => {
    if (!multiple) {
      onChange([value]);
      close();
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const create = () => {
    onCreate?.(trimmed);
    setQuery('');
  };

  const footer =
    multiple || footerExtra ? (
      <View className="gap-2">
        {footerExtra}
        {multiple ? <Button label={t('common.done')} onPress={close} /> : null}
      </View>
    ) : undefined;

  const list = (
    <FlatList
      data={filtered}
      keyExtractor={(item: SelectOption<T>) => String(item.value)}
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      ListHeaderComponent={
        canCreate ? (
          <Pressable
            accessibilityRole="button"
            onPress={create}
            className="min-h-touch flex-row items-center gap-3 px-6 active:bg-surface-variant"
          >
            <Icon name="add" color="primary" />
            <Text className="flex-1 text-primary">
              {createLabel ? createLabel(trimmed) : trimmed}
            </Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={
        canCreate ? null : (
          <Text className="px-6 py-4 text-on-surface-variant">
            {emptyLabel ?? t('common.noResults')}
          </Text>
        )
      }
      renderItem={({ item }: { item: SelectOption<T> }) => (
        <OptionRow
          option={item}
          multiple={multiple}
          selected={selected.includes(item.value)}
          onPress={() => toggle(item.value)}
        />
      )}
    />
  );

  return (
    <Sheet visible={visible} onClose={close} title={title} footer={footer} tall={searchable}>
      {searchable ? (
        <View className="flex-1">
          <View className="mx-6 mb-2 min-h-touch flex-row items-center gap-2 rounded-full bg-surface-variant px-4">
            <Icon name="search" size={20} color="on-surface-variant" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder ?? t('common.search')}
              placeholderTextColor={colors['on-surface-variant']}
              returnKeyType={canCreate ? 'done' : 'search'}
              onSubmitEditing={canCreate ? create : undefined}
              cursorColor={colors.primary}
              autoCorrect={false}
              accessibilityLabel={searchPlaceholder ?? t('common.search')}
              className="flex-1 py-2.5 font-sans text-base text-on-surface"
            />
          </View>
          {list}
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          {options.map((item) => (
            <OptionRow
              key={String(item.value)}
              option={item}
              multiple={multiple}
              selected={selected.includes(item.value)}
              onPress={() => toggle(item.value)}
            />
          ))}
        </ScrollView>
      )}
    </Sheet>
  );
}
