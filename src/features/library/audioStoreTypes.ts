import type { SupportedAudioExtension } from '../../types/library';

export interface StagedAudio {
  stagingRef: string;
  byteSize: number;
}

export interface AudioStoreAdapter {
  ensureDirectories(): Promise<void>;
  availableBytes(): Promise<number | null>;
  sourceByteSize(sourceUri: string): Promise<number | null>;
  randomUUID(): string;
  stage(
    sourceUri: string,
    expectedBytes: number,
    extension: SupportedAudioExtension,
  ): Promise<StagedAudio>;
  hash(staged: StagedAudio): Promise<string>;
  probeDuration(staged: StagedAudio, timeoutMs: number): Promise<number>;
  commit(staged: StagedAudio, physicalName: string): Promise<string>;
  discard(staged: StagedAudio): Promise<void>;
  resolvePlayableUri(relativePath: string): Promise<string>;
  checkAvailable(relativePath: string): Promise<'available' | 'missing'>;
  remove(relativePath: string): Promise<void>;
  sweepOrphans(referenced: ReadonlySet<string>, minAgeMs: number): Promise<number>;
  deleteSourceCopy(sourceUri: string): Promise<void>;
}

export type ImportErrorCode =
  | 'unsupported'
  | 'invalidSize'
  | 'insufficientSpace'
  | 'copyFailed'
  | 'copyIncomplete'
  | 'hashFailed'
  | 'decodeFailed'
  | 'decodeTimeout'
  | 'commitFailed'
  | 'targetMissing'
  | 'stagedAudioMissing';

export class ImportError extends Error {
  readonly code: ImportErrorCode;

  constructor(code: ImportErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ImportError';
    this.code = code;
  }
}
