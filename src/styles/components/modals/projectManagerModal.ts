import { StyleSheet } from 'react-native';

export const projectManagerModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    color: '#888888',
    textAlign: 'center',
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
  },
  projectItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  projectName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectInfo: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  projectDate: {
    color: '#888888',
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
    borderRadius: 4,
  },
  loadButton: {
    backgroundColor: '#ff6600',
    flex: 1,
  },
  renameButton: {
    backgroundColor: '#444444',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#ff6600',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#444444',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
});