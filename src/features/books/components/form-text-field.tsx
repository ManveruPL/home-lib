import type { ComponentProps } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TextField } from '@/components/ui/text-field';

import type { BookFormValues } from '../book-form-schema';

type StringFieldName = {
  [K in keyof BookFormValues]: BookFormValues[K] extends string ? K : never;
}[keyof BookFormValues];

type FormTextFieldProps = Omit<ComponentProps<typeof TextField>, 'value' | 'error'> & {
  control: Control<BookFormValues>;
  name: StringFieldName;
};

/** TextField bound to a string field of the book form; errors are translated i18n keys. */
export function FormTextField({ control, name, ...props }: FormTextFieldProps) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
          error={
            fieldState.error?.message
              ? t(fieldState.error.message as 'validation.required')
              : undefined
          }
          {...props}
        />
      )}
    />
  );
}
