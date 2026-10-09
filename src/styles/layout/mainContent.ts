import { StyleSheet } from 'react-native';
import { colors, dimensions } from '../common';

export const mainContentStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileWorkspace: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  landscapeBody: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileCanvas: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    paddingHorizontal: dimensions.spacing.sm,
    paddingTop: 4,
    paddingBottom: 2,
  },
  landscapeCanvas: {
    width: undefined,
  },
  mobileWaveform: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  mobileControlDock: {
    width: '100%',
    gap: 4,
    paddingHorizontal: dimensions.spacing.sm,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  landscapeControlRail: {
    width: 264,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  landscapeMarkerActions: {
    width: '100%',
    alignItems: 'center',
  },
  mobileTransportRow: {
    width: '100%',
    alignItems: 'center',
  },
  mobileMarkerActions: {
    width: '100%',
    alignItems: 'center',
  },
  mobileMarkerStatus: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    padding: dimensions.spacing.sm,
    paddingBottom: 100,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: dimensions.spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: dimensions.spacing.lg,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  controlsRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.sm,
    width: '100%',
  },
  controlsRowTopMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: dimensions.spacing.sm,
    width: '100%',
  },
  markerButtonContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: dimensions.spacing.sm,
  },
  activeLayerText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeLayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalMarkersText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
