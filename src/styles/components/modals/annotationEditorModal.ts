import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const annotationEditorModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayLandscape: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  containerLandscape: {
    maxWidth: 680,
    maxHeight: '100%',
    flexShrink: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleActionSpacer: {
    width: 48,
  },
  keyboardDoneButton: {
    width: 48,
    minHeight: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  keyboardDoneText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  timestampLandscape: {
    marginTop: 0,
    marginBottom: 6,
  },
  editorScroll: {
    flexShrink: 1,
  },
  editorScrollContent: {
    flexGrow: 0,
  },
  input: {
    minHeight: 120,
    maxHeight: 220,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: colors.surfaceGlassStrong,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
    fontSize: 16,
    lineHeight: 22,
  },
  inputLandscape: {
    minHeight: 72,
    maxHeight: 96,
  },
  draftMeta: {
    minHeight: dimensions.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  clearButton: {
    minHeight: dimensions.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    marginLeft: 'auto',
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionsLandscape: {
    marginTop: 4,
  },
  button: {
    flex: 1,
    minHeight: dimensions.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlass,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderColor: colors.borderEmphasis,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
