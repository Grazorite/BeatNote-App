import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const overviewTimeStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  // Reserve the longest timestamp for this song, including when minutes gain a digit.
  reservation: { opacity: 0 },
  value: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
