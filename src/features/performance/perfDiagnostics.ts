import { Platform } from 'react-native';

import LibraryStorage from '../../../modules/library-storage/src';
import {
  clearPerfCounters,
  getPerfCounterSnapshot,
} from '../../utils/perfCounters';
import {
  clearPerfIntervals,
  getPerfIntervals,
  perfMarksEnabled,
  setPerfMarkSink,
} from '../../utils/perfMarks';

export interface PerfDiagnosticsSnapshot {
  counters: Readonly<Record<string, number>>;
  intervals: ReturnType<typeof getPerfIntervals>;
}

interface PerfDiagnosticsApi {
  clear(): void;
  snapshot(): PerfDiagnosticsSnapshot;
}

type PerfGlobal = typeof globalThis & {
  __BEATNOTE_PERF__?: PerfDiagnosticsApi;
};

/** Expose temporary profiling data to the Hermes/React Native DevTools console. */
export function installPerfDiagnostics(): void {
  const perfGlobal = globalThis as PerfGlobal;
  const nativeSignpostsEnabled = perfMarksEnabled && Platform.OS === 'ios';
  LibraryStorage.enableSignposts?.(nativeSignpostsEnabled);
  setPerfMarkSink(nativeSignpostsEnabled ? {
    begin: (name, id) => LibraryStorage.beginSignpost?.(id, name),
    end: (_name, id) => LibraryStorage.endSignpost?.(id),
  } : null);
  if (!perfMarksEnabled) {
    delete perfGlobal.__BEATNOTE_PERF__;
    return;
  }
  perfGlobal.__BEATNOTE_PERF__ = {
    clear: () => {
      clearPerfCounters();
      clearPerfIntervals();
    },
    snapshot: () => ({
      counters: getPerfCounterSnapshot(),
      intervals: getPerfIntervals(),
    }),
  };
}
