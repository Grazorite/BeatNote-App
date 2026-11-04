import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { resetDebugTier } from '../entitlements/capabilityService';
import { resetSettingsPreferences } from '../settings/preferences';
import { cancelAnalysis } from '../analysis/bpmAnalysisService';
import { useStudioStore } from '../../hooks/useStudioStore';
import { clearWaveformCache } from '../../hooks/useWaveformData';
import { clearAllStemCache } from '../stemSeparation/stemCache';
import { IMPORTED_MUSIC_COLLECTION_ID } from '../../types/library';
import type { SongDraft } from '../../types/project';
import audioStore from './audioStore';
import { flushDraft } from './draftAutosave';
import { deleteMusicItem, resetAllStudioData } from './libraryActions';
import { PROJECT_INDEX_KEY, PROJECT_KEY_PREFIX } from './repositories';

const LEGACY_PROJECTS_KEY = 'beatnote_projects';
const DRAFT_KEY_PREFIX = 'beatnote.draft.v1.';

const isSongDraft = (value: unknown): value is SongDraft => (
  typeof value === 'object' && value !== null
  && (value as SongDraft).schemaVersion === 1
  && typeof (value as SongDraft).musicItemId === 'string'
  && typeof (value as SongDraft).content === 'object'
);

/** Delete saved project records while preserving each song's authored draft as an unsaved draft. */
export async function deleteAllSavedProjects(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const projectKeys = keys.filter(key => (
    key === PROJECT_INDEX_KEY || key === LEGACY_PROJECTS_KEY || key.startsWith(PROJECT_KEY_PREFIX)
  ));
  const draftKeys = keys.filter(key => key.startsWith(DRAFT_KEY_PREFIX));
  const drafts = await AsyncStorage.multiGet(draftKeys);
  const detachedDrafts = drafts.flatMap(([key, raw]) => {
    if (raw === null) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isSongDraft(parsed)) return [];
      return [[key, JSON.stringify({ ...parsed, baseline: null, baselineFingerprint: null })] as [string, string]];
    } catch {
      return [];
    }
  });

  if (projectKeys.length > 0) await AsyncStorage.multiRemove(projectKeys);
  if (detachedDrafts.length > 0) await AsyncStorage.multiSet(detachedDrafts);
  useStudioStore.setState(state => ({
    projectSummaries: {},
    readOnlyLegacyProjects: [],
    draftBaseline: null,
    draftBaselineFingerprint: null,
    draftBaselineName: null,
    loadedProjectSource: null,
    draftUiState: state.songLoaded ? 'unsaved' : state.draftUiState,
  }));
}

/** Delete every managed imported-audio copy while retaining drafts and projects for relinking. */
export async function deleteAllImportedAudio(): Promise<void> {
  const state = useStudioStore.getState();
  if (state.importJobs.some(job => job.status !== 'failed')) {
    throw new Error('Wait for the current audio import to finish or cancel it first.');
  }

  const currentId = state.currentMusicItemId;
  const importedIds = Object.values(state.libraryItems)
    .filter(item => !item.removed && item.collectionIds.includes(IMPORTED_MUSIC_COLLECTION_ID))
    .map(item => item.id)
    // Remove the playing song last so the existing deletion flow does not switch into a song that
    // the same bulk operation is about to remove.
    .sort((left, right) => Number(left === currentId) - Number(right === currentId));

  for (const musicItemId of importedIds) {
    const result = await deleteMusicItem(musicItemId);
    if (result.kind === 'failed') throw new Error(result.error);
    if (result.kind === 'cancelled') {
      throw new Error('Imported-audio removal was cancelled before every song was removed.');
    }
  }
}

/** Delete every app-owned record and managed audio copy without touching the user's source files. */
export async function deleteAllBeatNoteData(): Promise<void> {
  const state = useStudioStore.getState();
  if (state.importJobs.some(job => job.status !== 'failed')) {
    throw new Error('Wait for the current audio import to finish or cancel it first.');
  }
  // Quiesce any in-flight autosave before removing storage so it cannot finish afterward and
  // recreate a draft the user explicitly deleted.
  const flushResult = await flushDraft(3_000);
  if (flushResult === 'timeout') {
    throw new Error("BeatNote is still saving the current draft. Try again in a moment.");
  }
  Object.keys(state.libraryItems).forEach(cancelAnalysis);
  resetAllStudioData();
  clearWaveformCache();

  await Promise.all([
    resetSettingsPreferences(),
    resetDebugTier(),
    audioStore.sweepOrphans(new Set(), 0),
    Platform.OS === 'web' ? Promise.resolve() : clearAllStemCache(),
  ]);
  const keys = await AsyncStorage.getAllKeys();
  const beatNoteKeys = keys.filter(key => key.startsWith('beatnote.') || key.startsWith('beatnote_'));
  if (beatNoteKeys.length > 0) await AsyncStorage.multiRemove(beatNoteKeys);
}
