import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../../styles/common';

export const useAnimatedToggleStyles = (value: boolean) => {
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.accent : colors.surface, { duration: 200 }),
    borderColor: withTiming(value ? colors.accent : colors.border, { duration: 200 }),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(value ? colors.background : colors.text, { duration: 200 }),
  }));

  return { backgroundStyle, textStyle };
};