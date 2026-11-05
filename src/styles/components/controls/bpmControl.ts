import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const bpmControlStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 4,
  },
  button: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlassStrong,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderQuiet,
    marginHorizontal: 2,
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bpmValue: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 2,
    minWidth: 52,
    minHeight: 48,
    flex: 1,
    textAlign: 'center',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
