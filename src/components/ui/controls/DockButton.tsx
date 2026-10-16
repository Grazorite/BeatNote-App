import React, { ReactNode } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { dockButtonStyles as styles } from '../../../styles/components/controls/dockButton';

export type DockButtonState = 'active' | 'inactive' | 'unavailable' | 'reserved';

interface DockButtonProps {
  testID: string;
  label: string;
  state?: DockButtonState;
  checked?: boolean;
  valueText?: string;
  hint?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityActions?: AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

const DockButton: React.FC<DockButtonProps> = ({
  testID,
  label,
  state = 'inactive',
  checked,
  valueText,
  hint,
  onPress,
  onLongPress,
  accessibilityActions,
  onAccessibilityAction,
  children,
  style,
  compact = false,
}) => {
  const unavailable = state === 'unavailable';
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.button, styles[state], compact && styles.compactButton, style]}
      onPress={unavailable ? undefined : onPress}
      onLongPress={unavailable ? undefined : onLongPress}
      delayLongPress={450}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint ?? (state === 'reserved' ? 'Coming soon' : undefined)}
      accessibilityState={{ disabled: unavailable, checked }}
      accessibilityValue={valueText ? { text: valueText } : undefined}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      aria-valuetext={valueText}
      aria-disabled={unavailable}
      aria-pressed={checked}
      activeOpacity={0.8}
      hitSlop={compact ? 5 : 2}
    >
      {children}
      {state === 'reserved' && <View style={styles.reservedDot} />}
    </TouchableOpacity>
  );
};

export default React.memo(DockButton);
