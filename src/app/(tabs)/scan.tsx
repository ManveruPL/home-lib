import * as Haptics from 'expo-haptics';
import { router, useIsFocused } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View, type AlertButton } from 'react-native';

import { listAuthors } from '@/features/authors/author-repository';
import { lookupToFormValues } from '@/features/books/apply-lookup';
import { findBookIdByIsbn, saveBook } from '@/features/books/book-repository';
import { LookupUnavailableError, lookupIsbn } from '@/features/lookup/lookup-isbn';
import { BarcodeScanner } from '@/features/scan/barcode-scanner';

const openBook = (id: number) =>
  router.push({ pathname: '/book/[id]', params: { id: String(id) } });

const openForm = (isbn: string, autoLookup = false) =>
  router.push({
    pathname: '/book/new',
    params: { isbn, ...(autoLookup ? { autoLookup: '1' } : {}) },
  });

/** Quick Add: scan → lookup → save → details, skipping the form entirely. */
export default function ScanScreen() {
  const { t } = useTranslation();
  // Release the camera while another tab is shown.
  const isFocused = useIsFocused();
  // Scanning stays paused while a lookup runs or an alert waits for an answer.
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | undefined>();

  const resume = () => {
    setBusy(false);
    setStatus(undefined);
  };

  /** Shows an alert; every button (and dismissing it) resumes scanning first. */
  const ask = (title: string, body: string, buttons: AlertButton[]) => {
    Alert.alert(
      title,
      body,
      buttons.map((button) => ({
        ...button,
        onPress: () => {
          resume();
          button.onPress?.();
        },
      })),
      { cancelable: true, onDismiss: resume },
    );
  };

  const handleScan = async (isbn: string) => {
    setBusy(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const existingId = await findBookIdByIsbn(isbn);
    if (existingId !== null) {
      ask(t('scan.duplicateTitle'), t('scan.duplicateBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('scan.openExisting'), onPress: () => openBook(existingId) },
      ]);
      return;
    }

    setStatus(t('scan.lookingUp', { isbn }));
    try {
      const result = await lookupIsbn(isbn);
      if (!result?.authors.length) {
        // Not found, or found without authors (which the form requires): let the user finish it.
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        ask(t('scan.notFoundTitle'), t(result ? 'scan.incompleteBody' : 'scan.notFoundBody'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('scan.openForm'), onPress: () => openForm(isbn, !!result) },
        ]);
        return;
      }
      const id = await saveBook(lookupToFormValues(result, await listAuthors()));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resume();
      openBook(id);
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const offline = error instanceof LookupUnavailableError;
      ask(
        t(offline ? 'scan.offlineTitle' : 'scan.errorTitle'),
        t(offline ? 'scan.offlineBody' : 'scan.errorBody'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('scan.openForm'), onPress: () => openForm(isbn) },
        ],
      );
    }
  };

  return (
    <View className="flex-1 bg-black">
      {isFocused ? (
        <BarcodeScanner onScan={(isbn) => void handleScan(isbn)} paused={busy} status={status} />
      ) : null}
    </View>
  );
}
