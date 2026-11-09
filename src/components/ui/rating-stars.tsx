import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon } from './icon';

type RatingStarsProps = {
  value: number | null;
  /** Omit for a read-only display. Tapping the current rating clears it. */
  onChange?: (value: number | null) => void;
  size?: number;
};

export function RatingStars({ value, onChange, size = 20 }: RatingStarsProps) {
  const { t } = useTranslation();
  const rating = value ?? 0;

  if (!onChange) {
    return (
      <View
        accessible
        accessibilityLabel={t('book.ratingValue', { n: rating })}
        className="flex-row"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={size}
            color="accent"
          />
        ))}
      </View>
    );
  }

  return (
    <View accessibilityRole="adjustable" className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={t('book.rateStars', { n: star })}
          accessibilityState={{ selected: star <= rating }}
          onPress={() => onChange(star === value ? null : star)}
          className="min-h-touch min-w-touch items-center justify-center"
        >
          <Icon name={star <= rating ? 'star' : 'star-border'} size={size} color="accent" />
        </Pressable>
      ))}
    </View>
  );
}
