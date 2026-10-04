import { useStudioStore } from '../../src/hooks/useStudioStore';

beforeEach(() => {
  useStudioStore.setState(useStudioStore.getInitialState(), true);
});

describe('wrapped-view store state', () => {
  it('starts with the wrapped-view defaults', () => {
    const state = useStudioStore.getState();
    expect(state.primaryView).toBe('wrapped');
    expect(state.countSize).toBe(8);
    expect(state.rowDensity).toEqual({ mode: 'phrase' });
    expect(state.followPlayhead).toBe(true);
    expect([state.loopStartMs, state.loopEndMs, state.selectedRowIndex, state.selectedMarker])
      .toEqual([null, null, null, null]);
  });

  it('updates each preference and the session-only loop and selection state', () => {
    const state = useStudioStore.getState();
    state.setPrimaryView('detail');
    state.setCountSize(6);
    state.setRowDensity({ mode: 'duration', rowDurationMs: 10000 });
    state.setFollowPlayhead(false);
    state.setLoopRange(2000, 8000);
    state.setSelectedRowIndex(3);
    state.setSelectedMarker({ layerId: 'drums', timestamp: 4500 });

    expect(useStudioStore.getState()).toMatchObject({
      primaryView: 'detail',
      countSize: 6,
      rowDensity: { mode: 'duration', rowDurationMs: 10000 },
      followPlayhead: false,
      loopStartMs: 2000,
      loopEndMs: 8000,
      selectedRowIndex: 3,
      selectedMarker: { layerId: 'drums', timestamp: 4500 },
    });

    state.setLoopRange(null, null);
    state.setSelectedRowIndex(null);
    state.setSelectedMarker(null);
    expect([useStudioStore.getState().loopStartMs, useStudioStore.getState().loopEndMs,
      useStudioStore.getState().selectedRowIndex]).toEqual([null, null, null]);
    expect(useStudioStore.getState().selectedMarker).toBeNull();
  });

  it('clears selection when the selected marker is removed', () => {
    const state = useStudioStore.getState();
    state.addMarker(2500);
    state.setSelectedMarker({ layerId: 'vocals', timestamp: 2500 });
    state.removeMarker(2500);

    expect(useStudioStore.getState().selectedMarker).toBeNull();
  });

  it('switches views and selects a row without changing playback or annotation state', () => {
    const state = useStudioStore.getState();
    state.setIsPlaying(true);
    state.setCurrentTime(4200);
    state.addMarker(4000);
    state.updateMarkerAnnotation('vocals', 4000, 'Turn');
    state.setLoopRange(2000, 8000);
    state.toggleRepeat();
    state.toggleLoopMarker();
    const before = useStudioStore.getState();
    const protectedState = {
      isPlaying: before.isPlaying,
      currentTime: before.currentTime,
      allLayersData: before.allLayersData,
      loopStartMs: before.loopStartMs,
      loopEndMs: before.loopEndMs,
      isRepeatActive: before.isRepeatActive,
      isLoopMarkerActive: before.isLoopMarkerActive,
      activeLayerId: before.activeLayerId,
    };

    state.setSelectedRowIndex(2);
    state.setPrimaryView('detail');
    state.setPrimaryView('wrapped');

    expect(useStudioStore.getState()).toMatchObject(protectedState);
    expect(useStudioStore.getState().allLayersData[0].annotations).toEqual([
      { timestamp: 4000, text: 'Turn' },
    ]);
  });
});
