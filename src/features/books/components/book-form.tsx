import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FieldLabel, SectionTitle } from '@/components/ui/field-label';
import { IconButton } from '@/components/ui/icon-button';
import { RatingStars } from '@/components/ui/rating-stars';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { OWNERSHIP_STATUSES, READING_STATUSES } from '@/constants/enums';
import { isValidIsbn } from '@/lib/isbn';

import { useAuthors } from '../../authors/use-authors';
import { LookupUnavailableError } from '../../lookup/lookup-isbn';
import { useIsbnLookup } from '../../lookup/use-isbn-lookup';
import { ScannerModal } from '../../scan/scanner-modal';
import { applyLookup } from '../apply-lookup';
import { bookFormSchema, type BookFormValues } from '../book-form-schema';

import { AuthorsField } from './authors-field';
import { CoverField } from './cover-field';
import { FormTextField } from './form-text-field';
import { GenresField } from './genres-field';
import { LanguageField } from './language-field';

type BookFormProps = {
  initialValues: BookFormValues;
  submitLabel: string;
  /** Saves the book and returns its id. */
  onSubmit: (values: BookFormValues) => Promise<number>;
  /** Called after the save, once leaving the screen is no longer guarded. */
  onSaved: (bookId: number) => void;
  /** Runs the ISBN lookup on mount, e.g. after a failed Quick Scan. */
  autoLookup?: boolean;
};

type LookupMessage = { tone: 'success' | 'error'; text: string };

