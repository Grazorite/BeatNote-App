import { useStudioStore } from '../../hooks/useStudioStore';
import type { LibraryRecord } from '../../types/library';
import { normalizeDisplayTitle } from '../../utils/projectNames';
import audioStore from './audioStore';
import {
  commitMusicItemRemoval,
  mutateLibrary,
  readDraftStrict,
  type RepositoryOptions,
} from './repositories';
import {
  pauseTrackSwitchPlayer,
  requestTrackSwitch,
  restoreTrackAfterDeleteFailure,
  resumeTrackSwitchPlayer,
} from './trackSwitch';

export type RenameMusicItemResult =
  | { kind: 'renamed'; title: string }
  | { kind: 'invalid'; error: string }
  | { kind: 'failed'; error: string };

export interface DeleteMusicItemSummary {
  projectCount: number;
  hasDraft: boolean;
}

export type DeleteMusicItemResult =
  | { kind: 'deleted' }
  | { kind: 'cancelled' }
  | { kind: 'failed'; error: string };

const repositoryOptions = (): RepositoryOptions => ({
  onIssue: issue => useStudioStore.setState(state => ({
    persistenceIssues: [
      ...state.persistenceIssues.filter(existing => (
        existing.kind !== issue.kind || existing.label !== issue.label
      )),
      issue,
    ],
  })),
});

/** Rename only mutable display metadata; identity, source, projects, drafts, and queue stay intact. */
export async function renameMusicItem(
  musicItemId: string,
  requestedTitle: string,
): Promise<RenameMusicItemResult> {
  const title = normalizeDisplayTitle(requestedTitle);
  if (title === null) return { kind: 'invalid', error: 'Enter a song name' };

  try {
    const library = await mutateLibrary((current: LibraryRecord | null) => {
      const item = current?.items[musicItemId];
      if (current === null || item === undefined || item.removed) {
        throw new Error('This song is no longer in your music library.');
      }
      const next: LibraryRecord = {
        ...current,
        items: {
          ...current.items,
          [musicItemId]: { ...item, displayTitle: title },
        },
      };
      return { library: next, result: next };
    }, repositoryOptions());
    useStudioStore.setState({ libraryItems: library.items });
    return { kind: 'renamed', title };
  } catch (error) {
    return {
      kind: 'failed',
      error: error instanceof Error ? error.message : "BeatNote couldn't rename this song.",
    };
  }
}

export async function getDeleteMusicItemSummary(
  musicItemId: string,
): Promise<DeleteMusicItemSummary> {
  const state = useStudioStore.getState();
  const hasDraft = await readDraftStrict(musicItemId, repositoryOptions()) !== null;
  const projectCount = Object.values(state.projectSummaries)
    .filter(project => project.musicItemId === musicItemId).length;
  return { projectCount, hasDraft };
}

const deletionSwitchDestination = (musicItemId: string) => {
  const queue = useStudioStore.getState().queue;
  if (queue === null || queue.currentIndex === null) return null;
  const currentIndex = queue.order.indexOf(musicItemId);
  if (currentIndex < 0) return null;
  const targetIndex = currentIndex + 1 < queue.order.length
    ? currentIndex + 1
    : currentIndex > 0 ? currentIndex - 1 : null;
  if (targetIndex === null) return null;
  return { musicItemId: queue.order[targetIndex], queueIndex: targetIndex };
};

/** Delete only BeatNote's managed copy while retaining project and draft references. */
export async function deleteMusicItem(musicItemId: string): Promise<DeleteMusicItemResult> {
  const initial = useStudioStore.getState();
  const item = initial.libraryItems[musicItemId];
  if (item === undefined || item.removed) {
    return { kind: 'failed', error: 'This song is no longer in your music library.' };
  }

  const deletingCurrent = initial.currentMusicItemId === musicItemId;
  let switchedBeforeDelete = false;
  let gatedCurrentBeforeDelete = false;
  if (deletingCurrent) {
    const destination = deletionSwitchDestination(musicItemId);
    if (destination !== null) {
      const switched = await requestTrackSwitch({
        ...destination,
        origin: 'deleteCurrent',
      });
      if (switched.kind === 'cancelled') return { kind: 'cancelled' };
      if (switched.kind === 'failed') return { kind: 'failed', error: switched.reason.message };
      if (switched.kind === 'superseded') {
        return { kind: 'failed', error: 'Song removal was interrupted.' };
      }
      switchedBeforeDelete = true;
    } else {
      try {
        await pauseTrackSwitchPlayer();
        useStudioStore.setState({ currentAudioUri: null, isPlaying: false });
        gatedCurrentBeforeDelete = true;
      } catch (error) {
        return {
          kind: 'failed',
          error: error instanceof Error ? error.message : "BeatNote couldn't stop playback.",
        };
      }
    }
  }

  try {
    await audioStore.remove(item.source.reference);
  } catch {
    let restoreError: string | null = null;
    if (switchedBeforeDelete || gatedCurrentBeforeDelete) {
      const restored = await restoreTrackAfterDeleteFailure({
        musicItemId,
        origin: 'deleteCurrent',
        ...(initial.queue?.currentIndex === null || initial.queue === null
          ? {}
          : { queueIndex: initial.queue.currentIndex }),
      }).catch(error => ({
        kind: 'failed' as const,
        reason: {
          message: error instanceof Error ? error.message : String(error),
        },
      }));
      if (restored.kind !== 'committed') {
        restoreError = restored.kind === 'failed'
          ? restored.reason.message
          : 'the original song switch was interrupted';
      } else if (initial.isPlaying) {
        try {
          await resumeTrackSwitchPlayer();
          useStudioStore.setState({ isPlaying: true });
        } catch (error) {
          useStudioStore.setState({ isPlaying: false });
          restoreError = error instanceof Error ? error.message : String(error);
        }
      }
    }
    return {
      kind: 'failed',
      error: restoreError === null
        ? `The audio for “${item.displayTitle}” couldn't be removed`
        : `The audio for “${item.displayTitle}” couldn't be removed, and BeatNote couldn't restore the original song: ${restoreError}`,
    };
  }

  try {
    await commitMusicItemRemoval(musicItemId, repositoryOptions(), committed => {
      useStudioStore.setState(state => ({
        libraryItems: committed.library.items,
        queue: committed.queue,
        ...(deletingCurrent && state.currentMusicItemId === musicItemId ? {
          currentAudioUri: null,
          isPlaying: false,
          currentTime: 0,
          songLoaded: true,
          switchPhase: 'idle' as const,
          loadingMusicItemId: null,
        } : {}),
      }));
    });
    return { kind: 'deleted' };
  } catch (error) {
    useStudioStore.setState(state => ({
      libraryItems: {
        ...state.libraryItems,
        [musicItemId]: { ...item, availability: 'missing' },
      },
      ...(deletingCurrent && state.currentMusicItemId === musicItemId ? {
        currentAudioUri: null,
        isPlaying: false,
        currentTime: 0,
        songLoaded: true,
      } : {}),
    }));
    return {
      kind: 'failed',
      error: error instanceof Error ? error.message : "BeatNote couldn't finish removing this song.",
    };
  }
}
