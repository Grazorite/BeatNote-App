import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { controlTransition } from '../motion';
import { colors } from '../../styles/common';

export const useAnimatedToggleStyles = (value: boolean) => {
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.accent : colors.surface, controlTransition),
    borderColor: withTiming(value ? colors.accent : colors.border, controlTransition),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(value ? colors.background : colors.text, controlTransition),
  }));

  return { backgroundStyle, textStyle };
};