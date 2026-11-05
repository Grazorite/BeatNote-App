import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import {
  DEFAULT_PLAYBACK_SPEED_PRESET_COUNT,
  DEFAULT_PLAYBACK_SPEED_RANGE,
  type PlaybackSpeedPresetCount,
  type PlaybackSpeedRange,
} from '../../utils/playbackSpeed';

export type KeepScreenOnMode = 'disabled' | 'always' | 'whilePlaying';
export type SeekButtonBehaviour = 'tapTrackHoldSeek' | 'tapSeekHoldTrack';
export type SeekDurationSeconds = number;
export type RemoteButtonMode = 'seek' | 'tracks';
export const REMOTE_SEEK_SECONDS = [5, 10, 15, 30] as const;

export interface SettingsPreferences {
  remoteSeekSeconds: number;
  remoteButtonMode: RemoteButtonMode;
  showTimingShortcut: boolean;
  continuousPlay: boolean;
  pauseOnHeadsetDisconnect: boolean;
  keepScreenOn: KeepScreenOnMode;
  seekButtonBehaviour: SeekButtonBehaviour;
  seekDurationSeconds: SeekDurationSeconds;
  playbackSpeedRange: PlaybackSpeedRange;
  playbackSpeedPresetCount: PlaybackSpeedPresetCount;
  playbackSpeedPresetOverrides: Readonly<Record<string, number>>;
}

const STORAGE_KEY = 'beatnote.settings.v1';
const DEFAULTS: SettingsPreferences = {
  remoteSeekSeconds: 10,
  remoteButtonMode: 'seek',
  showTimingShortcut: false,
  continuousPlay: true,
  pauseOnHeadsetDisconnect: true,
  keepScreenOn: 'disabled',
  seekButtonBehaviour: 'tapSeekHoldTrack',
  seekDurationSeconds: 5,
  playbackSpeedRange: DEFAULT_PLAYBACK_SPEED_RANGE,
  playbackSpeedPresetCount: DEFAULT_PLAYBACK_SPEED_PRESET_COUNT,
  playbackSpeedPresetOverrides: Object.freeze({}),
};
let snapshot = DEFAULTS;
const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach(listener => listener());

const isKeepScreenOnMode = (value: unknown): value is KeepScreenOnMode => (
  value === 'disabled' || value === 'always' || value === 'whilePlaying'
);

const isSeekButtonBehaviour = (value: unknown): value is SeekButtonBehaviour => (
  value === 'tapTrackHoldSeek' || value === 'tapSeekHoldTrack'
);

const isSeekDurationSeconds = (value: unknown): value is SeekDurationSeconds => (
  typeof value === 'number'
  && value >= 0.5
  && value <= 30
  && Number.isInteger(value * 2)
);

const isPlaybackSpeedRange = (value: unknown): value is PlaybackSpeedRange => (
  value === 'focused' || value === 'extended'
);

const isPlaybackSpeedPresetCount = (value: unknown): value is PlaybackSpeedPresetCount => (
  value === 4 || value === 8 || value === 12
);

const playbackSpeedPresetOverridesFrom = (value: unknown): Readonly<Record<string, number>> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return Object.freeze({});
  return Object.freeze(Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => (
      /^(focused|extended):(4|8|12):([0-9]|1[01])$/.test(key)
      && typeof entry === 'number'
      && Number.isFinite(entry)
      && entry >= 0.25
      && entry <= 2
    )),
  ));
};

const hydration = AsyncStorage.getItem(STORAGE_KEY)
  .then(raw => {
    if (raw === null) return;
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>;
    snapshot = {
      remoteButtonMode: parsed.remoteButtonMode === 'tracks' ? 'tracks' : 'seek',
      remoteSeekSeconds: REMOTE_SEEK_SECONDS.find(value => value === parsed.remoteSeekSeconds) ?? DEFAULTS.remoteSeekSeconds,
      showTimingShortcut: typeof parsed.showTimingShortcut === 'boolean'
        ? parsed.showTimingShortcut : DEFAULTS.showTimingShortcut,
      continuousPlay: typeof parsed.continuousPlay === 'boolean'
        ? parsed.continuousPlay
        : DEFAULTS.continuousPlay,
      pauseOnHeadsetDisconnect: typeof parsed.pauseOnHeadsetDisconnect === 'boolean'
        ? parsed.pauseOnHeadsetDisconnect
        : DEFAULTS.pauseOnHeadsetDisconnect,
      keepScreenOn: isKeepScreenOnMode(parsed.keepScreenOn)
        ? parsed.keepScreenOn
        : DEFAULTS.keepScreenOn,
      seekButtonBehaviour: isSeekButtonBehaviour(parsed.seekButtonBehaviour)
        ? parsed.seekButtonBehaviour
        : DEFAULTS.seekButtonBehaviour,
      seekDurationSeconds: isSeekDurationSeconds(parsed.seekDurationSeconds)
        ? parsed.seekDurationSeconds
        : DEFAULTS.seekDurationSeconds,
      playbackSpeedRange: isPlaybackSpeedRange(parsed.playbackSpeedRange)
        ? parsed.playbackSpeedRange
        : DEFAULTS.playbackSpeedRange,
      playbackSpeedPresetCount: isPlaybackSpeedPresetCount(parsed.playbackSpeedPresetCount)
        ? parsed.playbackSpeedPresetCount
        : DEFAULTS.playbackSpeedPresetCount,
      playbackSpeedPresetOverrides: playbackSpeedPresetOverridesFrom(
        parsed.playbackSpeedPresetOverrides,
      ),
    };
    emit();
  })
  .catch(error => console.error('Settings preference restore failed:', error));

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSettingsPreferences = (): SettingsPreferences => snapshot;

export const useSettingsPreferences = (): SettingsPreferences => (
  useSyncExternalStore(subscribe, getSettingsPreferences, getSettingsPreferences)
);

export const updateSettingsPreferences = async (
  patch: Partial<SettingsPreferences>,
): Promise<void> => {
  await hydration;
  snapshot = { ...snapshot, ...patch };
  emit();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Settings preference save failed:', error);
  }
};

/** Restore in-memory and persisted settings defaults during an explicit all-data reset. */
export const resetSettingsPreferences = async (): Promise<void> => {
  await hydration;
  snapshot = DEFAULTS;
  emit();
  await AsyncStorage.removeItem(STORAGE_KEY);
};
