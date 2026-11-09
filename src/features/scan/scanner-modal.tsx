import * as Haptics from 'expo-haptics';
import { Modal } from 'react-native';

import { BarcodeScanner } from './barcode-scanner';

type ScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScan: (isbn: string) => void;
};

/** Fullscreen camera for filling the ISBN field of the book form. */
export function ScannerModal({ visible, onClose, onScan }: ScannerModalProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
    >
      {visible ? (
        <BarcodeScanner
          onClose={onClose}
          onScan={(isbn) => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onScan(isbn);
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}
