import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { FieldLabel } from '@/components/ui/field-label';
import { Icon } from '@/components/ui/icon';
import { SelectSheet } from '@/components/ui/select-sheet';
import { Text } from '@/components/ui/text';
import { BOOK_LANGUAGES, isKnownLanguage } from '@/constants/languages';

type LanguageFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const NONE = '';

export function useLanguageLabel() {
  const { t } = useTranslation();
  return (code: string) => (isKnownLanguage(code) ? t(`languages.${code}`) : code.toUpperCase());
}

export function LanguageField({ value, onChange }: LanguageFieldProps) {
  const { t } = useTranslation();
  const languageLabel = useLanguageLabel();
  const [open, setOpen] = useState(false);

  const options = [
    { value: NONE, label: t('languages.none') },
    ...BOOK_LANGUAGES.map((code) => ({ value: code as string, label: languageLabel(code) })),
    // Keeps an unusual code from a lookup (e.g. "bat") selectable.
    ...(value && !isKnownLanguage(value) ? [{ value, label: languageLabel(value) }] : []),
  ];

  return (
    <View className="gap-1">
      <FieldLabel>{t('book.fields.language')}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('book.fields.language')}
        onPress={() => setOpen(true)}
        className="min-h-touch flex-row items-center rounded-xl border border-outline bg-surface px-4 active:bg-surface-variant"
      >
        <Text className={`flex-1 ${value ? '' : 'text-outline'}`}>
          {value ? languageLabel(value) : t('languages.none')}
        </Text>
        <Icon name="expand-more" color="on-surface-variant" />
      </Pressable>
      <SelectSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('book.fields.language')}
        options={options}
        selected={[value]}
        onChange={([code]) => onChange(code ?? NONE)}
        searchable
      />
    </View>
  );
}
