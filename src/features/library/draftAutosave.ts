import { useStudioStore, type StudioStore } from '../../hooks/useStudioStore';
import type { SongDraft } from '../../types/project';
import { computeContentFingerprint, contentFingerprintsEqual } from '../../utils/contentFingerprint';
import { deriveDraftUiState } from '../../utils/draftResolution';
import {
  DRAFT_AUTOSAVE_DEBOUNCE_MS,
  DRAFT_FLUSH_TIMEOUT_MS,
} from '../../utils/libraryConstants';
import { extractPersistedContent } from '../../utils/persistedContent';
import type { PersistenceIssue } from './persistencePipeline';
import { writeDraftSnapshot, type RepositoryOptions } from './repositories';

export type DraftFlushResult = 'written' | 'skipped' | 'failed' | 'timeout';

export const DRAFT_ISSUE_LABEL_PREFIX = 'draft:';
export const DRAFT_NOT_SAVED_MESSAGE = 'Draft not saved. Your latest changes are only on screen.';

type StoreSetState = typeof useStudioStore.setState;
type StoreGetState = typeof useStudioStore.getState;
type StoreSubscribe = typeof useStudioStore.subscribe;

export interface DraftAutosaveDependencies {
  getState: StoreGetState;
  setState: StoreSetState;
  subscribe: StoreSubscribe;
  now: () => number;
  writeSnapshot: (
    musicItemId: string,
    snapshot: () => SongDraft | null,
    onCommitted: (draft: SongDraft | null) => void,
    options?: RepositoryOptions,
  ) => Promise<void>;
}

export interface DraftAutosaveController {
  start: () => () => void;
  stop: () => void;
  flush: (timeoutMs: number) => Promise<DraftFlushResult>;
  retryFailed: () => Promise<DraftFlushResult>;
}

const defaultDependencies: DraftAutosaveDependencies = {
  getState: useStudioStore.getState,
  setState: useStudioStore.setState,
  subscribe: useStudioStore.subscribe,
  now: Date.now,
  writeSnapshot: writeDraftSnapshot,
};

const persistedTuple = (state: StudioStore): readonly unknown[] => [
  state.allLayersData,
  state.bpm,
  state.stemCount,
  state.viewMode,
  state.showGridLines,
  state.layerSpecificNavigation,
  state.primaryView,
  state.countSize,
  state.showDanceCounts,
  state.beatAnchorMs,
  state.phraseStartMs,
  state.manuallyOverriddenBpm,
  state.manuallyOverriddenAnchor,
  state.rowDensity,
  state.followPlayhead,
  state.playbackSpeed,
  state.loopStartMs,
  state.loopEndMs,
  state.isLoopRangeEnabled,
];

const shallowTupleEqual = (left: readonly unknown[], right: readonly unknown[]): boolean => (
  left.length === right.length && left.every((value, index) => Object.is(value, right[index]))
);

const draftIssueLabel = (musicItemId: string): string => (
  `${DRAFT_ISSUE_LABEL_PREFIX}${musicItemId}`
);

