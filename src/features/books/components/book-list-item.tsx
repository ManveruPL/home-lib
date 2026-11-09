import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { RatingStars } from '@/components/ui/rating-stars';
import { Text } from '@/components/ui/text';

import type { BookWithRelations } from '../book-repository';

import { BookCover } from './book-cover';
import { OwnershipBadge, ReadingStatusBadge } from './status-badge';

export function BookListItem({ book }: { book: BookWithRelations }) {
  const authorNames = book.authors.map((a) => a.name).join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[book.title, authorNames].filter(Boolean).join(', ')}
      onPress={() => router.push({ pathname: '/book/[id]', params: { id: String(book.id) } })}
      className="flex-row gap-4 px-4 py-3 active:bg-surface-variant"
    >
      <BookCover uri={book.coverImage} width={56} />
      <View className="flex-1 gap-1">
        <Text variant="title" numberOfLines={2} className="font-serif font-semibold">
          {book.title}
        </Text>
        {authorNames ? (
          <Text variant="bodySmall" numberOfLines={1} className="text-sm text-on-surface-variant">
            {authorNames}
          </Text>
        ) : null}
        <View className="mt-1 flex-row flex-wrap items-center gap-2">
          <ReadingStatusBadge status={book.readingStatus} />
          {book.ownershipStatus === 'WISHLIST' ? <OwnershipBadge status="WISHLIST" /> : null}
          {book.personalRating ? <RatingStars value={book.personalRating} size={14} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
