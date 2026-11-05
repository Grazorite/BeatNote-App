import { AccessibilityInfo } from 'react-native';
import { useStudioStore, type StudioStore, type SwitchDestination } from '../../hooks/useStudioStore';
import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type LibraryRecord,
  type MusicItem,
} from '../../types/library';
import type { PersistedContent, SavedProject, SongDraft } from '../../types/project';
import { summarizeProjectEdits } from '../../utils/projectChangeSummary';
import { computeContentFingerprint, contentFingerprintsEqual } from '../../utils/contentFingerprint';
import { decideSwitchGuard, deriveDraftUiState, resolveSongLoad } from '../../utils/draftResolution';
import {
  DRAFT_FLUSH_TIMEOUT_MS,
  IMPORT_DECODE_TIMEOUT_MS,
} from '../../utils/libraryConstants';
import {
  applyPersistedContent,
  createEmptyPersistedContent,
  extractPersistedContent,
  projectContent,
  splitProjectEnvelope,
} from '../../utils/persistedContent';
import audioStore from './audioStore';
import { flushDraft, type DraftFlushResult } from './draftAutosave';
import {
  commitTrackSwitch,
  mutateLibrary,
  readDraftStrict,
  readProject,
  type RepositoryOptions,
} from './repositories';
import { resolveSource, SourceUnavailableError } from './sourceResolver';
import type { SaveResult } from './projectService';
import { buildQueue, nextSkipCandidate } from '../../utils/queueOrder';
import type { PlaybackQueue } from '../../types/queue';
import { perfBegin, perfEndAfterFrame } from '../../utils/perfMarks';
import { withAudioOperationTimeout } from '../../utils/audioOperationTimeout';

const PLAYER_LOAD_TIMEOUT_MS = 10_000;
const PLAYER_SEEK_TIMEOUT_MS = 5_000;
const PLAYER_COMMAND_TIMEOUT_MS = 2_000;
const TRACK_RESOLVE_TIMEOUT_MS = 12_000;

/** Compare once when switching, using the same authored snapshot as draft autosave. */
function switchChanges(state: StudioStore): string[] {
  const current = extractPersistedContent(state);
  if (contentFingerprintsEqual(computeContentFingerprint(current), state.draftBaselineFingerprint)) return [];
  const saved = state.loadedProjectSource;
  if (!saved || !state.draftBaseline || saved.projectId !== state.draftBaseline.projectId) {
    return ['The saved version is unavailable for comparison.'];
  }
  // Apply today's defaults to older projects just as the editor does on load.
  const before = extractPersistedContent({ ...applyPersistedContent(projectContent(saved)), loadedProjectSource: saved });
  const lines = summarizeProjectEdits(before, current);
  if (saved.revision !== state.draftBaseline.revision) lines.unshift('Compared with the newer saved version.');
  return lines;
}

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
  readDraft: typeof readDraftStrict;
  readProject: typeof readProject;
  resolveSource: typeof resolveSource;
  probePlayableDuration: typeof audioStore.probePlayableDuration;
  mutateLibrary: typeof mutateLibrary;
  commitTrackSwitch: typeof commitTrackSwitch;
  saveCurrent: () => Promise<SaveResult>;
  player: TrackSwitchPlayer;
  now: () => Date;
  announceQueueTitle: (title: string) => void;
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
  seekTo: milliseconds => withAudioOperationTimeout(
    currentPlayer().seekTo(milliseconds),
    PLAYER_SEEK_TIMEOUT_MS,
    'Audio seek during song switch',
  ),
  waitUntilLoaded: (uri, timeoutMs) => new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearInterval(poll);
      playerListeners.delete(check);
      if (error) reject(error);
      else resolve();
    };
    const check = (): void => {
      if (playerSnapshot?.uri !== uri) return;
      try {
        if (playerSnapshot.isLoaded) finish();
      } catch {
        // Expo may release the old player before React publishes its replacement.
      }
    };
    const timeout = setTimeout(() => {
      finish(new Error('Timed out while loading audio'));
    }, timeoutMs);
    const poll = setInterval(check, 150);
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
  readDraft: readDraftStrict,
  readProject,
  resolveSource,
  probePlayableDuration: audioStore.probePlayableDuration,
  mutateLibrary,
  commitTrackSwitch,
  saveCurrent: async () => (await import('./projectService')).saveCurrent(),
  player: defaultPlayer,
  now: () => new Date(),
  announceQueueTitle: title => AccessibilityInfo.announceForAccessibility(title),
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

