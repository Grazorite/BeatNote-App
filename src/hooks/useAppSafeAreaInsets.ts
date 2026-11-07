import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** iPadOS window controls can extend below the reported safe area (including a 10-point inset). */
export const useAppSafeAreaInsets = (): ReturnType<typeof useSafeAreaInsets> => {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' && Platform.isPad
    ? { ...insets, top: Math.max(44, insets.top) }
    : insets;
};
