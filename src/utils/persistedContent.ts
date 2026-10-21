import type { Layer, StudioStore } from '../hooks/useStudioStore';
import type {
  BeatNoteProject,
  PersistedContent,
  PersistedLayer,
  SavedProject,
} from '../types/project';

const PROJECT_TOP_LEVEL_KEYS = new Set([
  'version',
  'projectId',
  'musicItemId',
  'revision',
  'metadata',
  'audio',
  'layers',
  'settings',
]);

const VISIBLE_LAYER_IDS: Record<2 | 4 | 6, PersistedLayer['id'][]> = {
  2: ['vocals', 'other'],
  4: ['vocals', 'drums', 'bass', 'other'],
  6: ['vocals', 'drums', 'bass', 'piano', 'guitar', 'other'],
};

const ALL_LAYER_IDS: PersistedLayer['id'][] = [
  'vocals',
  'drums',
  'bass',
  'piano',
  'guitar',
  'other',
];

const DEFAULT_LAYERS: PersistedLayer[] = [
  { id: 'vocals', name: 'Vocals', color: '#ff6666', markers: [], annotations: [], isVisible: true },
  { id: 'drums', name: 'Drums', color: '#00ccff', markers: [], annotations: [], isVisible: true },
  { id: 'bass', name: 'Bass', color: '#bb66ff', markers: [], annotations: [], isVisible: true },
  { id: 'piano', name: 'Piano', color: '#ffcc00', markers: [], annotations: [], isVisible: true },
  { id: 'guitar', name: 'Guitar', color: '#d2b48c', markers: [], annotations: [], isVisible: true },
  { id: 'other', name: 'Other', color: '#ff69b4', markers: [], annotations: [], isVisible: true },
];

export type PersistedContentSource = Pick<StudioStore,
  | 'allLayersData'
  | 'bpm'
  | 'stemCount'
  | 'viewMode'
  | 'showGridLines'
  | 'layerSpecificNavigation'
  | 'primaryView'
  | 'countSize'
  | 'rowDensity'
  | 'followPlayhead'
  | 'playbackSpeed'
  | 'loopStartMs'
  | 'loopEndMs'
  | 'isLoopRangeEnabled'
  | 'loadedProjectSource'
>;

export type PersistedContentPatch = Pick<StudioStore,
  | 'allLayersData'
  | 'layers'
  | 'bpm'
  | 'stemCount'
  | 'viewMode'
  | 'showGridLines'
  | 'layerSpecificNavigation'
  | 'primaryView'
  | 'countSize'
  | 'rowDensity'
  | 'followPlayhead'
  | 'playbackSpeed'
  | 'loopStartMs'
  | 'loopEndMs'
  | 'isLoopRangeEnabled'
>;

export interface SavedProjectEnvelope {
  version: string;
  projectId: string;
  musicItemId: string;
  revision: number;
  metadata: {
    name: string;
    duration: number;
    createdAt: string;
    modifiedAt: string;
  };
  audio: SavedProject['audio'];
}

const cloneLayers = (layers: readonly PersistedLayer[]): PersistedLayer[] => layers.map(layer => ({
  ...layer,
  markers: [...layer.markers],
  annotations: layer.annotations.map(annotation => ({ ...annotation })),
}));

const getTopLevelExtras = (project: BeatNoteProject | null): Record<string, unknown> => {
  if (project === null) return {};
  return Object.fromEntries(
    Object.entries(project).filter(([key]) => !PROJECT_TOP_LEVEL_KEYS.has(key)),
  );
};

/** Create the authored defaults for a song that has no draft or saved project yet. */
export function createEmptyPersistedContent(): PersistedContent {
  return {
    layers: cloneLayers(DEFAULT_LAYERS),
    bpm: 120,
    stemCount: 4,
    settings: {
      viewMode: 'unified',
      showGridLines: true,
      layerSpecificNavigation: false,
      primaryView: 'wrapped',
      countSize: 8,
      rowDensity: { mode: 'phrase' },
      followPlayhead: true,
      playbackSpeed: 1,
      loopRange: null,
      loopEnabled: false,
    },
    extras: {},
  };
}

