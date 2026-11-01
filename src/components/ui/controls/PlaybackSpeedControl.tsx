import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  configuredPlaybackSpeedPresets,
  DEFAULT_PLAYBACK_SPEED,
  defaultPlaybackSpeedPreset,
  formatSpeedLabel,
  normalizePlaybackSpeed,
  playbackSpeedBounds,
  playbackSpeedPresetOverrideKey,
  PLAYBACK_SPEED_PRESETS,
  PLAYBACK_SPEED_STEP,
} from '../../../utils/playbackSpeed';
import DockButton from './DockButton';
import GlassBackdrop from './GlassBackdrop';
import { playbackSpeedControlStyles as styles } from '../../../styles/components/controls/playbackSpeedControl';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { capabilitiesForLoadedItem } from '../../../features/library/sourceResolver';
import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import {
  updateSettingsPreferences,
  useSettingsPreferences,
} from '../../../features/settings/preferences';
import { useAcceleratingPress } from '../../../hooks/useAcceleratingPress';
import PlaybackSpeedPresetEditor from '../modals/PlaybackSpeedPresetEditor';

const DRAG_CLOSE_DELAY_MS = 700;
const DRAG_FADE_DURATION_MS = 220;
const POPUP_PRESENT_DURATION_MS = 180;
/** Preferred overhang of the compact (landscape) chooser below the speed button's bottom edge. */
const COMPACT_CHOOSER_BELOW_ANCHOR = 124;
/** Minimum gap between the compact chooser and the safe-area edges. */
const CHOOSER_EDGE_MARGIN = 8;

interface PlaybackSpeedControlProps {
  value?: number;
  options?: readonly number[];
  onSelect?: (value: number) => void;
  compact?: boolean;
  chooserSide?: 'leading' | 'trailing';
}

