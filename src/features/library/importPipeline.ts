import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type ImportJobView,
  type LibraryRecord,
  type MusicItem,
} from '../../types/library';
import {
  IMPORT_DECODE_TIMEOUT_MS,
  DISPLAY_TITLE_MAX_LENGTH,
} from '../../utils/libraryConstants';
import {
  decideDuplicate,
  decideRelink,
  validateImportRequest,
  type RelinkCandidate,
  type RelinkDecision,
} from '../../utils/importDecisions';
import audioStore from './audioStore';
import type { AudioStoreAdapter, StagedAudio } from './audioStoreTypes';
import { ImportError } from './audioStoreTypes';
import { useStudioStore } from '../../hooks/useStudioStore';
import {
  mutateLibrary,
  readLibraryStrict,
  type RepositoryOptions,
} from './repositories';

export type ImportOrigin = 'picker' | 'openIn' | 'relink' | 'migration';

export interface ImportRequest {
  origin: ImportOrigin;
  sourceUri: string;
  originalFilename: string;
  reportedBytes: number | null;
  relinkTargetId?: string;
  onStaged?: (relativePath: string) => Promise<void>;
  onCommitted?: (musicItemId: string) => Promise<void>;
}

export interface RelinkConfirmation {
  musicItemId: string;
  staged: StagedAudio;
  chosen: RelinkCandidate;
  decision: Extract<RelinkDecision, 'looksOriginal' | 'confirmMismatch'>;
}

export type ImportOutcome =
  | { kind: 'created'; musicItemId: string }
  | { kind: 'duplicate'; musicItemId: string }
  | { kind: 'reattached'; musicItemId: string }
  | ({ kind: 'relinkNeedsConfirm' } & RelinkConfirmation)
  | { kind: 'cancelled' }
  | { kind: 'failed'; error: ImportError };

export type ImportJobObserver = (jobs: readonly ImportJobView[]) => void;

interface ImportJob {
  view: ImportJobView;
  request: ImportRequest;
  cancelRequested: boolean;
  commitStarted: boolean;
  resolve: (outcome: ImportOutcome) => void;
  relinkContinuation?: PendingRelink & { useFile: boolean };
}

interface PendingRelink {
  request: ImportRequest;
  target: MusicItem;
  staged: StagedAudio;
  chosen: RelinkCandidate;
  extension: MusicItem['extension'];
  decision: Extract<RelinkDecision, 'looksOriginal' | 'confirmMismatch'>;
}

export interface ImportPipelineDependencies {
  audioStore: AudioStoreAdapter;
  readLibrary: (options?: RepositoryOptions) => Promise<LibraryRecord | null>;
  mutateLibrary: <T>(
    mutate: (current: LibraryRecord | null) => { library: LibraryRecord; result: T },
    options?: RepositoryOptions,
  ) => Promise<T>;
  repositoryOptions?: RepositoryOptions;
  now?: () => Date;
  logError?: (message: string, error: unknown) => void;
}

export interface ImportPipeline {
  enqueueImport(request: ImportRequest): Promise<ImportOutcome>;
  cancelImport(jobId: string): void;
  subscribeImportJobs(observer: ImportJobObserver): () => void;
  importJobs(): readonly ImportJobView[];
  dismissImportJob(jobId: string): void;
  resolveRelinkConfirmation(stagingRef: string, useFile: boolean): Promise<ImportOutcome>;
}

const emptyLibrary = (): LibraryRecord => ({
  schemaVersion: 1,
  items: {},
  collections: {
    [IMPORTED_MUSIC_COLLECTION_ID]: {
      id: IMPORTED_MUSIC_COLLECTION_ID,
      name: 'Imported Music',
      builtIn: true,
    },
  },
});

const withImportedCollection = (library: LibraryRecord): LibraryRecord => ({
  ...library,
  collections: {
    ...library.collections,
    [IMPORTED_MUSIC_COLLECTION_ID]: library.collections[IMPORTED_MUSIC_COLLECTION_ID]
      ?? emptyLibrary().collections[IMPORTED_MUSIC_COLLECTION_ID],
  },
});

