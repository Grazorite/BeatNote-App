import type { DraftUiState } from '../types/csvImport';
import type {
  DraftBaseline,
  PersistedContent,
  SavedProjectSummary,
  SongDraft,
} from '../types/project';
import {
  canonicalizeValue,
  computeContentFingerprint,
  contentFingerprintsEqual,
} from './contentFingerprint';

export interface ResolutionInput {
  draft: SongDraft | null;
  draftFingerprint: string | null;
  projects: SavedProjectSummary[];
  explicitProjectId: string | null;
}

export type SongLoadResolution =
  | { kind: 'openProject'; projectId: string }
  | { kind: 'restoreDraft'; asUnnamed: boolean; advanceBaselineTo?: DraftBaseline }
  | { kind: 'emptyDraft' };

export type SavePlan =
  | { kind: 'create'; revision: 1 }
  | { kind: 'update'; projectId: string; revision: number }
  | {
    kind: 'conflict';
    projectId: string;
    baselineRevision: number;
    storedRevision: number | null;
  };

const compareCodeUnits = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const hasMarkersOrAnnotations = (content: PersistedContent): boolean => content.layers.some(
  layer => layer.markers.length > 0 || layer.annotations.length > 0,
);

const newestProject = (projects: readonly SavedProjectSummary[]): SavedProjectSummary | null => {
  if (projects.length === 0) return null;
  return [...projects].sort((left, right) => {
    const modifiedOrder = compareCodeUnits(right.modifiedAt, left.modifiedAt);
    if (modifiedOrder !== 0) return modifiedOrder;
    const revisionOrder = right.revision - left.revision;
    if (revisionOrder !== 0) return revisionOrder;
    return compareCodeUnits(left.projectId, right.projectId);
  })[0];
};

/** Derive the four-state draft presentation model from stored content and its fingerprint. */
export function deriveDraftUiState(
  draft: SongDraft | null,
  draftFingerprint: string | null = null,
): DraftUiState {
  if (draft === null) return 'emptyUnnamed';
  if (draft.baseline === null) {
    return hasMarkersOrAnnotations(draft.content) ? 'unsaved' : 'emptyUnnamed';
  }
  const fingerprint = draftFingerprint ?? computeContentFingerprint(draft.content);
  return contentFingerprintsEqual(fingerprint, draft.baselineFingerprint) ? 'saved' : 'dirty';
}

/** Resolve which project or draft should open for a selected music item. */
export function resolveSongLoad(input: ResolutionInput): SongLoadResolution {
  if (input.explicitProjectId !== null) {
    return { kind: 'openProject', projectId: input.explicitProjectId };
  }

  const projectById = new Map(input.projects.map(project => [project.projectId, project]));
  const baselineProject = input.draft?.baseline === null || input.draft === null
    ? null
    : projectById.get(input.draft.baseline.projectId) ?? null;
  const baselineWasDeleted = input.draft?.baseline !== null
    && input.draft !== null
    && baselineProject === null;
  const effectiveDraft = baselineWasDeleted && input.draft !== null
    ? { ...input.draft, baseline: null, baselineFingerprint: null }
    : input.draft;
  const fingerprint = effectiveDraft === null
    ? null
    : input.draftFingerprint ?? computeContentFingerprint(effectiveDraft.content);

  if (effectiveDraft?.baseline !== null && effectiveDraft !== null && baselineProject !== null
    && baselineProject.revision > effectiveDraft.baseline.revision
    && contentFingerprintsEqual(fingerprint, effectiveDraft.baselineFingerprint)) {
    return {
      kind: 'restoreDraft',
      asUnnamed: false,
      advanceBaselineTo: {
        projectId: baselineProject.projectId,
        revision: baselineProject.revision,
      },
    };
  }

  const draftState = deriveDraftUiState(effectiveDraft, fingerprint);
  if (effectiveDraft !== null && (draftState === 'dirty' || draftState === 'unsaved')) {
    return { kind: 'restoreDraft', asUnnamed: effectiveDraft.baseline === null };
  }

  const newest = newestProject(input.projects);
  if (newest !== null) return { kind: 'openProject', projectId: newest.projectId };
  if (effectiveDraft !== null) {
    return { kind: 'restoreDraft', asUnnamed: effectiveDraft.baseline === null };
  }
  return { kind: 'emptyDraft' };
}

/** Prompt before switching songs only when edits differ from a named saved baseline. */
export function decideSwitchGuard(state: DraftUiState): 'continue' | 'prompt' {
  return state === 'dirty' ? 'prompt' : 'continue';
}

/** Plan an optimistic project save against the revision currently in storage. */
export function planSave(
  baseline: DraftBaseline | null,
  storedRevision: number | null,
): SavePlan {
  if (baseline === null) return { kind: 'create', revision: 1 };
  if (storedRevision === baseline.revision) {
    return {
      kind: 'update',
      projectId: baseline.projectId,
      revision: baseline.revision + 1,
    };
  }
  return {
    kind: 'conflict',
    projectId: baseline.projectId,
    baselineRevision: baseline.revision,
    storedRevision,
  };
}

const markerFrequencies = (markers: readonly number[]): Map<number, number> => {
  const frequencies = new Map<number, number>();
  markers.forEach(marker => frequencies.set(marker, (frequencies.get(marker) ?? 0) + 1));
  return frequencies;
};

/** Count per-layer marker additions and removals, retaining duplicate multiplicity. */
export function changedMarkerCount(
  current: PersistedContent,
  baseline: PersistedContent,
): number {
  const baselineByLayer = new Map(baseline.layers.map(layer => [layer.id, layer]));
  return current.layers.reduce((total, layer) => {
    const currentCounts = markerFrequencies(layer.markers);
    const baselineCounts = markerFrequencies(baselineByLayer.get(layer.id)?.markers ?? []);
    const timestamps = new Set([...currentCounts.keys(), ...baselineCounts.keys()]);
    return total + [...timestamps].reduce(
      (count, timestamp) => count
        + Math.abs((currentCounts.get(timestamp) ?? 0) - (baselineCounts.get(timestamp) ?? 0)),
      0,
    );
  }, 0) + baseline.layers
    .filter(layer => !current.layers.some(currentLayer => currentLayer.id === layer.id))
    .reduce((total, layer) => total + layer.markers.length, 0);
}

/** List persisted setting keys whose canonical values differ. */
export function changedSettingNames(
  current: PersistedContent,
  baseline: PersistedContent,
): string[] {
  const names = new Set([
    ...Object.keys(current.settings),
    ...Object.keys(baseline.settings),
  ]);
  return [...names]
    .filter(name => canonicalizeValue(current.settings[name])
      !== canonicalizeValue(baseline.settings[name]))
    .sort(compareCodeUnits);
}
