import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type KeepScreenOnMode = 'disabled' | 'always' | 'whilePlaying';

export interface SettingsPreferences {
  continuousPlay: boolean;
  keepScreenOn: KeepScreenOnMode;
}

const STORAGE_KEY = 'beatnote.settings.v1';
const DEFAULTS: SettingsPreferences = {
  continuousPlay: true,
  keepScreenOn: 'disabled',
};
let snapshot = DEFAULTS;
const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach(listener => listener());

const isKeepScreenOnMode = (value: unknown): value is KeepScreenOnMode => (
  value === 'disabled' || value === 'always' || value === 'whilePlaying'
);

const hydration = AsyncStorage.getItem(STORAGE_KEY)
  .then(raw => {
    if (raw === null) return;
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>;
    snapshot = {
      continuousPlay: typeof parsed.continuousPlay === 'boolean'
        ? parsed.continuousPlay
        : DEFAULTS.continuousPlay,
      keepScreenOn: isKeepScreenOnMode(parsed.keepScreenOn)
        ? parsed.keepScreenOn
        : DEFAULTS.keepScreenOn,
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