const titleFromFilename = (filename: string): string => {
  const dot = filename.lastIndexOf('.');
  const withoutExtension = (dot > 0 ? filename.slice(0, dot) : filename).trim();
  return (withoutExtension || filename || 'Untitled audio').slice(0, DISPLAY_TITLE_MAX_LENGTH);
};

const copyReason = (error: unknown): string => {
  const name = typeof error === 'object' && error !== null && 'name' in error
    ? String(error.name)
    : '';
  const message = error instanceof Error ? error.message : String(error);
  if (name === 'QuotaExceededError') return 'the browser storage limit was reached';
  if (/\b(space|disk full|no space)\b/i.test(message)) return 'the device is out of space';
  return message.replace(/[.\s]+$/, '') || 'an unknown error occurred';
};

const copyFailure = (filename: string, error: unknown): ImportError => new ImportError(
  'copyFailed',
  `BeatNote couldn't copy “${filename}”: ${copyReason(error)}.`,
  { cause: error },
);

const decodeFailure = (filename: string, error: unknown): ImportError => new ImportError(
  error instanceof ImportError && error.code === 'decodeTimeout' ? 'decodeTimeout' : 'decodeFailed',
  `BeatNote couldn't read “${filename}”. The file may be damaged or use an unsupported encoding.`,
  { cause: error },
);

const hashFailure = (filename: string, error: unknown): ImportError => new ImportError(
  'hashFailed',
  `BeatNote couldn't identify “${filename}”: ${copyReason(error)}.`,
  { cause: error },
);

const commitFailure = (filename: string, error: unknown): ImportError => new ImportError(
  'commitFailed',
  `BeatNote couldn't add “${filename}” to your library`,
  { cause: error },
);

const validationError = (message: string): ImportError => {
  const code = message.includes('supported audio file')
    ? 'unsupported'
    : message.startsWith('BeatNote needs') ? 'insufficientSpace' : 'invalidSize';
  return new ImportError(code, message);
};

const snapshotView = (view: ImportJobView): ImportJobView => ({ ...view });

