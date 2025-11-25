import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const markerOptionsToggleStyles = StyleSheet.create({
  container: {
    // marginBottom handled dynamically in component
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    marginTop: 8,
    paddingLeft: 16,
  },
});