/** Extract only authored, persistable content from the live studio state. */
export function extractPersistedContent(state: PersistedContentSource): PersistedContent {
  const sourceSettings = state.loadedProjectSource?.settings ?? {};
  const loopRange = state.loopStartMs !== null && state.loopEndMs !== null
    ? { startMs: state.loopStartMs, endMs: state.loopEndMs }
    : null;

  return {
    layers: cloneLayers(state.allLayersData as PersistedLayer[]),
    bpm: state.bpm,
    stemCount: state.stemCount,
    settings: {
      ...sourceSettings,
      viewMode: state.viewMode,
      showGridLines: state.showGridLines,
      layerSpecificNavigation: state.layerSpecificNavigation,
      primaryView: state.primaryView,
      countSize: state.countSize,
      rowDensity: state.rowDensity,
      followPlayhead: state.followPlayhead,
      playbackSpeed: state.playbackSpeed,
      loopRange,
      loopEnabled: loopRange !== null && state.isLoopRangeEnabled,
    },
    extras: getTopLevelExtras(state.loadedProjectSource),
  };
}

/** Convert persisted authored content into one atomic studio-store patch. */
export function applyPersistedContent(content: PersistedContent): PersistedContentPatch {
  const clonedLayers = cloneLayers(content.layers);
  const allLayersData = ALL_LAYER_IDS
    .map(id => clonedLayers.find(layer => layer.id === id))
    .filter((layer): layer is PersistedLayer => layer !== undefined) as Layer[];
  const visibleIds = VISIBLE_LAYER_IDS[content.stemCount];
  const loopRange = content.settings.loopRange ?? null;

  return {
    allLayersData,
    layers: visibleIds
      .map(id => allLayersData.find(layer => layer.id === id))
      .filter((layer): layer is Layer => layer !== undefined),
    bpm: content.bpm,
    stemCount: content.stemCount,
    viewMode: content.settings.viewMode,
    showGridLines: content.settings.showGridLines,
    layerSpecificNavigation: content.settings.layerSpecificNavigation,
    primaryView: content.settings.primaryView ?? 'wrapped',
    countSize: content.settings.countSize ?? 8,
    rowDensity: content.settings.rowDensity ?? { mode: 'phrase' },
    followPlayhead: content.settings.followPlayhead ?? true,
    playbackSpeed: content.settings.playbackSpeed ?? 1,
    loopStartMs: loopRange?.startMs ?? null,
    loopEndMs: loopRange?.endMs ?? null,
    isLoopRangeEnabled: loopRange !== null && content.settings.loopEnabled === true,
  };
}

/** Split a stored project into its immutable envelope and authored content. */
export function splitProjectEnvelope(project: SavedProject): {
  envelope: SavedProjectEnvelope;
  content: PersistedContent;
} {
  const {
    version,
    projectId,
    musicItemId,
    revision,
    metadata,
    audio,
    layers,
    settings,
  } = project;

  return {
    envelope: {
      version,
      projectId,
      musicItemId,
      revision,
      metadata: {
        name: metadata.name,
        duration: metadata.duration,
        createdAt: metadata.createdAt,
        modifiedAt: metadata.modifiedAt,
      },
      audio: { ...audio },
    },
    content: {
      layers: cloneLayers(layers as PersistedLayer[]),
      bpm: metadata.bpm,
      stemCount: metadata.stemCount,
      settings: { ...settings },
      extras: getTopLevelExtras(project),
    },
  };
}

/** Recombine a saved-project envelope and authored content without dropping unknown fields. */
export function toProjectRecord(
  envelope: SavedProjectEnvelope,
  content: PersistedContent,
): SavedProject {
  return {
    ...content.extras,
    version: envelope.version,
    projectId: envelope.projectId,
    musicItemId: envelope.musicItemId,
    revision: envelope.revision,
    metadata: {
      name: envelope.metadata.name,
      bpm: content.bpm,
      duration: envelope.metadata.duration,
      stemCount: content.stemCount,
      createdAt: envelope.metadata.createdAt,
      modifiedAt: envelope.metadata.modifiedAt,
    },
    audio: { ...envelope.audio },
    layers: cloneLayers(content.layers),
    settings: { ...content.settings },
  };
}
