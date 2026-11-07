import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PRODUCT_CAPABILITIES,
  PRO_ENTITLEMENT_KEY,
  type CapabilityMatrixEntry,
  type EntitlementProvider,
  type EntitlementSnapshot,
  type ProductCapability,
  type ProductTier,
} from './types';

/**
 * Lite includes the built-in pitch-preserved speed presets. Waveform artwork, label editing, fine speed
 * adjustment, custom presets, all BPM tooling, continuous playback, resume, and remote controls
 * remain Pro.
 */
const LITE_INCLUDED = new Set<ProductCapability>([
  'playback.pitchPreservingSpeed',
]);

/**
 * Declares Lite/Pro policy. No purchase is enforced yet; the debug tier override below is the only
 * way to enable Pro previews until the V2 purchase provider replaces this one.
 */
export const CAPABILITY_MATRIX: readonly CapabilityMatrixEntry[] = Object.freeze(
  PRODUCT_CAPABILITIES.map(capability => Object.freeze({
    capability,
    lite: LITE_INCLUDED.has(capability),
    pro: true,
  })),
);

const matrixByCapability = new Map(
  CAPABILITY_MATRIX.map(entry => [entry.capability, entry] as const),
);

export const tierAllows = (tier: ProductTier, capability: ProductCapability): boolean => (
  matrixByCapability.get(capability)?.[tier] ?? false
);

export const snapshotAllows = (
  snapshot: EntitlementSnapshot,
  capability: ProductCapability,
): boolean => tierAllows(snapshot.tier, capability);

const DEBUG_TIER_KEY = 'beatnote_debug_tier';

type SnapshotListener = (snapshot: EntitlementSnapshot) => void;

const listeners = new Set<SnapshotListener>();
// New installations start in Lite; hydration preserves either explicit saved tier.
let currentTier: ProductTier = 'lite';

const snapshotFor = (tier: ProductTier): EntitlementSnapshot => ({
  tier,
  activeEntitlements: tier === 'pro' ? [PRO_ENTITLEMENT_KEY] : [],
  checkedAt: new Date().toISOString(),
  offline: true,
});

const notify = (): void => {
  const snapshot = snapshotFor(currentTier);
  listeners.forEach(listener => listener(snapshot));
};

// Restores the persisted debug choice so a Lite test session survives an app restart.
const hydration: Promise<void> = AsyncStorage.getItem(DEBUG_TIER_KEY)
  .then(stored => {
    if ((stored === 'lite' || stored === 'pro') && stored !== currentTier) {
      currentTier = stored;
      notify();
    }
  })
  .catch((error: unknown) => {
    console.error('Debug tier restore failed:', error);
  });

/** Current tier for non-React callers such as playback event handlers. */
export const getCurrentTier = (): ProductTier => currentTier;

/** Synchronous capability check for event handlers; components should use useProductCapability. */
export const isCapabilityAvailable = (capability: ProductCapability): boolean => (
  tierAllows(currentTier, capability)
);

/** Debug-only tier override. Remove when the V2 purchase provider replaces the preview provider. */
export const setDebugTier = async (tier: ProductTier): Promise<void> => {
  currentTier = tier;
  notify();
  try {
    await AsyncStorage.setItem(DEBUG_TIER_KEY, tier);
  } catch (error) {
    console.error('Debug tier save failed:', error);
  }
};

/** Remove the preview override and return to the V1 default during an all-data reset. */
export const resetDebugTier = async (): Promise<void> => {
  await hydration;
  currentTier = 'lite';
  notify();
  await AsyncStorage.removeItem(DEBUG_TIER_KEY);
};

/**
 * V1 preview provider: no purchases, tier comes from the debug override (default Lite). Replace
 * at V2 launch; UI code continues to ask only whether a product capability is available.
 */
export const v1PreviewEntitlementProvider: EntitlementProvider = {
  async getSnapshot() {
    await hydration;
    return snapshotFor(currentTier);
  },
  async restore() {
    await hydration;
    return snapshotFor(currentTier);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const validateCapabilityMatrix = (): readonly string[] => {
  const issues: string[] = [];
  const seen = new Set<ProductCapability>();

  CAPABILITY_MATRIX.forEach(entry => {
    if (seen.has(entry.capability)) issues.push(`Duplicate capability: ${entry.capability}`);
    seen.add(entry.capability);
    if (!entry.pro) issues.push(`Pro must include ${entry.capability}`);
    if (entry.lite && !entry.pro) issues.push(`Lite cannot exceed Pro for ${entry.capability}`);
  });

  PRODUCT_CAPABILITIES.forEach(capability => {
    if (!seen.has(capability)) issues.push(`Missing capability: ${capability}`);
  });

  return issues;
};