async function resolveTrack(
  dependencies: TrackSwitchDependencies,
  request: SwitchRequest,
): Promise<ResolvedTrack> {
  const item = dependencies.getState().libraryItems[request.musicItemId];
  if (!item || item.removed) throw new Error('Music item is not available');
  if (item.availability !== 'available') throw new SourceUnavailableError(item);

  const [{ uri }, draft] = await Promise.all([
    dependencies.resolveSource(item),
    dependencies.readDraft(item.id),
  ]);
  // Boot reconciles this index and project mutations maintain it. Read only this song's content.
  const summaries = Object.values(dependencies.getState().projectSummaries)
    .filter(project => project.musicItemId === item.id);
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

  // Import already validated and persisted the duration. Re-probing here created a second native
  // player on every library tap and made long songs appear to hang before the real player loaded.
  // Only legacy/migrated records without usable metadata need the bounded compatibility probe.
  const durationMs = typeof item.durationMs === 'number'
    && Number.isFinite(item.durationMs)
    && item.durationMs > 0
    ? item.durationMs
    : await dependencies.probePlayableDuration(uri, IMPORT_DECODE_TIMEOUT_MS);
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
  reference: string,
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
      if (!item || item.source.reference !== reference) return { library: source, result: source };
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
    const missing = library.items[musicItemId];
    if (missing?.availability === 'missing') dependencies.setState(state => {
      const item = state.libraryItems[musicItemId];
      if (!item || item.source.reference !== missing.source.reference) return {};
      return { libraryItems: { ...state.libraryItems, [musicItemId]: { ...item, availability: 'missing' } } };
    });
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
  item: MusicItem,
): Promise<void> => {
  const state = dependencies.getState();
  const committed = await dependencies.commitTrackSwitch(
    item.id,
    state.queue,
    dependencies.now().toISOString(),
    { onIssue: upsertPersistenceIssue },
  );
  dependencies.setState(current => {
    const live = current.libraryItems[item.id];
    if (!live) return {};
    return { libraryItems: {
      ...current.libraryItems,
      [item.id]: { ...live, lastPlayedAt: committed.library.items[item.id].lastPlayedAt },
    } };
  });
};

