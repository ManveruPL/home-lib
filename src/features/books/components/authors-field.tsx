import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FieldError, FieldLabel } from '@/components/ui/field-label';
import { SelectSheet } from '@/components/ui/select-sheet';
import type { Author } from '@/db/schema';

import { createAuthor } from '../../authors/author-repository';
import { AuthorFormModal } from '../../authors/components/author-form-modal';
import { useAuthors } from '../../authors/use-authors';
import type { AuthorRef } from '../book-form-schema';

type AuthorsFieldProps = {
  value: AuthorRef[];
  onChange: (value: AuthorRef[]) => void;
  error?: string;
};

export function AuthorsField({ value, onChange, error }: AuthorsFieldProps) {
  const { t } = useTranslation();
  const { data: authors = [] } = useAuthors();
  const [pickerOpen, setPickerOpen] = useState(false);
  // null = closed; otherwise the name to prefill.
  const [newAuthorName, setNewAuthorName] = useState<string | null>(null);

  const selectedIds = value.flatMap((a) => (a.id !== undefined ? [a.id] : []));

  const handlePick = (ids: number[]) => {
    const byId = new Map(authors.map((a) => [a.id, a]));
    // Authors from a lookup that are not cataloged yet stay selected.
    const unsaved = value.filter((a) => a.id === undefined);
    const picked = ids.flatMap((id) => {
      const author = byId.get(id);
      return author ? [{ id: author.id, name: author.name }] : [];
    });
    onChange([...picked, ...unsaved]);
  };

  const handleCreated = (author: Author) => {
    if (!value.some((a) => a.id === author.id)) {
      onChange([...value, { id: author.id, name: author.name }]);
    }
    setNewAuthorName(null);
  };

  return (
    <View className="gap-2">
      <FieldLabel>{t('book.fields.authors')}</FieldLabel>
      <View className="flex-row flex-wrap gap-2">
        {value.map((author, index) => (
          <Chip
            key={author.id ?? `new-${index}`}
            label={author.id === undefined ? `${author.name} (${t('common.new')})` : author.name}
            selected
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
            removeLabel={t('common.removeItem', { name: author.name })}
          />
        ))}
        <Chip
          label={value.length ? t('common.edit') : t('book.selectAuthors')}
          icon={value.length ? 'edit' : 'person-add'}
          onPress={() => setPickerOpen(true)}
        />
      </View>
      <FieldError>{error}</FieldError>

      <SelectSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('book.fields.authors')}
        multiple
        searchable
        searchPlaceholder={t('author.searchPlaceholder')}
        options={authors.map((a) => ({ value: a.id, label: a.name }))}
        selected={selectedIds}
        onChange={handlePick}
        onCreate={(name) => setNewAuthorName(name)}
        createLabel={(name) => t('author.addNamed', { name })}
        emptyLabel={t('author.empty')}
        footerExtra={
          <Button
            label={t('author.addNew')}
            icon="person-add"
            variant="outlined"
            onPress={() => setNewAuthorName('')}
          />
        }
      />

      <AuthorFormModal
        visible={newAuthorName !== null}
        title={t('author.addNew')}
        initialValues={{ name: newAuthorName ?? '' }}
        onClose={() => setNewAuthorName(null)}
        onSubmit={(values) => handleCreated(createAuthor(values))}
      />
    </View>
  );
}