export function createImportPipeline(dependencies: ImportPipelineDependencies): ImportPipeline {
  const queue: ImportJob[] = [];
  const failedJobs: ImportJob[] = [];
  const observers = new Set<ImportJobObserver>();
  const pendingRelinks = new Map<string, PendingRelink>();
  let activeJob: ImportJob | null = null;
  let workerRunning = false;

  const currentViews = (): ImportJobView[] => (
    [activeJob, ...queue, ...failedJobs]
      .filter((job): job is ImportJob => job !== null)
      .map(job => snapshotView(job.view))
  );

  const emit = (): void => {
    const views = currentViews();
    observers.forEach(observer => {
      try {
        observer(views);
      } catch (error) {
        (dependencies.logError ?? console.error)('Import job observer failed', error);
      }
    });
  };

  const update = (
    job: ImportJob,
    status: ImportJobView['status'],
    cancellable = !job.commitStarted,
    error: string | null = null,
  ): void => {
    job.view = { ...job.view, status, cancellable, error };
    emit();
  };

  const cancelled = async (
    job: ImportJob,
    staged?: StagedAudio,
    committedPath?: string,
  ): Promise<boolean> => {
    if (!job.cancelRequested || job.commitStarted) return false;
    try {
      if (committedPath !== undefined) await dependencies.audioStore.remove(committedPath);
      else if (staged !== undefined) await dependencies.audioStore.discard(staged);
    } catch (error) {
      (dependencies.logError ?? console.error)('Unable to clean up cancelled import', error);
    }
    return true;
  };

  const cleanupSource = async (sourceUri: string): Promise<void> => {
    try {
      await dependencies.audioStore.deleteSourceCopy(sourceUri);
    } catch (error) {
      (dependencies.logError ?? console.error)('Unable to delete consumed import source', error);
    }
  };

  const commitLibraryItem = async (
    job: ImportJob,
    library: LibraryRecord,
    item: MusicItem,
    staged: StagedAudio,
    extension: MusicItem['extension'],
    oldReference?: string,
  ): Promise<ImportOutcome> => {
    const physicalName = `${dependencies.audioStore.randomUUID()}.${extension}`;
    let committedPath: string;
    try {
      committedPath = await dependencies.audioStore.commit(staged, physicalName);
    } catch (error) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return { kind: 'failed', error: copyFailure(job.request.originalFilename, error) };
    }
    if (await cancelled(job, undefined, committedPath)) return { kind: 'cancelled' };

    job.commitStarted = true;
    update(job, 'committing', false);
    const committedItem: MusicItem = {
      ...item,
      source: { provider: 'local', reference: committedPath },
      availability: 'available',
      removed: false,
      collectionIds: Array.from(new Set([
        ...item.collectionIds,
        IMPORTED_MUSIC_COLLECTION_ID,
      ])),
    };
    try {
      await dependencies.mutateLibrary(current => {
        const latest = current ?? emptyLibrary();
        const latestItem = latest.items[item.id];
        if (library.items[item.id] === undefined && latestItem !== undefined) {
          throw new Error(`Music item ID collision: ${item.id}`);
        }
        const nextItem: MusicItem = latestItem === undefined ? committedItem : {
          ...latestItem,
          source: committedItem.source,
          originalFilename: committedItem.originalFilename,
          extension: committedItem.extension,
          byteSize: committedItem.byteSize,
          contentHash: committedItem.contentHash,
          durationMs: committedItem.durationMs,
          availability: 'available',
          removed: false,
          collectionIds: Array.from(new Set([
            ...latestItem.collectionIds,
            IMPORTED_MUSIC_COLLECTION_ID,
          ])),
        };
        return {
          library: withImportedCollection({
            ...latest,
            items: { ...latest.items, [item.id]: nextItem },
          }),
          result: undefined,
        };
      }, dependencies.repositoryOptions);
    } catch (error) {
      await dependencies.audioStore.remove(committedPath).catch(cleanupError => {
        (dependencies.logError ?? console.error)('Unable to roll back committed audio', cleanupError);
      });
      return { kind: 'failed', error: commitFailure(job.request.originalFilename, error) };
    }
    try {
      await job.request.onCommitted?.(item.id);
    } catch (error) {
      return { kind: 'failed', error: commitFailure(job.request.originalFilename, error) };
    }

    if (oldReference !== undefined && oldReference !== committedPath) {
      await dependencies.audioStore.remove(oldReference).catch(error => {
        (dependencies.logError ?? console.error)('Unable to remove replaced managed audio', error);
      });
    }
    await cleanupSource(job.request.sourceUri);
    return library.items[item.id] === undefined
      ? { kind: 'created', musicItemId: item.id }
      : { kind: 'reattached', musicItemId: item.id };
  };

  const execute = async (job: ImportJob): Promise<ImportOutcome> => {
    const { request } = job;
    if (job.relinkContinuation) {
      const pending = job.relinkContinuation;
      if (!pending.useFile) {
        await dependencies.audioStore.discard(pending.staged).catch(error => {
          (dependencies.logError ?? console.error)('Unable to discard cancelled relink', error);
        });
        await cleanupSource(pending.request.sourceUri);
        return { kind: 'cancelled' };
      }
      update(job, 'committing', false);
      let library: LibraryRecord;
      try {
        library = await dependencies.readLibrary(dependencies.repositoryOptions) ?? emptyLibrary();
      } catch (error) {
        await dependencies.audioStore.discard(pending.staged).catch(() => undefined);
        return { kind: 'failed', error: commitFailure(request.originalFilename, error) };
      }
      const target = library.items[pending.target.id];
      if (!target) {
        await dependencies.audioStore.discard(pending.staged);
        return {
          kind: 'failed',
          error: new ImportError('targetMissing', 'The song to relink is no longer in the library.'),
        };
      }
      const updated: MusicItem = {
        ...target,
        originalFilename: pending.request.originalFilename,
        extension: pending.extension,
        byteSize: pending.chosen.byteSize,
        contentHash: pending.chosen.contentHash,
        durationMs: pending.chosen.durationMs,
      };
      return commitLibraryItem(
        job,
        library,
        updated,
        pending.staged,
        pending.extension,
        target.source.reference,
      );
    }
    let staged: StagedAudio | undefined;
    update(job, 'validating');
    if (await cancelled(job)) return { kind: 'cancelled' };

    const extensionCheck = validateImportRequest(request.originalFilename, 1, null);
    if (!extensionCheck.valid) {
      return { kind: 'failed', error: validationError(extensionCheck.error) };
    }
    let reportedBytes = request.reportedBytes;
    try {
      if (reportedBytes === null) {
        reportedBytes = await dependencies.audioStore.sourceByteSize(request.sourceUri);
      }
    } catch (error) {
      return { kind: 'failed', error: copyFailure(request.originalFilename, error) };
    }
    if (await cancelled(job)) return { kind: 'cancelled' };

    if (reportedBytes === null) {
      return {
        kind: 'failed',
        error: copyFailure(request.originalFilename, new Error('the file size is unavailable')),
      };
    }
    const sourceBytes = reportedBytes;
    const sizeCheck = validateImportRequest(request.originalFilename, sourceBytes, null);
    if (!sizeCheck.valid) {
      return { kind: 'failed', error: validationError(sizeCheck.error) };
    }
    try {
      await dependencies.audioStore.ensureDirectories();
    } catch (error) {
      return { kind: 'failed', error: copyFailure(request.originalFilename, error) };
    }
    let availableBytes: number | null;
    try {
      availableBytes = await dependencies.audioStore.availableBytes();
    } catch {
      availableBytes = null;
    }
    const validation = validateImportRequest(request.originalFilename, sourceBytes, availableBytes);
    if (!validation.valid) {
      return { kind: 'failed', error: validationError(validation.error) };
    }
    if (await cancelled(job)) return { kind: 'cancelled' };

    update(job, 'copying');
    try {
      staged = await dependencies.audioStore.stage(
        request.sourceUri,
        sourceBytes,
        validation.extension,
      );
      await request.onStaged?.(staged.stagingRef);
    } catch (error) {
      if (staged !== undefined) await dependencies.audioStore.discard(staged).catch(() => undefined);
      return { kind: 'failed', error: copyFailure(request.originalFilename, error) };
    }
    if (staged.byteSize !== sourceBytes) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return {
        kind: 'failed',
        error: copyFailure(
          request.originalFilename,
          new Error(`copied ${staged.byteSize} of ${sourceBytes} bytes`),
        ),
      };
    }
    if (await cancelled(job, staged)) return { kind: 'cancelled' };

    update(job, 'hashing');
    let contentHash: string;
    try {
      contentHash = await dependencies.audioStore.hash(staged);
    } catch (error) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return { kind: 'failed', error: hashFailure(request.originalFilename, error) };
    }
    if (await cancelled(job, staged)) return { kind: 'cancelled' };

    let library: LibraryRecord;
    try {
      library = await dependencies.readLibrary(dependencies.repositoryOptions) ?? emptyLibrary();
    } catch (error) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return { kind: 'failed', error: commitFailure(request.originalFilename, error) };
    }
    if (await cancelled(job, staged)) return { kind: 'cancelled' };

    if (request.relinkTargetId === undefined) {
      let duplicate = decideDuplicate(library, contentHash, staged.byteSize);
      if (duplicate.kind === 'duplicate') {
        const availability = await dependencies.audioStore.checkAvailable(
          duplicate.item.source.reference,
        );
        if (availability === 'missing') duplicate = { kind: 'reattach', item: duplicate.item };
      }
      if (await cancelled(job, staged)) return { kind: 'cancelled' };
      if (duplicate.kind === 'duplicate') {
        await dependencies.audioStore.discard(staged);
        try {
          await request.onCommitted?.(duplicate.item.id);
        } catch (error) {
          return { kind: 'failed', error: commitFailure(request.originalFilename, error) };
        }
        await cleanupSource(request.sourceUri);
        return { kind: 'duplicate', musicItemId: duplicate.item.id };
      }

      update(job, 'probing');
      let durationMs: number;
      try {
        durationMs = Math.max(1, Math.round(
          await dependencies.audioStore.probeDuration(staged, IMPORT_DECODE_TIMEOUT_MS),
        ));
      } catch (error) {
        await dependencies.audioStore.discard(staged).catch(() => undefined);
        return { kind: 'failed', error: decodeFailure(request.originalFilename, error) };
      }
      if (await cancelled(job, staged)) return { kind: 'cancelled' };

      update(job, 'committing');
      if (duplicate.kind === 'reattach') {
        const item: MusicItem = {
          ...duplicate.item,
          originalFilename: request.originalFilename,
          extension: validation.extension,
          byteSize: staged.byteSize,
          contentHash,
          durationMs,
        };
        return commitLibraryItem(
          job,
          library,
          item,
          staged,
          validation.extension,
          duplicate.item.source.reference,
        );
      }

      const id = dependencies.audioStore.randomUUID();
      const now = (dependencies.now ?? (() => new Date()))().toISOString();
      const item: MusicItem = {
        id,
        source: { provider: 'local', reference: '' },
        displayTitle: titleFromFilename(request.originalFilename),
        originalFilename: request.originalFilename,
        extension: validation.extension,
        byteSize: staged.byteSize,
        contentHash,
        durationMs,
        addedAt: now,
        lastPlayedAt: null,
        availability: 'available',
        removed: false,
        collectionIds: [IMPORTED_MUSIC_COLLECTION_ID],
      };
      return commitLibraryItem(job, library, item, staged, validation.extension);
    }

    const target = library.items[request.relinkTargetId];
    if (!target) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return {
        kind: 'failed',
        error: new ImportError('targetMissing', 'The song to relink is no longer in the library.'),
      };
    }

    update(job, 'probing');
    let durationMs: number;
    try {
      durationMs = Math.max(1, Math.round(
        await dependencies.audioStore.probeDuration(staged, IMPORT_DECODE_TIMEOUT_MS),
      ));
    } catch (error) {
      await dependencies.audioStore.discard(staged).catch(() => undefined);
      return { kind: 'failed', error: decodeFailure(request.originalFilename, error) };
    }
    if (await cancelled(job, staged)) return { kind: 'cancelled' };

    const chosen: RelinkCandidate = {
      originalFilename: request.originalFilename,
      contentHash,
      byteSize: staged.byteSize,
      durationMs,
    };
    const decision = decideRelink(target, chosen, true);
    if (decision === 'looksOriginal' || decision === 'confirmMismatch') {
      pendingRelinks.set(staged.stagingRef, {
        request,
        target,
        staged,
        chosen,
        extension: validation.extension,
        decision,
      });
      return {
        kind: 'relinkNeedsConfirm',
        musicItemId: target.id,
        staged,
        chosen,
        decision,
      };
    }

    update(job, 'committing');
    const updated: MusicItem = {
      ...target,
      source: { provider: 'local', reference: '' },
      originalFilename: request.originalFilename,
      extension: validation.extension,
      byteSize: staged.byteSize,
      contentHash,
      durationMs,
    };
    return commitLibraryItem(
      job,
      library,
      updated,
      staged,
      validation.extension,
      target.source.reference,
    );
  };

  const runWorker = async (): Promise<void> => {
    if (workerRunning) return;
    workerRunning = true;
    try {
      while (queue.length > 0) {
        const job = queue.shift();
        if (!job) continue;
        activeJob = job;
        emit();
        let outcome: ImportOutcome;
        try {
          outcome = await execute(job);
        } catch (error) {
          outcome = {
            kind: 'failed',
            error: commitFailure(job.request.originalFilename, error),
          };
        }
        if (outcome.kind === 'failed') update(job, 'failed', false, outcome.error.message);
        job.resolve(outcome);
        if (outcome.kind === 'failed') failedJobs.push(job);
        activeJob = null;
        emit();
      }
    } finally {
      workerRunning = false;
    }
  };

  const enqueueImport = (request: ImportRequest): Promise<ImportOutcome> => {
    const id = dependencies.audioStore.randomUUID();
    const promise = new Promise<ImportOutcome>(resolve => {
      queue.push({
        request,
        resolve,
        cancelRequested: false,
        commitStarted: false,
        view: {
          id,
          origin: request.origin,
          originalFilename: request.originalFilename,
          status: 'queued',
          progress: null,
          cancellable: true,
          error: null,
        },
      });
    });
    emit();
    void runWorker();
    return promise;
  };

  const resolveRelinkConfirmation = async (
    stagingRef: string,
    useFile: boolean,
  ): Promise<ImportOutcome> => {
    const pending = pendingRelinks.get(stagingRef);
    if (!pending) {
      return {
        kind: 'failed',
        error: new ImportError('stagedAudioMissing', 'The selected relink file is no longer available.'),
      };
    }
    pendingRelinks.delete(stagingRef);
    const id = dependencies.audioStore.randomUUID();
    const promise = new Promise<ImportOutcome>(resolve => {
      queue.push({
        request: pending.request,
        resolve,
        cancelRequested: false,
        commitStarted: true,
        relinkContinuation: { ...pending, useFile },
        view: {
          id,
          origin: 'relink',
          originalFilename: pending.request.originalFilename,
          status: 'queued',
          progress: null,
          cancellable: false,
          error: null,
        },
      });
    });
    emit();
    void runWorker();
    return promise;
  };

  return {
    enqueueImport,
    cancelImport(jobId: string): void {
      const job = activeJob?.view.id === jobId
        ? activeJob
        : queue.find(candidate => candidate.view.id === jobId);
      if (!job || job.commitStarted) return;
      job.cancelRequested = true;
      emit();
    },
    subscribeImportJobs(observer: ImportJobObserver): () => void {
      observers.add(observer);
      try {
        observer(currentViews());
      } catch (error) {
        (dependencies.logError ?? console.error)('Import job observer failed', error);
      }
      return () => observers.delete(observer);
    },
    importJobs: currentViews,
    dismissImportJob(jobId: string): void {
      const index = failedJobs.findIndex(job => job.view.id === jobId);
      if (index < 0) return;
      failedJobs.splice(index, 1);
      emit();
    },
    resolveRelinkConfirmation,
  };
}