export function BookForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSaved,
  autoLookup,
}: BookFormProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: knownAuthors = [] } = useAuthors();
  const lookup = useIsbnLookup();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<LookupMessage | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { isDirty },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: initialValues,
  });

  // Ask before throwing away unsaved edits with the back button or gesture.
  usePreventRemove(isDirty && !saving && savedId === null, ({ data }) => {
    Alert.alert(t('form.discardTitle'), t('form.discardBody'), [
      { text: t('form.keepEditing'), style: 'cancel' },
      {
        text: t('form.discard'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const downloadInfo = async (isbnOverride?: string) => {
    const isbn = (isbnOverride ?? getValues('isbn')).trim();
    if (!isValidIsbn(isbn)) {
      setError('isbn', { message: 'validation.isbnChecksum' });
      return;
    }
    clearErrors('isbn');
    setLookupMessage(null);
    try {
      const result = await lookup.mutateAsync(isbn);
      if (!result) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setLookupMessage({ tone: 'error', text: t('lookup.notFound') });
        return;
      }
      reset(applyLookup(getValues(), result, knownAuthors), { keepDefaultValues: true });
      setSubjects(result.subjects ?? []);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLookupMessage({
        tone: 'success',
        text: t('lookup.found', { source: t(`lookup.sources.${result.source}`) }),
      });
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLookupMessage({
        tone: 'error',
        text: t(error instanceof LookupUnavailableError ? 'lookup.offline' : 'lookup.failed'),
      });
    }
  };

  // Navigate only after the re-render that lifted the unsaved-changes guard.
  useEffect(() => {
    if (savedId !== null) onSaved(savedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedId]);

  useEffect(() => {
    if (!autoLookup || !initialValues.isbn) return;
    const timer = setTimeout(() => void downloadInfo(initialValues.isbn));
    return () => clearTimeout(timer);
    // Runs once for the initial ISBN.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      setSavedId(await onSubmit(values));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Saving book failed', error);
      Alert.alert(t('form.saveFailedTitle'), t('form.saveFailedBody'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-4 p-4 pb-8"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ISBN assistant: first on the form, per the spec. */}
        <View className="gap-3 rounded-2xl bg-surface-variant/60 p-4">
          <FormTextField
            control={control}
            name="isbn"
            label={t('book.fields.isbn')}
            placeholder="978…"
            inputMode="numeric"
            maxLength={13}
            returnKeyType="search"
            onSubmitEditing={() => void downloadInfo()}
            accessory={
              <IconButton
                icon="qr-code-scanner"
                color="primary"
                accessibilityLabel={t('book.scanIsbn')}
                onPress={() => setScannerOpen(true)}
              />
            }
          />
          <Button
            label={t('book.downloadInfo')}
            icon="cloud-download"
            variant="tonal"
            loading={lookup.isPending}
            onPress={() => void downloadInfo()}
          />
          {lookupMessage ? (
            <Text
              variant="bodySmall"
              className={`text-sm ${lookupMessage.tone === 'error' ? 'text-error' : 'text-tertiary'}`}
            >
              {lookupMessage.text}
            </Text>
          ) : null}
        </View>

        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => <CoverField value={field.value} onChange={field.onChange} />}
        />

        <SectionTitle>{t('book.sections.details')}</SectionTitle>
        <FormTextField
          control={control}
          name="title"
          label={t('book.fields.title')}
          autoCapitalize="sentences"
        />
        <FormTextField control={control} name="subtitle" label={t('book.fields.subtitle')} />
        <Controller
          control={control}
          name="authors"
          render={({ field, fieldState }) => (
            <AuthorsField
              value={field.value}
              onChange={field.onChange}
              error={
                fieldState.error?.message
                  ? t(fieldState.error.message as 'validation.required')
                  : undefined
              }
            />
          )}
        />
        <Controller
          control={control}
          name="genres"
          render={({ field }) => (
            <GenresField value={field.value} onChange={field.onChange} suggestions={subjects} />
          )}
        />
        <FormTextField control={control} name="publisher" label={t('book.fields.publisher')} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormTextField
              control={control}
              name="publicationDate"
              label={t('book.fields.publicationDate')}
              placeholder={t('common.datePlaceholder')}
            />
          </View>
          <View className="flex-1">
            <FormTextField
              control={control}
              name="pageCount"
              label={t('book.fields.pageCount')}
              inputMode="numeric"
              maxLength={6}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="language"
          render={({ field }) => <LanguageField value={field.value} onChange={field.onChange} />}
        />
        <FormTextField
          control={control}
          name="description"
          label={t('book.fields.description')}
          multiline
        />

        <SectionTitle>{t('book.sections.myCopy')}</SectionTitle>
        <View className="gap-1">
          <FieldLabel>{t('book.fields.ownershipStatus')}</FieldLabel>
          <Controller
            control={control}
            name="ownershipStatus"
            render={({ field }) => (
              <SegmentedControl
                accessibilityLabel={t('book.fields.ownershipStatus')}
                options={OWNERSHIP_STATUSES.map((s) => ({
                  value: s,
                  label: t(`book.ownership.${s}`),
                }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </View>
        <View className="gap-1">
          <FieldLabel>{t('book.fields.readingStatus')}</FieldLabel>
          <Controller
            control={control}
            name="readingStatus"
            render={({ field }) => (
              <View className="gap-2">
                <SegmentedControl
                  accessibilityLabel={t('book.fields.readingStatus')}
                  options={READING_STATUSES.slice(0, 2).map((s) => ({
                    value: s,
                    label: t(`book.reading.${s}`),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
                <SegmentedControl
                  options={READING_STATUSES.slice(2).map((s) => ({
                    value: s,
                    label: t(`book.reading.${s}`),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              </View>
            )}
          />
        </View>
        <View className="gap-1">
          <FieldLabel>{t('book.fields.personalRating')}</FieldLabel>
          <Controller
            control={control}
            name="personalRating"
            render={({ field }) => (
              <RatingStars value={field.value} onChange={field.onChange} size={32} />
            )}
          />
        </View>
        <FormTextField
          control={control}
          name="physicalLocation"
          label={t('book.fields.physicalLocation')}
          placeholder={t('book.locationPlaceholder')}
        />
        <FormTextField
          control={control}
          name="personalNotes"
          label={t('book.fields.personalNotes')}
          multiline
        />
      </ScrollView>

      <View
        className="border-t border-surface-variant bg-surface px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button label={submitLabel} icon="check" loading={saving} onPress={submit} />
      </View>

      <ScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(isbn) => {
          setValue('isbn', isbn, { shouldDirty: true });
          void downloadInfo(isbn);
        }}
      />
    </View>
  );
}
