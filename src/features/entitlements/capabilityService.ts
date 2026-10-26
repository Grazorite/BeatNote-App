import {
  PRODUCT_CAPABILITIES,
  PRO_ENTITLEMENT_KEY,
  type CapabilityMatrixEntry,
  type EntitlementProvider,
  type EntitlementSnapshot,
  type ProductCapability,
  type ProductTier,
} from './types';

const PRO_ONLY = new Set<ProductCapability>(PRODUCT_CAPABILITIES);

/**
 * V1 product decision: the core Lite workflow remains available, while every capability listed
 * here is a V2 Pro expansion. This matrix declares future policy but does not activate a paywall.
 */
export const CAPABILITY_MATRIX: readonly CapabilityMatrixEntry[] = Object.freeze(
  PRODUCT_CAPABILITIES.map(capability => Object.freeze({
    capability,
    lite: !PRO_ONLY.has(capability),
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

const v1PreviewSnapshot = (): EntitlementSnapshot => ({
  tier: 'pro',
  activeEntitlements: [PRO_ENTITLEMENT_KEY],
  checkedAt: new Date().toISOString(),
  offline: true,
});

/**
 * V1 deliberately exposes implemented preview features without purchases. Replace this provider
 * at V2 launch; UI code continues to ask only whether a product capability is available.
 */
export const v1PreviewEntitlementProvider: EntitlementProvider = {
  async getSnapshot() {
    return v1PreviewSnapshot();
  },
  async restore() {
    return v1PreviewSnapshot();
  },
  subscribe() {
    return () => undefined;
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
