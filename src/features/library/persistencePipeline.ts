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
  coalesceKey?: string;
  run: () => Promise<void>;
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
let workerRunning = false;

async function runWorker(): Promise<void> {
  if (workerRunning) return;
  workerRunning = true;

  try {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) continue;

      try {
        await entry.op.run();
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
