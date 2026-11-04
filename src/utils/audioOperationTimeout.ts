export class AudioOperationTimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`${operation} did not finish within ${timeoutMs} ms`);
    this.name = 'AudioOperationTimeoutError';
  }
}

/**
 * Bound native audio promises so an AVPlayer operation abandoned during suspension cannot keep
 * BeatNote's serialized seek or track-switch pipeline locked forever.
 */
export async function withAudioOperationTimeout<T>(
  operation: PromiseLike<T> | T,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const timeoutResult = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(
      () => reject(new AudioOperationTimeoutError(label, timeoutMs)),
      Math.max(0, timeoutMs),
    );
  });

  try {
    return await Promise.race([Promise.resolve(operation), timeoutResult]);
  } finally {
    if (timeout !== null) clearTimeout(timeout);
  }
}
