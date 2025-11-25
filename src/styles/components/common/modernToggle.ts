import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const modernToggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: dimensions.spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});