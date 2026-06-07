import { Screen } from '@/components/Screen';
import { ScreenTitle } from '@/components/ScreenTitle';
import { CollectionManager } from '@/features/CollectionManager';
import { spacing } from '@/theme';

export default function CollectionTab() {
  return (
    <Screen scroll edges={['top']}>
      <ScreenTitle style={{ marginBottom: spacing.xl }}>
        What motivates you?
      </ScreenTitle>
      <CollectionManager />
    </Screen>
  );
}
