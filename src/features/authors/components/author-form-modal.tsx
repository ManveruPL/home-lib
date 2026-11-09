import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';

import { authorFormDefaults, authorFormSchema, type AuthorFormValues } from '../author-form-schema';

type AuthorFormModalProps = {
  visible: boolean;
  title: string;
  initialValues?: Partial<AuthorFormValues>;
  onClose: () => void;
  onSubmit: (values: AuthorFormValues) => void;
};

/** Overlay form, so adding an author does not lose the book form underneath. */
export function AuthorFormModal({
  visible,
  title,
  initialValues,
  onClose,
  onSubmit,
}: AuthorFormModalProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: authorFormDefaults,
  });

  useEffect(() => {
    if (visible) reset({ ...authorFormDefaults, ...initialValues });
    // Reset only when the modal opens, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const errorText = (key?: string) => (key ? t(key as 'validation.required') : undefined);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Pressable
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          className="flex-1 justify-center bg-black/50 px-4"
        >
          {/* Stops taps inside the card from closing the modal. */}
          <Pressable onPress={() => {}} className="max-h-[90%] rounded-3xl bg-surface">
            <ScrollView contentContainerClassName="gap-4 p-6" keyboardShouldPersistTaps="handled">
              <Text variant="headline">{title}</Text>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label={t('author.fields.name')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    autoCapitalize="words"
                    autoFocus
                    error={errorText(errors.name?.message)}
                  />
                )}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="birthDate"
                    render={({ field }) => (
                      <TextField
                        label={t('author.fields.birthDate')}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('common.datePlaceholder')}
                        inputMode="numeric"
                        error={errorText(errors.birthDate?.message)}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="deathDate"
                    render={({ field }) => (
                      <TextField
                        label={t('author.fields.deathDate')}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('common.datePlaceholder')}
                        inputMode="numeric"
                        error={errorText(errors.deathDate?.message)}
                      />
                    )}
                  />
                </View>
              </View>
              <Controller
                control={control}
                name="biography"
                render={({ field }) => (
                  <TextField
                    label={t('author.fields.biography')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    multiline
                  />
                )}
              />
              <View className="flex-row justify-end gap-2">
                <Button label={t('common.cancel')} variant="text" onPress={onClose} />
                <Button label={t('common.save')} onPress={handleSubmit(onSubmit)} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
