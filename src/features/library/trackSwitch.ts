import { useStudioStore, type StudioStore, type SwitchDestination } from '../../hooks/useStudioStore';
import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type LibraryRecord,
  type MusicItem,
} from '../../types/library';
import type { PersistedContent, SavedProject, SongDraft } from '../../types/project';
import { computeContentFingerprint } from '../../utils/contentFingerprint';
import { decideSwitchGuard, deriveDraftUiState, resolveSongLoad } from '../../utils/draftResolution';
import {
  DRAFT_FLUSH_TIMEOUT_MS,
  IMPORT_DECODE_TIMEOUT_MS,
} from '../../utils/libraryConstants';
import {
  applyPersistedContent,
  createEmptyPersistedContent,
  extractPersistedContent,
  splitProjectEnvelope,
} from '../../utils/persistedContent';
import audioStore from './audioStore';
import { flushDraft, type DraftFlushResult } from './draftAutosave';
import {
  commitTrackSwitch,
  mutateLibrary,
  readDraft,
  readProject,
  readProjectIndex,
  type RepositoryOptions,
} from './repositories';
import { resolveSource } from './sourceResolver';
import type { SaveResult } from './projectService';
import { buildQueue, nextSkipCandidate } from '../../utils/queueOrder';
import type { PlaybackQueue } from '../../types/queue';

const PLAYER_LOAD_TIMEOUT_MS = 10_000;

export type SwitchRequest = SwitchDestination;

export interface SwitchFailure {
  kind: 'draftFlush' | 'missingAudio' | 'resolveFailed' | 'playerFailed';
  musicItemId: string;
  title: string;
  message: string;
  retry: () => Promise<SwitchResult>;
  skip?: () => Promise<SwitchResult>;
  canRelink: boolean;
  canSkip: boolean;
}

export type SwitchResult =
  | { kind: 'committed'; musicItemId: string }
  | { kind: 'cancelled' }
  | { kind: 'superseded' }
  | { kind: 'failed'; reason: SwitchFailure };

export type SwitchGuardChoice = 'save' | 'keepDraft' | 'cancel' | 'saved';
export type SwitchGuardResolution = SwitchResult | { kind: 'saveResult'; result: SaveResult };

export interface TrackSwitchPlayer {
  pause(): void | Promise<void>;
  play(): void | Promise<void>;
  seekTo(milliseconds: number): void | Promise<void>;
  waitUntilLoaded(uri: string, timeoutMs: number): Promise<void>;
}

interface ResolvedTrack {
  item: MusicItem;
  uri: string;
  durationMs: number;
  content: PersistedContent;
  baseline: StudioStore['draftBaseline'];
  baselineFingerprint: string | null;
  baselineName: string | null;
  lastWrittenFingerprint: string | null;
  draftUiState: StudioStore['draftUiState'];
  loadedProjectSource: SavedProject | null;
}

interface SourceSnapshot {
  musicItemId: string | null;
  audioUri: string | null;
  audioFilename: string | null;
  content: PersistedContent;
  songDuration: number;
  baseline: StudioStore['draftBaseline'];
  baselineFingerprint: string | null;
  baselineName: string | null;
  lastWrittenFingerprint: string | null;
  draftUiState: StudioStore['draftUiState'];
  queueIndex: number | null;
  queue: PlaybackQueue | null;
  currentTime: number;
  loadedProjectSource: SavedProject | null;
}

export interface TrackSwitchDependencies {
  getState: typeof useStudioStore.getState;
  setState: typeof useStudioStore.setState;
  flushDraft: (timeoutMs: number) => Promise<DraftFlushResult>;
  readDraft: typeof readDraft;
  readProject: typeof readProject;
  readProjectIndex: typeof readProjectIndex;
  resolveSource: typeof resolveSource;
  checkAvailable: typeof audioStore.checkAvailable;
  probePlayableDuration: typeof audioStore.probePlayableDuration;
  mutateLibrary: typeof mutateLibrary;
  commitTrackSwitch: typeof commitTrackSwitch;
  saveCurrent: () => Promise<SaveResult>;
  player: TrackSwitchPlayer;
  now: () => Date;
}

type PlayerSnapshot = {
  uri: string | null;
  isLoaded: boolean;
  pause: () => void | Promise<void>;
  play: () => void | Promise<void>;
  seekTo: (milliseconds: number) => void | Promise<void>;
};

let playerSnapshot: PlayerSnapshot | null = null;
const playerListeners = new Set<() => void>();

