import { PERSISTENCE_AUTO_RETRY_LIMIT } from '../../utils/libraryConstants';

export type PersistenceKeyFamily =
  | 'library'
  | 'draft'
  | 'project'
  | 'projectIndex'
  | 'queue'
  | 'prefs'
  | 'journal';

export interface WriteOp {
  label: string;
  family: PersistenceKeyFamily;
  targetKeys?: readonly string[];
  coalesceKey?: string;
  availableBytes?: () => number | null | Promise<number | null>;
  onIssue?: (issue: PersistenceIssue) => void;
  run: () => Promise<void>;
}

export interface PersistenceIssue {
  kind: 'readFailed' | 'storageFull' | 'writeFailed';
  label: string;
  message: string;
  detail?: string;
  error: unknown;
  retry: () => Promise<void>;
}

export class PersistenceBlockedError extends Error {
  readonly family: PersistenceKeyFamily;
  readonly blockedKeys: readonly string[];

  constructor(op: WriteOp, blockedKeys: readonly string[]) {
    super(`Cannot write ${op.label} until its stored data has been read successfully`);
    this.name = 'PersistenceBlockedError';
    this.family = op.family;
    this.blockedKeys = blockedKeys;
  }
}

export class PersistenceStorageFullError extends Error {
  readonly cause: unknown;

  constructor(label: string, cause: unknown) {
    super(`BeatNote is out of storage space while saving ${label}`);
    this.name = 'PersistenceStorageFullError';
    this.cause = cause;
  }
}

/** A repository read failed while a serialised operation was running. */
export class PersistenceReadError extends Error {
  readonly cause: unknown;

  constructor(label: string, cause: unknown) {
    super(`BeatNote couldn't read ${label}`);
    this.name = 'PersistenceReadError';
    this.cause = cause;
  }
}

interface Waiter {
  resolve: () => void;
  reject: (reason: unknown) => void;
}

interface QueueEntry {
  op: WriteOp;
  waiters: Waiter[];
}

const queue: QueueEntry[] = [];
const failedKeys = new Set<string>();
const failedFamilies = new Set<PersistenceKeyFamily>();
let workerRunning = false;

const RETRY_DELAYS_MS = [1_000, 2_000, 4_000] as const;
const STORAGE_FULL_THRESHOLD_BYTES = 1024 * 1024;

const wait = (delayMs: number): Promise<void> => new Promise(resolve => {
  setTimeout(resolve, delayMs);
});

const errorName = (error: unknown): string | null => (
  typeof error === 'object' && error !== null && 'name' in error
    ? String(error.name)
    : null
);

const errorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

async function isStorageFull(op: WriteOp, error: unknown): Promise<boolean> {
  if (errorName(error) === 'QuotaExceededError') return true;
  if (/\b(space|full)\b/i.test(errorMessage(error))) return true;
  if (!op.availableBytes) return false;

  try {
    const availableBytes = await op.availableBytes();
    return availableBytes !== null && availableBytes < STORAGE_FULL_THRESHOLD_BYTES;
  } catch {
    return false;
  }
}

const notifyIssue = (
  op: WriteOp,
  kind: PersistenceIssue['kind'],
  error: unknown,
): void => {
  op.onIssue?.({
    kind,
    label: op.label,
    message: kind === 'storageFull'
      ? `BeatNote is out of storage space while saving ${op.label}`
      : `BeatNote couldn't save ${op.label}`,
    error,
    retry: () => enqueueWrite(op),
  });
};

async function runEntry(entry: QueueEntry): Promise<void> {
  assertWriteHealthy(entry.op);

  for (let retryCount = 0; ; retryCount += 1) {
    try {
      await entry.op.run();
      return;
    } catch (error) {
      if (error instanceof PersistenceBlockedError || error instanceof PersistenceReadError) {
        throw error;
      }
      if (await isStorageFull(entry.op, error)) {
        const storageError = new PersistenceStorageFullError(entry.op.label, error);
        notifyIssue(entry.op, 'storageFull', storageError);
        throw storageError;
      }
      if (retryCount >= PERSISTENCE_AUTO_RETRY_LIMIT) {
        notifyIssue(entry.op, 'writeFailed', error);
        throw error;
      }
      await wait(RETRY_DELAYS_MS[retryCount]);
    }
  }
}

const blockedKeysFor = (op: WriteOp): string[] => (
  op.targetKeys?.filter(key => failedKeys.has(key)) ?? []
);

const assertWriteHealthy = (op: WriteOp): void => {
  const blockedKeys = blockedKeysFor(op);
  if (failedFamilies.has(op.family) || blockedKeys.length > 0) {
    throw new PersistenceBlockedError(op, blockedKeys);
  }
};

async function runWorker(): Promise<void> {
  if (workerRunning) return;
  workerRunning = true;

  try {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) continue;

      try {
        await runEntry(entry);
        entry.waiters.forEach(waiter => waiter.resolve());
      } catch (error) {
        entry.waiters.forEach(waiter => waiter.reject(error));
      }
    }
  } finally {
    workerRunning = false;
  }
}

export function enqueueWrite(op: WriteOp): Promise<void> {
  const promise = new Promise<void>((resolve, reject) => {
    const waiter = { resolve, reject };
    const replaceIndex = op.coalesceKey === undefined
      ? -1
      : queue.findIndex(entry => entry.op.coalesceKey === op.coalesceKey);

    if (replaceIndex >= 0) {
      const queued = queue[replaceIndex];
      queued.op = op;
      queued.waiters.push(waiter);
      return;
    }

    queue.push({ op, waiters: [waiter] });
  });

  void runWorker();
  return promise;
}

/** Cancel a not-yet-running coalescible write. Intentional cancellation resolves its waiters. */
export function cancelQueued(coalesceKey: string): boolean {
  const index = queue.findIndex(entry => entry.op.coalesceKey === coalesceKey);
  if (index < 0) return false;

  const [cancelled] = queue.splice(index, 1);
  cancelled.waiters.forEach(waiter => waiter.resolve());
  return true;
}

export function markReadFailed(key: string): void {
  failedKeys.add(key);
}

export function markReadSucceeded(key: string): void {
  failedKeys.delete(key);
}

export function markFamilyReadFailed(family: PersistenceKeyFamily): void {
  failedFamilies.add(family);
}

export function markFamilyReadSucceeded(family: PersistenceKeyFamily): void {
  failedFamilies.delete(family);
}
