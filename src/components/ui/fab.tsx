import { Pressable } from 'react-native';

import { Icon, type IconName } from './icon';

type FabProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
};

/** Floating action button, bottom right within thumb reach. */
export function Fab({ icon, accessibilityLabel, onPress }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="absolute bottom-5 right-5 h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg active:opacity-80"
    >
      <Icon name={icon} size={28} color="on-primary" />
    </Pressable>
  );
}