/** Publish the current Expo player instance/status for the transaction coordinator. */
export function updateTrackSwitchPlayer(snapshot: PlayerSnapshot | null): void {
  playerSnapshot = snapshot;
  playerListeners.forEach(listener => listener());
}

/** Stop the currently registered player before its managed source is removed. */
export async function pauseTrackSwitchPlayer(): Promise<void> {
  if (playerSnapshot !== null) await playerSnapshot.pause();
}

/** Resume a player paused only to attempt removal when that removal fails. */
export async function resumeTrackSwitchPlayer(): Promise<void> {
  if (playerSnapshot !== null) await playerSnapshot.play();
}

const currentPlayer = (): PlayerSnapshot => {
  if (playerSnapshot === null) throw new Error('Audio player is not ready');
  return playerSnapshot;
};

const defaultPlayer: TrackSwitchPlayer = {
  pause: () => currentPlayer().pause(),
  play: () => currentPlayer().play(),
  seekTo: milliseconds => currentPlayer().seekTo(milliseconds),
  waitUntilLoaded: (uri, timeoutMs) => new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      playerListeners.delete(check);
      if (error) reject(error);
      else resolve();
    };
    const check = (): void => {
      if (playerSnapshot?.uri === uri && playerSnapshot.isLoaded) finish();
    };
    const timeout = setTimeout(() => {
      finish(new Error('Timed out while loading audio'));
    }, timeoutMs);
    playerListeners.add(check);
    check();
  }),
};

const upsertPersistenceIssue = (issue: Parameters<NonNullable<RepositoryOptions['onIssue']>>[0]) => {
  useStudioStore.setState(state => ({
    persistenceIssues: [
      ...state.persistenceIssues.filter(existing => (
        existing.kind !== issue.kind || existing.label !== issue.label
      )),
      issue,
    ],
  }));
};

const defaultDependencies: TrackSwitchDependencies = {
  getState: useStudioStore.getState,
  setState: useStudioStore.setState,
  flushDraft,
  readDraft,
  readProject,
  readProjectIndex,
  resolveSource,
  checkAvailable: audioStore.checkAvailable,
  probePlayableDuration: audioStore.probePlayableDuration,
  mutateLibrary,
  commitTrackSwitch,
  saveCurrent: async () => (await import('./projectService')).saveCurrent(),
  player: defaultPlayer,
  now: () => new Date(),
};

const queueOrigin = (origin: SwitchRequest['origin']): boolean => (
  origin === 'queueNext' || origin === 'queuePrevious' || origin === 'queueFirst'
);

export function navigationBaseIndex(state: Pick<StudioStore,
  'queue' | 'pendingSwitchTargetId' | 'loadingMusicItemId'>): number | null {
  if (state.queue === null) return null;
  const targetId = state.pendingSwitchTargetId ?? state.loadingMusicItemId;
  if (targetId === null) return state.queue.currentIndex;
  const targetIndex = state.queue.order.indexOf(targetId);
  return targetIndex >= 0 ? targetIndex : state.queue.currentIndex;
}

const snapshotSource = (state: StudioStore): SourceSnapshot => ({
  musicItemId: state.currentMusicItemId,
  audioUri: state.currentAudioUri,
  audioFilename: state.currentAudioFilename,
  content: extractPersistedContent(state),
  songDuration: state.songDuration,
  baseline: state.draftBaseline,
  baselineFingerprint: state.draftBaselineFingerprint,
  baselineName: state.draftBaselineName,
  lastWrittenFingerprint: state.lastWrittenFingerprint,
  draftUiState: state.draftUiState,
  queueIndex: state.queue?.currentIndex ?? null,
  queue: state.queue,
  currentTime: state.currentTime,
  loadedProjectSource: state.loadedProjectSource as SavedProject | null,
});

const projectsForItem = (
  projects: Awaited<ReturnType<typeof readProjectIndex>>,
  musicItemId: string,
) => Object.values(projects?.projects ?? {}).filter(project => project.musicItemId === musicItemId);

