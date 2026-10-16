import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const helpScreenStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 16,
    maxWidth: 800,
    maxHeight: '90%',
    width: '90%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  scrollContainer: {
    maxHeight: 600,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shortcutGroup: {
    marginBottom: 16,
  },
  shortcutGroupTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shortcutKeys: {
    color: colors.text,
    backgroundColor: colors.surfaceGlassStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  shortcutDescription: {
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
  },
});
