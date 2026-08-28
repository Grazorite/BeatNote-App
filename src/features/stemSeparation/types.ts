import { LayerId } from '../../hooks/useStudioStore';

/** Current status of the stem separation pipeline. */
export type StemSeparationStatus = 'idle' | 'processing' | 'complete' | 'error';

/** User-selected processing tier for stem separation. */
export type StemSeparationMode = 'auto' | 'on-device' | 'cloud';

/** The result of a completed stem separation, mapping each LayerId to a local file URI. */
export interface StemSeparationResult {
  /** SHA-256 hash (16 hex chars) of the source audio URI + stem count. */
  sourceHash: string;
  /** Number of stems produced. */
  stemCount: 4 | 6;
  /** Map of LayerId to local file URI for each separated stem. */
  stems: Partial<Record<LayerId, string>>;
  /** ISO 8601 timestamp of when the separation was completed. */
  createdAt: string;
}

/** A single entry in the stem cache — identical shape to StemSeparationResult. */
export interface StemCacheEntry extends StemSeparationResult {}

/** Top-level structure persisted in AsyncStorage under `beatnote_stem_cache`. */
export interface StemCacheMetadata {
  /** All cached entries keyed by sourceHash. */
  entries: Record<string, StemCacheEntry>;
}

/** Progress event emitted by the native module or cloud poller during separation. */
export interface StemProgressEvent {
  /** Current progress percentage, in the range [0, 100]. */
  progress: number;
}

/** Typed error thrown by any part of the stem separation pipeline. */
export interface StemSeparationError {
  /** Machine-readable error code for programmatic handling. */
  code:
    | 'NO_SONG'
    | 'ALREADY_PROCESSING'
    | 'NO_API_KEY'
    | 'NETWORK_ERROR'
    | 'API_ERROR'
    | 'DEVICE_ERROR'
    | 'STORAGE_ERROR'
    | 'UNSUPPORTED_FORMAT'
    | 'MODEL_MISSING'
    | 'INSUFFICIENT_MEMORY';
  /** Human-readable description of the error. */
  message: string;
}
