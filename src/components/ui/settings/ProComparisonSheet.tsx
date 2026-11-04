import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { PRO_COMPARISON } from '../../../features/entitlements/proPreview';
import { proSettingsStyles as styles } from '../../../styles/components/settings/proSettings';
import BottomSheet from '../common/BottomSheet';

interface ProComparisonSheetProps {
  visible: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<View | null>;
}

const ProComparisonSheet: React.FC<ProComparisonSheetProps> = ({ visible, onClose, returnFocusRef }) => (
  <BottomSheet visible={visible} title="Compare plans" initialDetent="medium"
    surfaceStyle={styles.comparisonSurface} onClose={onClose} returnFocusRef={returnFocusRef} testID="pro-comparison-sheet">
    <View style={styles.comparisonHeader}>
      <Text style={[styles.comparisonLabel, styles.tableHeading]}>Feature</Text>
      <Text style={[styles.comparisonValue, styles.proHeading]}>Pro</Text>
      <Text style={[styles.comparisonValue, styles.tableHeading]}>Lite</Text>
    </View>
    <ScrollView testID="pro-comparison-list" style={styles.comparisonScroll}>
      {PRO_COMPARISON.map(row => <View key={row.label} style={styles.comparisonRow}
        accessible accessibilityLabel={`${row.label}. Pro: ${row.pro === '✓' ? 'Included' : row.pro}. Lite: ${row.lite === '✓' ? 'Included' : 'Not included'}.`}>
        <Text style={styles.comparisonLabel}>{row.label}</Text>
        <Text style={[styles.comparisonValue, styles.proValue]}>{row.pro}</Text>
        <Text style={styles.comparisonValue}>{row.lite}</Text>
      </View>)}
      <Text style={styles.comparisonNote}>Current preview features. ✓ Included · — Not included</Text>
    </ScrollView>
    <Pressable onPress={onClose} accessibilityRole="button" style={styles.compareButton} testID="pro-comparison-done">
      <Text style={styles.link}>Done</Text>
    </Pressable>
  </BottomSheet>
);

export default ProComparisonSheet;
