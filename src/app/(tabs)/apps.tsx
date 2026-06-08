import { Screen } from '@/components/Screen';
import { ScreenTitle } from '@/components/ScreenTitle';
import { AppsManager } from '@/features/AppsManager';
import { spacing } from '@/theme';

export default function AppsTab() {
  return (
    <Screen scroll edges={['top']}>
      <ScreenTitle center style={{ marginBottom: spacing.xl }}>
        Eliminate your distractions. Today.
      </ScreenTitle>
      <AppsManager editableGroups />
    </Screen>
  );
}
