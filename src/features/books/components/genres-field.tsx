import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { FieldLabel } from '@/components/ui/field-label';
import { SelectSheet } from '@/components/ui/select-sheet';
import { Text } from '@/components/ui/text';
import { normalizeForCompare } from '@/lib/text';

import { createGenre } from '../../genres/genre-repository';
import { useGenres } from '../../genres/use-genres';
import type { GenreRef } from '../book-form-schema';

type GenresFieldProps = {
  value: GenreRef[];
  onChange: (value: GenreRef[]) => void;
  /** Subject keywords from the ISBN lookup, offered as one-tap genres. */
  suggestions?: string[];
};

export function GenresField({ value, onChange, suggestions = [] }: GenresFieldProps) {
  const { t } = useTranslation();
  const { data: genres = [] } = useGenres();
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedKeys = new Set(value.map((g) => normalizeForCompare(g.name)));
  const openSuggestions = suggestions.filter((s) => !selectedKeys.has(normalizeForCompare(s)));

  const add = (name: string) => {
    // Creates the tag right away, as the spec asks, and selects it.
    const genre = createGenre(name);
    if (!value.some((g) => g.id === genre.id))
      onChange([...value, { id: genre.id, name: genre.name }]);
  };

  const handlePick = (ids: number[]) => {
    const byId = new Map(genres.map((g) => [g.id, g]));
    onChange(
      ids.flatMap((id) => {
        const genre = byId.get(id);
        return genre ? [{ id: genre.id, name: genre.name }] : [];
      }),
    );
  };

  return (
    <View className="gap-2">
      <FieldLabel>{t('book.fields.genres')}</FieldLabel>
      <View className="flex-row flex-wrap gap-2">
        {value.map((genre, index) => (
          <Chip
            key={genre.id ?? `new-${index}`}
            label={genre.name}
            selected
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
            removeLabel={t('common.removeItem', { name: genre.name })}
          />
        ))}
        <Chip
          label={value.length ? t('common.edit') : t('book.selectGenres')}
          icon={value.length ? 'edit' : 'sell'}
          onPress={() => setPickerOpen(true)}
        />
      </View>

      {openSuggestions.length ? (
        <View className="gap-2">
          <Text variant="bodySmall" className="text-on-surface-variant">
            {t('book.suggestedGenres')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {openSuggestions.map((name) => (
              <Chip key={name} label={name} icon="add" onPress={() => add(name)} />
            ))}
          </View>
        </View>
      ) : null}

      <SelectSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('book.fields.genres')}
        multiple
        searchable
        searchPlaceholder={t('genre.searchPlaceholder')}
        options={genres.map((g) => ({ value: g.id, label: g.name }))}
        selected={value.flatMap((g) => (g.id !== undefined ? [g.id] : []))}
        onChange={handlePick}
        onCreate={add}
        createLabel={(name) => t('genre.addNamed', { name })}
        emptyLabel={t('genre.empty')}
      />
    </View>
  );
}
