import type { RowDensity } from '../utils/rowLayout';

export const SAVED_PROJECT_VERSION = '1.2.0';

export type LayerId = 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'other';

export interface BeatNoteProject {
  [key: string]: unknown;
  version: string;
  metadata: {
    name: string;
    bpm: number;
    duration: number;
    stemCount: 2 | 4 | 6;
    createdAt: string;
    modifiedAt: string;
  };
  audio: {
    uri: string;
    filename: string;
  };
  layers: {
    id: string;
    name: string;
    customName?: string;
    color: string;
    markers: number[];
    annotations: { timestamp: number; text: string; }[];
    isVisible: boolean;
  }[];
  settings: {
    [key: string]: unknown;
    viewMode: 'unified' | 'multitrack';
    showGridLines: boolean;
    layerSpecificNavigation: boolean;
    primaryView?: 'wrapped' | 'detail';
    countSize?: 4 | 6 | 8;
    rowDensity?: RowDensity;
    followPlayhead?: boolean;
    playbackSpeed?: number;
    loopRange?: { startMs: number; endMs: number } | null;
    loopEnabled?: boolean;
  };
}

/** Minimal envelope retained for a future-version legacy project that this build must not rewrite. */
export interface NewerLegacyProject {
  [key: string]: unknown;
  version: string;
  metadata: {
    [key: string]: unknown;
    name: string;
    modifiedAt: string;
  };
}

export type LegacyStoredProject = BeatNoteProject | NewerLegacyProject;

export interface ProjectListItem {
  filename: string;
  name: string;
  modifiedAt: string;
  duration: number;
  stemCount: 2 | 4 | 6;
  markerCount: number;
}

export interface PersistedLayer {
  [key: string]: unknown;
  id: LayerId;
  name: string;
  customName?: string;
  color: string;
  markers: number[];
  annotations: { timestamp: number; text: string }[];
  isVisible: boolean;
}

/** Exactly the authored song content stored by drafts and saved projects. */
export interface PersistedContent {
  layers: PersistedLayer[];
  bpm: number;
  stemCount: 2 | 4 | 6;
  settings: BeatNoteProject['settings'];
  extras: Record<string, unknown>;
}

export interface SavedProject extends BeatNoteProject {
  version: string;
  projectId: string;
  musicItemId: string;
  revision: number;
  /** Compatibility-only audio metadata; library playback resolves through musicItemId. */
  audio: { uri: string; filename: string };
}

export interface SavedProjectSummary {
  projectId: string;
  musicItemId: string;
  name: string;
  revision: number;
  modifiedAt: string;
  markerCount: number;
  version: string;
  readOnly: boolean;
}

export interface ProjectIndexRecord {
  schemaVersion: 1;
  projects: Record<string, SavedProjectSummary>;
}

export interface DraftBaseline {
  projectId: string;
  revision: number;
}

export interface SongDraft {
  schemaVersion: 1;
  musicItemId: string;
  baseline: DraftBaseline | null;
  baselineFingerprint: string | null;
  content: PersistedContent;
  updatedAt: string;
}
