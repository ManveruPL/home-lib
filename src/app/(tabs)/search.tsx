import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { SearchBar } from '@/components/ui/search-bar';
import { SelectSheet } from '@/components/ui/select-sheet';
import { Text } from '@/components/ui/text';
import { OWNERSHIP_STATUSES, READING_STATUSES, type OwnershipStatus } from '@/constants/enums';
import { useAuthors } from '@/features/authors/use-authors';
import {
  countActiveFilters,
  emptyFilters,
  filterBooks,
  searchBooks,
  sortBooks,
  type BookFilters,
} from '@/features/books/book-filters';
import { BookList } from '@/features/books/components/book-list';
import { useBooks } from '@/features/books/use-books';
import { useGenres } from '@/features/genres/use-genres';

type OpenSheet = 'author' | 'genre' | 'status' | 'ownership' | null;

export default function SearchScreen() {
  const { t } = useTranslation();
  const { data: books, isLoading } = useBooks();
  const { data: authors = [] } = useAuthors();
  const { data: genres = [] } = useGenres();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<BookFilters>(emptyFilters);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);

  const results = useMemo(
    () => sortBooks(filterBooks(searchBooks(books ?? [], query), filters), 'title_asc'),
    [books, query, filters],
  );

  if (isLoading) return <LoadingView />;

  const update = (patch: Partial<BookFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const activeCount = countActiveFilters(filters);
  const authorName = authors.find((a) => a.id === filters.authorId)?.name;
  const isFiltering = activeCount > 0 || query.trim().length > 0;

  return (
    <View className="flex-1 bg-background">
      <View className="gap-3 pb-2 pt-3">
        <View className="px-4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('library.searchPlaceholder')}
            clearLabel={t('common.clear')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 py-1"
          keyboardShouldPersistTaps="handled"
        >
          <Chip
            label={authorName ?? t('filters.author')}
            icon="person"
            selected={filters.authorId !== null}
            onPress={() => setOpenSheet('author')}
          />
          <Chip
            label={
              filters.genreIds.length
                ? t('filters.genreCount', { n: filters.genreIds.length })
                : t('filters.genre')
            }
            icon="sell"
            selected={filters.genreIds.length > 0}
            onPress={() => setOpenSheet('genre')}
          />
          <Chip
            label={
              filters.readingStatuses.length === 1
                ? t(`book.reading.${filters.readingStatuses[0]!}`)
                : filters.readingStatuses.length
                  ? t('filters.statusCount', { n: filters.readingStatuses.length })
                  : t('filters.status')
            }
            icon="bookmark"
            selected={filters.readingStatuses.length > 0}
            onPress={() => setOpenSheet('status')}
          />
          <Chip
            label={
              filters.ownership === 'ALL'
                ? t('filters.ownership')
                : t(`book.ownership.${filters.ownership}`)
            }
            icon="inventory-2"
            selected={filters.ownership !== 'ALL'}
            onPress={() => setOpenSheet('ownership')}
          />
          {activeCount ? (
            <Chip
              label={t('filters.clear')}
              icon="filter-alt-off"
              onPress={() => setFilters(emptyFilters)}
            />
          ) : null}
        </ScrollView>
        {isFiltering ? (
          <Text variant="bodySmall" className="px-4 text-on-surface-variant">
            {t('library.count', { n: results.length })}
          </Text>
        ) : null}
      </View>

      {isFiltering ? (
        <BookList
          books={results}
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
          icon="manage-search"
          title={t('search.promptTitle')}
          body={t('search.promptBody')}
        />
      )}

      <SelectSheet
        visible={openSheet === 'author'}
        onClose={() => setOpenSheet(null)}
        title={t('filters.author')}
        searchable
        searchPlaceholder={t('author.searchPlaceholder')}
        options={[
          { value: -1, label: t('filters.anyAuthor') },
          ...authors.map((a) => ({ value: a.id, label: a.name })),
        ]}
        selected={[filters.authorId ?? -1]}
        onChange={([id]) => update({ authorId: id === undefined || id === -1 ? null : id })}
      />
      <SelectSheet
        visible={openSheet === 'genre'}
        onClose={() => setOpenSheet(null)}
        title={t('filters.genre')}
        multiple
        searchable
        searchPlaceholder={t('genre.searchPlaceholder')}
        emptyLabel={t('genre.empty')}
        options={genres.map((g) => ({ value: g.id, label: g.name }))}
        selected={filters.genreIds}
        onChange={(genreIds) => update({ genreIds })}
      />
      <SelectSheet
        visible={openSheet === 'status'}
        onClose={() => setOpenSheet(null)}
        title={t('filters.status')}
        multiple
        options={READING_STATUSES.map((s) => ({ value: s, label: t(`book.reading.${s}`) }))}
        selected={filters.readingStatuses}
        onChange={(readingStatuses) => update({ readingStatuses })}
      />
      <SelectSheet
        visible={openSheet === 'ownership'}
        onClose={() => setOpenSheet(null)}
        title={t('filters.ownership')}
        options={[
          { value: 'ALL', label: t('filters.allBooks') },
          ...OWNERSHIP_STATUSES.map((s) => ({ value: s, label: t(`book.ownership.${s}`) })),
        ]}
        selected={[filters.ownership]}
        onChange={([ownership]) =>
          ownership && update({ ownership: ownership as OwnershipStatus | 'ALL' })
        }
      />
    </View>
  );
}
