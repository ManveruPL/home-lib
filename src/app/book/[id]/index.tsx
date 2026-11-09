import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionTitle } from '@/components/ui/field-label';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingView } from '@/components/ui/loading-view';
import { RatingStars } from '@/components/ui/rating-stars';
import { Text } from '@/components/ui/text';
import { deleteBook } from '@/features/books/book-repository';
import { BookCover } from '@/features/books/components/book-cover';
import { useLanguageLabel } from '@/features/books/components/language-field';
import { OwnershipBadge, ReadingStatusBadge } from '@/features/books/components/status-badge';
import { useBook } from '@/features/books/use-books';

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-row gap-4 py-2">
      <Text variant="bodySmall" className="w-32 text-sm text-on-surface-variant">
        {label}
      </Text>
      <Text className="flex-1">{children}</Text>
    </View>
  );
}

export default function BookDetailsScreen() {
  const { t, i18n } = useTranslation();
  const languageLabel = useLanguageLabel();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { data: book, isLoading } = useBook(bookId);

  if (isLoading) return <LoadingView />;
  if (!book) return <EmptyState icon="error-outline" title={t('book.notFound')} />;

  const edit = () => router.push({ pathname: '/book/[id]/edit', params: { id: String(book.id) } });

  const confirmDelete = () =>
    Alert.alert(t('book.deleteTitle'), t('book.deleteBody', { title: book.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteBook(book.id);
          router.back();
        },
      },
    ]);

  const meta: [string, string | number | null][] = [
    [t('book.fields.isbn'), book.isbn],
    [t('book.fields.publisher'), book.publisher],
    [t('book.fields.publicationDate'), book.publicationDate],
    [t('book.fields.pageCount'), book.pageCount],
    [t('book.fields.language'), book.language ? languageLabel(book.language) : null],
    [t('book.fields.physicalLocation'), book.physicalLocation],
    [
      t('book.fields.dateCataloged'),
      new Date(book.dateCataloged).toLocaleDateString(i18n.language),
    ],
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="edit"
              color="primary"
              accessibilityLabel={t('common.edit')}
              onPress={edit}
            />
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
        <View className="items-center gap-3">
          <BookCover
            uri={book.coverImage}
            width={160}
            accessibilityLabel={t('book.fields.coverImage')}
          />
          <Text variant="headline" className="text-center" selectable>
            {book.title}
          </Text>
          {book.subtitle ? (
            <Text className="-mt-2 text-center text-on-surface-variant">{book.subtitle}</Text>
          ) : null}
          {book.authors.length ? (
            <View className="flex-row flex-wrap justify-center gap-x-2">
              {book.authors.map((author) => (
                <Link
                  key={author.id}
                  href={{ pathname: '/author/[id]', params: { id: String(author.id) } }}
                  asChild
                >
                  <Pressable accessibilityRole="link" className="min-h-touch justify-center px-1">
                    <Text variant="title" className="text-primary underline">
                      {author.name}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : null}
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <ReadingStatusBadge status={book.readingStatus} />
            <OwnershipBadge status={book.ownershipStatus} />
          </View>
          {book.personalRating ? <RatingStars value={book.personalRating} size={24} /> : null}
        </View>

        {book.genres.length ? (
          <View className="flex-row flex-wrap gap-2">
            {book.genres.map((genre) => (
              <Chip key={genre.id} label={genre.name} icon="sell" />
            ))}
          </View>
        ) : null}

        <View className="rounded-2xl bg-surface-variant/50 px-4 py-2">
          {meta
            .filter(([, value]) => value !== null && value !== '')
            .map(([label, value]) => (
              <MetaRow key={label} label={label}>
                {value}
              </MetaRow>
            ))}
        </View>

        {book.description ? (
          <View className="gap-2">
            <SectionTitle>{t('book.fields.description')}</SectionTitle>
            <Text selectable>{book.description}</Text>
          </View>
        ) : null}

        {book.personalNotes ? (
          <View className="gap-2">
            <SectionTitle>{t('book.fields.personalNotes')}</SectionTitle>
            <Text selectable>{book.personalNotes}</Text>
          </View>
        ) : null}

        <View className="mt-4 gap-3">
          <Button label={t('book.edit')} icon="edit" onPress={edit} />
          <Button
            label={t('book.delete')}
            icon="delete-outline"
            variant="danger"
            onPress={confirmDelete}
          />
        </View>
      </ScrollView>
    </>
  );
}
