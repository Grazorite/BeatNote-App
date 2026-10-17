import type { PersistedContent, PersistedLayer } from '../types/project';

const FINGERPRINT_PREFIX = 'fp1:';
const SECOND_HASH_SEED = 0x9e3779b9;

const compareCodeUnits = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const compareCanonicalNumbers = (left: number, right: number): number => {
  const normalizedLeft = Number.isFinite(left) ? left : null;
  const normalizedRight = Number.isFinite(right) ? right : null;
  if (normalizedLeft === null) return normalizedRight === null ? 0 : 1;
  if (normalizedRight === null) return -1;
  return normalizedLeft - normalizedRight;
};

const normalizeForCanonicalJson = (value: unknown): unknown => {
  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(item => normalizeForCanonicalJson(item));
  }
  if (value !== null && typeof value === 'object') {
    const normalized: Record<string, unknown> = {};
    Object.keys(value)
      .sort(compareCodeUnits)
      .forEach(key => {
        const child = (value as Record<string, unknown>)[key];
        if (child !== undefined) normalized[key] = normalizeForCanonicalJson(child);
      });
    return normalized;
  }
  return value;
};

const canonicalLayer = (layer: PersistedLayer): PersistedLayer => ({
  ...layer,
  markers: [...layer.markers].sort(compareCanonicalNumbers),
  annotations: [...layer.annotations].sort((left, right) => {
    const timestampOrder = compareCanonicalNumbers(left.timestamp, right.timestamp);
    return timestampOrder === 0 ? compareCodeUnits(left.text, right.text) : timestampOrder;
  }),
});

/** Return deterministic JSON for authored content without mutating the caller's value. */
export function canonicalize(content: PersistedContent): string {
  const normalizedContent: PersistedContent = {
    ...content,
    layers: [...content.layers]
      .sort((left, right) => compareCodeUnits(left.id, right.id))
      .map(canonicalLayer),
  };
  return canonicalizeValue(normalizedContent);
}

/** Return deterministic JSON for an arbitrary persisted sub-value. */
export function canonicalizeValue(value: unknown): string {
  return JSON.stringify(normalizeForCanonicalJson(value)) ?? 'undefined';
}

/** Compute a deterministic 53-bit cyrb hash for a string and seed. */
export function cyrb53(value: string, seed = 0): number {
  let hash1 = 0xdeadbeef ^ seed;
  let hash2 = 0x41c6ce57 ^ seed;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hash1 = Math.imul(hash1 ^ code, 2654435761);
    hash2 = Math.imul(hash2 ^ code, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507)
    ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507)
    ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & hash2) + (hash1 >>> 0);
}

/** Fingerprint authored content for draft dirty-state comparisons. */
export function computeContentFingerprint(content: PersistedContent): string {
  const canonical = canonicalize(content);
  const hash1 = cyrb53(canonical, 0).toString(36);
  const hash2 = cyrb53(canonical, SECOND_HASH_SEED).toString(36);
  return `${FINGERPRINT_PREFIX}${canonical.length}:${hash1}${hash2}`;
}

/** Compare only fingerprints produced by the current algorithm version. */
export function contentFingerprintsEqual(left: string | null, right: string | null): boolean {
  return left !== null
    && right !== null
    && left.startsWith(FINGERPRINT_PREFIX)
    && right.startsWith(FINGERPRINT_PREFIX)
    && left === right;
}