async function resolveTrack(
  dependencies: TrackSwitchDependencies,
  request: SwitchRequest,
): Promise<ResolvedTrack> {
  const item = dependencies.getState().libraryItems[request.musicItemId];
  if (!item || item.removed) throw new Error('Music item is not available');
  if (item.availability !== 'available'
    || await dependencies.checkAvailable(item.source.reference) !== 'available') {
    throw new Error('MISSING_AUDIO');
  }

  const [{ uri }, draft, index] = await Promise.all([
    dependencies.resolveSource(item),
    dependencies.readDraft(item.id),
    dependencies.readProjectIndex(),
  ]);
  if (index === null) throw new Error('Project index is unavailable');
  const summaries = projectsForItem(index, item.id);
  const draftFingerprint = draft === null ? null : computeContentFingerprint(draft.content);
  const resolution = resolveSongLoad({
    draft,
    draftFingerprint,
    projects: summaries,
    explicitProjectId: request.explicitProjectId ?? null,
  });

  let content: PersistedContent;
  let baseline: SongDraft['baseline'] = null;
  let baselineFingerprint: string | null = null;
  let baselineName: string | null = null;
  let lastWrittenFingerprint: string | null = null;
  let loadedProjectSource: SavedProject | null = null;
  let draftUiState: StudioStore['draftUiState'] = 'emptyUnnamed';

  if (resolution.kind === 'openProject') {
    const project = await dependencies.readProject(resolution.projectId);
    if (project === null || project.musicItemId !== item.id) throw new Error('Project is unavailable');
    content = splitProjectEnvelope(project).content;
    baselineFingerprint = computeContentFingerprint(content);
    baseline = { projectId: project.projectId, revision: project.revision };
    baselineName = project.metadata.name;
    loadedProjectSource = project;
    draftUiState = 'saved';
  } else if (resolution.kind === 'restoreDraft' && draft !== null) {
    content = draft.content;
    baseline = resolution.asUnnamed
      ? null
      : resolution.advanceBaselineTo ?? draft.baseline;
    baselineFingerprint = baseline === null ? null : draft.baselineFingerprint;
    baselineName = baseline === null
      ? null
      : summaries.find(project => project.projectId === baseline?.projectId)?.name ?? null;
    lastWrittenFingerprint = resolution.advanceBaselineTo === undefined ? draftFingerprint : null;
    const effectiveDraft: SongDraft = { ...draft, baseline, baselineFingerprint };
    draftUiState = deriveDraftUiState(effectiveDraft, draftFingerprint);
    if (baseline !== null) loadedProjectSource = await dependencies.readProject(baseline.projectId);
  } else {
    content = createEmptyPersistedContent();
  }

  const durationMs = await dependencies.probePlayableDuration(uri, IMPORT_DECODE_TIMEOUT_MS);
  return {
    item,
    uri,
    durationMs,
    content,
    baseline,
    baselineFingerprint,
    baselineName,
    lastWrittenFingerprint,
    draftUiState,
    loadedProjectSource,
  };
}

const markMissing = async (
  dependencies: TrackSwitchDependencies,
  musicItemId: string,
): Promise<void> => {
  try {
    const library = await dependencies.mutateLibrary((current: LibraryRecord | null) => {
      const fallback: LibraryRecord = {
        schemaVersion: 1,
        items: dependencies.getState().libraryItems,
        collections: {},
      };
      const source = current ?? fallback;
      const item = source.items[musicItemId];
      if (!item) return { library: source, result: source };
      const nextLibrary: LibraryRecord = {
        ...source,
        items: {
          ...source.items,
          [musicItemId]: { ...item, availability: 'missing' as const },
        },
      };
      return {
        library: nextLibrary,
        result: nextLibrary,
      };
    }, { onIssue: upsertPersistenceIssue });
    dependencies.setState({ libraryItems: library.items });
  } catch {
    // The repository issue remains visible; switching still fails safely on the source song.
  }
};

