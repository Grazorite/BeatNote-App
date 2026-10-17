import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DEFAULT_PLAYBACK_SPEED,
  formatSpeedLabel,
  MAX_PLAYBACK_SPEED,
  MIN_PLAYBACK_SPEED,
  normalizePlaybackSpeed,
  PLAYBACK_SPEED_PRESETS,
  PLAYBACK_SPEED_STEP,
} from '../../../utils/playbackSpeed';
import DockButton from './DockButton';
import GlassBackdrop from './GlassBackdrop';
import { playbackSpeedControlStyles as styles } from '../../../styles/components/controls/playbackSpeedControl';
import { useStudioStore } from '../../../hooks/useStudioStore';

const DRAG_CLOSE_DELAY_MS = 700;
const DRAG_FADE_DURATION_MS = 420;

interface PlaybackSpeedControlProps {
  value?: number;
  options?: readonly number[];
  onSelect?: (value: number) => void;
  compact?: boolean;
}

const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({
  value: controlledValue,
  options = PLAYBACK_SPEED_PRESETS,
  onSelect,
  compact,
}) => {
  const songLoaded = useStudioStore(state => state.songLoaded);
  const [localValue, setLocalValue] = useState(DEFAULT_PLAYBACK_SPEED);
  const [open, setOpen] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const dismissProgress = useRef(new Animated.Value(0)).current;
  const value = normalizePlaybackSpeed(controlledValue ?? localValue);
  const progress = (value - MIN_PLAYBACK_SPEED) / (MAX_PLAYBACK_SPEED - MIN_PLAYBACK_SPEED);

  const clearCloseTimer = useCallback(() => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const stopDismissAnimation = useCallback(() => {
    const runningAnimation = dismissAnimationRef.current;
    dismissAnimationRef.current = null;
    runningAnimation?.stop();
  }, []);

  const restorePopup = useCallback(() => {
    clearCloseTimer();
    stopDismissAnimation();
    dismissProgress.setValue(0);
  }, [clearCloseTimer, dismissProgress, stopDismissAnimation]);

  const animateDismiss = useCallback(() => {
    clearCloseTimer();
    stopDismissAnimation();
    const dismissAnimation = Animated.timing(dismissProgress, {
      toValue: 1,
      duration: DRAG_FADE_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    dismissAnimationRef.current = dismissAnimation;
    dismissAnimation.start(() => {
      if (dismissAnimationRef.current === dismissAnimation) dismissAnimationRef.current = null;
    });
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      stopDismissAnimation();
      setOpen(false);
      dismissProgress.setValue(0);
    }, DRAG_FADE_DURATION_MS);
  }, [clearCloseTimer, dismissProgress, stopDismissAnimation]);

  const applySpeed = useCallback((next: number, dismiss = false) => {
    const normalized = normalizePlaybackSpeed(next);
    if (controlledValue === undefined) setLocalValue(normalized);
    onSelect?.(normalized);
    if (dismiss) animateDismiss();
  }, [animateDismiss, controlledValue, onSelect]);

  const stepSpeed = useCallback((direction: -1 | 1) => {
    applySpeed(value + direction * PLAYBACK_SPEED_STEP);
  }, [applySpeed, value]);

  /** Schedule the deferred auto-close after a completed drag; cancels any pending timer. */
  const scheduleCloseAfterDrag = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      animateDismiss();
    }, DRAG_CLOSE_DELAY_MS);
  }, [animateDismiss, clearCloseTimer]);

  useEffect(() => () => {
    clearCloseTimer();
    stopDismissAnimation();
  }, [clearCloseTimer, stopDismissAnimation]);

  const updateFromTrackX = useCallback((trackX: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, trackX / trackWidth));
    applySpeed(MIN_PLAYBACK_SPEED + ratio * (MAX_PLAYBACK_SPEED - MIN_PLAYBACK_SPEED));
  }, [applySpeed, trackWidth]);

  const onTrackLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);
  const onTouch = (event: GestureResponderEvent) => {
    updateFromTrackX(event.nativeEvent.locationX);
  };
  const onTrackGrant = (event: GestureResponderEvent) => {
    restorePopup();
    onTouch(event);
  };
  const finishPopupInteraction = () => scheduleCloseAfterDrag();
  const onAdjust = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') stepSpeed(1);
    if (event.nativeEvent.actionName === 'decrement') stepSpeed(-1);
  };

  const animatedChooserStyle = {
    opacity: dismissProgress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 0.25, 0] }),
    transform: compact
      ? [
        { translateX: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 84] }) },
        { scale: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.68] }) },
      ]
      : [
        { translateY: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 52] }) },
        { scale: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.68] }) },
      ],
  };

  return (
    <View style={styles.wrapper}>
      {open && (
        <Animated.View
          style={[styles.chooser, compact && styles.compactChooser, animatedChooserStyle]}
          testID="playback-speed-chooser"
          onTouchStart={restorePopup}
          onTouchEnd={finishPopupInteraction}
          onPointerUpCapture={finishPopupInteraction}
          onPointerCancelCapture={finishPopupInteraction}
        >
          <View style={styles.glassSheen} testID="playback-speed-glass-underlay" />
          <GlassBackdrop
            gradientId="playback-speed-glass"
            radius={14}
            testID="playback-speed-glass"
            variant="toast"
          />
          <View style={styles.header}>
            <Text style={styles.title}>Playback speed</Text>
            <Text style={styles.currentValue} testID="playback-speed-value">{formatSpeedLabel(value)}</Text>
          </View>
          <View
            testID="playback-speed-slider"
            style={styles.sliderTouchArea}
            onLayout={onTrackLayout}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={onTrackGrant}
            onResponderMove={onTouch}
            onResponderRelease={finishPopupInteraction}
            onResponderTerminate={finishPopupInteraction}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Playback speed slider"
            accessibilityValue={{
              min: MIN_PLAYBACK_SPEED,
              max: MAX_PLAYBACK_SPEED,
              now: value,
              text: formatSpeedLabel(value),
            }}
            aria-valuemin={MIN_PLAYBACK_SPEED}
            aria-valuemax={MAX_PLAYBACK_SPEED}
            aria-valuenow={value}
            aria-valuetext={formatSpeedLabel(value)}
            accessibilityActions={[
              { name: 'increment', label: 'Increase playback speed' },
              { name: 'decrement', label: 'Decrease playback speed' },
            ]}
            onAccessibilityAction={onAdjust}
          >
            <View pointerEvents="none" style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${progress * 100}%` }]} />
            </View>
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>{formatSpeedLabel(MIN_PLAYBACK_SPEED)}</Text>
            <Text style={styles.rangeLabel}>{formatSpeedLabel(MAX_PLAYBACK_SPEED)}</Text>
          </View>
          <View style={styles.presets}>
            {options.map(option => {
              const normalizedOption = normalizePlaybackSpeed(option);
              return (
                <TouchableOpacity
                  key={option}
                  testID={`playback-speed-preset-${option}`}
                  style={[styles.option, normalizedOption === value && styles.optionSelected]}
                  onPress={() => applySpeed(normalizedOption, true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${formatSpeedLabel(normalizedOption)} playback speed`}
                  accessibilityState={{ selected: normalizedOption === value }}
                >
                  <Text style={[styles.optionText, normalizedOption === value && styles.optionTextSelected]}>
                    {formatSpeedLabel(normalizedOption)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            testID="playback-speed-reset"
            style={styles.reset}
            onPress={() => applySpeed(DEFAULT_PLAYBACK_SPEED, true)}
            accessibilityRole="button"
            accessibilityLabel="Reset playback speed to 1×"
          >
            <Text style={styles.resetText}>Reset to 1×</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <DockButton
        compact={compact}
        testID="playback-speed"
        label={`Playback speed ${formatSpeedLabel(value)}`}
        valueText={formatSpeedLabel(value)}
        hint="Opens playback speed controls"
        state={songLoaded ? (value === DEFAULT_PLAYBACK_SPEED ? 'inactive' : 'active') : 'unavailable'}
        onPress={() => {
          if (open) {
            animateDismiss();
            return;
          }
          clearCloseTimer();
          stopDismissAnimation();
          dismissProgress.setValue(0);
          setOpen(true);
        }}
        accessibilityActions={[
          { name: 'increment', label: 'Increase playback speed' },
          { name: 'decrement', label: 'Decrease playback speed' },
        ]}
        onAccessibilityAction={onAdjust}
      >
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>{formatSpeedLabel(value)}</Text>
      </DockButton>
    </View>
  );
};

export default PlaybackSpeedControl;
