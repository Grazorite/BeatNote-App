import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStudioStore } from '../../src/hooks/useStudioStore';
import { ProjectManager } from '../../src/utils/projectManager';
import type { BeatNoteProject } from '../../src/types/project';

const legacyProject: BeatNoteProject = {
  version: '1.0.0',
  metadata: {
    name: 'Legacy project',
    bpm: 120,
    duration: 60000,
    stemCount: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedAt: '2026-01-01T00:00:00.000Z',
  },
  audio: {
    uri: 'file:///legacy.m4a',
    filename: 'legacy.m4a',
  },
  layers: [],
  settings: {
    viewMode: 'unified',
    showGridLines: true,
    layerSpecificNavigation: false,
  },
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  useStudioStore.setState(useStudioStore.getInitialState(), true);
});

describe('wrapped-view project persistence', () => {
  it('round-trips wrapped preferences without persisting session or derived state', async () => {
    const state = useStudioStore.getState();
    state.setPrimaryView('detail');
    state.setCountSize(6);
    state.setRowDensity({ mode: 'duration', rowDurationMs: 12000 });
    state.setFollowPlayhead(false);
    state.setLoopRange(3000, 9000);
    state.setSelectedRowIndex(4);

    const filename = await state.saveProject('Wrapped preferences', 'file:///song.m4a', 'song.m4a');
    const stored = await ProjectManager.loadProject(filename);

    expect(stored.settings).toMatchObject({
      primaryView: 'detail',
      countSize: 6,
      rowDensity: { mode: 'duration', rowDurationMs: 12000 },
      followPlayhead: false,
      loopRange: { startMs: 3000, endMs: 9000 },
      loopEnabled: false,
    });
    expect(stored.settings).not.toHaveProperty('selectedRowIndex');
    expect(stored.settings).not.toHaveProperty('manualScrollSuspended');
    expect(stored).not.toHaveProperty('rows');

    state.setPrimaryView('wrapped');
    state.setCountSize(8);
    state.setRowDensity({ mode: 'phrase' });
    state.setFollowPlayhead(true);
    await state.loadProject(filename);

    expect(useStudioStore.getState()).toMatchObject({
      primaryView: 'detail',
      countSize: 6,
      rowDensity: { mode: 'duration', rowDurationMs: 12000 },
      followPlayhead: false,
      loopStartMs: 3000,
      loopEndMs: 9000,
      isLoopRangeEnabled: false,
    });
  });

  it('defaults wrapped preferences when loading a legacy project', async () => {
    await ProjectManager.setStoredProjects({ 'legacy.beatnote': legacyProject });

    const loaded = await ProjectManager.loadProject('legacy.beatnote');
    expect(loaded.settings).toMatchObject({
      primaryView: 'wrapped',
      countSize: 8,
      rowDensity: { mode: 'phrase' },
      followPlayhead: true,
      loopRange: null,
      loopEnabled: false,
    });

    useStudioStore.setState({
      primaryView: 'detail',
      countSize: 4,
      rowDensity: { mode: 'duration', rowDurationMs: 2000 },
      followPlayhead: false,
    });
    await useStudioStore.getState().loadProject('legacy.beatnote');

    expect(useStudioStore.getState()).toMatchObject({
      primaryView: 'wrapped',
      countSize: 8,
      rowDensity: { mode: 'phrase' },
      followPlayhead: true,
      loopStartMs: null,
      loopEndMs: null,
      isLoopRangeEnabled: false,
    });
  });

  it('summarizes saved projects by marker count without exposing layer count', async () => {
    const project: BeatNoteProject = {
      ...legacyProject,
      layers: [
        { id: 'vocals', name: 'Vocals', color: '#fff', markers: [1000, 2000], annotations: [], isVisible: true },
        { id: 'drums', name: 'Drums', color: '#fff', markers: [3000], annotations: [], isVisible: true },
      ],
    };
    await ProjectManager.setStoredProjects({ 'summary.beatnote': project });

    await expect(ProjectManager.listProjects()).resolves.toEqual([
      expect.objectContaining({ filename: 'summary.beatnote', markerCount: 3 }),
    ]);
  });
});
