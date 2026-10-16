import fc from 'fast-check';
import { create } from 'zustand';
import { studioStoreCreator, type StudioStore } from '../../src/hooks/useStudioStore';
import { MIN_LOOP_DURATION_MS } from '../../src/utils/loopRange';

const freshStore = () => create<StudioStore>(studioStoreCreator);

describe('cycleInnerLoop', () => {
  it('cycles off to markers to range to off and auto-initializes the whole-song range', () => {
    const store = freshStore();
    store.getState().setSongLoaded(true);
    store.getState().setSongDuration(60000);
    expect(store.getState().cycleInnerLoop()).toBe('markers');
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: true, isLoopRangeEnabled: false });
    expect(store.getState().cycleInnerLoop()).toBe('range');
    expect(store.getState()).toMatchObject({
      isLoopMarkerActive: false,
      isLoopRangeEnabled: true,
      loopStartMs: 0,
      loopEndMs: 60000,
    });
    expect(store.getState().cycleInnerLoop()).toBe('off');
  });

  it('keeps markers active when range entry is unavailable', () => {
    const store = freshStore();
    store.getState().setSongLoaded(true);
    store.getState().setSongDuration(MIN_LOOP_DURATION_MS - 1);
    expect(store.getState().cycleInnerLoop()).toBe('markers');
    expect(store.getState().cycleInnerLoop()).toBe('markers');
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: true, isLoopRangeEnabled: false });
  });

  it('does not transition while audio is unloaded and never changes repeat', () => {
    const store = freshStore();
    store.setState({ isRepeatActive: true });
    expect(store.getState().cycleInnerLoop()).toBe('off');
    expect(store.getState().isRepeatActive).toBe(true);
  });

  it('Feature: playback-marker-control-dock, Property 3: repeat remains independent', () => {
    fc.assert(fc.property(fc.boolean(), fc.integer({ min: 0, max: 30 }), (repeat, taps) => {
      const store = freshStore();
      store.setState({ songLoaded: true, songDuration: 10000, isRepeatActive: repeat });
      for (let index = 0; index < taps; index += 1) store.getState().cycleInnerLoop();
      expect(store.getState().isRepeatActive).toBe(repeat);
      expect(store.getState().isLoopMarkerActive && store.getState().isLoopRangeEnabled).toBe(false);
    }), { numRuns: 100 });
  });
});

describe('dock marker removal actions', () => {
  it('removes only the nearest marker within the inclusive 100 ms toggle window', () => {
    const store = freshStore();
    store.setState(state => ({
      activeLayerId: 'vocals',
      allLayersData: state.allLayersData.map(layer => layer.id === 'vocals'
        ? { ...layer, markers: [900, 950, 1100] }
        : layer),
    }));
    store.getState().removeMarker(1000);
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')?.markers).toEqual([900, 1100]);
  });

  it('removes exactly one previous marker and records it for redo', () => {
    const store = freshStore();
    store.setState(state => ({
      currentTime: 2000,
      layerSpecificNavigation: true,
      activeLayerId: 'vocals',
      allLayersData: state.allLayersData.map(layer => layer.id === 'vocals'
        ? { ...layer, markers: [1000, 1000, 3000] }
        : layer),
    }));
    store.getState().removeLastMarker();
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')?.markers).toEqual([1000, 3000]);
    expect(store.getState().lastRemovedMarker).toEqual({ layerId: 'vocals', timestamp: 1000 });
  });

  it('restores a deleted marker together with its annotation', () => {
    const store = freshStore();
    store.setState(state => ({
      currentTime: 2000,
      layerSpecificNavigation: true,
      activeLayerId: 'vocals',
      allLayersData: state.allLayersData.map(layer => layer.id === 'vocals'
        ? { ...layer, markers: [1000], annotations: [{ timestamp: 1000, text: 'Turn' }] }
        : layer),
    }));

    store.getState().removeLastMarker();
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')).toMatchObject({
      markers: [],
      annotations: [],
    });
    store.getState().restoreLastMarkerDeletion();
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')).toMatchObject({
      markers: [1000],
      annotations: [{ timestamp: 1000, text: 'Turn' }],
    });
  });

  it('deletes every marker before the playhead across layers and restores the batch', () => {
    const store = freshStore();
    store.setState(state => ({
      allLayersData: state.allLayersData.map(layer => layer.id === 'vocals'
        ? { ...layer, markers: [500, 1500, 2500], annotations: [{ timestamp: 500, text: 'Start' }] }
        : layer.id === 'drums'
          ? { ...layer, markers: [1000, 3000] }
          : layer),
    }));

    expect(store.getState().deleteMarkersBefore(2000)).toBe(3);
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')?.markers).toEqual([2500]);
    expect(store.getState().allLayersData.find(layer => layer.id === 'drums')?.markers).toEqual([3000]);
    store.getState().restoreLastMarkerDeletion();
    expect(store.getState().allLayersData.find(layer => layer.id === 'vocals')?.markers).toEqual([500, 1500, 2500]);
    expect(store.getState().allLayersData.find(layer => layer.id === 'drums')?.markers).toEqual([1000, 3000]);
  });
});
