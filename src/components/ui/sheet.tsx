import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './text';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned below the content, e.g. a Done button. */
  footer?: ReactNode;
  /** Near-fullscreen sheet for long, searchable lists; otherwise sized to its content. */
  tall?: boolean;
};

/**
 * Bottom sheet on top of React Native's Modal. @gorhom/bottom-sheet 5.2 silently fails to open
 * with Reanimated 4 (required by Expo SDK 57), so this uses the core Animated API instead.
 * Closes with the Android back button or a tap on the backdrop.
 */
export function Sheet({ visible, onClose, title, children, footer, tall = false }: SheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // Stable across renders; created once.
  const [translateY] = useState(() => new Animated.Value(windowHeight));

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(windowHeight);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateY, windowHeight]);

  const maxHeight = windowHeight * 0.92 - insets.top;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* Edge-to-edge Android does not resize for the keyboard, so pad for it here. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          className="absolute inset-0 bg-black/40"
        />
        <Animated.View
          accessibilityViewIsModal
          className="rounded-t-3xl bg-surface"
          style={{
            maxHeight,
            height: tall ? maxHeight : undefined,
            // Let a tall sheet give way to the keyboard padding instead of being pushed off the top.
            flexShrink: 1,
            paddingBottom: insets.bottom + 8,
            transform: [{ translateY }],
          }}
        >
          <View className="items-center pb-1 pt-3">
            <View className="h-1 w-10 rounded-full bg-outline" />
          </View>
          <Text variant="headline" className="px-6 pb-3 pt-1 text-xl">
            {title}
          </Text>
          <View className={tall ? 'flex-1' : 'shrink'}>{children}</View>
          {footer ? <View className="px-6 pt-3">{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
