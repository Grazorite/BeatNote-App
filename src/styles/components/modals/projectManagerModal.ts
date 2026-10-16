import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../../common';

export const projectManagerModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
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
  title: {
    color: colors.text,
    fontSize: 18,
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  projectItem: {
    backgroundColor: colors.surfaceGlass,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  projectName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectInfo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  projectDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: dimensions.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  loadButton: {
    backgroundColor: colors.accent,
    flex: 1,
  },
  renameButton: {
    backgroundColor: colors.surfaceGlassStrong,
  },
  deleteButton: {
    backgroundColor: colors.iconDestructive,
  },
  actionButtonText: {
    color: colors.text,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: colors.surfaceGlassStrong,
    color: colors.text,
    padding: 8,
    borderRadius: dimensions.borderRadius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: dimensions.borderRadius,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.surfaceGlassStrong,
    padding: 8,
    borderRadius: dimensions.borderRadius,
    flex: 1,
  },
});
