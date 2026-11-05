import type { BeatNoteProject, PersistedContent, PersistedLayer } from '../types/project';
import { canonicalizeValue } from './contentFingerprint';
import { changedMarkers, changedSettingNames } from './draftResolution';
import { getExportLayerDisplayName } from './layers';
import { formatLoopTime } from './loopRange';

interface NoteChanges { added: number; edited: number; removed: number }

/** Match notes by marker time within a layer, including older projects with duplicate timestamps. */
function noteChanges(before: PersistedLayer['annotations'], after: PersistedLayer['annotations']): NoteChanges {
  const byTime = new Map<number, Map<string, number>>();
  const count = (note: PersistedLayer['annotations'][number], delta: number): void => {
    const texts = byTime.get(note.timestamp) ?? new Map<string, number>();
    texts.set(note.text, (texts.get(note.text) ?? 0) + delta);
    byTime.set(note.timestamp, texts);
  };
  before.forEach(note => count(note, -1));
  after.forEach(note => count(note, 1));
  const result = { added: 0, edited: 0, removed: 0 };
  for (const texts of byTime.values()) {
    let added = 0;
    let removed = 0;
    for (const delta of texts.values()) {
      added += Math.max(0, delta);
      removed += Math.max(0, -delta);
    }
    const edited = Math.min(added, removed);
    result.edited += edited;
    result.added += added - edited;
    result.removed += removed - edited;
  }
  return result;
}

const settingLabels: Record<string, string> = {
  viewMode: 'Timeline view', showGridLines: 'Grid lines', layerSpecificNavigation: 'Active-lane navigation',
  primaryView: 'Editor view', countSize: 'Counts per phrase', showDanceCounts: 'Dance counts',
  showWaveform: 'Show waveform', beatAnchorMs: 'Beat anchor', phraseStartMs: 'Count 1',
  manuallyOverriddenBpm: 'Manual BPM', manuallyOverriddenAnchor: 'Manual beat anchor',
  rowDensity: 'Timeline row size', followPlayhead: 'Follow playhead', playbackSpeed: 'Playback speed',
  loopRange: 'Loop range', loopEnabled: 'Loop range playback', appliedBpm: 'Applied BPM',
};

function settingValue(settings: BeatNoteProject['settings'], key: string): string {
  const value = settings[key];
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  if (key === 'loopRange' && settings.loopRange) {
    return `${formatLoopTime(settings.loopRange.startMs)}–${formatLoopTime(settings.loopRange.endMs)}`;
  }
  if (key === 'rowDensity') {
    const density = settings.rowDensity;
    if (density?.mode === 'duration') return density.rowDurationMs ? `${density.rowDurationMs / 1000}s` : 'auto duration';
    return density?.phrasesPerRow ? `${density.phrasesPerRow} per row` : 'auto phrase length';
  }
  if (typeof value === 'number') {
    if (key === 'playbackSpeed') return `${value}×`;
    if (key === 'beatAnchorMs' || key === 'phraseStartMs') return `${value} ms`;
  }
  return value == null ? 'unset' : String(value);
}

/** Describe net authored changes against the saved content, excluding playback position and selection. */
export function summarizeProjectEdits(before: PersistedContent, after: PersistedContent): string[] {
  const lines: string[] = [];
  const { added, removed } = changedMarkers(after, before);
  if (added || removed) {
    const parts = [added && `${added} added`, removed && `${removed} removed`].filter(Boolean);
    lines.push(`Markers: ${parts.join(', ')}`);
  }

  const notes: NoteChanges = { added: 0, edited: 0, removed: 0 };
  const layerIds = new Set([...before.layers, ...after.layers].map(layer => layer.id));
  for (const id of layerIds) {
    const old = before.layers.find(layer => layer.id === id);
    const next = after.layers.find(layer => layer.id === id);
    const delta = noteChanges(old?.annotations ?? [], next?.annotations ?? []);
    notes.added += delta.added;
    notes.edited += delta.edited;
    notes.removed += delta.removed;
    if (!old || !next) {
      lines.push(`${(old ?? next)!.name} lane ${next ? 'added' : 'removed'}`);
      continue;
    }
    if (old.customName !== next.customName || old.name !== next.name) {
      lines.push(`${id === 'vocals' ? 'Annotation label' : old.name + ' label'}: “${getExportLayerDisplayName(old)}” → “${getExportLayerDisplayName(next)}”`);
    }
    if (old.isVisible !== next.isVisible) lines.push(`${getExportLayerDisplayName(next)} lane ${next.isVisible ? 'shown' : 'hidden'}`);
    if (old.color !== next.color) lines.push(`${getExportLayerDisplayName(next)} lane colour changed`);
    const known = ['id', 'name', 'customName', 'color', 'markers', 'annotations', 'isVisible'];
    if ([...new Set([...Object.keys(old), ...Object.keys(next)])].some(key =>
      !known.includes(key) && canonicalizeValue(old[key]) !== canonicalizeValue(next[key]))) {
      lines.push(`Other ${getExportLayerDisplayName(next)} lane settings changed`);
    }
  }
  const noteParts = Object.entries(notes).filter(([, n]) => n > 0).map(([verb, n]) => `${n} ${verb}`);
  if (noteParts.length) lines.unshift(`Notes: ${noteParts.join(', ')}`);
  if (before.bpm !== after.bpm) lines.push(`Tempo: ${before.bpm} → ${after.bpm} BPM`);
  if (before.stemCount !== after.stemCount) lines.push(`Layer count: ${before.stemCount} → ${after.stemCount}`);
  let otherSettings = false;
  for (const key of changedSettingNames(after, before)) {
    if (key === 'appliedBpm' && before.bpm !== after.bpm) continue;
    if (!settingLabels[key]) { otherSettings = true; continue; }
    lines.push(`${settingLabels[key]}: ${settingValue(before.settings, key)} → ${settingValue(after.settings, key)}`);
  }
  if (otherSettings || canonicalizeValue(before.extras) !== canonicalizeValue(after.extras)) lines.push('Other project settings changed');
  return lines;
}
