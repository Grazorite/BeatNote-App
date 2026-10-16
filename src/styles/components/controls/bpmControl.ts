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
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },
});
