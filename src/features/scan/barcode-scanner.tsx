import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingView } from '@/components/ui/loading-view';
import { Text } from '@/components/ui/text';
import { isBooklandEan } from '@/lib/isbn';

const WINDOW_WIDTH = 300;
const WINDOW_HEIGHT = 170;
// Book barcodes are EAN-13 (Bookland); UPC-A covers some imported paperbacks.
const BARCODE_TYPES = ['ean13', 'upc_a'] as const;

type BarcodeScannerProps = {
  /** Called once per detected ISBN; scanning pauses until `paused` goes false again. */
  onScan: (isbn: string) => void;
  paused?: boolean;
  onClose?: () => void;
  /** Overlay content such as a "Looking up…" indicator. */
  status?: string;
};

export function BarcodeScanner({ onScan, paused = false, onClose, status }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  // The camera reports the same code many times per second.
  const lastCode = useRef<string | null>(null);

  if (!permission) return <LoadingView />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          icon="photo-camera"
          title={t('scan.permissionTitle')}
          body={t('scan.permissionBody')}
        >
          {permission.canAskAgain ? (
            <Button label={t('scan.grantPermission')} onPress={requestPermission} />
          ) : (
            <Button label={t('scan.openSettings')} onPress={() => Linking.openSettings()} />
          )}
          {onClose ? <Button label={t('common.cancel')} variant="text" onPress={onClose} /> : null}
        </EmptyState>
      </View>
    );
  }

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (paused || !isBooklandEan(data) || lastCode.current === data) return;
    lastCode.current = data;
    onScan(data);
    // Allow the same book to be scanned again after a short pause.
    setTimeout(() => {
      lastCode.current = null;
    }, 3000);
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={paused ? undefined : handleScan}
      />

      {/* Dimmed frame around the alignment window. */}
      <View pointerEvents="none" className="absolute inset-0">
        <View className="flex-1 bg-black/55" />
        <View className="flex-row" style={{ height: WINDOW_HEIGHT }}>
          <View className="flex-1 bg-black/55" />
          <View style={{ width: WINDOW_WIDTH }} className="rounded-xl border-2 border-accent" />
          <View className="flex-1 bg-black/55" />
        </View>
        <View className="flex-1 items-center bg-black/55 px-8 pt-6">
          <Text className="text-center text-white">{status ?? t('scan.hint')}</Text>
        </View>
      </View>

      <View
        className="absolute left-0 right-0 flex-row justify-between px-2"
        style={{ top: insets.top + 8 }}
      >
        {onClose ? (
          <IconButton
            icon="close"
            color="on-primary"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            className="bg-black/40"
          />
        ) : (
          <View />
        )}
        <IconButton
          icon={torch ? 'flash-on' : 'flash-off'}
          color="on-primary"
          accessibilityLabel={t(torch ? 'scan.torchOff' : 'scan.torchOn')}
          onPress={() => setTorch((on) => !on)}
          className="bg-black/40"
        />
      </View>
    </View>
  );
}
