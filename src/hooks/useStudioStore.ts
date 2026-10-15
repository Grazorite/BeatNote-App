import { create, type StateCreator } from 'zustand';
import { ProjectManager, PROJECT_VERSION, compareProjectVersion } from '../utils/projectManager';
import { BeatNoteProject } from '../types/project';
import { ImportEngine } from '../utils/importEngine';
import type { ImportResult } from '../utils/importTypes';
import { StemSeparationStatus } from '../features/stemSeparation/types';
import type { RowDensity } from '../utils/rowLayout';
import { canEnterRangeState, deriveInnerLoopState, type InnerLoopState } from '../utils/innerLoop';
import {
  MIN_LOOP_DURATION_MS,
  RESTORE_WINDOW_MS,
  beatStepMs,
  isValidLoopRange,
  normalizeLoopRange,
  reclampLoopRangeToDuration,
  resizeLoopBound,
} from '../utils/loopRange';

export type LayerId = 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'other';

export interface MarkerAnnotation {
  timestamp: number;
  text: string;
}

export interface SelectedMarker {
  layerId: LayerId;
  timestamp: number;
}

export interface Layer {
  id: LayerId;
  name: string;
  color: string;
  markers: number[];
  annotations: MarkerAnnotation[];
  isVisible: boolean;
}

export interface LoopRestoreSnapshot {
  loopStartMs: number | null;
  loopEndMs: number | null;
  isLoopRangeEnabled: boolean;
  expiresAtMs: number;
}

export interface StudioStore {
  isPlaying: boolean;
  currentTime: number;
  ghostPlayheadTime: number | null; // Last clicked position on waveform
  showGhostInTimeline: boolean; // Toggle for ghost playhead in timeline
  showTimeline: boolean; // Toggle for timeline visibility
  layerSpecificNavigation: boolean; // Toggle for layer-specific Marker Selection
  viewportStartTime: number; // Start time of visible waveform section
  viewportDuration: number; // Duration of visible waveform section (ms)
  pixelsPerSecond: number; // Zoom level (pixels per second)
  songDuration: number;
  layers: Layer[];
  allLayersData: Layer[]; // Persistent storage for all layers
  activeLayerId: LayerId;
  songLoaded: boolean;
  stemCount: 2 | 4 | 6;
  isViewportLocked: boolean; // Whether viewport follows playhead
  bpm: number;
  viewMode: 'unified' | 'multitrack';
  primaryView: 'wrapped' | 'detail';
  countSize: 4 | 6 | 8;
  rowDensity: RowDensity;
  followPlayhead: boolean;
  loopStartMs: number | null;
  loopEndMs: number | null;
  isLoopRangeEnabled: boolean;
  isLoopMarkerActive: boolean;
  loopRestoreSnapshot: LoopRestoreSnapshot | null;
  pendingLoopRangeEnabled: boolean;
  loadedProjectSource: BeatNoteProject | null;
  selectedRowIndex: number | null;
  selectedMarker: SelectedMarker | null;
  showGridLines: boolean;
  isSidebarCollapsed: boolean;
  showHelpScreen: boolean;
  showExportModal: boolean;
  showImportModal: boolean;
  lastRemovedMarker: { layerId: LayerId; timestamp: number } | null;
  isRepeatActive: boolean;
  magneticSnapping: boolean;
  showAnnotations: boolean;
  isTextInputFocused: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setGhostPlayheadTime: (time: number | null) => void;
  setShowGhostInTimeline: (show: boolean) => void;
  setShowTimeline: (show: boolean) => void;
  setLayerSpecificNavigation: (enabled: boolean) => void;
  setViewportStartTime: (time: number) => void;
  setViewportDuration: (duration: number) => void;
  setPixelsPerSecond: (pps: number) => void;
  setSongDuration: (duration: number) => void;
  setViewportLocked: (locked: boolean) => void;
  setBpm: (bpm: number) => void;
  setViewMode: (mode: 'unified' | 'multitrack') => void;
  setPrimaryView: (view: 'wrapped' | 'detail') => void;
  setCountSize: (size: 4 | 6 | 8) => void;
  setRowDensity: (density: RowDensity) => void;
  setFollowPlayhead: (follow: boolean) => void;
  setLoopRange: (startMs: number | null, endMs: number | null) => boolean;
  setLoopStartAtPlayhead: (playheadMs: number) => void;
  setLoopEndAtPlayhead: (playheadMs: number) => void;
  nudgeLoopBound: (bound: 'start' | 'end', steps: number) => void;
  clearLoopRange: (nowMs: number) => void;
  restoreLoopRange: (nowMs: number) => void;
  discardLoopRestore: () => void;
  setLoopRangeEnabled: (enabled: boolean) => void;
  toggleLoopRangeEnabled: () => void;
  toggleLoopMarker: () => void;
  cycleInnerLoop: () => InnerLoopState;
  resetLoopForNewAudio: () => void;
  setSelectedRowIndex: (index: number | null) => void;
  setSelectedMarker: (marker: SelectedMarker | null) => void;
  setShowGridLines: (show: boolean) => void;
  toggleSidebar: () => void;
  setShowHelpScreen: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowImportModal: (show: boolean) => void;
  toggleRepeat: () => void;
  setMagneticSnapping: (enabled: boolean) => void;
  setShowAnnotations: (show: boolean) => void;
  updateMarkerAnnotation: (layerId: LayerId, timestamp: number, text: string) => void;
  setTextInputFocused: (focused: boolean) => void;
  navigateToLeftMarker: () => void;
  navigateToRightMarker: () => void;
  addMarker: (timestamp: number) => void;
  removeMarker: (timestamp: number) => void;
  removeLastMarker: () => void;
  redoLastMarker: () => void;
  clearAllMarkers: () => void;
  scrollTimeline: (direction: 'left' | 'right') => void;
  zoomTimeline: (direction: 'in' | 'out') => void;
  skipPlayhead: (direction: 'left' | 'right') => void;
  setSongLoaded: (loaded: boolean) => void;
  saveProject: (name: string, audioUri: string, audioFilename: string) => Promise<string>;
  loadProject: (filename: string) => Promise<{ audioUri: string; audioFilename: string }>;
  importFromCSV: (csvContent: string) => Promise<ImportResult>;
  setActiveLayer: (layerId: LayerId) => void;
  toggleLayerVisibility: (layerId: LayerId) => void;
  setStemCount: (count: 2 | 4 | 6) => void;
  // Stem separation state (Requirements 6.1, 6.2, 6.3, 6.4)
  stemSeparationStatus: StemSeparationStatus;
  stemSeparationProgress: number;
  separatedStemUris: Partial<Record<LayerId, string>>;
  setStemSeparationStatus: (status: StemSeparationStatus) => void;
  setStemSeparationProgress: (progress: number) => void;
  setSeparatedStemUris: (uris: Partial<Record<LayerId, string>>) => void;
}

