import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const beatAnchorControlStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
    padding: 10,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlass,
    gap: 7,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  value: {
    color: colors.accent,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  button: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.borderQuiet,
    backgroundColor: colors.surfaceGlassStrong,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderColor: colors.accent,
  },
  buttonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.accent,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
