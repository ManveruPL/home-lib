import { Pressable, View } from 'react-native';

import { Icon, type IconName } from './icon';
import { Text } from './text';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: IconName;
  onPress?: () => void;
  /** Shows a remove (x) affordance and calls this when tapped. */
  onRemove?: () => void;
  removeLabel?: string;
};

export function Chip({ label, selected = false, icon, onPress, onRemove, removeLabel }: ChipProps) {
  const content = (
    <>
      {selected && !onRemove ? (
        <Icon name="check" size={18} color="on-secondary-container" />
      ) : null}
      {icon ? (
        <Icon
          name={icon}
          size={18}
          color={selected ? 'on-secondary-container' : 'on-surface-variant'}
        />
      ) : null}
      <Text
        variant="title"
        numberOfLines={1}
        className={`text-sm ${selected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}
      >
        {label}
      </Text>
    </>
  );

  const container = `min-h-10 max-w-full flex-row items-center gap-1 rounded-lg border px-3 ${
    selected ? 'border-secondary-container bg-secondary-container' : 'border-outline'
  }`;

  if (onRemove) {
    return (
      <View className={container}>
        {content}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? label}
          onPress={onRemove}
          hitSlop={12}
          className="-mr-1 ml-1"
        >
          <Icon name="close" size={18} color="on-surface-variant" />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      // 40px chip + hit slop keeps the 48px touch target.
      hitSlop={4}
      className={`${container} active:opacity-70`}
    >
      {content}
    </Pressable>
  );
}
