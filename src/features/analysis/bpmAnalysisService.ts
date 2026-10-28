import type { MusicItem } from '../../types/library';
import { AppState } from 'react-native';
import type { AnalysisJobView } from '../../types/analysis';
import { analyzeBpm, ANALYZER_VERSION } from '../../services/bpmAnalysis';
import { capabilitiesFor, resolveSource } from '../library/sourceResolver';
import { readLibraryStrict } from '../library/repositories';
import { readAnalysis, removeAnalysis, writeAnalysis } from './analysisRepository';

type AnalysisObserver = (jobs: Readonly<Record<string, AnalysisJobView>>) => void;

const queue: string[] = [];
const jobs = new Map<string, AnalysisJobView>();
const controllers = new Map<string, AbortController>();
const activeRuns = new Map<string, Promise<void>>();
const observers = new Set<AnalysisObserver>();
let workerRunning = false;
let appPaused = AppState.currentState !== 'active';
const backgroundRequeue = new Set<string>();

const snapshot = (): Record<string, AnalysisJobView> => Object.fromEntries(
  Array.from(jobs, ([musicItemId, job]) => [musicItemId, { ...job }]),
);

const emit = (): void => {
  const current = snapshot();
  observers.forEach(observer => {
    try {
      observer(current);
    } catch (error) {
      console.error('BPM analysis observer failed', error);
    }
  });
};

const update = (musicItemId: string, patch: Partial<AnalysisJobView>): void => {
  const current = jobs.get(musicItemId) ?? {
    musicItemId,
    status: 'queued' as const,
    progress: 0,
    result: null,
    error: null,
  };
  jobs.set(musicItemId, { ...current, ...patch });
  emit();
};

const itemFor = async (musicItemId: string): Promise<MusicItem | null> => {
  const item = (await readLibraryStrict())?.items[musicItemId];
  return item && !item.removed ? item : null;
};

const runOne = async (musicItemId: string): Promise<void> => {
  const item = await itemFor(musicItemId);
  if (item === null || item.contentHash === null || !capabilitiesFor(item).decodedAudioAnalysis) {
    update(musicItemId, { status: 'unavailable', progress: 0, result: null, error: null });
    return;
  }

  const cached = await readAnalysis(musicItemId);
  if (cached?.result.audioFingerprint === item.contentHash
    && cached.result.analyzerVersion === ANALYZER_VERSION) {
    update(musicItemId, { status: 'success', progress: 1, result: cached.result, error: null });
    return;
  }

  const controller = new AbortController();
  controllers.set(musicItemId, controller);
  update(musicItemId, { status: 'running', progress: 0, result: null, error: null });
  try {
    const { uri } = await resolveSource(item);
    const result = await analyzeBpm({
      audioUri: uri,
      audioFingerprint: item.contentHash,
      signal: controller.signal,
      onProgress: progress => update(musicItemId, {
        status: 'running',
        progress: Math.max(0, Math.min(1, progress)),
      }),
    });
    if (controller.signal.aborted && backgroundRequeue.has(musicItemId)) {
      update(musicItemId, { status: 'queued', progress: 0, result: null, error: null });
      return;
    }
    if (controller.signal.aborted) {
      update(musicItemId, { status: 'cancelled', progress: 0, result: null, error: null });
      return;
    }
    if (result === null) {
      update(musicItemId, { status: 'unavailable', progress: 0, result: null, error: null });
      return;
    }
    await writeAnalysis(musicItemId, { schemaVersion: 1, musicItemId, result });
    update(musicItemId, { status: 'success', progress: 1, result, error: null });
  } catch (error) {
    if (backgroundRequeue.has(musicItemId)) {
      update(musicItemId, { status: 'queued', progress: 0, result: null, error: null });
    } else if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      update(musicItemId, { status: 'cancelled', progress: 0, result: null, error: null });
    } else {
      update(musicItemId, {
        status: 'failed',
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : 'BPM analysis failed',
      });
    }
  } finally {
    controllers.delete(musicItemId);
    backgroundRequeue.delete(musicItemId);
  }
};

const drain = async (): Promise<void> => {
  if (workerRunning) return;
  workerRunning = true;
  try {
    while (!appPaused && queue.length > 0) {
      const musicItemId = queue.shift();
      if (musicItemId !== undefined) {
        const run = runOne(musicItemId);
        activeRuns.set(musicItemId, run);
        try {
          await run;
        } finally {
          if (activeRuns.get(musicItemId) === run) activeRuns.delete(musicItemId);
        }
      }
    }
  } finally {
    workerRunning = false;
  }
};

AppState.addEventListener('change', nextState => {
  const wasPaused = appPaused;
  appPaused = nextState !== 'active';
  if (appPaused) {
    controllers.forEach((controller, musicItemId) => {
      backgroundRequeue.add(musicItemId);
      if (!queue.includes(musicItemId)) queue.unshift(musicItemId);
      controller.abort();
      update(musicItemId, { status: 'queued', progress: 0, result: null, error: null });
    });
  } else if (wasPaused) {
    void drain();
  }
});

/** Enqueue without blocking import/playback; duplicate requests share one job. */
export const enqueueAnalysis = (musicItemId: string, prioritize = false): void => {
  const active = jobs.get(musicItemId);
  if (active?.status === 'queued' || active?.status === 'running') return;
  update(musicItemId, { status: 'queued', progress: 0, result: null, error: null });
  if (prioritize) queue.unshift(musicItemId);
  else queue.push(musicItemId);
  void drain();
};

export const cancelAnalysis = (musicItemId: string): void => {
  const queuedIndex = queue.indexOf(musicItemId);
  if (queuedIndex >= 0) queue.splice(queuedIndex, 1);
  controllers.get(musicItemId)?.abort();
  if (jobs.has(musicItemId)) {
    update(musicItemId, { status: 'cancelled', progress: 0, result: null, error: null });
  }
};

export const retryAnalysis = (musicItemId: string): void => {
  cancelAnalysis(musicItemId);
  enqueueAnalysis(musicItemId, true);
};

export const invalidateAnalysis = async (musicItemId: string): Promise<void> => {
  cancelAnalysis(musicItemId);
  await activeRuns.get(musicItemId)?.catch(() => undefined);
  jobs.delete(musicItemId);
  emit();
  await removeAnalysis(musicItemId);
};

export const subscribeAnalysisJobs = (observer: AnalysisObserver): (() => void) => {
  observers.add(observer);
  observer(snapshot());
  return () => observers.delete(observer);
};

export const getAnalysisJobs = (): Readonly<Record<string, AnalysisJobView>> => snapshot();
