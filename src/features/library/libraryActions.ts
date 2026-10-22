import { useStudioStore } from '../../hooks/useStudioStore';
import type { LibraryRecord } from '../../types/library';
import { normalizeDisplayTitle } from '../../utils/projectNames';
import { mutateLibrary, type RepositoryOptions } from './repositories';

export type RenameMusicItemResult =
  | { kind: 'renamed'; title: string }
  | { kind: 'invalid'; error: string }
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
