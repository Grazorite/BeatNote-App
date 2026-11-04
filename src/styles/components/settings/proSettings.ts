import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const proSettingsStyles = StyleSheet.create({
  pageContent: { paddingTop: 8, paddingBottom: 8 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  viewport: { width: '100%', flexShrink: 0 },
  slide: { gap: 8 },
  illustration: { padding: 0, justifyContent: 'center', backgroundColor: colors.surfaceGlass, borderRadius: 20, overflow: 'hidden', marginBottom: 4 },
  title: { color: colors.text, fontSize: 22, lineHeight: 27, fontWeight: '700' },
  pagination: { flexDirection: 'row', justifyContent: 'flex-start' },
  dotButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary },
  activeDot: { width: 18, backgroundColor: colors.accent },
  caption: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  compareButton: { minHeight: 54, flexShrink: 0, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  chevron: { width: 28, height: 28, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  plans: { gap: 10, marginTop: 8 },
  plan: { minHeight: 68, padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceGlass },
  selectedPlan: { borderColor: colors.accent },
  selection: { color: colors.accent, fontSize: 23, width: 24, textAlign: 'center' },
  planCopy: { flex: 1, minWidth: 0 },
  planPrice: { alignItems: 'flex-end', flexShrink: 1, gap: 2 },
  planHeading: { color: colors.text, fontSize: 17, fontWeight: '700' },
  price: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  small: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  badge: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  previewNote: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 12 },
  restore: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingVertical: 10 },
  comparisonSurface: { backgroundColor: colors.background },
  comparisonHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.borderSubtle },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, minHeight: 60, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.borderSubtle },
  comparisonLabel: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20, paddingRight: 8 },
  comparisonValue: { width: 76, color: colors.text, fontSize: 14, textAlign: 'center' },
  tableHeading: { fontWeight: '700', fontSize: 16 },
  proValue: { color: colors.accent, fontWeight: '700' },
  proHeading: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  comparisonScroll: { flex: 1, minHeight: 0 },
  comparisonNote: { padding: 20, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  link: { color: colors.accent, fontSize: 15, fontWeight: '600' },
});

/** Size the illustration to leave room for both plan cards on portrait phones. */
export const proIllustrationSize = (height: number): { height: number } => ({ height: Math.max(120, Math.min(240, height * 0.23)) });

/** Width follows the actual settings content, including safe areas and rotation. */
export const proSlideWidth = (width: number): { width: number } => ({ width });