const restoreSource = async (
  dependencies: TrackSwitchDependencies,
  source: SourceSnapshot,
): Promise<void> => {
  if (source.musicItemId === null) {
    dependencies.setState({
      ...applyPersistedContent(source.content),
      currentMusicItemId: null,
      currentAudioUri: null,
      currentAudioFilename: null,
      songLoaded: false,
      isPlaying: false,
      currentTime: source.currentTime,
      switchPhase: 'idle',
      loadingMusicItemId: null,
      queue: source.queue,
    });
    return;
  }
  if (source.audioUri === null) {
    dependencies.setState({
      ...applyPersistedContent(source.content),
      currentMusicItemId: source.musicItemId,
      currentAudioUri: null,
      currentAudioFilename: source.audioFilename,
      songDuration: source.songDuration,
      songLoaded: true,
      isPlaying: false,
      currentTime: source.currentTime,
      draftBaseline: source.baseline,
      draftBaselineFingerprint: source.baselineFingerprint,
      draftBaselineName: source.baselineName,
      lastWrittenFingerprint: source.lastWrittenFingerprint,
      draftUiState: source.draftUiState,
      loadedProjectSource: source.loadedProjectSource,
      switchPhase: 'idle',
      loadingMusicItemId: null,
      queue: source.queue,
    });
    return;
  }
  dependencies.getState().applyTrackState({
    musicItemId: source.musicItemId,
    audioUri: source.audioUri,
    audioFilename: source.audioFilename ?? 'Untitled',
    content: source.content,
    songDuration: source.songDuration,
    baseline: source.baseline,
    baselineFingerprint: source.baselineFingerprint,
    baselineName: source.baselineName,
    lastWrittenFingerprint: source.lastWrittenFingerprint,
    draftUiState: source.draftUiState,
    queueIndex: source.queueIndex ?? undefined,
    queue: source.queue,
    isPlaying: false,
    loadedProjectSource: source.loadedProjectSource,
  });
  await dependencies.player.waitUntilLoaded(source.audioUri, PLAYER_LOAD_TIMEOUT_MS);
  await dependencies.player.seekTo(source.currentTime);
  dependencies.setState({
    currentTime: source.currentTime,
    isPlaying: false,
    switchPhase: 'idle',
    loadingMusicItemId: null,
  });
};

const persistSuccessfulSwitch = async (
  dependencies: TrackSwitchDependencies,
  request: SwitchRequest,
  item: MusicItem,
): Promise<void> => {
  const state = dependencies.getState();
  const committed = await dependencies.commitTrackSwitch(
    item.id,
    state.queue,
    dependencies.now().toISOString(),
    { onIssue: upsertPersistenceIssue },
  );
  dependencies.setState({ libraryItems: committed.library.items, queue: committed.queue });
};

interface PendingRequest {
  request: SwitchRequest;
  resolve: (result: SwitchResult) => void;
}

