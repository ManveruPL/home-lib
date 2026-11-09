import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';

/** Runs pending migrations before rendering the app. */
export function DatabaseProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-error">
          {t('db.migrationError', { message: error.message })}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return children;
}
