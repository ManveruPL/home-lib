import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingView } from '@/components/ui/loading-view';
import { Text } from '@/components/ui/text';
import { authorToFormValues, updateAuthor } from '@/features/authors/author-repository';
import { AuthorFormModal } from '@/features/authors/components/author-form-modal';
import { useAuthor } from '@/features/authors/use-authors';
import { sortBooks } from '@/features/books/book-filters';
import { BookList } from '@/features/books/components/book-list';
import { useBooks } from '@/features/books/use-books';

export default function AuthorScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authorId = Number(id);
  const { data: author, isLoading } = useAuthor(authorId);
  const { data: books = [] } = useBooks();
  const [editing, setEditing] = useState(false);

  const authorBooks = useMemo(
    () =>
      sortBooks(
        books.filter((b) => b.authors.some((a) => a.id === authorId)),
        'title_asc',
      ),
    [books, authorId],
  );

  if (isLoading) return <LoadingView />;
  if (!author) return <EmptyState icon="error-outline" title={t('author.notFound')} />;

  const lifeDates = [author.birthDate, author.deathDate].filter(Boolean).join(' – ');

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: author.name,
          headerRight: () => (
            <IconButton
              icon="edit"
              color="primary"
              accessibilityLabel={t('author.edit')}
              onPress={() => setEditing(true)}
            />
          ),
        }}
      />
      <BookList
        books={authorBooks}
        header={
          <View className="gap-2 p-4">
            <Text variant="display" selectable>
              {author.name}
            </Text>
            {lifeDates ? <Text className="text-on-surface-variant">{lifeDates}</Text> : null}
            {author.biography ? (
              <Text selectable className="mt-2">
                {author.biography}
              </Text>
            ) : null}
            <Text variant="headline" className="mt-4 text-xl text-primary">
              {t('author.booksInLibrary', { n: authorBooks.length })}
            </Text>
          </View>
        }
      />
      <AuthorFormModal
        visible={editing}
        title={t('author.edit')}
        initialValues={authorToFormValues(author)}
        onClose={() => setEditing(false)}
        onSubmit={(values) => {
          updateAuthor(author.id, values);
          setEditing(false);
        }}
      />
    </View>
  );
}
