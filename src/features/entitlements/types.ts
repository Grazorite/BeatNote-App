export const PRO_ENTITLEMENT_KEY = 'beatnote.pro' as const;

export const PRODUCT_CAPABILITIES = [
  'projects.unlimited',
  'layers.multiple',
  'layers.customNames',
  'waveform.detailed',
  'playback.pitchPreservingSpeed',
  'export.pdf',
  'export.midi',
  'snapping.advanced',
  'projects.templates',
  'annotations.customVocabulary',
  'analysis.autoBpm',
] as const;

export type ProductCapability = typeof PRODUCT_CAPABILITIES[number];
export type ProductTier = 'lite' | 'pro';
export type EntitlementKey = typeof PRO_ENTITLEMENT_KEY;

export interface CapabilityMatrixEntry {
  capability: ProductCapability;
  lite: boolean;
  pro: boolean;
}

export interface EntitlementSnapshot {
  /** Provider-neutral product tier. Purchase SDK identifiers stay behind the provider boundary. */
  tier: ProductTier;
  activeEntitlements: readonly EntitlementKey[];
  checkedAt: string;
  offline: boolean;
}

export interface EntitlementProvider {
  getSnapshot(): Promise<EntitlementSnapshot>;
  restore(): Promise<EntitlementSnapshot>;
  subscribe(listener: (snapshot: EntitlementSnapshot) => void): () => void;
}
