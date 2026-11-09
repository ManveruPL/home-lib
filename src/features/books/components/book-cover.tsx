import { Image } from 'expo-image';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';

type BookCoverProps = {
  uri: string | null | undefined;
  width: number;
  accessibilityLabel?: string;
};

/** Book cover at a 2:3 ratio, with a placeholder when there is no image. */
export function BookCover({ uri, width, accessibilityLabel }: BookCoverProps) {
  const height = Math.round(width * 1.5);

  if (!uri) {
    return (
      <View
        style={{ width, height }}
        className="items-center justify-center rounded-md bg-primary-container"
      >
        <Icon name="menu-book" size={Math.round(width * 0.45)} color="on-primary-container" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius: 6 }}
      contentFit="cover"
      transition={150}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