const pipeline = createImportPipeline({
  audioStore,
  readLibrary: readLibraryStrict,
  mutateLibrary,
});

const enqueueImportRaw = pipeline.enqueueImport;

/** Import for user-facing flows, refresh the mirror, then open the committed library item. */
export const enqueueImport = async (request: ImportRequest): Promise<ImportOutcome> => {
  const outcome = await enqueueImportRaw(request);
  if (request.origin === 'migration'
    || (outcome.kind !== 'created'
      && outcome.kind !== 'duplicate'
      && outcome.kind !== 'reattached')) return outcome;

  const library = await readLibraryStrict();
  if (library !== null) useStudioStore.setState({ libraryItems: library.items });
  const item = library?.items[outcome.musicItemId];
  const { requestTrackSwitch } = await import('./trackSwitch');
  await requestTrackSwitch({
    musicItemId: outcome.musicItemId,
    origin: outcome.kind === 'duplicate'
      ? 'duplicate'
      : request.origin === 'openIn' ? 'openIn' : 'library',
    rebuildQueue: request.origin === 'picker' || request.origin === 'openIn',
  });
  if (outcome.kind === 'duplicate') {
    useStudioStore.getState().notify(
      `“${item?.displayTitle ?? request.originalFilename}” is already in your library`,
    );
  } else {
    useStudioStore.getState().notify(
      `Imported “${item?.displayTitle ?? request.originalFilename}”`,
    );
  }
  return outcome;
};
export const cancelImport = pipeline.cancelImport;
export const subscribeImportJobs = pipeline.subscribeImportJobs;
export const getImportJobs = pipeline.importJobs;
export const dismissImportJob = pipeline.dismissImportJob;
export const resolveRelinkConfirmation = pipeline.resolveRelinkConfirmation;

export const migrationImporter = async (
  request: ImportRequest & { origin: 'migration' },
): Promise<{ kind: 'imported'; musicItemId: string } | { kind: 'failed'; error: unknown }> => {
  const outcome = await enqueueImport(request);
  if (
    outcome.kind === 'created'
    || outcome.kind === 'duplicate'
    || outcome.kind === 'reattached'
  ) {
    return { kind: 'imported', musicItemId: outcome.musicItemId };
  }
  if (outcome.kind === 'failed') return outcome;
  return { kind: 'failed', error: new Error(`Unexpected migration import outcome: ${outcome.kind}`) };
};
