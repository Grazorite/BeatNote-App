import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const controlDockStyles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
  },
  landscapeRoot: {
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
    minHeight: 0,
    gap: 3,
    justifyContent: 'center',
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
  popupCell: {
    position: 'relative',
    zIndex: 20,
    elevation: 20,
    overflow: 'visible',
  },
  landscapeRow: {
    flexDirection: 'row',
    width: '100%',
    height: 0,
    minHeight: 0,
    gap: 3,
  },
  popupRow: {
    position: 'relative',
    zIndex: 19,
    overflow: 'visible',
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
    height: 0,
    minHeight: 0,
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
    borderRadius: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  toastAction: {
    minHeight: 28,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
  },
  toastActionText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