const allLayers: Layer[] = [
  { id: 'vocals', name: 'Vocals', color: '#ff6666', markers: [], annotations: [], isVisible: true },
  { id: 'drums', name: 'Drums', color: '#00ccff', markers: [], annotations: [], isVisible: true },
  { id: 'bass', name: 'Bass', color: '#bb66ff', markers: [], annotations: [], isVisible: true },
  { id: 'piano', name: 'Piano', color: '#ffcc00', markers: [], annotations: [], isVisible: true },
  { id: 'guitar', name: 'Guitar', color: '#d2b48c', markers: [], annotations: [], isVisible: true },
  { id: 'other', name: 'Other', color: '#ff69b4', markers: [], annotations: [], isVisible: true },
];

const getVisibleLayerIds = (stemCount: 2 | 4 | 6): LayerId[] => {
  switch (stemCount) {
    case 2:
      return ['vocals', 'other'];
    case 4:
      return ['vocals', 'drums', 'bass', 'other'];
    case 6:
      return ['vocals', 'drums', 'bass', 'piano', 'guitar', 'other'];
    default:
      return ['vocals', 'drums', 'bass', 'other'];
  }
};

const getLayersForDisplay = (allLayersData: Layer[], stemCount: 2 | 4 | 6): Layer[] => {
  const visibleIds = getVisibleLayerIds(stemCount);
  return allLayersData.filter(layer => visibleIds.includes(layer.id));
};

