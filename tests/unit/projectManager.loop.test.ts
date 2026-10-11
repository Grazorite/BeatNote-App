import AsyncStorage from '@react-native-async-storage/async-storage';
import * as fc from 'fast-check';

import { useStudioStore } from '../../src/hooks/useStudioStore';
import type { BeatNoteProject } from '../../src/types/project';
import { PROJECT_VERSION, ProjectManager } from '../../src/utils/projectManager';

const makeProject = (
  version: string,
  loopRange: { startMs: number; endMs: number } | null,
  loopEnabled: unknown,
  duration = 10000,
): BeatNoteProject => ({
  version,
  metadata: {
    name: 'Loop project',
    bpm: 120,
    duration,
    stemCount: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedAt: '2026-01-01T00:00:00.000Z',
  },
  audio: { uri: 'file:///loop.m4a', filename: 'loop.m4a' },
  layers: [],
  settings: {
    viewMode: 'unified',
    showGridLines: true,
    layerSpecificNavigation: false,
    loopRange,
    loopEnabled: loopEnabled as boolean,
  },
});

describe('loop project persistence and migration', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    useStudioStore.setState(useStudioStore.getInitialState(), true);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('loads 1.0.0 projects with a null disabled loop and no warning', async () => {
    const legacy = makeProject('1.0.0', { startMs: 1000, endMs: 3000 }, true);
    await ProjectManager.setStoredProjects({ 'legacy.beatnote': legacy });
    const loaded = await ProjectManager.loadProject('legacy.beatnote');
    expect(loaded.settings).toMatchObject({ loopRange: null, loopEnabled: false });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('normalizes and clamps a valid persisted range', async () => {
    const project = makeProject(PROJECT_VERSION, { startMs: 1000.4, endMs: 12000.2 }, true);
    await ProjectManager.setStoredProjects({ 'valid.beatnote': project });
    const loaded = await ProjectManager.loadProject('valid.beatnote');
    expect(loaded.settings).toMatchObject({
      loopRange: { startMs: 1000, endMs: 10000 },
      loopEnabled: true,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['reversed', { startMs: 4000, endMs: 1000 }],
    ['non-finite', { startMs: 1000, endMs: Number.POSITIVE_INFINITY }],
    ['past duration', { startMs: 10000, endMs: 12000 }],
    ['too short after clamp', { startMs: 9800, endMs: 12000 }],
  ])('rejects a %s persisted range with one warning', async (_name, loopRange) => {
    const project = makeProject(PROJECT_VERSION, loopRange, true);
    await ProjectManager.setStoredProjects({ 'invalid.beatnote': project });
    const loaded = await ProjectManager.loadProject('invalid.beatnote');
    expect(loaded.settings).toMatchObject({ loopRange: null, loopEnabled: false });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('forces a non-boolean enabled value to false while retaining a valid range', async () => {
    const project = makeProject(PROJECT_VERSION, { startMs: 1000, endMs: 3000 }, 'yes');
    await ProjectManager.setStoredProjects({ 'invalid-flag.beatnote': project });
    const loaded = await ProjectManager.loadProject('invalid-flag.beatnote');
    expect(loaded.settings).toMatchObject({
      loopRange: { startMs: 1000, endMs: 3000 },
      loopEnabled: false,
    });
  });

  it('preserves a newer version and unknown top-level and settings fields on save', async () => {
    const future: BeatNoteProject = {
      ...makeProject('1.10.0', { startMs: 1000, endMs: 3000 }, true),
      futureTopLevel: { mode: 'future' },
      settings: {
        ...makeProject('1.10.0', null, false).settings,
        loopRange: { startMs: 1000, endMs: 3000 },
        loopEnabled: true,
        futureSetting: 'preserve-me',
      },
    };
    await ProjectManager.setStoredProjects({ 'future.beatnote': future });
    await useStudioStore.getState().loadProject('future.beatnote');
    const savedFilename = await useStudioStore.getState().saveProject('Future copy', 'file:///loop.m4a', 'loop.m4a');
    const stored = await ProjectManager.getStoredProjects();
    expect(stored[savedFilename].version).toBe('1.10.0');
    expect(stored[savedFilename].futureTopLevel).toEqual({ mode: 'future' });
    expect(stored[savedFilename].settings.futureSetting).toBe('preserve-me');
  });

  it('holds a zero-duration project range pending and restores requested enablement later', async () => {
    const pending = makeProject(PROJECT_VERSION, { startMs: 1000, endMs: 3000 }, true, 0);
    await ProjectManager.setStoredProjects({ 'pending.beatnote': pending });
    await useStudioStore.getState().loadProject('pending.beatnote');
    expect(useStudioStore.getState()).toMatchObject({
      loopStartMs: 1000,
      loopEndMs: 3000,
      isLoopRangeEnabled: false,
      pendingLoopRangeEnabled: true,
    });
    useStudioStore.getState().setSongDuration(10000);
    expect(useStudioStore.getState().isLoopRangeEnabled).toBe(true);
  });

  it('never serializes the restore snapshot and saves a cleared range as disabled', async () => {
    const state = useStudioStore.getState();
    state.setSongLoaded(true);
    state.setLoopRange(1000, 3000);
    state.setLoopRangeEnabled(true);
    state.clearLoopRange(100);
    const filename = await state.saveProject('Cleared loop', 'file:///loop.m4a', 'loop.m4a');
    const loaded = await ProjectManager.loadProject(filename);
    expect(loaded.settings).toMatchObject({ loopRange: null, loopEnabled: false });
    expect(loaded.settings).not.toHaveProperty('loopRestoreSnapshot');
  });

  it('Property 7: save/load round-trips valid loop bounds and enabled state', async () => {
    await fc.assert(fc.asyncProperty(
      fc.integer({ min: 0, max: 9000 }),
      fc.integer({ min: 500, max: 1000 }),
      fc.boolean(),
      async (start, length, enabled) => {
        await AsyncStorage.clear();
        const end = Math.min(10000, start + length);
        const adjustedStart = Math.min(start, end - 500);
        const project = makeProject(PROJECT_VERSION, { startMs: adjustedStart, endMs: end }, enabled);
        const filename = await ProjectManager.saveProject(project);
        const loaded = await ProjectManager.loadProject(filename);
        expect(loaded.settings.loopRange).toEqual({ startMs: adjustedStart, endMs: end });
        expect(loaded.settings.loopEnabled).toBe(enabled);
      },
    ), { numRuns: 100 });
  });
});
