import { useStudioStore } from './useStudioStore';

/** Tempo status is independent of edits to markers, notes and other project settings. */
export function useBpmStatus() {
  const bpm = useStudioStore(state => state.bpm);
  const chosen = useStudioStore(state => state.bpmChosen || state.bpm !== 120);
  const loaded = useStudioStore(state => state.songLoaded);
  const saved = useStudioStore(state => state.draftBaseline ? state.loadedProjectSource : null);
  const savedBpm = saved?.metadata.bpm;
  const savedChosen = saved?.settings.bpmChosen ?? (savedBpm !== 120 || saved?.settings.manuallyOverriddenBpm === true);
  const edited = loaded && (saved ? savedBpm !== bpm || chosen !== savedChosen : chosen);
  const caption = !loaded ? 'Choose a song to set its tempo.'
    : !chosen && saved && edited ? `Default tempo · unsaved change from ${savedBpm} BPM`
    : !chosen ? (saved ? 'Default tempo · saved in this project' : 'Default tempo · not yet saved to a project')
    : !edited ? 'Saved in this project'
    : !saved ? 'Edited · not yet saved to a project'
    : savedBpm === bpm ? 'Edited · tempo selected'
    : `Edited · saved tempo is ${savedBpm} BPM`;
  return { bpm, chosen, edited, caption };
}