export function createTrackSwitch(dependencies: TrackSwitchDependencies) {
  let active = false;
  let pending: PendingRequest | null = null;
  let guarded: PendingRequest | null = null;

  const failed = (
    request: SwitchRequest,
    kind: SwitchFailure['kind'],
    title: string,
    message: string,
    retry: () => Promise<SwitchResult> = () => requestTrackSwitch(request),
    skip?: () => Promise<SwitchResult>,
  ): SwitchResult => ({
    kind: 'failed',
    reason: {
      kind,
      musicItemId: request.musicItemId,
      title,
      message,
      retry,
      skip,
      canRelink: kind === 'missingAudio' || kind === 'resolveFailed',
      canSkip: skip !== undefined,
    },
  });

  const restorePlaybackIfNeeded = async (wasPlaying: boolean): Promise<void> => {
    if (!wasPlaying) return;
    await dependencies.player.play();
    dependencies.setState({ isPlaying: true });
  };

  const run = async (
    request: SwitchRequest,
    bypassGuard = false,
    guardWasShown = false,
    visited: ReadonlySet<string> = new Set(),
  ): Promise<SwitchResult> => {
    const initial = dependencies.getState();
    if (initial.saveInProgress) return { kind: 'cancelled' };
    if (!bypassGuard && decideSwitchGuard(initial.draftUiState) === 'prompt') {
      dependencies.setState({
        switchPhase: 'guard',
        switchGuard: { pendingDestination: request },
      });
      return new Promise<SwitchResult>(resolve => { guarded = { request, resolve }; });
    }

    const source = snapshotSource(initial);
    const wasPlaying = initial.isPlaying;
    if (wasPlaying) await dependencies.player.pause();
    dependencies.setState({ isPlaying: false, switchPhase: 'flushing' });
    const flushResult = await dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
    if (flushResult === 'failed' || flushResult === 'timeout') {
      dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
      await restorePlaybackIfNeeded(wasPlaying);
      return failed(
        request,
        'draftFlush',
        'Song Not Changed',
        "BeatNote couldn't save your draft, so the song wasn't changed.",
        () => drain(request, bypassGuard, guardWasShown, visited),
      );
    }

    dependencies.setState({ switchPhase: 'resolving', loadingMusicItemId: request.musicItemId });
    let destination: ResolvedTrack;
    try {
      destination = await resolveTrack(dependencies, request);
    } catch (error) {
      const missing = error instanceof Error && error.message === 'MISSING_AUDIO';
      if (missing) await markMissing(dependencies, request.musicItemId);
      dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
      await restorePlaybackIfNeeded(wasPlaying);
      const title = initial.libraryItems[request.musicItemId]?.displayTitle ?? 'Song';
      return failed(
        request,
        missing ? 'missingAudio' : 'resolveFailed',
        `Couldn't Open “${title}”`,
        missing
          ? 'The audio file is no longer available.'
          : error instanceof Error ? error.message : String(error),
        () => drain(request, bypassGuard, guardWasShown, visited),
        queueOrigin(request.origin)
          ? () => skipFromFailure(request, bypassGuard, guardWasShown, visited)
          : undefined,
      );
    }

    dependencies.setState({ switchPhase: 'committing' });
    const beforeCommit = dependencies.getState();
    const shouldRebuildQueue = request.rebuildQueue === true
      || ((request.origin === 'openIn' || request.origin === 'launch')
        && !beforeCommit.queue?.snapshot.includes(destination.item.id));
    let destinationQueue = beforeCommit.queue;
    if (shouldRebuildQueue) {
      destinationQueue = buildQueue(
        Object.values(beforeCommit.libraryItems),
        beforeCommit.queue?.collectionId ?? IMPORTED_MUSIC_COLLECTION_ID,
        beforeCommit.queue?.sortKey ?? beforeCommit.librarySort,
        destination.item.id,
      );
    } else if (destinationQueue !== null) {
      const matchingIndex = request.queueIndex
        ?? destinationQueue.order.indexOf(destination.item.id);
      if (matchingIndex >= 0) destinationQueue = { ...destinationQueue, currentIndex: matchingIndex };
    }
    dependencies.getState().applyTrackState({
      musicItemId: destination.item.id,
      audioUri: destination.uri,
      audioFilename: destination.item.originalFilename,
      content: destination.content,
      songDuration: destination.durationMs,
      baseline: destination.baseline,
      baselineFingerprint: destination.baselineFingerprint,
      baselineName: destination.baselineName,
      lastWrittenFingerprint: destination.lastWrittenFingerprint,
      draftUiState: destination.draftUiState,
      queueIndex: request.queueIndex,
      queue: destinationQueue,
      isPlaying: false,
      loadedProjectSource: destination.loadedProjectSource,
    });

    try {
      await dependencies.player.waitUntilLoaded(destination.uri, PLAYER_LOAD_TIMEOUT_MS);
    } catch (error) {
      dependencies.setState({ switchPhase: 'rollingBack' });
      try {
        await restoreSource(dependencies, source);
      } catch {
        dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null, isPlaying: false });
      }
      return failed(
        request,
        'playerFailed',
        `Couldn't Open “${destination.item.displayTitle}”`,
        error instanceof Error ? error.message : String(error),
        () => drain(request, bypassGuard, guardWasShown, visited),
        queueOrigin(request.origin)
          ? () => skipFromFailure(request, bypassGuard, guardWasShown, visited)
          : undefined,
      );
    }

    try {
      await persistSuccessfulSwitch(dependencies, request, destination.item);
    } catch (error) {
      dependencies.setState({ switchPhase: 'rollingBack' });
      try {
        await restoreSource(dependencies, source);
      } catch {
        dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null, isPlaying: false });
      }
      return failed(
        request,
        'resolveFailed',
        `Couldn't Open “${destination.item.displayTitle}”`,
        error instanceof Error ? error.message : String(error),
        () => drain(request, bypassGuard, guardWasShown, visited),
        queueOrigin(request.origin)
          ? () => skipFromFailure(request, bypassGuard, guardWasShown, visited)
          : undefined,
      );
    }
    dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
    if (wasPlaying && !guardWasShown) {
      await dependencies.player.play();
      dependencies.setState({ isPlaying: true });
    }
    if (request.origin === 'library') dependencies.setState({ isLibrarySheetOpen: false });
    return { kind: 'committed', musicItemId: destination.item.id };
  };

  const drain = async (
    request: SwitchRequest,
    bypassGuard = false,
    guardWasShown = false,
    visited: ReadonlySet<string> = new Set(),
  ): Promise<SwitchResult> => {
    if (request.origin === 'library') dependencies.setState({ librarySwitchFailure: null });
    active = true;
    let result: SwitchResult;
    try {
      result = await run(request, bypassGuard, guardWasShown, visited);
    } catch (error) {
      dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
      result = failed(
        request,
        'resolveFailed',
        'Song Not Changed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      active = false;
    }
    if (request.origin === 'library' && result.kind === 'failed') {
      dependencies.setState({
        librarySwitchFailure: {
          musicItemId: request.musicItemId,
          message: result.reason.message,
        },
      });
    }
    const next = pending;
    pending = null;
    dependencies.setState({ pendingSwitchTargetId: null });
    if (next !== null) {
      const nextResult = await drain(next.request);
      next.resolve(nextResult);
    }
    return result;
  };

  const skipFromFailure = (
    request: SwitchRequest,
    bypassGuard: boolean,
    guardWasShown: boolean,
    visited: ReadonlySet<string>,
  ): Promise<SwitchResult> => {
    const queue = dependencies.getState().queue;
    const direction: -1 | 1 = request.origin === 'queuePrevious' ? -1 : 1;
    const fromIndex = request.queueIndex ?? queue?.order.indexOf(request.musicItemId) ?? -1;
    const nextVisited = new Set(visited);
    nextVisited.add(request.musicItemId);
    const candidate = queue === null
      ? null
      : nextSkipCandidate(queue, fromIndex, direction, nextVisited);
    if (candidate === null) {
      return Promise.resolve(failed(
        request,
        'resolveFailed',
        'Song Not Changed',
        'No playable songs in this direction',
        () => drain(request, bypassGuard, guardWasShown, visited),
      ));
    }
    return drain({
      musicItemId: candidate.musicItemId,
      queueIndex: candidate.index,
      origin: direction === -1 ? 'queuePrevious' : 'queueNext',
    }, bypassGuard, guardWasShown, nextVisited);
  };

  const requestTrackSwitch = (request: SwitchRequest): Promise<SwitchResult> => {
    const state = dependencies.getState();
    if (state.switchPhase === 'guard') return Promise.resolve({ kind: 'cancelled' });
    if (!active) return drain(request);
    if (pending !== null) pending.resolve({ kind: 'superseded' });
    dependencies.setState({ pendingSwitchTargetId: request.musicItemId });
    return new Promise(resolve => { pending = { request, resolve }; });
  };

  const requestTrackSwitchWithoutGuard = (request: SwitchRequest): Promise<SwitchResult> => (
    drain(request, true)
  );

  const resolveSwitchGuard = async (
    choice: SwitchGuardChoice,
  ): Promise<SwitchGuardResolution> => {
    const guard = dependencies.getState().switchGuard;
    if (guard === null) return { kind: 'cancelled' };
    if (choice === 'cancel') {
      dependencies.setState({ switchGuard: null, switchPhase: 'idle' });
      const result: SwitchResult = { kind: 'cancelled' };
      guarded?.resolve(result);
      guarded = null;
      return result;
    }
    if (choice === 'save') {
      const result = await dependencies.saveCurrent();
      if (result.kind !== 'saved') {
        if (result.kind === 'failed' || result.kind === 'noSong') {
          dependencies.setState({ switchGuard: null, switchPhase: 'idle' });
          guarded?.resolve({ kind: 'cancelled' });
          guarded = null;
        }
        return { kind: 'saveResult', result };
      }
    }
    dependencies.setState({ switchGuard: null, switchPhase: 'idle' });
    let result: SwitchResult;
    try {
      result = await run(guard.pendingDestination, true, true);
    } catch (error) {
      dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
      result = failed(
        guard.pendingDestination,
        'resolveFailed',
        'Song Not Changed',
        error instanceof Error ? error.message : String(error),
      );
    }
    guarded?.resolve(result);
    guarded = null;
    return result;
  };

  return { requestTrackSwitch, requestTrackSwitchWithoutGuard, resolveSwitchGuard };
}

const defaultTrackSwitch = createTrackSwitch(defaultDependencies);

export const requestTrackSwitch = (request: SwitchRequest): Promise<SwitchResult> => (
  defaultTrackSwitch.requestTrackSwitch(request)
);

export const resolveSwitchGuard = (
  choice: SwitchGuardChoice,
): Promise<SwitchGuardResolution> => defaultTrackSwitch.resolveSwitchGuard(choice);

/** Restore a pre-delete source without prompting over the just-loaded destination draft. */
export const restoreTrackAfterDeleteFailure = (request: SwitchRequest): Promise<SwitchResult> => (
  defaultTrackSwitch.requestTrackSwitchWithoutGuard(request)
);

/** Seek the currently published player without replacing its source or playback state. */
export const seekCurrentTrack = async (milliseconds: number): Promise<void> => {
  await defaultPlayer.seekTo(milliseconds);
  useStudioStore.setState({ currentTime: milliseconds });
};
