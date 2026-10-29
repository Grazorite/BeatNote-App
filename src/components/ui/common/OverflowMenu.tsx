import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  overflowMenuPositionStyle,
  overflowMenuStyles as styles,
} from '../../../styles/components/common/overflowMenu';
import { dimensions } from '../../../styles/common';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { BeatNoteIcon } from '../../icons';
import GlassBackdrop from '../controls/GlassBackdrop';
import AppModal from './AppModal';

export interface OverflowMenuAction {
  name: string;
  label: string;
  onPress: (returnFocusRef?: React.RefObject<unknown>) => void;
  disabled?: boolean;
  destructive?: boolean;
  testID?: string;
}

export interface OverflowMenuProps {
  actions: readonly OverflowMenuAction[];
  accessibilityLabel: string;
  testID: string;
  disabled?: boolean;
}

interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WebKeyEvent {
  key: string;
  preventDefault(): void;
}

const MENU_MARGIN = dimensions.spacing.sm;
const MIN_MENU_WIDTH = 212;
const ESTIMATED_ACTION_HEIGHT = dimensions.touchTarget.minHeight;

const focusNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  (node as { focus?: () => void } | null)?.focus?.();
};

export const overflowAccessibilityActions = (
  actions: readonly OverflowMenuAction[],
): AccessibilityActionInfo[] => actions
  .filter(action => !action.disabled)
  .map(action => ({ name: action.name, label: action.label }));

export const handleOverflowAccessibilityAction = (
  event: AccessibilityActionEvent,
  actions: readonly OverflowMenuAction[],
): void => {
  const action = actions.find(candidate => (
    candidate.name === event.nativeEvent.actionName && !candidate.disabled
  ));
  action?.onPress();
};

const OverflowMenu: React.FC<OverflowMenuProps> = ({
  actions,
  accessibilityLabel,
  testID,
  disabled = false,
}) => {
  const { width, height, fontScale } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const firstActionRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const enabledActions = useMemo(() => actions.filter(action => !action.disabled), [actions]);

  const close = useCallback(() => {
    setVisible(false);
    requestAnimationFrame(() => focusNode(triggerRef.current));
  }, []);

  const open = useCallback(() => {
    if (disabled || enabledActions.length === 0) return;
    triggerRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      setAnchor({ x, y, width: measuredWidth, height: measuredHeight });
      setVisible(true);
    });
  }, [disabled, enabledActions.length]);

  const invoke = useCallback((action: OverflowMenuAction) => {
    if (action.disabled) return;
    setVisible(false);
    requestAnimationFrame(() => action.onPress(triggerRef));
  }, []);

  const menuHeight = Math.min(
    enabledActions.length * Math.max(
      ESTIMATED_ACTION_HEIGHT,
      Math.ceil(42 * Math.min(fontScale, MAX_TEXT_SCALE)),
    ),
    height - MENU_MARGIN * 2,
  );
  const placeAbove = anchor !== null && anchor.y + anchor.height + menuHeight + MENU_MARGIN > height;
  const top = anchor === null
    ? MENU_MARGIN
    : placeAbove
      ? Math.max(MENU_MARGIN, anchor.y - menuHeight)
      : anchor.y + anchor.height;
  const desiredRight = anchor === null ? MENU_MARGIN : width - anchor.x - anchor.width;
  const right = Math.max(
    MENU_MARGIN,
    Math.min(Math.max(MENU_MARGIN, width - MENU_MARGIN - MIN_MENU_WIDTH), desiredRight),
  );
  const webKeyProps = Platform.OS === 'web' ? {
    onKeyDown: (event: WebKeyEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
  } : {};

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={[
          styles.trigger,
          focused === 'trigger' && styles.triggerFocused,
          disabled && styles.triggerDisabled,
        ]}
        onPress={open}
        onFocus={() => setFocused('trigger')}
        onBlur={() => setFocused(current => current === 'trigger' ? null : current)}
        disabled={disabled || enabledActions.length === 0}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Shows more actions"
        accessibilityState={{ disabled: disabled || enabledActions.length === 0, expanded: visible }}
        testID={testID}
      >
        <BeatNoteIcon name="more" size={20} />
      </TouchableOpacity>
      <AppModal
        visible={visible}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={close}
        onShow={() => requestAnimationFrame(() => focusNode(firstActionRef.current))}
        accessibilityViewIsModal
      >
        <View style={styles.overlay} {...webKeyProps}>
          <TouchableOpacity
            style={styles.dismissArea}
            onPress={close}
            activeOpacity={1}
            accessible={false}
            testID={`${testID}-dismiss`}
          />
          <View
            style={[
              styles.menu,
              overflowMenuPositionStyle(top, right, height - MENU_MARGIN * 2),
            ]}
            accessibilityRole="menu"
            testID={`${testID}-menu`}
          >
            <GlassBackdrop gradientId={`${testID}-glass`} radius={14} />
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {enabledActions.map((action, index) => (
                <TouchableOpacity
                  ref={index === 0 ? firstActionRef : undefined}
                  key={action.name}
                  style={[
                    styles.action,
                    index === enabledActions.length - 1 && styles.finalAction,
                    focused === action.name && styles.actionFocused,
                    action.disabled && styles.actionDisabled,
                  ]}
                  onPress={() => invoke(action)}
                  onFocus={() => setFocused(action.name)}
                  onBlur={() => setFocused(current => current === action.name ? null : current)}
                  disabled={action.disabled}
                  accessibilityRole="menuitem"
                  accessibilityLabel={action.label}
                  accessibilityState={{ disabled: action.disabled }}
                  testID={action.testID ?? `${testID}-${action.name}`}
                >
                  <Text
                    style={[styles.actionText, action.destructive && styles.destructiveText]}
                    numberOfLines={2}
                    maxFontSizeMultiplier={MAX_TEXT_SCALE}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </AppModal>
    </>
  );
};

export default OverflowMenu;
