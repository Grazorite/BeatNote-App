import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  bottomSheetHeightStyle,
  bottomSheetInsetStyle,
  bottomSheetKeyboardStyle,
  bottomSheetStyles as styles,
} from '../../../styles/components/common/bottomSheet';
import { resolveSheetRelease, type SheetReleaseTarget } from '../../../utils/sheetDetent';
import { BeatNoteIcon } from '../../icons';
import GlassBackdrop from '../controls/GlassBackdrop';

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  initialDetent: 'medium' | 'large';
  onClose: () => void;
  returnFocusRef: React.RefObject<View | null>;
  testID: string;
  children: React.ReactNode;
}

interface WebKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault(): void;
}

const ANIMATION_MS = 300;

const focusNode = (node: unknown): void => {
  const handle = findNodeHandle(node as never);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
  (node as { focus?: () => void } | null)?.focus?.();
};

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  title,
  initialDetent,
  onClose,
  returnFocusRef,
  testID,
  children,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const sheetHeight = Math.max(0, height - insets.top - insets.bottom);
  const translateY = useSharedValue(Math.max(height, 1));
  const dragOrigin = useSharedValue(0);
  const [detent, setDetentState] = useState<'medium' | 'large'>(initialDetent);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const detentRef = useRef(detent);
  const closingRef = useRef(false);
  const wasVisibleRef = useRef(false);
  const titleRef = useRef<Text>(null);
  const sheetRef = useRef<View>(null);

  const offsetFor = useCallback((next: 'medium' | 'large') => (
    next === 'large' ? 0 : sheetHeight * 0.5
  ), [sheetHeight]);

  const animateTo = useCallback((offset: number, finished?: () => void) => {
    if (reduceMotion !== false) {
      translateY.value = offset;
      finished?.();
      return;
    }
    translateY.value = withTiming(offset, {
      duration: ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
    }, completed => {
      if (completed && finished) runOnJS(finished)();
    });
  }, [reduceMotion, translateY]);

  const setDetent = useCallback((next: 'medium' | 'large') => {
    if (closingRef.current) return;
    detentRef.current = next;
    setDetentState(next);
    animateTo(offsetFor(next));
  }, [animateTo, offsetFor]);

  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => focusNode(returnFocusRef.current));
  }, [returnFocusRef]);

  const finishClose = useCallback(() => {
    if (!closingRef.current) return;
    onClose();
    restoreFocus();
  }, [onClose, restoreFocus]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    animateTo(sheetHeight, finishClose);
  }, [animateTo, finishClose, sheetHeight]);

  const handleRelease = useCallback((releaseOffset: number) => {
    if (closingRef.current) return;
    const target: SheetReleaseTarget = resolveSheetRelease(sheetHeight, releaseOffset);
    if (target === 'close') {
      requestClose();
      return;
    }
    setDetent(target);
  }, [requestClose, setDetent, sheetHeight]);

  const resetCancelledPan = useCallback(() => {
    if (!closingRef.current) setDetent(detentRef.current);
  }, [setDetent]);

  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(visible)
    .onBegin(() => {
      dragOrigin.value = translateY.value;
    })
    .onUpdate(event => {
      translateY.value = Math.min(sheetHeight, Math.max(0, dragOrigin.value + event.translationY));
    })
    .onFinalize((_event, success) => {
      if (success) runOnJS(handleRelease)(translateY.value);
      else runOnJS(resetCancelledPan)();
    }), [dragOrigin, handleRelease, resetCancelledPan, sheetHeight, translateY, visible]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion !== true || !visible) return;
    cancelAnimation(translateY);
    if (closingRef.current) {
      translateY.value = sheetHeight;
      finishClose();
      return;
    }
    translateY.value = offsetFor(detentRef.current);
  }, [finishClose, offsetFor, reduceMotion, sheetHeight, translateY, visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      setKeyboardInset(event.endCoordinates.height);
      if (visible && !closingRef.current) setDetent('large');
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [setDetent, visible]);

  useEffect(() => {
    if (reduceMotion === null) return;
    if (visible && !wasVisibleRef.current) {
      closingRef.current = false;
      const openingDetent = isLandscape ? 'large' : initialDetent;
      detentRef.current = openingDetent;
      setDetentState(openingDetent);
      translateY.value = sheetHeight;
      requestAnimationFrame(() => animateTo(offsetFor(openingDetent)));
    } else if (!visible && wasVisibleRef.current) {
      if (!closingRef.current) restoreFocus();
      closingRef.current = false;
      setKeyboardInset(0);
    }
    wasVisibleRef.current = visible;
  }, [animateTo, initialDetent, isLandscape, offsetFor, reduceMotion, restoreFocus, sheetHeight, translateY, visible]);

  useEffect(() => {
    if (!visible || !wasVisibleRef.current || closingRef.current || reduceMotion === null) return;
    const fittedDetent = isLandscape ? 'large' : detentRef.current;
    detentRef.current = fittedDetent;
    setDetentState(fittedDetent);
    animateTo(offsetFor(fittedDetent));
  }, [animateTo, isLandscape, offsetFor, reduceMotion, sheetHeight, visible]);

  const toggleDetent = useCallback(() => {
    setDetent(detentRef.current === 'large' ? 'medium' : 'large');
  }, [setDetent]);

  const handleWebKeyDown = useCallback((event: WebKeyEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const root = sheetRef.current as unknown as HTMLElement | null;
    if (!root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )).filter(node => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true');
    if (focusable.length === 0) {
      event.preventDefault();
      focusNode(titleRef.current);
      return;
    }
    const active = document.activeElement;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!root.contains(active) || !focusable.includes(active as HTMLElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, [requestClose]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const webKeyProps = Platform.OS === 'web' ? { onKeyDown: handleWebKeyDown } : {};
  const webTitleProps = Platform.OS === 'web' ? { tabIndex: -1 as const } : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={requestClose}
      onShow={() => requestAnimationFrame(() => focusNode(titleRef.current))}
      accessibilityViewIsModal
    >
      <GestureHandlerRootView style={styles.root}>
        <View
          style={[
            styles.overlay,
            bottomSheetInsetStyle(
              insets.top,
              insets.bottom,
              isLandscape ? insets.left : 0,
              isLandscape ? insets.right : 0,
            ),
          ]}
        >
          <Animated.View
            ref={sheetRef}
            testID={testID}
            style={[styles.sheet, bottomSheetHeightStyle(sheetHeight), animatedStyle]}
            {...webKeyProps}
          >
            <GlassBackdrop gradientId={`${testID}-glass`} radius={22} testID={`${testID}-glass`} />
            <GestureDetector gesture={panGesture}>
              <View style={styles.header}>
                <View
                  style={styles.grabberTarget}
                  testID={`${testID}-grabber`}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel="Sheet size"
                  accessibilityHint="Switches between medium and large sheet sizes"
                  accessibilityValue={{ text: detent }}
                  accessibilityActions={[{ name: 'activate', label: 'Switch sheet size' }]}
                  onAccessibilityAction={event => {
                    if (event.nativeEvent.actionName === 'activate') toggleDetent();
                  }}
                >
                  <View style={styles.grabber} />
                </View>
                <View style={styles.titleRow}>
                  <Text
                    ref={titleRef}
                    style={styles.title}
                    accessibilityRole="header"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    testID={`${testID}-title`}
                    {...webTitleProps}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={requestClose}
                    accessibilityRole="button"
                    accessibilityLabel={`Close ${title}`}
                    testID={`${testID}-close`}
                  >
                    <BeatNoteIcon name="close" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </GestureDetector>
            <View
              style={[styles.content, bottomSheetKeyboardStyle(keyboardInset)]}
              testID={`${testID}-content`}
            >
              {children}
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default BottomSheet;
