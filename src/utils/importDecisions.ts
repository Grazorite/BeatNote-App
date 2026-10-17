import type {
  LibraryRecord,
  MusicItem,
  SupportedAudioExtension,
} from '../types/library';
import {
  FREE_SPACE_MARGIN_BYTES,
  LEGACY_DURATION_TOLERANCE_MS,
  MAX_AUDIO_FILE_BYTES,
  SUPPORTED_AUDIO_EXTENSIONS,
} from './libraryConstants';

const BYTES_PER_MEGABYTE = 1024 * 1024;

export type ImportValidationResult =
  | { valid: true; extension: SupportedAudioExtension }
  | { valid: false; error: string };

export type DuplicateDecision =
  | { kind: 'duplicate'; item: MusicItem }
  | { kind: 'reattach'; item: MusicItem }
  | { kind: 'create' };

export interface RelinkCandidate {
  originalFilename: string;
  contentHash: string;
  byteSize: number;
  durationMs: number;
}

export type RelinkDecision = 'attach' | 'looksOriginal' | 'keepMissing' | 'confirmMismatch';

export interface StoredFileEntry {
  relativePath: string;
  modifiedAtMs: number;
}

const supportedExtension = (filename: string): SupportedAudioExtension | null => {
  const finalDot = filename.lastIndexOf('.');
  if (finalDot < 0 || finalDot === filename.length - 1) return null;

  const extensionWithDot = filename.slice(finalDot).toLocaleLowerCase('en-US');
  if (!SUPPORTED_AUDIO_EXTENSIONS.includes(
    extensionWithDot as typeof SUPPORTED_AUDIO_EXTENSIONS[number],
  )) {
    return null;
  }

  return extensionWithDot.slice(1) as SupportedAudioExtension;
};

export function validateImportRequest(
  filename: string,
  reportedBytes: number,
  availableBytes: number | null,
): ImportValidationResult {
  const extension = supportedExtension(filename);
  if (!extension) {
    return {
      valid: false,
      error: `“${filename}” isn't a supported audio file. Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC.`,
    };
  }

  if (!Number.isFinite(reportedBytes) || reportedBytes <= 0) {
    return { valid: false, error: `“${filename}” is empty.` };
  }

  if (reportedBytes > MAX_AUDIO_FILE_BYTES) {
    return { valid: false, error: `“${filename}” is larger than the 500 MB limit.` };
  }

  const requiredBytes = reportedBytes + FREE_SPACE_MARGIN_BYTES;
  if (availableBytes !== null && availableBytes < requiredBytes) {
    const requiredMb = Math.ceil(requiredBytes / BYTES_PER_MEGABYTE);
    const availableMb = Math.max(0, Math.floor(availableBytes / BYTES_PER_MEGABYTE));
    return {
      valid: false,
      error: `BeatNote needs ${requiredMb} MB free to import “${filename}”. ${availableMb} MB is available.`,
    };
  }

  return { valid: true, extension };
}

export function decideDuplicate(
  library: LibraryRecord,
  contentHash: string,
  byteSize: number,
): DuplicateDecision {
  const match = Object.values(library.items).find(item => (
    item.contentHash === contentHash && item.byteSize === byteSize
  ));

  if (!match) return { kind: 'create' };
  if (match.removed || match.availability === 'missing') {
    return { kind: 'reattach', item: match };
  }
  return { kind: 'duplicate', item: match };
}

export function decideRelink(
  stored: MusicItem,
  chosen: RelinkCandidate,
  decodeOk: boolean,
): RelinkDecision {
  if (!decodeOk) return 'keepMissing';

  if (
    stored.contentHash !== null
    && stored.contentHash === chosen.contentHash
    && stored.byteSize === chosen.byteSize
  ) {
    return 'attach';
  }

  const legacyDuration = stored.legacy?.durationMs;
  if (
    stored.contentHash === null
    && stored.legacy?.filename === chosen.originalFilename
    && typeof legacyDuration === 'number'
    && Math.abs(legacyDuration - chosen.durationMs) <= LEGACY_DURATION_TOLERANCE_MS
  ) {
    return 'looksOriginal';
  }

  return 'confirmMismatch';
}

export function selectOrphans<T extends StoredFileEntry>(
  files: readonly T[],
  referencedRelativePaths: Iterable<string>,
  nowMs: number,
  minAgeMs: number,
): T[] {
  const referenced = new Set(referencedRelativePaths);
  return files.filter(file => (
    !referenced.has(file.relativePath)
    && Number.isFinite(file.modifiedAtMs)
    && nowMs - file.modifiedAtMs >= minAgeMs
  ));
}
