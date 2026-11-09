import type { ReactElement } from 'react';
import { FlatList, View } from 'react-native';

import type { BookWithRelations } from '../book-repository';

import { BookListItem } from './book-list-item';

type BookListProps = {
  books: BookWithRelations[];
  header?: ReactElement;
  empty?: ReactElement;
};

export function BookList({ books, header, empty }: BookListProps) {
  return (
    <FlatList
      data={books}
      keyExtractor={(book) => String(book.id)}
      renderItem={({ item }) => <BookListItem book={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View className="ml-[88px] h-px bg-surface-variant" />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      // Leaves room for the floating action button.
      contentContainerClassName="grow pb-24"
    />
  );
}
