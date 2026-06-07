import { Screen } from '@/components/Screen';
import { ScreenTitle } from '@/components/ScreenTitle';
import { GoalsEditor } from '@/features/GoalsEditor';
import { spacing } from '@/theme';

export default function GoalsTab() {
  return (
    <Screen scroll edges={['top']}>
      <ScreenTitle center style={{ marginBottom: spacing.xl }}>
        Get stuff done.
      </ScreenTitle>
      <GoalsEditor />
    </Screen>
  );
}