const PlaybackSpeedControl: React.FC<PlaybackSpeedControlProps> = ({
  value: controlledValue,
  options,
  onSelect,
  compact,
  chooserSide = 'trailing',
}) => {
  const songLoaded = useStudioStore(state => state.songLoaded);
  const sourceSpeedAvailable = useStudioStore(state => capabilitiesForLoadedItem(
    state.currentMusicItemId === null ? null : state.libraryItems[state.currentMusicItemId] ?? null,
    state.songLoaded && state.currentAudioUri !== null,
  ).pitchPreservingSpeed);
  const productSpeedAvailable = useProductCapability('playback.pitchPreservingSpeed');
  const advancedSpeedAvailable = useProductCapability('playback.advancedSpeed');
  const preferences = useSettingsPreferences();
  const speedAvailable = sourceSpeedAvailable && productSpeedAvailable;
  const [localValue, setLocalValue] = useState(DEFAULT_PLAYBACK_SPEED);
  const [open, setOpen] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [compactTop, setCompactTop] = useState<number | null>(null);
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const wrapperRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const presentAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const dismissingRef = useRef(false);
  const dismissProgress = useRef(new Animated.Value(0)).current;
  const presentProgress = useRef(new Animated.Value(0)).current;
  const activeRange = advancedSpeedAvailable ? preferences.playbackSpeedRange : 'focused';
  const activeBounds = playbackSpeedBounds(activeRange);
  const configuredOptions = advancedSpeedAvailable
    ? configuredPlaybackSpeedPresets(
      activeRange,
      preferences.playbackSpeedPresetCount,
      preferences.playbackSpeedPresetOverrides,
    )
    : PLAYBACK_SPEED_PRESETS;
  const displayedOptions = options ?? configuredOptions;
  const rawValue = normalizePlaybackSpeed(controlledValue ?? localValue);
  const value = normalizePlaybackSpeed(rawValue, activeBounds);
  const presentedValue = productSpeedAvailable ? value : DEFAULT_PLAYBACK_SPEED;
  const progress = (value - activeBounds.min) / (activeBounds.max - activeBounds.min);

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

  const stopPresentAnimation = useCallback(() => {
    const runningAnimation = presentAnimationRef.current;
    presentAnimationRef.current = null;
    runningAnimation?.stop();
  }, []);

  const restorePopup = useCallback(() => {
    clearCloseTimer();
    stopDismissAnimation();
    dismissingRef.current = false;
    dismissProgress.setValue(0);
  }, [clearCloseTimer, dismissProgress, stopDismissAnimation]);

  const animateDismiss = useCallback(() => {
    clearCloseTimer();
    stopDismissAnimation();
    dismissingRef.current = true;
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
      presentProgress.setValue(0);
    }, DRAG_FADE_DURATION_MS);
  }, [clearCloseTimer, dismissProgress, presentProgress, stopDismissAnimation]);

  const applySpeed = useCallback((next: number, dismiss = false) => {
    const normalized = normalizePlaybackSpeed(next, activeBounds);
    if (controlledValue === undefined) setLocalValue(normalized);
    onSelect?.(normalized);
    if (dismiss) animateDismiss();
  }, [activeBounds, animateDismiss, controlledValue, onSelect]);

  const stepSpeed = useCallback((direction: -1 | 1) => {
    applySpeed(value + direction * PLAYBACK_SPEED_STEP);
  }, [applySpeed, value]);
  const decrementDisabled = value <= activeBounds.min;
  const incrementDisabled = value >= activeBounds.max;
  const decrementSpeed = useAcceleratingPress(() => {
    restorePopup();
    stepSpeed(-1);
  }, decrementDisabled);
  const incrementSpeed = useAcceleratingPress(() => {
    restorePopup();
    stepSpeed(1);
  }, incrementDisabled);

  useEffect(() => {
    if (rawValue === value) return;
    if (controlledValue === undefined) setLocalValue(value);
    onSelect?.(value);
  }, [controlledValue, onSelect, rawValue, value]);

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
    stopPresentAnimation();
    dismissingRef.current = false;
  }, [clearCloseTimer, stopDismissAnimation, stopPresentAnimation]);

  useEffect(() => {
    if (!open) dismissingRef.current = false;
  }, [open]);

  useEffect(() => {
    if (speedAvailable) return;
    clearCloseTimer();
    stopDismissAnimation();
    stopPresentAnimation();
    setOpen(false);
    presentProgress.setValue(0);
  }, [clearCloseTimer, presentProgress, speedAvailable, stopDismissAnimation, stopPresentAnimation]);

  const showPopup = useCallback(() => {
    restorePopup();
    setOpen(true);
    stopPresentAnimation();
    presentProgress.setValue(0);
    requestAnimationFrame(() => {
      const animation = Animated.timing(presentProgress, {
        toValue: 1,
        duration: POPUP_PRESENT_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      presentAnimationRef.current = animation;
      animation.start(() => {
        if (presentAnimationRef.current === animation) presentAnimationRef.current = null;
      });
    });
  }, [presentProgress, restorePopup, stopPresentAnimation]);

  const updateFromTrackX = useCallback((trackX: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, trackX / trackWidth));
    applySpeed(activeBounds.min + ratio * (activeBounds.max - activeBounds.min));
  }, [activeBounds, applySpeed, trackWidth]);

  const onTrackLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);
  // The compact chooser grows with its content, so a fixed offset can push it past the top of a
  // short landscape window. Keep the preferred placement but clamp it inside the safe area.
  const onChooserLayout = (event: LayoutChangeEvent) => {
    if (!compact) return;
    const chooserHeight = event.nativeEvent.layout.height;
    wrapperRef.current?.measureInWindow((_x, anchorY, _width, anchorHeight) => {
      const preferredTop = anchorY + anchorHeight + COMPACT_CHOOSER_BELOW_ANCHOR - chooserHeight;
      const minTop = insets.top + CHOOSER_EDGE_MARGIN;
      const maxTop = windowHeight - insets.bottom - CHOOSER_EDGE_MARGIN - chooserHeight;
      const top = Math.min(Math.max(preferredTop, minTop), Math.max(minTop, maxTop));
      const nextTop = Math.round(top - anchorY);
      setCompactTop(current => (current === nextTop ? current : nextTop));
    });
  };
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
    opacity: Animated.multiply(
      presentProgress,
      dismissProgress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 0.25, 0] }),
    ),
    transform: compact
      ? [
        { scale: presentProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        { scale: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }) },
      ]
      : [
        { scale: presentProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        { scale: dismissProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }) },
      ],
  };

  return (
    <View ref={wrapperRef} collapsable={false} style={styles.wrapper}>
      {open && (
        <Animated.View
          style={[
            styles.chooser,
            compact
              ? [styles.compactChooser, compactTop !== null && { top: compactTop, bottom: undefined }]
              : chooserSide === 'leading'
                ? styles.leadingChooser
                : styles.trailingChooser,
            animatedChooserStyle,
          ]}
          onLayout={onChooserLayout}
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
          {advancedSpeedAvailable && <View style={styles.sliderControls}>
            <TouchableOpacity
              testID="playback-speed-decrement"
              style={[styles.stepButton, decrementDisabled && styles.stepButtonDisabled]}
              onPress={decrementSpeed.onPress}
              onPressIn={decrementSpeed.onPressIn}
              onPressOut={() => {
                decrementSpeed.onPressOut();
                scheduleCloseAfterDrag();
              }}
              disabled={decrementDisabled}
              accessibilityRole="button"
              accessibilityLabel={`Decrease playback speed by ${PLAYBACK_SPEED_STEP}×`}
              accessibilityHint={`Current speed ${formatSpeedLabel(value)}. Press and hold to accelerate.`}
              accessibilityState={{ disabled: decrementDisabled }}
            >
              <Text style={styles.stepButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.sliderColumn}>
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
                  min: activeBounds.min,
                  max: activeBounds.max,
                  now: value,
                  text: formatSpeedLabel(value),
                }}
                aria-valuemin={activeBounds.min}
                aria-valuemax={activeBounds.max}
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
                  <View
                    testID="playback-speed-slider-thumb"
                    style={[styles.sliderThumb, { left: `${progress * 100}%` }]}
                  />
                </View>
              </View>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeLabel} testID="playback-speed-range-min">
                  {formatSpeedLabel(activeBounds.min)}
                </Text>
                <Text style={styles.rangeLabel} testID="playback-speed-range-max">
                  {formatSpeedLabel(activeBounds.max)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              testID="playback-speed-increment"
              style={[styles.stepButton, incrementDisabled && styles.stepButtonDisabled]}
              onPress={incrementSpeed.onPress}
              onPressIn={incrementSpeed.onPressIn}
              onPressOut={() => {
                incrementSpeed.onPressOut();
                scheduleCloseAfterDrag();
              }}
              disabled={incrementDisabled}
              accessibilityRole="button"
              accessibilityLabel={`Increase playback speed by ${PLAYBACK_SPEED_STEP}×`}
              accessibilityHint={`Current speed ${formatSpeedLabel(value)}. Press and hold to accelerate.`}
              accessibilityState={{ disabled: incrementDisabled }}
            >
              <Text style={styles.stepButtonText}>+</Text>
            </TouchableOpacity>
          </View>}
          <View style={styles.presets}>
            {displayedOptions.map((option, index) => {
              const normalizedOption = normalizePlaybackSpeed(option, activeBounds);
              return (
                <TouchableOpacity
                  key={`${index}-${option}`}
                  testID={`playback-speed-preset-${option}`}
                  style={[styles.option, normalizedOption === value && styles.optionSelected]}
                  onPress={() => applySpeed(normalizedOption, true)}
                  onLongPress={advancedSpeedAvailable ? () => setEditingPresetIndex(index) : undefined}
                  delayLongPress={450}
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
        label={`Playback speed ${formatSpeedLabel(presentedValue)}`}
        valueText={formatSpeedLabel(presentedValue)}
        hint={!songLoaded
          ? 'Choose music to adjust playback speed'
          : !productSpeedAvailable
            ? 'Playback speed is unavailable'
            : speedAvailable
            ? advancedSpeedAvailable
              ? 'Opens preset and fine playback speed controls'
              : 'Opens preset playback speeds'
            : 'Playback speed is unavailable for this audio source'}
        description={songLoaded && !speedAvailable
          ? productSpeedAvailable
            ? 'Not available for this source: playback speed'
            : 'Unavailable'
          : undefined}
        state={songLoaded && speedAvailable
          ? (presentedValue === DEFAULT_PLAYBACK_SPEED ? 'inactive' : 'active')
          : 'unavailable'}
        onPress={() => {
          if (dismissingRef.current) {
            showPopup();
            return;
          }
          if (open) {
            animateDismiss();
            return;
          }
          showPopup();
        }}
        accessibilityActions={advancedSpeedAvailable ? [
          { name: 'increment', label: 'Increase playback speed' },
          { name: 'decrement', label: 'Decrease playback speed' },
        ] : undefined}
        onAccessibilityAction={advancedSpeedAvailable ? onAdjust : undefined}
      >
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>{formatSpeedLabel(presentedValue)}</Text>
      </DockButton>
      {editingPresetIndex !== null && (
        <PlaybackSpeedPresetEditor
          visible
          value={displayedOptions[editingPresetIndex] ?? DEFAULT_PLAYBACK_SPEED}
          defaultValue={defaultPlaybackSpeedPreset(
            activeRange,
            preferences.playbackSpeedPresetCount,
            editingPresetIndex,
          )}
          bounds={activeBounds}
          onClose={() => setEditingPresetIndex(null)}
          onSave={nextValue => {
            const key = playbackSpeedPresetOverrideKey(
              activeRange,
              preferences.playbackSpeedPresetCount,
              editingPresetIndex,
            );
            void updateSettingsPreferences({
              playbackSpeedPresetOverrides: {
                ...preferences.playbackSpeedPresetOverrides,
                [key]: nextValue,
              },
            });
            setEditingPresetIndex(null);
          }}
          onUseDefault={() => {
            const key = playbackSpeedPresetOverrideKey(
              activeRange,
              preferences.playbackSpeedPresetCount,
              editingPresetIndex,
            );
            const nextOverrides = { ...preferences.playbackSpeedPresetOverrides };
            delete nextOverrides[key];
            void updateSettingsPreferences({ playbackSpeedPresetOverrides: nextOverrides });
            setEditingPresetIndex(null);
          }}
        />
      )}
    </View>
  );
};

export default PlaybackSpeedControl;