export const studioStoreCreator: StateCreator<StudioStore> = (set, get) => ({
  isPlaying: false,
  currentTime: 0,
  ghostPlayheadTime: null,
  showGhostInTimeline: false,
  showTimeline: true,
  layerSpecificNavigation: false,
  viewportStartTime: 0,
  viewportDuration: 20000, // Default 20 seconds visible
  pixelsPerSecond: 40, // Default zoom level (800px / 20s)
  songDuration: 180000, // Default 3 minutes in ms
  layers: getLayersForDisplay(allLayers, 4),
  allLayersData: allLayers,
  activeLayerId: 'vocals',
  songLoaded: false,
  stemCount: 4,
  isViewportLocked: true,
  bpm: 120,
  viewMode: 'unified',
  primaryView: 'wrapped',
  countSize: 8,
  rowDensity: { mode: 'phrase' },
  followPlayhead: true,
  loopStartMs: null,
  loopEndMs: null,
  isLoopRangeEnabled: false,
  isLoopMarkerActive: false,
  loopRestoreSnapshot: null,
  pendingLoopRangeEnabled: false,
  loadedProjectSource: null,
  selectedRowIndex: null,
  selectedMarker: null,
  showGridLines: true,
  isSidebarCollapsed: true,
  showHelpScreen: false,
  showExportModal: false,
  showImportModal: false,
  lastRemovedMarker: null,
  isRepeatActive: false,
  magneticSnapping: true,
  showAnnotations: true,
  isTextInputFocused: false,
  stemSeparationStatus: 'idle',
  stemSeparationProgress: 0,
  separatedStemUris: {},
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setGhostPlayheadTime: (time) => set({ ghostPlayheadTime: time }),
  setShowGhostInTimeline: (show) => set({ showGhostInTimeline: show }),
  setShowTimeline: (show) => set({ showTimeline: show }),
  setLayerSpecificNavigation: (enabled) => set({ layerSpecificNavigation: enabled }),
  setViewportStartTime: (time) => set((state) => {
    const constrainedStartTime = Math.max(0, Math.min(time, state.songDuration - state.viewportDuration));
    return { viewportStartTime: constrainedStartTime };
  }),
  setViewportDuration: (duration) => set((state) => {
    const constrainedDuration = Math.min(duration, state.songDuration);
    const constrainedStartTime = Math.max(0, Math.min(state.viewportStartTime, state.songDuration - constrainedDuration));
    return { 
      viewportDuration: constrainedDuration,
      viewportStartTime: constrainedStartTime
    };
  }),
  setPixelsPerSecond: (pps) => set({ pixelsPerSecond: pps }),
  setSongDuration: (duration) => set((state) => {
    const roundedDuration = Number.isFinite(duration) && duration > 0
      ? Math.floor(duration + 0.5)
      : duration;
    if (Object.is(roundedDuration, state.songDuration)) return {};

    const previousDurationIsValid = Number.isFinite(state.songDuration) && state.songDuration > 0;
    const durationIsValid = Number.isFinite(roundedDuration) && roundedDuration > 0;
    const baseUpdate = durationIsValid && state.songLoaded
      ? {
          songDuration: roundedDuration,
          viewportStartTime: 0,
          viewportDuration: roundedDuration,
          pixelsPerSecond: 800 / (roundedDuration / 1000),
        }
      : { songDuration: roundedDuration };

    if (!durationIsValid) {
      return {
        ...baseUpdate,
        isLoopRangeEnabled: false,
        pendingLoopRangeEnabled: previousDurationIsValid
          ? state.isLoopRangeEnabled
          : state.pendingLoopRangeEnabled,
      };
    }

    if (state.loopStartMs === null || state.loopEndMs === null) {
      return {
        ...baseUpdate,
        isLoopRangeEnabled: false,
        pendingLoopRangeEnabled: false,
      };
    }

    const previousRange = { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs };
    const reclamped = reclampLoopRangeToDuration(previousRange, roundedDuration);
    if (!isValidLoopRange(reclamped, roundedDuration)) {
      console.warn('Clearing loop range after duration change', {
        loopStartMs: state.loopStartMs,
        loopEndMs: state.loopEndMs,
        songDuration: roundedDuration,
      });
      return {
        ...baseUpdate,
        loopStartMs: null,
        loopEndMs: null,
        isLoopRangeEnabled: false,
        pendingLoopRangeEnabled: false,
      };
    }

    const restoredEnabled = previousDurationIsValid
      ? state.isLoopRangeEnabled
      : state.pendingLoopRangeEnabled;
    return {
      ...baseUpdate,
      loopStartMs: reclamped.loopStartMs,
      loopEndMs: reclamped.loopEndMs,
      isLoopRangeEnabled: restoredEnabled,
      isLoopMarkerActive: restoredEnabled ? false : state.isLoopMarkerActive,
      pendingLoopRangeEnabled: false,
    };
  }),
  setViewportLocked: (locked) => set({ isViewportLocked: locked }),
  setBpm: (bpm) => set({ bpm }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPrimaryView: (view) => set({ primaryView: view }),
  setCountSize: (size) => set({ countSize: size }),
  setRowDensity: (density) => set({ rowDensity: density }),
  setFollowPlayhead: (follow) => set({ followPlayhead: follow }),
  setLoopRange: (startMs, endMs) => {
    const state = get();
    if (startMs === null && endMs === null) {
      set({
        loopStartMs: null,
        loopEndMs: null,
        isLoopRangeEnabled: false,
        pendingLoopRangeEnabled: false,
      });
      return true;
    }
    if (typeof startMs !== 'number' || typeof endMs !== 'number'
      || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      console.warn('Rejected non-finite loop range', { startMs, endMs });
      return false;
    }

    const normalized = normalizeLoopRange(startMs, endMs, state.songDuration);
    const durationIsValid = Number.isFinite(state.songDuration) && state.songDuration > 0;
    const acceptable = durationIsValid
      ? isValidLoopRange(normalized, state.songDuration)
      : normalized.loopStartMs !== null && normalized.loopEndMs !== null;
    if (!acceptable) {
      console.warn('Rejected invalid loop range', { startMs, endMs, songDuration: state.songDuration });
      return false;
    }

    const hadValidRange = isValidLoopRange(
      { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs },
      state.songDuration,
    );
    if (state.loopStartMs === normalized.loopStartMs
      && state.loopEndMs === normalized.loopEndMs
      && state.pendingLoopRangeEnabled === false
      && state.loopRestoreSnapshot === null) {
      return true;
    }
    set({
      loopStartMs: normalized.loopStartMs,
      loopEndMs: normalized.loopEndMs,
      isLoopRangeEnabled: hadValidRange ? state.isLoopRangeEnabled : false,
      pendingLoopRangeEnabled: false,
      loopRestoreSnapshot: null,
    });
    return true;
  },
  setLoopStartAtPlayhead: (playheadMs) => {
    const state = get();
    if (!Number.isFinite(playheadMs) || !Number.isFinite(state.songDuration) || state.songDuration <= 0) {
      console.warn('Rejected loop start at playhead', { playheadMs, songDuration: state.songDuration });
      return;
    }
    const startMs = Math.max(0, Math.min(Math.round(playheadMs), state.songDuration));
    const currentRange = { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs };
    const endMs = isValidLoopRange(currentRange, state.songDuration)
      && (state.loopEndMs as number) - startMs >= MIN_LOOP_DURATION_MS
      ? state.loopEndMs as number
      : Math.min(state.songDuration, startMs + MIN_LOOP_DURATION_MS);
    if (!isValidLoopRange({ loopStartMs: startMs, loopEndMs: endMs }, state.songDuration)) {
      console.warn('Rejected loop start at playhead', { startMs, endMs });
      return;
    }
    get().setLoopRange(startMs, endMs);
  },
  setLoopEndAtPlayhead: (playheadMs) => {
    const state = get();
    if (!Number.isFinite(playheadMs) || !Number.isFinite(state.songDuration) || state.songDuration <= 0) {
      console.warn('Rejected loop end at playhead', { playheadMs, songDuration: state.songDuration });
      return;
    }
    const endMs = Math.max(0, Math.min(Math.round(playheadMs), state.songDuration));
    const currentRange = { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs };
    const startMs = isValidLoopRange(currentRange, state.songDuration)
      && endMs - (state.loopStartMs as number) >= MIN_LOOP_DURATION_MS
      ? state.loopStartMs as number
      : Math.max(0, endMs - MIN_LOOP_DURATION_MS);
    if (!isValidLoopRange({ loopStartMs: startMs, loopEndMs: endMs }, state.songDuration)) {
      console.warn('Rejected loop end at playhead', { startMs, endMs });
      return;
    }
    get().setLoopRange(startMs, endMs);
  },
  nudgeLoopBound: (bound, steps) => {
    const state = get();
    const range = { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs };
    if (!Number.isFinite(steps) || !isValidLoopRange(range, state.songDuration)) return;
    const currentBound = bound === 'start' ? state.loopStartMs as number : state.loopEndMs as number;
    const resized = resizeLoopBound(
      range,
      bound,
      currentBound + Math.round(steps) * beatStepMs(state.bpm),
      state.songDuration,
    );
    get().setLoopRange(resized.loopStartMs, resized.loopEndMs);
  },
  clearLoopRange: (nowMs) => set((state) => {
    const range = { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs };
    if (!Number.isFinite(nowMs) || !isValidLoopRange(range, state.songDuration)) return {};
    return {
      loopRestoreSnapshot: {
        loopStartMs: state.loopStartMs,
        loopEndMs: state.loopEndMs,
        isLoopRangeEnabled: state.isLoopRangeEnabled,
        expiresAtMs: nowMs + RESTORE_WINDOW_MS,
      },
      loopStartMs: null,
      loopEndMs: null,
      isLoopRangeEnabled: false,
      pendingLoopRangeEnabled: false,
    };
  }),
  restoreLoopRange: (nowMs) => {
    const state = get();
    const snapshot = state.loopRestoreSnapshot;
    if (!snapshot || !Number.isFinite(nowMs) || nowMs >= snapshot.expiresAtMs) {
      if (snapshot) set({ loopRestoreSnapshot: null });
      return;
    }
    const normalized = normalizeLoopRange(snapshot.loopStartMs, snapshot.loopEndMs, state.songDuration);
    if (!isValidLoopRange(normalized, state.songDuration)) {
      set({ loopRestoreSnapshot: null });
      return;
    }
    set({
      loopStartMs: normalized.loopStartMs,
      loopEndMs: normalized.loopEndMs,
      isLoopRangeEnabled: snapshot.isLoopRangeEnabled,
      isLoopMarkerActive: snapshot.isLoopRangeEnabled ? false : state.isLoopMarkerActive,
      pendingLoopRangeEnabled: false,
      loopRestoreSnapshot: null,
    });
  },
  discardLoopRestore: () => set({ loopRestoreSnapshot: null }),
  setLoopRangeEnabled: (enabled) => set((state) => {
    const valid = state.songLoaded && isValidLoopRange(
      { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs },
      state.songDuration,
    );
    const nextEnabled = enabled && valid;
    return {
      isLoopRangeEnabled: nextEnabled,
      isLoopMarkerActive: nextEnabled ? false : state.isLoopMarkerActive,
    };
  }),
  toggleLoopRangeEnabled: () => set((state) => {
    const valid = state.songLoaded && isValidLoopRange(
      { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs },
      state.songDuration,
    );
    const nextEnabled = valid ? !state.isLoopRangeEnabled : false;
    return {
      isLoopRangeEnabled: nextEnabled,
      isLoopMarkerActive: nextEnabled ? false : state.isLoopMarkerActive,
    };
  }),
  toggleLoopMarker: () => set((state) => {
    if (!state.songLoaded) return { isLoopMarkerActive: false };
    const nextEnabled = !state.isLoopMarkerActive;
    return {
      isLoopMarkerActive: nextEnabled,
      isLoopRangeEnabled: nextEnabled ? false : state.isLoopRangeEnabled,
    };
  }),
  cycleInnerLoop: () => {
    const state = get();
    const current = deriveInnerLoopState(state.isLoopMarkerActive, state.isLoopRangeEnabled);
    if (!state.songLoaded) return current;

    if (current === 'off') {
      set({ isLoopMarkerActive: true, isLoopRangeEnabled: false });
      return 'markers';
    }
    if (current === 'range') {
      set({ isLoopMarkerActive: false, isLoopRangeEnabled: false });
      return 'off';
    }

    const hasValidRange = isValidLoopRange(
      { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs },
      state.songDuration,
    );
    if (!canEnterRangeState(state.songDuration, hasValidRange)) return current;
    if (!hasValidRange && !get().setLoopRange(0, state.songDuration)) return current;
    const next = get();
    const rangeIsValid = isValidLoopRange(
      { loopStartMs: next.loopStartMs, loopEndMs: next.loopEndMs },
      next.songDuration,
    );
    if (!rangeIsValid) return current;
    set({ isLoopMarkerActive: false, isLoopRangeEnabled: true });
    return 'range';
  },
  resetLoopForNewAudio: () => set({
    loopStartMs: null,
    loopEndMs: null,
    isLoopRangeEnabled: false,
    isLoopMarkerActive: false,
    pendingLoopRangeEnabled: false,
    loopRestoreSnapshot: null,
    loadedProjectSource: null,
  }),
  setSelectedRowIndex: (index) => set({ selectedRowIndex: index }),
  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  setShowGridLines: (show) => set({ showGridLines: show }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setShowHelpScreen: (show) => set({ showHelpScreen: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setShowImportModal: (show) => set({ showImportModal: show }),
  toggleRepeat: () => set((state) => ({ isRepeatActive: !state.isRepeatActive })),
  setMagneticSnapping: (enabled) => set({ magneticSnapping: enabled }),
  setShowAnnotations: (show) => set({ showAnnotations: show }),
  setTextInputFocused: (focused) => set({ isTextInputFocused: focused }),
  setStemSeparationStatus: (status) => set({ stemSeparationStatus: status }),
  setStemSeparationProgress: (progress) => set({ stemSeparationProgress: progress }),
  setSeparatedStemUris: (uris) => set({ separatedStemUris: uris }),
  updateMarkerAnnotation: (layerId, timestamp, text) => set((state) => {
    const updatedAllLayers = state.allLayersData.map(layer => {
      if (layer.id === layerId) {
        const existingIndex = layer.annotations.findIndex(ann => Math.abs(ann.timestamp - timestamp) < 100);
        const newAnnotations = [...layer.annotations];
        
        if (existingIndex >= 0) {
          if (text.trim()) {
            newAnnotations[existingIndex] = { timestamp, text };
          } else {
            newAnnotations.splice(existingIndex, 1);
          }
        } else if (text.trim()) {
          newAnnotations.push({ timestamp, text });
        }
        
        return { ...layer, annotations: newAnnotations };
      }
      return layer;
    });
    
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount)
    };
  }),
  navigateToLeftMarker: () => set((state) => {
    const baseMarkers = state.layerSpecificNavigation 
      ? state.allLayersData.find(layer => layer.id === state.activeLayerId)?.markers || []
      : state.allLayersData.flatMap(layer => layer.markers);
    
    const allMarkers = [...baseMarkers]; // Create a copy to avoid mutation
    
    if (state.ghostPlayheadTime !== null) {
      allMarkers.push(state.ghostPlayheadTime);
    }
    allMarkers.push(0); // Start of song
    
    const leftMarkers = allMarkers
      .filter(marker => marker < state.currentTime)
      .sort((a, b) => b - a); // Descending order
    
    if (leftMarkers.length > 0) {
      return { currentTime: leftMarkers[0] };
    }
    return {};
  }),
  navigateToRightMarker: () => set((state) => {
    const baseMarkers = state.layerSpecificNavigation 
      ? state.allLayersData.find(layer => layer.id === state.activeLayerId)?.markers || []
      : state.allLayersData.flatMap(layer => layer.markers);
    
    const allMarkers = [...baseMarkers]; // Create a copy to avoid mutation
    
    if (state.ghostPlayheadTime !== null) {
      allMarkers.push(state.ghostPlayheadTime);
    }
    allMarkers.push(state.songDuration); // End of song
    
    const rightMarkers = allMarkers
      .filter(marker => marker > state.currentTime)
      .sort((a, b) => a - b); // Ascending order
    
    if (rightMarkers.length > 0) {
      return { currentTime: rightMarkers[0] };
    }
    return {};
  }),
  addMarker: (timestamp) => set((state) => {
    const markerTime = timestamp;
    const updatedAllLayers = state.allLayersData.map(layer => 
      layer.id === state.activeLayerId
        ? { ...layer, markers: [...layer.markers, markerTime] }
        : layer
    );
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount)
    };
  }),
  removeMarker: (timestamp) => set((state) => {
    const activeLayer = state.allLayersData.find(layer => layer.id === state.activeLayerId);
    const nearestIndex = activeLayer?.markers.reduce((nearest, marker, index, markers) => {
      if (Math.abs(marker - timestamp) > 100) return nearest;
      if (nearest < 0 || Math.abs(marker - timestamp) < Math.abs(markers[nearest] - timestamp)) return index;
      return nearest;
    }, -1) ?? -1;
    if (nearestIndex < 0) return {};
    const removedTimestamp = activeLayer!.markers[nearestIndex];
    const updatedAllLayers = state.allLayersData.map(layer => {
      if (layer.id !== state.activeLayerId) return layer;
      return { ...layer, markers: layer.markers.filter((_, index) => index !== nearestIndex) };
    });
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount),
      selectedMarker: state.selectedMarker
        && state.selectedMarker.layerId === state.activeLayerId
        && state.selectedMarker.timestamp === removedTimestamp
        ? null
        : state.selectedMarker,
    };
  }),
  removeLastMarker: () => set((state) => {
    const baseMarkers = state.layerSpecificNavigation 
      ? state.allLayersData.find(layer => layer.id === state.activeLayerId)?.markers || []
      : state.allLayersData.flatMap(layer => layer.markers);
    
    const leftMarkers = baseMarkers
      .filter(marker => marker < state.currentTime)
      .sort((a, b) => b - a); // Descending order
    
    if (leftMarkers.length === 0) return {};
    
    const markerToRemove = leftMarkers[0];
    let layerIdToRemoveFrom = state.activeLayerId;
    
    if (!state.layerSpecificNavigation) {
      // Find which layer contains this marker
      const layerWithMarker = state.allLayersData.find(layer => 
        layer.markers.includes(markerToRemove)
      );
      if (layerWithMarker) {
        layerIdToRemoveFrom = layerWithMarker.id;
      }
    }
    
    let removed = false;
    const updatedAllLayers = state.allLayersData.map(layer => {
      if (layer.id !== layerIdToRemoveFrom || removed) return layer;
      const markerIndex = layer.markers.findIndex(marker => marker === markerToRemove);
      if (markerIndex < 0) return layer;
      removed = true;
      return { ...layer, markers: layer.markers.filter((_, index) => index !== markerIndex) };
    });
    
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount),
      lastRemovedMarker: { layerId: layerIdToRemoveFrom, timestamp: markerToRemove },
      selectedMarker: state.selectedMarker
        && state.selectedMarker.layerId === layerIdToRemoveFrom
        && state.selectedMarker.timestamp === markerToRemove
        ? null
        : state.selectedMarker,
    };
  }),
  redoLastMarker: () => set((state) => {
    if (!state.lastRemovedMarker) return {};
    
    const { layerId, timestamp } = state.lastRemovedMarker;
    const updatedAllLayers = state.allLayersData.map(layer => 
      layer.id === layerId
        ? { ...layer, markers: [...layer.markers, timestamp] }
        : layer
    );
    
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount),
      lastRemovedMarker: null
    };
  }),
  scrollTimeline: (direction) => set((state) => {
    const scrollAmount = state.viewportDuration * 0.1; // 10% of viewport
    const newStartTime = direction === 'left' 
      ? Math.max(0, state.viewportStartTime - scrollAmount)
      : Math.min(state.songDuration - state.viewportDuration, state.viewportStartTime + scrollAmount);
    
    return { viewportStartTime: newStartTime };
  }),
  zoomTimeline: (direction) => set((state) => {
    const zoomFactor = direction === 'in' ? 1.2 : 0.8;
    const newPixelsPerSecond = Math.max(10, Math.min(200, state.pixelsPerSecond * zoomFactor));
    const newViewportDuration = 800 / newPixelsPerSecond * 1000; // 800px width
    
    return { 
      pixelsPerSecond: newPixelsPerSecond,
      viewportDuration: newViewportDuration
    };
  }),
  skipPlayhead: (direction) => set((state) => {
    const newTime = direction === 'left' ? 0 : state.songDuration;
    return { currentTime: newTime };
  }),
  clearAllMarkers: () => set((state) => {
    const clearedAllLayers = state.allLayersData.map(layer => ({ ...layer, markers: [] }));
    return {
      allLayersData: clearedAllLayers,
      layers: getLayersForDisplay(clearedAllLayers, state.stemCount),
      lastRemovedMarker: null,
      selectedMarker: null,
    };
  }),
  setSongLoaded: (loaded) => set((state) => {
    if (loaded) {
      return {
        songLoaded: loaded,
        viewportStartTime: 0,
        viewportDuration: state.songDuration,
        pixelsPerSecond: 800 / (state.songDuration / 1000) // Fit entire song in 800px
      };
    }
    return { songLoaded: loaded, selectedMarker: null, isLoopMarkerActive: false };
  }),
  setActiveLayer: (layerId) => set({ activeLayerId: layerId }),
  toggleLayerVisibility: (layerId) => set((state) => {
    const updatedAllLayers = state.allLayersData.map(layer => 
      layer.id === layerId
        ? { ...layer, isVisible: !layer.isVisible }
        : layer
    );
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount)
    };
  }),
  setStemCount: (count) => set((state) => {
    const newVisibleLayers = getLayersForDisplay(state.allLayersData, count);
    const visibleIds = getVisibleLayerIds(count);
    const activeExists = visibleIds.includes(state.activeLayerId);
    return {
      stemCount: count,
      layers: newVisibleLayers,
      activeLayerId: activeExists ? state.activeLayerId : newVisibleLayers[0].id
    };
  }),
  saveProject: async (name: string, audioUri: string, audioFilename: string) => {
    const state = get();
    const compatibilitySource = state.loadedProjectSource
      && compareProjectVersion(state.loadedProjectSource.version, PROJECT_VERSION) > 0
      ? state.loadedProjectSource
      : null;
    const validLoopRange = isValidLoopRange(
      { loopStartMs: state.loopStartMs, loopEndMs: state.loopEndMs },
      state.songDuration,
    );
    const project: BeatNoteProject = {
      ...(compatibilitySource ?? {}),
      version: compatibilitySource?.version ?? PROJECT_VERSION,
      metadata: {
        name,
        bpm: state.bpm,
        duration: state.songDuration,
        stemCount: state.stemCount,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      audio: {
        uri: audioUri,
        filename: audioFilename,
      },
      layers: state.allLayersData.map(layer => ({
        id: layer.id,
        name: layer.name,
        color: layer.color,
        markers: layer.markers,
        annotations: layer.annotations,
        isVisible: layer.isVisible,
      })),
      settings: {
        ...(compatibilitySource?.settings ?? {}),
        viewMode: state.viewMode,
        showGridLines: state.showGridLines,
        layerSpecificNavigation: state.layerSpecificNavigation,
        primaryView: state.primaryView,
        countSize: state.countSize,
        rowDensity: state.rowDensity,
        followPlayhead: state.followPlayhead,
        loopRange: validLoopRange
          ? { startMs: state.loopStartMs as number, endMs: state.loopEndMs as number }
          : null,
        loopEnabled: validLoopRange ? state.isLoopRangeEnabled : false,
      },
    };
    const filename = await ProjectManager.saveProject(project);
    set({ loadedProjectSource: project });
    return filename;
  },
  loadProject: async (filename: string) => {
    const project = await ProjectManager.loadProject(filename);
    const loadedDuration = Number.isFinite(project.metadata.duration) && project.metadata.duration > 0
      ? Math.floor(project.metadata.duration + 0.5)
      : project.metadata.duration;
    const persistedRange = project.settings.loopRange ?? null;
    const hasPersistedRange = persistedRange !== null;
    const loadedRange = hasPersistedRange
      ? { loopStartMs: persistedRange.startMs, loopEndMs: persistedRange.endMs }
      : { loopStartMs: null, loopEndMs: null };
    const durationIsValid = Number.isFinite(loadedDuration) && loadedDuration > 0;
    const loopIsValid = durationIsValid && isValidLoopRange(loadedRange, loadedDuration);
    const requestedEnabled = project.settings.loopEnabled === true;
    const updatedAllLayers = allLayers.map(layer => {
      const projectLayer = project.layers.find(pl => pl.id === layer.id);
      return projectLayer ? {
        ...layer,
        markers: projectLayer.markers,
        annotations: projectLayer.annotations || [],
        isVisible: projectLayer.isVisible,
      } : layer;
    });
    
    set({
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, project.metadata.stemCount),
      stemCount: project.metadata.stemCount,
      bpm: project.metadata.bpm,
      songDuration: loadedDuration,
      viewMode: project.settings.viewMode,
      primaryView: project.settings.primaryView ?? 'wrapped',
      countSize: project.settings.countSize ?? 8,
      rowDensity: project.settings.rowDensity ?? { mode: 'phrase' },
      followPlayhead: project.settings.followPlayhead ?? true,
      showGridLines: project.settings.showGridLines,
      layerSpecificNavigation: project.settings.layerSpecificNavigation,
      songLoaded: true,
      currentTime: 0,
      selectedRowIndex: null,
      selectedMarker: null,
      loopStartMs: loadedRange.loopStartMs,
      loopEndMs: loadedRange.loopEndMs,
      isLoopRangeEnabled: loopIsValid && requestedEnabled,
      isLoopMarkerActive: false,
      pendingLoopRangeEnabled: !durationIsValid && hasPersistedRange && requestedEnabled,
      loopRestoreSnapshot: null,
      loadedProjectSource: project,
    });
    return { audioUri: project.audio.uri, audioFilename: project.audio.filename };
  },
  importFromCSV: async (csvContent: string) => {
    const importData = await ImportEngine.importFromCSV(csvContent);
    const state = get();
    
    const updatedAllLayers = state.allLayersData.map(layer => {
      const importedLayer = importData.layers[layer.id];
      if (importedLayer) {
        return {
          ...layer,
          markers: [...layer.markers, ...importedLayer.markers],
          annotations: [...layer.annotations, ...importedLayer.annotations]
        };
      }
      return layer;
    });
    
    set({
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount)
    });
    return importData;
  },
});

export const useStudioStore = create<StudioStore>(studioStoreCreator);
