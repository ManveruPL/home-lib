import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { bookToFormValues, saveBook } from '@/features/books/book-repository';
import { BookForm } from '@/features/books/components/book-form';
import { useBook } from '@/features/books/use-books';

export default function EditBookScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { data: book, isLoading } = useBook(bookId);

  if (isLoading) return <LoadingView />;
  if (!book) return <EmptyState icon="error-outline" title={t('book.notFound')} />;

  return (
    <BookForm
      // Load the form once; later live-query updates must not wipe the user's edits.
      key={book.id}
      initialValues={bookToFormValues(book)}
      submitLabel={t('common.saveChanges')}
      onSubmit={(values) => saveBook(values, bookId)}
      onSaved={() => router.back()}
    />
  );
}
