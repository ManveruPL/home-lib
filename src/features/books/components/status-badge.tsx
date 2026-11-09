import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { OwnershipStatus, ReadingStatus } from '@/constants/enums';

const readingClasses: Record<ReadingStatus, string> = {
  TO_READ: 'bg-surface-variant',
  READING: 'bg-secondary-container',
  COMPLETED: 'bg-primary-container',
  PAUSED: 'bg-surface-variant',
};

export function ReadingStatusBadge({ status }: { status: ReadingStatus }) {
  const { t } = useTranslation();
  return (
    <View className={`self-start rounded-md px-2 py-0.5 ${readingClasses[status]}`}>
      <Text variant="label" className="text-on-surface">
        {t(`book.reading.${status}`)}
      </Text>
    </View>
  );
}

export function OwnershipBadge({ status }: { status: OwnershipStatus }) {
  const { t } = useTranslation();
  return (
    <View
      className={`self-start rounded-md border px-2 py-0.5 ${
        status === 'WISHLIST' ? 'border-secondary' : 'border-outline'
      }`}
    >
      <Text
        variant="label"
        className={status === 'WISHLIST' ? 'text-secondary' : 'text-on-surface-variant'}
      >
        {t(`book.ownership.${status}`)}
      </Text>
    </View>
  );
}
