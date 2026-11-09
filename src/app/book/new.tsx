import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { bookFormDefaults } from '@/features/books/book-form-schema';
import { saveBook } from '@/features/books/book-repository';
import { BookForm } from '@/features/books/components/book-form';

export default function NewBookScreen() {
  const { t } = useTranslation();
  // Set when coming from Quick Scan, so the form opens with the scanned ISBN.
  const { isbn, autoLookup } = useLocalSearchParams<{ isbn?: string; autoLookup?: string }>();

  return (
    <BookForm
      initialValues={{ ...bookFormDefaults, isbn: isbn ?? '' }}
      autoLookup={autoLookup === '1'}
      submitLabel={t('common.save')}
      onSubmit={(values) => saveBook(values)}
      onSaved={(id) => router.replace({ pathname: '/book/[id]', params: { id: String(id) } })}
    />
  );
}
