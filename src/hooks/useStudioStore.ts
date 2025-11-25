import { create } from 'zustand';
import { ProjectManager } from '../utils/projectManager';
import { BeatNoteProject } from '../types/project';
import { ImportEngine } from '../utils/importEngine';

export type LayerId = 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'other';

export interface MarkerAnnotation {
  timestamp: number;
  text: string;
}

export interface Layer {
  id: LayerId;
  name: string;
  color: string;
  markers: number[];
  annotations: MarkerAnnotation[];
  isVisible: boolean;
}

interface StudioStore {
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
  showGridLines: boolean;
  isSidebarCollapsed: boolean;
  showHelpScreen: boolean;
  showExportModal: boolean;
  showImportModal: boolean;
  lastRemovedMarker: { layerId: LayerId; timestamp: number } | null;
  isRepeatActive: boolean;
  isLoopMarkerActive: boolean;
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
  setShowGridLines: (show: boolean) => void;
  toggleSidebar: () => void;
  setShowHelpScreen: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowImportModal: (show: boolean) => void;
  toggleRepeat: () => void;
  toggleLoopMarker: () => void;
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
  loadProject: (filename: string) => Promise<void>;
  importFromCSV: (csvContent: string) => Promise<void>;
  setActiveLayer: (layerId: LayerId) => void;
  toggleLayerVisibility: (layerId: LayerId) => void;
  setStemCount: (count: 2 | 4 | 6) => void;
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

export const useStudioStore = create<StudioStore>((set, get) => ({
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
  showGridLines: true,
  isSidebarCollapsed: false,
  showHelpScreen: false,
  showExportModal: false,
  showImportModal: false,
  lastRemovedMarker: null,
  isRepeatActive: false,
  isLoopMarkerActive: false,
  magneticSnapping: true,
  showAnnotations: true,
  isTextInputFocused: false,
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
    if (state.songLoaded) {
      return {
        songDuration: duration,
        viewportStartTime: 0,
        viewportDuration: duration,
        pixelsPerSecond: 800 / (duration / 1000) // Fit entire song in 800px
      };
    }
    return { songDuration: duration };
  }),
  setViewportLocked: (locked) => set({ isViewportLocked: locked }),
  setBpm: (bpm) => set({ bpm }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowGridLines: (show) => set({ showGridLines: show }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setShowHelpScreen: (show) => set({ showHelpScreen: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setShowImportModal: (show) => set({ showImportModal: show }),
  toggleRepeat: () => set((state) => ({ isRepeatActive: !state.isRepeatActive })),
  toggleLoopMarker: () => set((state) => ({ isLoopMarkerActive: !state.isLoopMarkerActive })),
  setMagneticSnapping: (enabled) => set({ magneticSnapping: enabled }),
  setShowAnnotations: (show) => set({ showAnnotations: show }),
  setTextInputFocused: (focused) => set({ isTextInputFocused: focused }),
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
    const updatedAllLayers = state.allLayersData.map(layer => 
      layer.id === state.activeLayerId
        ? { ...layer, markers: layer.markers.filter(marker => Math.abs(marker - timestamp) > 100) }
        : layer
    );
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount)
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
    
    const updatedAllLayers = state.allLayersData.map(layer => 
      layer.id === layerIdToRemoveFrom
        ? { ...layer, markers: layer.markers.filter(marker => marker !== markerToRemove) }
        : layer
    );
    
    return {
      allLayersData: updatedAllLayers,
      layers: getLayersForDisplay(updatedAllLayers, state.stemCount),
      lastRemovedMarker: { layerId: layerIdToRemoveFrom, timestamp: markerToRemove }
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
      lastRemovedMarker: null
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
    return { songLoaded: loaded };
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
    const project: BeatNoteProject = {
      version: '1.0.0',
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
        viewMode: state.viewMode,
        showGridLines: state.showGridLines,
        layerSpecificNavigation: state.layerSpecificNavigation,
      },
    };
    return await ProjectManager.saveProject(project);
  },
  loadProject: async (filename: string) => {
    const project = await ProjectManager.loadProject(filename);
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
      songDuration: project.metadata.duration,
      viewMode: project.settings.viewMode,
      showGridLines: project.settings.showGridLines,
      layerSpecificNavigation: project.settings.layerSpecificNavigation,
      songLoaded: true,
      currentTime: 0,
    });
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
  },
}));