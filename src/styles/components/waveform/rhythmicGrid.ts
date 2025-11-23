import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const rhythmicGridStyles = StyleSheet.create({
  ruler: {
    backgroundColor: colors.gridBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  majorLines: {
    position: 'absolute',
    top: dimensions.ruler.height,
    left: 0,
    pointerEvents: 'none',
  },
});