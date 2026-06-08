import { AppText } from './AppText';
import { colors } from '@/theme';

/** Required App Store / Play Store subscription disclosure. */
export function SubscriptionTerms({ compact }: { compact?: boolean }) {
  return (
    <AppText variant="small" color={colors.textFaint} center style={compact ? undefined : { lineHeight: 18 }}>
      HopOff offers auto-renewable subscriptions: $9.99/month or $59.99/year after a 7-day free trial.
      Payment is charged to your Apple ID or Google Play account at confirmation. Subscriptions renew unless
      canceled at least 24 hours before the end of the period. Manage subscriptions in your account settings.
    </AppText>
  );
}
