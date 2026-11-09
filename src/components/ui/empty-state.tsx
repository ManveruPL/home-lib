import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from './icon';
import { Text } from './text';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  body?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, body, children }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-12">
      <Icon name={icon} size={56} color="outline" />
      <Text variant="headline" className="text-center">
        {title}
      </Text>
      {body ? <Text className="text-center text-on-surface-variant">{body}</Text> : null}
      {children ? <View className="mt-2 w-full gap-3">{children}</View> : null}
    </View>
  );
}