interface PendingRequest {
  request: SwitchRequest;
  resolve: (result: SwitchResult) => void;
  bypassGuard?: boolean;
  guardWasShown?: boolean;
  visited?: ReadonlySet<string>;
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
    try {
      await withAudioOperationTimeout(
        dependencies.player.play(),
        PLAYER_COMMAND_TIMEOUT_MS,
        'Playback resume after song-switch failure',
      );
      dependencies.setState({ isPlaying: true });
    } catch (error) {
      console.error('Unable to resume playback after failed song switch', error);
      dependencies.setState({ isPlaying: false });
      dependencies.getState().notify('Song was not changed. Tap Play to resume.');
    }
  };

  const run = async (
    request: SwitchRequest,
    bypassGuard = false,
    guardWasShown = false,
    visited: ReadonlySet<string> = new Set(),
  ): Promise<SwitchResult> => {
    const initial = dependencies.getState();
    if (initial.saveInProgress) return { kind: 'cancelled' };
    if (!bypassGuard && initial.currentMusicItemId !== null && decideSwitchGuard(initial.draftUiState) === 'prompt') {
      const changes = switchChanges(initial);
      if (changes.length) {
        dependencies.setState({ switchPhase: 'guard', switchGuard: { pendingDestination: request, changes } });
        return new Promise<SwitchResult>(resolve => { guarded = { request, resolve }; });
      }
    }

    const source = snapshotSource(initial);
    const wasPlaying = initial.isPlaying;
    // Return the Library gesture to the same Studio transition used by the transport controls.
    // Keep guard decisions in the sheet, then dismiss it before changing the player or canvas.
    dependencies.setState({
      isPlaying: false,
      switchPhase: 'flushing',
      loadingMusicItemId: request.musicItemId,
      ...(request.origin === 'library' && { isLibrarySheetOpen: false }),
    });
    if (wasPlaying) {
      try {
        await withAudioOperationTimeout(
          dependencies.player.pause(),
          PLAYER_COMMAND_TIMEOUT_MS,
          'Playback pause before song switch',
        );
      } catch (error) {
        // Applying the new source stops the old one. A native pause promise abandoned after an iOS
        // suspension must not keep a Music Library row busy forever.
        console.error('Unable to confirm playback pause before song switch', error);
      }
    }
    const flushResult = await dependencies.flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
    if (flushResult === 'failed' || flushResult === 'timeout') {
      dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
      await restorePlaybackIfNeeded(wasPlaying);
      return failed(
        request,
        'draftFlush',
        'Song Not Changed',
        "BeatNote couldn't save your draft, so the song wasn't changed.",
        () => requestTrackSwitch(request, bypassGuard, guardWasShown, visited),
      );
    }

    dependencies.setState({ switchPhase: 'resolving', loadingMusicItemId: request.musicItemId });
    let destination: ResolvedTrack;
    try {
      destination = await withAudioOperationTimeout(
        resolveTrack(dependencies, request),
        TRACK_RESOLVE_TIMEOUT_MS,
        'Song metadata and audio resolution',
      );
    } catch (error) {
      const missing = error instanceof SourceUnavailableError && error.cause === undefined;
      const item = initial.libraryItems[request.musicItemId];
      if (missing && item) void markMissing(dependencies, item.id, item.source.reference);
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
        () => requestTrackSwitch(request, bypassGuard, guardWasShown, visited),
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
      const useActiveLibraryOrder = request.rebuildQueue === true;
      destinationQueue = buildQueue(
        Object.values(beforeCommit.libraryItems),
        beforeCommit.queue?.collectionId ?? IMPORTED_MUSIC_COLLECTION_ID,
        useActiveLibraryOrder
          ? beforeCommit.librarySort
          : beforeCommit.queue?.sortKey ?? beforeCommit.librarySort,
        destination.item.id,
        beforeCommit.libraryCustomOrder,
        useActiveLibraryOrder
          ? beforeCommit.librarySortDirection
          : beforeCommit.queue?.sortDirection ?? beforeCommit.librarySortDirection,
      );
    } else if (destinationQueue !== null) {
      const matchingIndex = destinationQueue.order.indexOf(destination.item.id);
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
        () => requestTrackSwitch(request, bypassGuard, guardWasShown, visited),
        queueOrigin(request.origin)
          ? () => skipFromFailure(request, bypassGuard, guardWasShown, visited)
          : undefined,
      );
    }

    // The audible/player switch is complete at this point. Persisting recent-play metadata and the
    // queue is retryable bookkeeping and may be queued behind an AsyncStorage operation abandoned
    // during suspension. Do not hold the Library sheet or roll back playable audio while it waits.
    void persistSuccessfulSwitch(dependencies, destination.item).catch(error => {
      console.error('Song changed but switch bookkeeping could not be saved', error);
      dependencies.getState().notify('Song opened. Recently Played hasn’t updated yet.');
    });
    dependencies.setState({ switchPhase: 'idle', loadingMusicItemId: null });
    if (wasPlaying && !guardWasShown) {
      try {
        await withAudioOperationTimeout(
          dependencies.player.play(),
          PLAYER_COMMAND_TIMEOUT_MS,
          'Playback resume after song switch',
        );
        dependencies.setState({ isPlaying: true });
      } catch (error) {
        console.error('Song loaded but playback could not resume', error);
        dependencies.setState({ isPlaying: false });
        dependencies.getState().notify('Song loaded. Tap Play to resume.');
      }
    }
    if (queueOrigin(request.origin)) dependencies.announceQueueTitle(destination.item.displayTitle);
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
        isLibrarySheetOpen: true,
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
      void drain(next.request, next.bypassGuard, next.guardWasShown, next.visited).then(next.resolve);
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
        () => requestTrackSwitch(request, bypassGuard, guardWasShown, visited),
      ));
    }
    return requestTrackSwitch({
      musicItemId: candidate.musicItemId,
      queueIndex: candidate.index,
      origin: direction === -1 ? 'queuePrevious' : 'queueNext',
    }, bypassGuard, guardWasShown, nextVisited);
  };

  const requestTrackSwitch = (
    request: SwitchRequest,
    bypassGuard = false,
    guardWasShown = false,
    visited: ReadonlySet<string> = new Set(),
  ): Promise<SwitchResult> => {
    const state = dependencies.getState();
    if (state.switchPhase === 'guard') return Promise.resolve({ kind: 'cancelled' });
    if (!active) return drain(request, bypassGuard, guardWasShown, visited);
    if (pending !== null) pending.resolve({ kind: 'superseded' });
    dependencies.setState({ pendingSwitchTargetId: request.musicItemId });
    return new Promise(resolve => { pending = { request, resolve, bypassGuard, guardWasShown, visited }; });
  };

  const requestTrackSwitchWithoutGuard = (request: SwitchRequest): Promise<SwitchResult> => (
    requestTrackSwitch(request, true)
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
      // Saving may finish after the user cancelled the prompt or chose another destination.
      if (dependencies.getState().switchGuard !== guard) return { kind: 'cancelled' };
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

export const requestTrackSwitch = (request: SwitchRequest): Promise<SwitchResult> => {
  const intervalId = perfBegin('track.switch');
  return defaultTrackSwitch.requestTrackSwitch(request)
    .finally(() => perfEndAfterFrame(intervalId));
};

/**
 * Automatic completion never overwrites a saved project or blocks playback behind the manual
 * switch guard. The transaction still flushes the per-song draft before changing audio, and a
 * failed/timeout flush aborts the switch so authored work is never discarded.
 */
export const requestTrackSwitchAfterCompletion = (
  request: SwitchRequest,
): Promise<SwitchResult> => {
  const intervalId = perfBegin('track.switch');
  return defaultTrackSwitch.requestTrackSwitchWithoutGuard(request)
    .finally(() => perfEndAfterFrame(intervalId));
};

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
  useStudioStore.getState().beginPlaybackTraversal(milliseconds);
};
