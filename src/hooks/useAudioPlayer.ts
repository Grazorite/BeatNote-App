import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudioPlayer, AudioSource, setAudioModeAsync } from 'expo-audio';
import { Alert, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from './useStudioStore';
import { LOOP_BOUNDARY_TOLERANCE_MS, decideLoopWrap, markerLoopRangeAtTime } from '../utils/loopRange';
import { updateTrackSwitchPlayer } from '../features/library/trackSwitch';
import { isLoopRangeGestureActive } from '../features/playback/interactionActivity';
import { incrementPerfCounter } from '../utils/perfCounters';
import { perfBegin, perfEndAfterFrame } from '../utils/perfMarks';

interface ErrorState {
  visible: boolean;
  title: string;
  message: string;
}

// Constants for audio playback behavior
const END_OF_TRACK_TOLERANCE_MS = 100;
const PLAYBACK_UPDATE_INTERVAL_MS = 100;
const PLAYBACK_RATE_DEBOUNCE_MS = 120;
const PLAYBACK_INTENT_COMMAND_TIMEOUT_MS = 2000;
const PLAYBACK_INTENT_SETTLE_MS = 400;

/**
 * Custom audio player hook that handles:
 * - Audio file loading and playback control
 * - End-of-track detection with automatic pause
 * - Restart from beginning when playing from end position
 * - Consistent behavior across single and stems view modes
 * - Waveform scrubbing with play state preservation
 */
export const useCustomAudioPlayer = () => {
  const [error, setError] = useState<ErrorState>({ visible: false, title: '', message: '' });
  const [audioModeReady, setAudioModeReady] = useState(Platform.OS === 'web');
  const wasPlayingBeforeScrubRef = useRef(false);
  const previousSampleRef = useRef<number | null>(null);
  const loopDecisionSuspendedRef = useRef(false);
  const loopSeekInFlightRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const pendingSeekIntervalsRef = useRef<string[]>([]);
  const seekDrainRef = useRef<Promise<void> | null>(null);
  const seekResumePlaybackRef = useRef(false);
  const seekEpochRef = useRef(0);
  const mountedRef = useRef(true);
  const playbackIntentRef = useRef<boolean | null>(null);
  const playbackIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedLoopRangeKeyRef = useRef<string | null>(null);
  const completionHandledRef = useRef(false);
  const playbackRateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackRateSourceRef = useRef<string | null>(null);
  const appliedPlaybackSpeedRef = useRef<number | null>(null);
  const currentAudioUri = useStudioStore(state => state.currentAudioUri);
  const currentAudioFilename = useStudioStore(state => state.currentAudioFilename);
  const lockScreenTitle = useStudioStore(state => (
    state.currentMusicItemId === null
      ? state.currentAudioFilename ?? 'BeatNote'
      : state.libraryItems[state.currentMusicItemId]?.displayTitle
        ?? state.currentAudioFilename
        ?? 'BeatNote'
  ));
  const audioSource = useMemo<AudioSource | null>(
    () => currentAudioUri ? { uri: currentAudioUri } : null,
    [currentAudioUri],
  );
  const player = useAudioPlayer(audioSource);
  const playerStatusRef = useRef(player.currentStatus);
  const [playerIsLoaded, setPlayerIsLoaded] = useState(player.isLoaded);
  const {
    isPlaying,
    layers,
    activeLayerId,
    setIsPlaying,
    addMarker,
    removeMarker,
    setSongDuration,
    setCurrentTime,
    playbackSpeed,
  } = useStudioStore(useShallow(state => ({
    isPlaying: state.isPlaying,
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    setIsPlaying: state.setIsPlaying,
    addMarker: state.addMarker,
    removeMarker: state.removeMarker,
    setSongDuration: state.setSongDuration,
    setCurrentTime: state.setCurrentTime,
    playbackSpeed: state.playbackSpeed,
  })));

  const holdPlaybackIntent = useCallback((playing: boolean, durationMs: number): void => {
    playbackIntentRef.current = playing;
    if (playbackIntentTimerRef.current !== null) clearTimeout(playbackIntentTimerRef.current);
    useStudioStore.getState().setIsPlaying(playing);
    playbackIntentTimerRef.current = setTimeout(() => {
      playbackIntentTimerRef.current = null;
      if (playbackIntentRef.current !== playing) return;
      playbackIntentRef.current = null;
      const statusPlaying = playerStatusRef.current.playing;
      const state = useStudioStore.getState();
      if (state.switchPhase === 'idle' && state.isPlaying !== statusPlaying) {
        state.setIsPlaying(statusPlaying);
      }
    }, durationMs);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      seekEpochRef.current += 1;
      pendingSeekRef.current = null;
      pendingSeekIntervalsRef.current.splice(0).forEach(perfEndAfterFrame);
      seekDrainRef.current = null;
      if (playbackIntentTimerRef.current !== null) clearTimeout(playbackIntentTimerRef.current);
    };
  }, []);

  useEffect(() => {
    seekEpochRef.current += 1;
    pendingSeekRef.current = null;
    pendingSeekIntervalsRef.current.splice(0).forEach(perfEndAfterFrame);
    seekDrainRef.current = null;
  }, [player]);

  const showError = useCallback((title: string, message: string) => {
    setError(prev => prev.visible ? prev : { visible: true, title, message });
  }, []);

  const hideError = useCallback(() => {
    setError(prev => prev.visible ? { visible: false, title: '', message: '' } : prev);
  }, []);

  const handleTrackCompletion = useCallback((durationMs: number): void => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    const state = useStudioStore.getState();
    const queue = state.queue;
    const hasShuffledNext = queue?.shuffle === true
      && queue.currentIndex !== null
      && queue.currentIndex + 1 < queue.order.length;

    previousSampleRef.current = durationMs;
    failedLoopRangeKeyRef.current = null;

    if (state.isRepeatActive) {
      void Promise.resolve(player.seekTo(0))
        .then(() => {
          previousSampleRef.current = 0;
          state.setCurrentTime(0);
          player.play();
          state.setIsPlaying(true);
        })
        .catch((repeatError: unknown) => {
          console.error('Track repeat failed:', repeatError);
          player.pause();
          state.setCurrentTime(durationMs);
          state.setIsPlaying(false);
        });
      return;
    }

    if (hasShuffledNext) {
      state.setCurrentTime(durationMs);
      // Preserve the playing intent so an unguarded Track_Switch_Transaction starts the shuffled
      // destination. A dirty saved project can still raise the normal switch guard; in that case
      // the completed source remains paused while the user decides.
      state.setIsPlaying(true);
      const switchPromise = state.nextTrack();
      void Promise.resolve().then(() => {
        const pendingState = useStudioStore.getState();
        if (pendingState.switchPhase === 'guard') pendingState.setIsPlaying(false);
      });
      void switchPromise.then(result => {
        if (result.kind === 'committed' || result.kind === 'superseded') return;
        const currentState = useStudioStore.getState();
        if (currentState.currentAudioUri === currentAudioUri) {
          player.pause();
          currentState.setCurrentTime(durationMs);
          currentState.setIsPlaying(false);
        }
      });
      return;
    }

    player.pause();
    state.setCurrentTime(durationMs);
    state.setIsPlaying(false);
  }, [currentAudioUri, player]);

  useEffect(() => {
    completionHandledRef.current = false;
  }, [currentAudioUri]);

  useEffect(() => {
    playerStatusRef.current = player.currentStatus;
    setPlayerIsLoaded(player.isLoaded);
    const subscription = player.addListener('playbackStatusUpdate', status => {
      playerStatusRef.current = status;
      setPlayerIsLoaded(previous => previous === status.isLoaded ? previous : status.isLoaded);
      const currentState = useStudioStore.getState();
      const durationMs = status.duration * 1000;
      if (status.playing && status.currentTime * 1000 < durationMs - END_OF_TRACK_TOLERANCE_MS) {
        completionHandledRef.current = false;
      }
      if (status.didJustFinish && currentState.switchPhase === 'idle' && currentState.isPlaying) {
        handleTrackCompletion(Number.isFinite(durationMs) && durationMs > 0
          ? durationMs
          : currentState.songDuration);
        return;
      }
      if (currentState.switchPhase === 'idle'
        && playbackIntentRef.current === null
        && currentState.isPlaying !== status.playing) {
        currentState.setIsPlaying(status.playing);
      }
      // Native seek status can briefly report the pre-seek position as paused. Keep the tapped
      // position authoritative until the latest-wins seek drain has settled.
      if (currentState.switchPhase === 'idle'
        && playbackIntentRef.current === null
        && !loopDecisionSuspendedRef.current
        && !status.playing) {
        const reportedPositionMs = status.currentTime * 1000;
        if (Number.isFinite(reportedPositionMs)
          && Math.abs(currentState.currentTime - reportedPositionMs) > 20) {
          currentState.setCurrentTime(reportedPositionMs);
          previousSampleRef.current = reportedPositionMs;
        }
      }
      if (Number.isFinite(durationMs) && durationMs > 0
        && useStudioStore.getState().songDuration !== durationMs) {
        setSongDuration(durationMs);
      }
    });
    return () => subscription.remove();
  }, [handleTrackCompletion, player, setSongDuration]);

  useEffect(() => {
    updateTrackSwitchPlayer({
      uri: currentAudioUri,
      isLoaded: playerIsLoaded,
      pause: () => player.pause(),
      play: () => player.play(),
      seekTo: milliseconds => player.seekTo(milliseconds / 1000),
    });
    return () => updateTrackSwitchPlayer(null);
  }, [currentAudioUri, player, playerIsLoaded]);

  useEffect(() => {
    if (!player) return;
    if (playbackRateTimerRef.current !== null) {
      clearTimeout(playbackRateTimerRef.current);
      playbackRateTimerRef.current = null;
    }
    const sourceChanged = playbackRateSourceRef.current !== currentAudioUri;
    const alreadyApplied = !sourceChanged && appliedPlaybackSpeedRef.current === playbackSpeed;
    if (alreadyApplied) return;

    const applyPlaybackRate = () => {
      playbackRateTimerRef.current = null;
      try {
        player.shouldCorrectPitch = true;
        player.setPlaybackRate(playbackSpeed, 'high');
        playbackRateSourceRef.current = currentAudioUri;
        appliedPlaybackSpeedRef.current = playbackSpeed;
      } catch (playbackRateError) {
        console.error('Playback speed configuration error:', playbackRateError);
        showError(
          'Playback Speed Error',
          'BeatNote could not apply pitch-preserved playback speed. Playback remains available at the last working speed.',
        );
      }
    };

    if (sourceChanged || !isPlaying || appliedPlaybackSpeedRef.current === null) {
      applyPlaybackRate();
    } else {
      playbackRateTimerRef.current = setTimeout(applyPlaybackRate, PLAYBACK_RATE_DEBOUNCE_MS);
    }
    return () => {
      if (playbackRateTimerRef.current !== null) {
        clearTimeout(playbackRateTimerRef.current);
        playbackRateTimerRef.current = null;
      }
    };
  }, [currentAudioUri, isPlaying, player, playbackSpeed, showError]);

  useEffect(() => {
    let mounted = true;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).then(() => {
      if (mounted) setAudioModeReady(true);
    }).catch((audioModeError: unknown) => {
      console.error('Audio mode configuration error:', audioModeError);
      showError('Audio Setup Error', 'BeatNote could not configure audio playback. Please restart the app and try again.');
    });
    return () => { mounted = false; };
  }, [showError]);

  useEffect(() => {
    if (Platform.OS === 'web' || !audioModeReady || currentAudioUri === null || !playerIsLoaded) return;
    try {
      player.setActiveForLockScreen(true, {
        title: lockScreenTitle,
        artist: 'BeatNote',
      }, {
        showSeekBackward: true,
        showSeekForward: true,
      });
    } catch (lockScreenError) {
      console.error('Lock screen controls setup error:', lockScreenError);
    }
    // Expo releases and unregisters the previous native player when its source changes or the hook
    // unmounts. Calling clearLockScreenControls from React cleanup races that release and can address
    // an already-disposed SharedObject on iOS.
  }, [audioModeReady, currentAudioUri, lockScreenTitle, player, playerIsLoaded]);

  const togglePlayback = useCallback(async () => {
    if (!player) return;
    const intervalId = perfBegin('playback.toggle');
    try {
      const targetPlaying = !useStudioStore.getState().isPlaying;
      seekResumePlaybackRef.current = targetPlaying;
      holdPlaybackIntent(targetPlaying, PLAYBACK_INTENT_COMMAND_TIMEOUT_MS);
      if (!targetPlaying) {
        player.pause();
        holdPlaybackIntent(false, PLAYBACK_INTENT_SETTLE_MS);
      } else {
        const activeDrain = seekDrainRef.current;
        if (activeDrain !== null) {
          await activeDrain;
          return;
        }
        const { currentTime, songDuration, setViewportStartTime } = useStudioStore.getState();
        
        // If at end of track, restart from beginning
        if (currentTime >= songDuration - END_OF_TRACK_TOLERANCE_MS) {
          setCurrentTime(0);
          setViewportStartTime(0); // Reset viewport for both single and stems modes
          await player.seekTo(0);
          previousSampleRef.current = 0;
          failedLoopRangeKeyRef.current = null;
        } else {
          // Paused native status already keeps the store aligned with the player. Re-seeking here
          // delayed every ordinary Play command and made the transport feel unresponsive.
          previousSampleRef.current = currentTime;
        }
        if (!mountedRef.current || playbackIntentRef.current !== true) return;
        await player.play();
        holdPlaybackIntent(true, PLAYBACK_INTENT_SETTLE_MS);
      }
    } catch (error) {
      console.error('Playback error:', error);
      playbackIntentRef.current = null;
      if (playbackIntentTimerRef.current !== null) {
        clearTimeout(playbackIntentTimerRef.current);
        playbackIntentTimerRef.current = null;
      }
      setIsPlaying(playerStatusRef.current.playing);
      Alert.alert('Playback Error', 'Failed to control audio playback');
    } finally {
      perfEndAfterFrame(intervalId);
    }
  }, [holdPlaybackIntent, player, setIsPlaying, setCurrentTime]);

  const seekToPosition = useCallback(async (position: number): Promise<void> => {
    if (!player) return;

    const intervalId = perfBegin(
      loopDecisionSuspendedRef.current && seekDrainRef.current === null ? 'seek.scrub' : 'seek.tap',
    );
    const { songDuration } = useStudioStore.getState();
    const clampedPosition = Math.max(0, Math.min(position, songDuration));
    // Visual feedback is immediate for every tap; only the newest target reaches the player.
    setCurrentTime(clampedPosition);
    pendingSeekRef.current = clampedPosition;
    pendingSeekIntervalsRef.current.push(intervalId);
    seekResumePlaybackRef.current = useStudioStore.getState().isPlaying;
    if (seekResumePlaybackRef.current) {
      holdPlaybackIntent(true, PLAYBACK_INTENT_COMMAND_TIMEOUT_MS);
    }
    if (seekDrainRef.current) return seekDrainRef.current;

    const seekEpoch = seekEpochRef.current;
    loopDecisionSuspendedRef.current = true;
    // Rapid taps previously queued one awaited seek (and play) per tap. Draining latest-wins keeps
    // at most one player seek in flight and resumes playback once, after the final target.
    let drain: Promise<void> | null = null;
    drain = (async (): Promise<void> => {
      try {
        while (true) {
          while (pendingSeekRef.current !== null) {
            const target = pendingSeekRef.current;
            pendingSeekRef.current = null;
            await player.seekTo(target / 1000); // Convert to seconds
            if (!mountedRef.current || seekEpoch !== seekEpochRef.current) return;
            previousSampleRef.current = target;
            failedLoopRangeKeyRef.current = null;
          }
          if (seekResumePlaybackRef.current) {
            // A tap can arrive while the native play promise is pending. Recheck the queue after
            // resuming so that target is sought instead of being cleared by the drain's finally.
            await player.play();
            if (!mountedRef.current || seekEpoch !== seekEpochRef.current) return;
            if (pendingSeekRef.current !== null) continue;
            holdPlaybackIntent(true, PLAYBACK_INTENT_SETTLE_MS);
          }
          break;
        }
      } catch (error) {
        pendingSeekRef.current = null;
        console.error('Seek error:', error);
        Alert.alert('Seek Error', 'Failed to seek to position');
        const reportedPosition = (player.currentTime ?? 0) * 1000;
        previousSampleRef.current = reportedPosition;
        setCurrentTime(reportedPosition);
      } finally {
        if (seekDrainRef.current === drain) {
          loopDecisionSuspendedRef.current = false;
          seekDrainRef.current = null;
          pendingSeekIntervalsRef.current.splice(0).forEach(perfEndAfterFrame);
        }
      }
    })();
    seekDrainRef.current = drain;
    return drain;
  }, [holdPlaybackIntent, player, setCurrentTime]);

  const startWaveformScrub = useCallback(async () => {
    perfBegin('seek.scrub', 'seek.scrub:session');
    loopDecisionSuspendedRef.current = true;
    if (player && isPlaying) {
      wasPlayingBeforeScrubRef.current = true;
      seekResumePlaybackRef.current = false;
      holdPlaybackIntent(false, PLAYBACK_INTENT_SETTLE_MS);
      player.pause();
    } else {
      wasPlayingBeforeScrubRef.current = false;
    }
  }, [holdPlaybackIntent, isPlaying, player]);

  const endWaveformScrub = useCallback(async () => {
    if (player) {
      const { currentTime } = useStudioStore.getState();
      const shouldResume = wasPlayingBeforeScrubRef.current;
      if (shouldResume) holdPlaybackIntent(true, PLAYBACK_INTENT_COMMAND_TIMEOUT_MS);
      await seekToPosition(currentTime);
    }
    wasPlayingBeforeScrubRef.current = false;
    loopDecisionSuspendedRef.current = false;
    perfEndAfterFrame('seek.scrub:session');
  }, [holdPlaybackIntent, player, seekToPosition]);

  const tapToBeat = useCallback(async () => {
    const { currentTime } = useStudioStore.getState();
    
    // Only sync audio position when paused to avoid interruption
    if (player && !isPlaying) {
      player.seekTo(currentTime / 1000); // Convert to seconds
    }
    
    const activeLayer = layers.find(layer => layer.id === activeLayerId);
    const existingMarker = activeLayer?.markers.find(marker => Math.abs(marker - currentTime) <= 100);
    const intervalId = perfBegin(existingMarker === undefined ? 'marker.add' : 'marker.remove');
    if (existingMarker !== undefined) {
      removeMarker(existingMarker);
    } else {
      addMarker(currentTime);
    }
    perfEndAfterFrame(intervalId);
  }, [activeLayerId, addMarker, isPlaying, layers, player, removeMarker]);

  // Handle playback position updates and end-of-track detection
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      incrementPerfCounter('playback.sampleTick');
      if (player.currentTime !== undefined) {
        const currentTimeMs = player.currentTime * 1000; // Convert to milliseconds
        const {
          isLoopRangeEnabled,
          isLoopMarkerActive,
          loopStartMs,
          loopEndMs,
          songDuration,
          layerSpecificNavigation,
          activeLayerId,
          allLayersData,
        } = useStudioStore.getState();

        if (loopDecisionSuspendedRef.current) {
          // The store already contains the user's latest tap/scrub position. Publishing the old
          // native clock during seek settlement makes every playing seek flash backwards once.
          return;
        }
        if (loopSeekInFlightRef.current) {
          previousSampleRef.current = currentTimeMs;
          setCurrentTime(currentTimeMs);
          return;
        }

        const previousSampleMs = previousSampleRef.current ?? currentTimeMs;
        const markerTimes = layerSpecificNavigation
          ? allLayersData.find(layer => layer.id === activeLayerId)?.markers ?? []
          : allLayersData.flatMap(layer => layer.markers);
        const markerRange = isLoopMarkerActive
          ? markerLoopRangeAtTime(markerTimes, previousSampleMs, songDuration)
          : { loopStartMs: null, loopEndMs: null };
        const effectiveLoopStartMs = isLoopRangeEnabled ? loopStartMs : markerRange.loopStartMs;
        const effectiveLoopEndMs = isLoopRangeEnabled ? loopEndMs : markerRange.loopEndMs;
        const loopIsEnabled = isLoopRangeEnabled || isLoopMarkerActive;
        const terminalLoopArmed = loopIsEnabled
          && effectiveLoopStartMs !== null
          && effectiveLoopEndMs !== null
          && Math.abs(effectiveLoopEndMs - songDuration) <= END_OF_TRACK_TOLERANCE_MS
          && previousSampleMs >= effectiveLoopStartMs
          && previousSampleMs < effectiveLoopEndMs;
        const nativeEndedInsideTerminalLoop = terminalLoopArmed
          && (playerStatusRef.current.didJustFinish
            || (currentTimeMs >= effectiveLoopEndMs - 500 && player.playing === false));
        const loopDecisionSampleMs = nativeEndedInsideTerminalLoop
          ? effectiveLoopEndMs
          : currentTimeMs;
        const loopRangeKey = `${isLoopRangeEnabled ? 'range' : 'marker'}:${effectiveLoopStartMs}:${effectiveLoopEndMs}`;
        if (failedLoopRangeKeyRef.current !== null && failedLoopRangeKeyRef.current !== loopRangeKey) {
          failedLoopRangeKeyRef.current = null;
        }
        if (failedLoopRangeKeyRef.current === loopRangeKey
          && (!loopIsEnabled
            || effectiveLoopStartMs === null
            || effectiveLoopEndMs === null
            || currentTimeMs < effectiveLoopStartMs
            || currentTimeMs < effectiveLoopEndMs - LOOP_BOUNDARY_TOLERANCE_MS)) {
          failedLoopRangeKeyRef.current = null;
        }
        const decision = failedLoopRangeKeyRef.current === loopRangeKey
          ? { kind: 'noWrap' as const }
          : decideLoopWrap({
              isEnabled: loopIsEnabled,
              isPlaying,
              loopStartMs: effectiveLoopStartMs,
              loopEndMs: effectiveLoopEndMs,
              previousSampleMs,
              currentSampleMs: loopDecisionSampleMs,
              toleranceMs: LOOP_BOUNDARY_TOLERANCE_MS,
            });

        if (decision.kind === 'wrap') {
          loopSeekInFlightRef.current = true;
          void Promise.resolve(player.seekTo(decision.targetMs / 1000))
            .then(() => {
              player.play();
              setCurrentTime(decision.targetMs);
              previousSampleRef.current = decision.targetMs;
              failedLoopRangeKeyRef.current = null;
            })
            .catch((seekError: unknown) => {
              console.error('Bounded loop seek failed', {
                error: seekError,
                targetMs: decision.targetMs,
              });
              const reportedPosition = (player.currentTime ?? 0) * 1000;
              setCurrentTime(reportedPosition);
              previousSampleRef.current = reportedPosition;
              failedLoopRangeKeyRef.current = loopRangeKey;
            })
            .finally(() => {
              loopSeekInFlightRef.current = false;
            });
          return;
        }

        // Do not let the broader end-of-track tolerance pause an armed range
        // before the tighter loop boundary is sampled. If iOS completes first,
        // the next poll is converted into the terminal wrap above.
        if (terminalLoopArmed && currentTimeMs >= songDuration - END_OF_TRACK_TOLERANCE_MS) {
          previousSampleRef.current = currentTimeMs;
          setCurrentTime(currentTimeMs);
          return;
        }

        previousSampleRef.current = currentTimeMs;

        // Check if reached end of track
        if (currentTimeMs >= songDuration - END_OF_TRACK_TOLERANCE_MS) {
          handleTrackCompletion(songDuration);
        } else {
          if (!isLoopRangeGestureActive()) setCurrentTime(currentTimeMs);
        }
      }
    }, PLAYBACK_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [handleTrackCompletion, player, isPlaying, setCurrentTime, setIsPlaying]);

  return {
    sound: player,
    audioUri: currentAudioUri,
    audioFilename: currentAudioFilename,
    togglePlayback,
    tapToBeat,
    seekToPosition,
    startWaveformScrub,
    endWaveformScrub,
    error,
    hideError,
  };
};
