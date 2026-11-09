import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FieldLabel, SectionTitle } from '@/components/ui/field-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { useAuthors } from '@/features/authors/use-authors';
import {
  InvalidBackupError,
  pickBackup,
  restoreBackup,
  shareBackup,
} from '@/features/backup/backup';
import type { BackupPayload } from '@/features/backup/types';
import { useBooks } from '@/features/books/use-books';
import { useGenres } from '@/features/genres/use-genres';
import { getLanguagePreference, setLanguagePreference, type LanguagePreference } from '@/i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { data: books = [] } = useBooks();
  const { data: authors = [] } = useAuthors();
  const { data: genres = [] } = useGenres();
  const [language, setLanguage] = useState<LanguagePreference>(getLanguagePreference);
  const [busy, setBusy] = useState<'backup' | 'restore' | null>(null);

  const changeLanguage = (value: LanguagePreference) => {
    setLanguage(value);
    void setLanguagePreference(value);
  };

  const backup = async () => {
    setBusy('backup');
    try {
      await shareBackup(t('settings.backupDialogTitle'));
    } catch (error) {
      console.error('Backup failed', error);
      Alert.alert(t('settings.backupFailedTitle'), t('settings.backupFailedBody'));
    } finally {
      setBusy(null);
    }
  };

  const runRestore = (payload: BackupPayload) => {
    setBusy('restore');
    try {
      const summary = restoreBackup(payload);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('settings.restoreDoneTitle'), t('settings.restoreDoneBody', summary));
    } catch (error) {
      console.error('Restore failed', error);
      Alert.alert(t('settings.restoreFailedTitle'), t('settings.restoreFailedBody'));
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    let payload: BackupPayload | null;
    try {
      payload = await pickBackup();
    } catch (error) {
      const invalid = error instanceof InvalidBackupError;
      if (!invalid) console.error('Reading backup failed', error);
      Alert.alert(
        t('settings.restoreFailedTitle'),
        t(invalid ? 'settings.invalidBackup' : 'settings.restoreFailedBody'),
      );
      return;
    }
    if (!payload) return;
    const backupPayload = payload;

    Alert.alert(
      t('settings.restoreTitle'),
      `${t('settings.restoreConfirm')}\n\n${t('settings.backupContents', {
        books: backupPayload.books.length,
        date: new Date(backupPayload.exportedAt).toLocaleDateString(),
      })}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.restoreProceed'), onPress: () => runRestore(backupPayload) },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <SectionTitle>{t('settings.library')}</SectionTitle>
      <View className="flex-row gap-3">
        {[
          { label: t('settings.stats.books'), value: books.length },
          { label: t('settings.stats.authors'), value: authors.length },
          { label: t('settings.stats.genres'), value: genres.length },
        ].map((stat) => (
          <View
            key={stat.label}
            className="flex-1 items-center rounded-2xl bg-primary-container p-4"
          >
            <Text variant="display" className="text-on-primary-container">
              {stat.value}
            </Text>
            <Text variant="label" className="uppercase text-on-primary-container">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <SectionTitle>{t('settings.data')}</SectionTitle>
      <Text className="text-on-surface-variant">{t('settings.dataInfo')}</Text>
      <Button
        label={t('settings.backup')}
        icon="ios-share"
        loading={busy === 'backup'}
        disabled={busy !== null}
        onPress={() => void backup()}
      />
      <Button
        label={t('settings.restore')}
        icon="restore"
        variant="outlined"
        loading={busy === 'restore'}
        disabled={busy !== null}
        onPress={() => void restore()}
      />

      <SectionTitle>{t('settings.appearance')}</SectionTitle>
      <View className="gap-1">
        <FieldLabel>{t('settings.language')}</FieldLabel>
        <SegmentedControl
          accessibilityLabel={t('settings.language')}
          options={[
            { value: 'system', label: t('settings.languageSystem') },
            { value: 'pl', label: 'Polski' },
            { value: 'en', label: 'English' },
          ]}
          value={language}
          onChange={changeLanguage}
        />
      </View>

      <SectionTitle>{t('settings.about')}</SectionTitle>
      <Text className="text-on-surface-variant">
        {t('settings.version', { version: Constants.expoConfig?.version ?? '—' })}
      </Text>
      <Text className="text-on-surface-variant">{t('settings.sources')}</Text>
    </ScrollView>
  );
}
