import '@/global.css';
import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { AppProviders } from '@/providers/app-providers';
import { fonts } from '@/theme/palette';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTitleStyle: { fontFamily: fonts.serif, fontWeight: '600' },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/new" options={{ title: t('book.newTitle') }} />
        <Stack.Screen name="book/[id]/index" options={{ title: t('book.detailsTitle') }} />
        <Stack.Screen name="book/[id]/edit" options={{ title: t('book.editTitle') }} />
        <Stack.Screen name="author/[id]" options={{ title: t('author.title') }} />
      </Stack>
    </AppProviders>
  );
}
