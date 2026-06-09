import { Tabs } from 'expo-router';
import { TabIcon } from '@/components/TabIcon';
import { TrialPaywallModal } from '@/components/TrialPaywallModal';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { fonts, colors } from '@/theme';

export default function TabsLayout() {
  const mustSubscribe = useSubscriptionStore((s) => s.mustSubscribe());

  return (
    <>
      <TrialPaywallModal visible={mustSubscribe} />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color }) => <TabIcon name="collection" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <TabIcon name="goals" color={color} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({ color }) => <TabIcon name="apps" color={color} />,
        }}
      />
    </Tabs>
    </>
  );
}
