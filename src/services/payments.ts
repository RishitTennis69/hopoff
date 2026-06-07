import { revenueCatKey, PLAN_IDS } from '@/config/env';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export type PurchasePlan = 'monthly' | 'annual';

export type PurchaseResult =
  | { ok: true; devMode?: boolean }
  | { ok: false; error: string };

type PurchasesPackage = {
  identifier: string;
  product: { identifier: string };
};

type PurchasesModule = {
  default: {
    configure: (opts: { apiKey: string; appUserID?: string }) => void;
    getOfferings: () => Promise<{
      current?: { availablePackages: PurchasesPackage[] };
    }>;
    purchasePackage: (pkg: PurchasesPackage) => Promise<unknown>;
    restorePurchases: () => Promise<{ entitlements: { active: Record<string, unknown> } }>;
    getCustomerInfo: () => Promise<{ entitlements: { active: Record<string, unknown> } }>;
  };
};

async function loadPurchases(): Promise<PurchasesModule | null> {
  if (!revenueCatKey()) return null;
  try {
    return (await import('react-native-purchases')) as PurchasesModule;
  } catch {
    return null;
  }
}

export async function initPurchases(userId?: string): Promise<void> {
  const mod = await loadPurchases();
  if (!mod) return;
  mod.default.configure({ apiKey: revenueCatKey(), appUserID: userId });
}

/** Start the 7-day trial with no payment — saves plan preference for later. */
export function startFreeWeek(plan: PurchasePlan): void {
  useSubscriptionStore.getState().setFromPurchase(plan, 7);
}

export async function purchasePlan(plan: PurchasePlan): Promise<PurchaseResult> {
  const mod = await loadPurchases();
  if (!mod) {
    useSubscriptionStore.getState().setFromPurchase(plan, 7);
    return { ok: true, devMode: true };
  }

  const Purchases = mod.default;
  try {
    const offerings = await Purchases.getOfferings();
    const productId = plan === 'monthly' ? PLAN_IDS.monthly : PLAN_IDS.annual;
    const pkg =
      offerings.current?.availablePackages.find(
        (p) => p.product.identifier === productId || p.identifier === productId,
      ) ?? offerings.current?.availablePackages[0];

    if (!pkg) return { ok: false, error: 'No subscription packages configured in RevenueCat.' };

    await Purchases.purchasePackage(pkg);
    useSubscriptionStore.getState().setFromPurchase(plan, 7);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Purchase failed';
    if (msg.toLowerCase().includes('cancel')) return { ok: false, error: 'Purchase cancelled' };
    return { ok: false, error: msg };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  const mod = await loadPurchases();
  if (!mod) {
    return { ok: false, error: 'Restore requires RevenueCat configuration.' };
  }
  try {
    const info = await mod.default.restorePurchases();
    const active = Object.keys(info.entitlements.active).length > 0;
    if (active) {
      useSubscriptionStore.getState().setStatus('active');
      return { ok: true };
    }
    return { ok: false, error: 'No active subscription found.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Restore failed' };
  }
}

export async function refreshSubscriptionStatus(): Promise<void> {
  const mod = await loadPurchases();
  if (!mod) return;
  try {
    const info = await mod.default.getCustomerInfo();
    const active = Object.keys(info.entitlements.active).length > 0;
    useSubscriptionStore.getState().setStatus(active ? 'active' : 'expired');
  } catch {
    // Non-fatal
  }
}
