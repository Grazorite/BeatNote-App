import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const wrappedRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  gutterPressed: {
    opacity: 0.7,
  },
  canvas: {
    justifyContent: 'center',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
