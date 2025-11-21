import { create } from 'zustand';

interface StudioStore {
  isPlaying: boolean;
  currentTime: number;
  markers: number[];
  songLoaded: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  addMarker: (timestamp: number) => void;
  removeMarker: (timestamp: number) => void;
  clearMarkers: () => void;
  setSongLoaded: (loaded: boolean) => void;
}

export const useStudioStore = create<StudioStore>((set) => ({
  isPlaying: false,
  currentTime: 0,
  markers: [],
  songLoaded: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  addMarker: (timestamp) => set((state) => ({ 
    markers: [...state.markers, timestamp] 
  })),
  removeMarker: (timestamp) => set((state) => ({
    markers: state.markers.filter(marker => Math.abs(marker - timestamp) > 100)
  })),
  clearMarkers: () => set({ markers: [] }),
  setSongLoaded: (loaded) => set({ songLoaded: loaded }),
}));