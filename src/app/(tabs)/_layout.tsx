import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { fonts } from '@/theme/palette';

type TabIconProps = Pick<ComponentProps<typeof MaterialIcons>, 'name' | 'color' | 'size'>;

function TabIcon(props: TabIconProps) {
  return <MaterialIcons {...props} />;
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontFamily: fonts.serif, fontWeight: '600' },
        tabBarLabelStyle: { fontFamily: fonts.sans, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.library'),
          tabBarIcon: (props) => <TabIcon name="menu-book" {...props} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: (props) => <TabIcon name="search" {...props} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tabs.scan'),
          headerShown: false,
          tabBarIcon: (props) => <TabIcon name="qr-code-scanner" {...props} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: (props) => <TabIcon name="settings" {...props} />,
        }}
      />
    </Tabs>
  );
}
