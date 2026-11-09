import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Fab } from '@/components/ui/fab';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingView } from '@/components/ui/loading-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SelectSheet } from '@/components/ui/select-sheet';
import { Text } from '@/components/ui/text';
import { SORT_KEYS, searchBooks, sortBooks, type SortKey } from '@/features/books/book-filters';
import { BookList } from '@/features/books/components/book-list';
import { useBooks } from '@/features/books/use-books';

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { data: books, isLoading } = useBooks();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('dateAdded_desc');
  const [sortOpen, setSortOpen] = useState(false);

  const visible = useMemo(
    () => sortBooks(searchBooks(books ?? [], query), sort),
    [books, query, sort],
  );

  if (isLoading) return <LoadingView />;

  const hasBooks = !!books?.length;

  return (
    <View className="flex-1 bg-background">
      {hasBooks ? (
        <BookList
          books={visible}
          header={
            <View className="gap-2 px-4 pb-2 pt-3">
              <View className="flex-row items-center gap-1">
                <SearchBar
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('library.searchPlaceholder')}
                  clearLabel={t('common.clear')}
                />
                <IconButton
                  icon="sort"
                  accessibilityLabel={t('library.sort')}
                  onPress={() => setSortOpen(true)}
                />
              </View>
              <Text variant="bodySmall" className="text-on-surface-variant">
                {t('library.count', { n: visible.length })} · {t(`sort.${sort}`)}
              </Text>
            </View>
          }
          empty={
            <EmptyState
              icon="search-off"
              title={t('library.noMatches')}
              body={t('library.noMatchesBody')}
            />
          }
        />
      ) : (
        <EmptyState
          icon="auto-stories"
          title={t('library.emptyTitle')}
          body={t('library.emptyBody')}
        >
          <Button
            label={t('library.addBook')}
            icon="add"
            onPress={() => router.push('/book/new')}
          />
          <Button
            label={t('library.scanBook')}
            icon="qr-code-scanner"
            variant="outlined"
            onPress={() => router.push('/scan')}
          />
        </EmptyState>
      )}

      {hasBooks ? (
        <Fab
          icon="add"
          accessibilityLabel={t('library.addBook')}
          onPress={() => router.push('/book/new')}
        />
      ) : null}

      <SelectSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title={t('library.sort')}
        options={SORT_KEYS.map((key) => ({ value: key, label: t(`sort.${key}`) }))}
        selected={[sort]}
        onChange={([key]) => key && setSort(key)}
      />
    </View>
  );
}
