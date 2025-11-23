import { create } from 'zustand';

export type LayerId = 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'other';

export interface Layer {
  id: LayerId;
  name: string;
  color: string;
  markers: number[];
  isVisible: boolean;
}

interface StudioStore {
  isPlaying: boolean;
  currentTime: number;
  ghostPlayheadTime: number | null; // Last clicked position on waveform
  showGhostInTimeline: boolean; // Toggle for ghost playhead in timeline
  layerSpecificNavigation: boolean; // Toggle for layer-specific marker navigation
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
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setGhostPlayheadTime: (time: number | null) => void;
  setShowGhostInTimeline: (show: boolean) => void;
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
  navigateToLeftMarker: () => void;
  navigateToRightMarker: () => void;
  addMarker: (timestamp: number) => void;
  removeMarker: (timestamp: number) => void;
  clearAllMarkers: () => void;
  setSongLoaded: (loaded: boolean) => void;
  setActiveLayer: (layerId: LayerId) => void;
  toggleLayerVisibility: (layerId: LayerId) => void;
  setStemCount: (count: 2 | 4 | 6) => void;
}

const allLayers: Layer[] = [
  { id: 'vocals', name: 'Vocals', color: '#ff6666', markers: [], isVisible: true },
  { id: 'drums', name: 'Drums', color: '#00ccff', markers: [], isVisible: true },
  { id: 'bass', name: 'Bass', color: '#bb66ff', markers: [], isVisible: true },
  { id: 'piano', name: 'Piano', color: '#ffcc00', markers: [], isVisible: true },
  { id: 'guitar', name: 'Guitar', color: '#d2b48c', markers: [], isVisible: true },
  { id: 'other', name: 'Other', color: '#ff69b4', markers: [], isVisible: true },
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
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setGhostPlayheadTime: (time) => set({ ghostPlayheadTime: time }),
  setShowGhostInTimeline: (show) => set({ showGhostInTimeline: show }),
  setLayerSpecificNavigation: (enabled) => set({ layerSpecificNavigation: enabled }),
  setViewportStartTime: (time) => set({ viewportStartTime: time }),
  setViewportDuration: (duration) => set({ viewportDuration: duration }),
  setPixelsPerSecond: (pps) => set({ pixelsPerSecond: pps }),
  setSongDuration: (duration) => set({ songDuration: duration }),
  setViewportLocked: (locked) => set({ isViewportLocked: locked }),
  setBpm: (bpm) => set({ bpm }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowGridLines: (show) => set({ showGridLines: show }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
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
  clearAllMarkers: () => set((state) => {
    const clearedAllLayers = state.allLayersData.map(layer => ({ ...layer, markers: [] }));
    return {
      allLayersData: clearedAllLayers,
      layers: getLayersForDisplay(clearedAllLayers, state.stemCount)
    };
  }),
  setSongLoaded: (loaded) => set({ songLoaded: loaded }),
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
}));