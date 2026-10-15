import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const controlDockStyles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
  },
  landscapeRoot: {
    flex: 1,
    minHeight: 0,
  },
  grid: {
    position: 'relative',
    width: '100%',
    gap: 4,
  },
  landscapeGrid: {
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: 0,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
    gap: 4,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    height: 44,
  },
  landscapeRow: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
    minHeight: 0,
    gap: 3,
  },
  landscapeCell: {
    height: '100%',
  },
  playBlock: {
    position: 'absolute',
    left: '37.5%',
    width: '25%',
    top: 0,
    bottom: 0,
    paddingHorizontal: 2,
    zIndex: 2,
  },
  landscapePlayBlock: {
    width: '100%',
    flex: 2,
    minHeight: 0,
  },
  emptyCell: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  toast: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    marginBottom: 6,
    zIndex: 10,
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.loopEnabled,
  },
  toastText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