/** Build an independently testable autosave scheduler around the shared studio store. */
export function createDraftAutosave(
  dependencies: DraftAutosaveDependencies = defaultDependencies,
): DraftAutosaveController {
  let unsubscribe: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let firstUnwrittenAt: number | null = null;
  let changeSequence = 0;
  let failedMusicItemId: string | null = null;
  let writeInFlight: Promise<DraftFlushResult> | null = null;
  let active = false;

  const clearTimer = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const removeDraftIssue = (musicItemId: string): void => {
    const label = draftIssueLabel(musicItemId);
    dependencies.setState((state: StudioStore) => ({
      persistenceIssues: state.persistenceIssues.filter(issue => issue.label !== label),
    }));
  };

  const upsertDraftIssue = (
    musicItemId: string,
    error: unknown,
    reportedIssue: PersistenceIssue | null,
  ): void => {
    const label = draftIssueLabel(musicItemId);
    const issue: PersistenceIssue = {
      kind: reportedIssue?.kind ?? 'writeFailed',
      label,
      message: DRAFT_NOT_SAVED_MESSAGE,
      ...(reportedIssue?.message && reportedIssue.message !== DRAFT_NOT_SAVED_MESSAGE
        ? { detail: reportedIssue.message }
        : {}),
      error,
      retry: async () => {
        const result = await controller.retryFailed();
        if (result === 'failed' || result === 'timeout') throw error;
      },
    };
    dependencies.setState((state: StudioStore) => ({
      persistenceIssues: [
        ...state.persistenceIssues.filter(existing => existing.label !== label),
        issue,
      ],
    }));
  };

  const recomputeDraftState = (musicItemId: string): void => {
    const state = dependencies.getState();
    if (state.currentMusicItemId !== musicItemId || !state.songLoaded) return;
    const content = extractPersistedContent(state);
    const fingerprint = computeContentFingerprint(content);
    const draft: SongDraft = {
      schemaVersion: 1,
      musicItemId,
      baseline: state.draftBaseline,
      baselineFingerprint: state.draftBaselineFingerprint,
      content,
      updatedAt: new Date(dependencies.now()).toISOString(),
    };
    dependencies.setState({ draftUiState: deriveDraftUiState(draft, fingerprint) });
  };

  const armTimer = (): void => {
    clearTimer();
    if (!active) return;
    const state = dependencies.getState();
    if (state.libraryStatus !== 'ready' || !state.songLoaded || state.currentMusicItemId === null) {
      firstUnwrittenAt = null;
      return;
    }
    if (state.saveInProgress) return;
    const now = dependencies.now();
    if (firstUnwrittenAt === null) firstUnwrittenAt = now;
    const remainingMaxLatency = firstUnwrittenAt + DRAFT_FLUSH_TIMEOUT_MS - now;
    const delay = Math.max(0, Math.min(DRAFT_AUTOSAVE_DEBOUNCE_MS, remainingMaxLatency));
    timer = setTimeout(() => {
      timer = null;
      void writeOnce();
    }, delay);
  };

  const writeOnce = (): Promise<DraftFlushResult> => {
    if (writeInFlight !== null) return writeInFlight;
    const requestedItemId = dependencies.getState().currentMusicItemId;
    if (requestedItemId === null) return Promise.resolve('skipped');

    let writtenFingerprint: string | null = null;
    let snapshotSequence = -1;
    let firstUnwrittenBeforeWrite: number | null = null;
    let capturedFirstUnwritten = false;
    let matchedDurableFingerprint = false;
    let reportedIssue: PersistenceIssue | null = null;

    writeInFlight = dependencies.writeSnapshot(requestedItemId, () => {
      const state = dependencies.getState();
      if (state.libraryStatus !== 'ready' || !state.songLoaded
        || state.currentMusicItemId !== requestedItemId || state.saveInProgress) return null;

      const content = extractPersistedContent(state);
      const fingerprint = computeContentFingerprint(content);
      snapshotSequence = changeSequence;
      if (!capturedFirstUnwritten) {
        firstUnwrittenBeforeWrite = firstUnwrittenAt;
        capturedFirstUnwritten = true;
      }
      firstUnwrittenAt = null;
      if (contentFingerprintsEqual(fingerprint, state.lastWrittenFingerprint)) {
        matchedDurableFingerprint = true;
        return null;
      }

      writtenFingerprint = fingerprint;
      return {
        schemaVersion: 1,
        musicItemId: requestedItemId,
        baseline: state.draftBaseline,
        baselineFingerprint: state.draftBaselineFingerprint,
        content,
        updatedAt: new Date(dependencies.now()).toISOString(),
      };
    }, (committedDraft) => {
      writtenFingerprint = committedDraft === null
        ? null
        : computeContentFingerprint(committedDraft.content);
    }, {
      onIssue: issue => { reportedIssue = issue; },
    }).then(() => {
      if (writtenFingerprint === null) {
        if (matchedDurableFingerprint) {
          failedMusicItemId = failedMusicItemId === requestedItemId ? null : failedMusicItemId;
          removeDraftIssue(requestedItemId);
        }
        recomputeDraftState(requestedItemId);
        return 'skipped' as const;
      }
      const fingerprint = writtenFingerprint;
      dependencies.setState((state: StudioStore) => (
        state.currentMusicItemId === requestedItemId
          ? { lastWrittenFingerprint: fingerprint }
          : {}
      ));
      failedMusicItemId = failedMusicItemId === requestedItemId ? null : failedMusicItemId;
      removeDraftIssue(requestedItemId);
      recomputeDraftState(requestedItemId);
      return 'written' as const;
    }).catch((error: unknown) => {
      if (firstUnwrittenAt === null) firstUnwrittenAt = firstUnwrittenBeforeWrite;
      failedMusicItemId = requestedItemId;
      upsertDraftIssue(requestedItemId, error, reportedIssue);
      recomputeDraftState(requestedItemId);
      return 'failed' as const;
    }).finally(() => {
      writeInFlight = null;
      if (active && snapshotSequence >= 0 && changeSequence > snapshotSequence) armTimer();
    });
    return writeInFlight;
  };

  const flushLatest = async (): Promise<DraftFlushResult> => {
    clearTimer();
    const firstResult = await writeOnce();
    if (firstResult === 'failed') return firstResult;

    const state = dependencies.getState();
    if (state.currentMusicItemId === null || state.libraryStatus !== 'ready' || !state.songLoaded) {
      return firstResult;
    }
    const latestFingerprint = computeContentFingerprint(extractPersistedContent(state));
    if (contentFingerprintsEqual(latestFingerprint, state.lastWrittenFingerprint)) return firstResult;
    return writeOnce();
  };

  const controller: DraftAutosaveController = {
    start: () => {
      if (unsubscribe !== null) return controller.stop;
      active = true;
      let previousTuple = persistedTuple(dependencies.getState());
      unsubscribe = dependencies.subscribe((state) => {
        const nextTuple = persistedTuple(state);
        if (shallowTupleEqual(previousTuple, nextTuple)) return;
        previousTuple = nextTuple;
        if (state.libraryStatus !== 'ready' || !state.songLoaded
          || state.currentMusicItemId === null) return;
        changeSequence += 1;
        // The switch guard must reflect authored changes immediately; only the
        // durable write is debounced.
        recomputeDraftState(state.currentMusicItemId);
        armTimer();
      });
      return controller.stop;
    },
    stop: () => {
      active = false;
      clearTimer();
      unsubscribe?.();
      unsubscribe = null;
      firstUnwrittenAt = null;
    },
    flush: async (timeoutMs) => {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const timeoutResult = new Promise<DraftFlushResult>(resolve => {
        timeout = setTimeout(() => resolve('timeout'), Math.max(0, timeoutMs));
      });
      const result = await Promise.race([flushLatest(), timeoutResult]);
      if (timeout !== null) clearTimeout(timeout);
      return result;
    },
    retryFailed: () => (
      failedMusicItemId === dependencies.getState().currentMusicItemId
        ? controller.flush(DRAFT_FLUSH_TIMEOUT_MS)
        : Promise.resolve('skipped')
    ),
  };

  return controller;
}

let activeController: DraftAutosaveController | null = null;

/** Start autosave after library boot and return an idempotent cleanup function. */
export function startDraftAutosave(): () => void {
  activeController?.stop();
  const controller = createDraftAutosave();
  activeController = controller;
  controller.start();
  return () => {
    controller.stop();
    if (activeController === controller) activeController = null;
  };
}

/** Flush the latest authored state before suspension or a track switch. */
export function flushDraft(timeoutMs: number): Promise<DraftFlushResult> {
  return activeController?.flush(timeoutMs) ?? Promise.resolve('skipped');
}

/** Retry the current song's last failed draft write, if any. */
export function retryFailedDraft(): Promise<DraftFlushResult> {
  return activeController?.retryFailed() ?? Promise.resolve('skipped');
}
