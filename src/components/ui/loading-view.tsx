import { ActivityIndicator, View } from 'react-native';

import { useThemeColors } from '@/theme/use-theme-colors';

export function LoadingView() {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
