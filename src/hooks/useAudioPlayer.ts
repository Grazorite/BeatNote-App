import { showPrompt } from '../components/ui/common/AppPrompt';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AudioSource, setAudioModeAsync } from 'expo-audio';
import { useStudioPlayer } from './useStudioPlayer';
import { AppState, Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from './useStudioStore';
import { LOOP_BOUNDARY_TOLERANCE_MS, decideLoopWrap, markerLoopRangeAtTime } from '../utils/loopRange';
import { isCapabilityAvailable } from '../features/entitlements/capabilityService';
import { useProductCapability } from '../features/entitlements/useProductCapability';
import { navigationBaseIndex, updateTrackSwitchPlayer } from '../features/library/trackSwitch';
import { isLoopRangeGestureActive } from '../features/playback/interactionActivity';
import { incrementPerfCounter } from '../utils/perfCounters';
import { perfBegin, perfEndAfterFrame } from '../utils/perfMarks';
import { DEFAULT_PLAYBACK_SPEED } from '../utils/playbackSpeed';
import { getSettingsPreferences, useSettingsPreferences } from '../features/settings/preferences';
import { configureRemoteButtons, subscribeToRemoteTrack, subscribeToOutputRouteUnavailable } from '../services/audioRoute';
import { withAudioOperationTimeout } from '../utils/audioOperationTimeout';

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
const NATIVE_SEEK_TIMEOUT_MS = 5_000;
const FOREGROUND_PLAYER_RECHECK_MS = 750;
const PLAYER_READY_TIMEOUT_MS = 10_000;
const PLAY_START_TIMEOUT_MS = 2_000;
const playbackAudioMode = {
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix' as const,
};

const clockMoved = (seconds: number, start: number) => Number.isFinite(seconds)
  && (Number.isFinite(start) ? Math.abs(seconds - start) > 0.01 : seconds > 0);

async function waitForPlayer(
  ready: () => boolean,
  current: () => boolean,
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (current() && !ready()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for the audio player');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

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
  const foregroundPlayerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryRef = useRef<{
    uri: string;
    previousPlayer: ReturnType<typeof useStudioPlayer>;
    playStarted: boolean;
    positionMs: number;
    shouldPlay: boolean;
  } | null>(null);
  const transportCommand = useRef(0);
  const checkNextPlay = useRef(false);
  const [playerGeneration, setPlayerGeneration] = useState(0);
  const mountedRef = useRef(true);
  const playbackIntentRef = useRef<boolean | null>(null);
  const playbackIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedLoopRangeKeyRef = useRef<string | null>(null);
  const completionHandledRef = useRef(false);
  const playbackRateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackRateSourceRef = useRef<string | null>(null);
  const appliedPlaybackSpeedRef = useRef<number | null>(null);
  const lastPlaybackActiveAtRef = useRef(0);
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
  const player = useStudioPlayer(audioSource, playerGeneration);
  const seekPlayer = useCallback(async (seconds: number, label = 'Audio seek'): Promise<void> => (
    withAudioOperationTimeout(player.seekTo(seconds), NATIVE_SEEK_TIMEOUT_MS, label)
  ), [player]);
  const remoteIndex = useStudioStore(navigationBaseIndex);
  const remoteCount = useStudioStore(state => state.queue?.order.length ?? 0);
  const remoteLocked = useStudioStore(state => state.saveInProgress || state.switchPhase === 'guard');
  const { remoteSeekSeconds, remoteButtonMode } = useSettingsPreferences();
  const remoteControlsAvailable = useProductCapability('playback.remoteControls');
  const playbackSpeedAvailable = useProductCapability('playback.pitchPreservingSpeed');
  const lockScreenActiveRef = useRef(false);
  const initialPlayerStatus = useMemo(() => player.currentStatus, [player]);
  const playerStatusRef = useRef(initialPlayerStatus);
  const [loadedPlayer, setLoadedPlayer] = useState(() => player.isLoaded ? player : null);
  const playerIsLoaded = loadedPlayer === player;
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

  const resetSeekPipeline = useCallback((): void => {
    seekEpochRef.current += 1;
    pendingSeekRef.current = null;
    seekDrainRef.current = null;
    seekResumePlaybackRef.current = false;
    loopDecisionSuspendedRef.current = false;
    loopSeekInFlightRef.current = false;
    pendingSeekIntervalsRef.current.splice(0).forEach(perfEndAfterFrame);
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
      if (foregroundPlayerTimerRef.current !== null) clearTimeout(foregroundPlayerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    transportCommand.current++;
    resetSeekPipeline();
    appliedPlaybackSpeedRef.current = null;
    if (recoveryRef.current?.uri !== currentAudioUri) recoveryRef.current = null;
  }, [currentAudioUri, player, resetSeekPipeline]);

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
    // Auto-advance is a Pro capability; Lite playback ends when the track does.
    const hasContinuousNext = isCapabilityAvailable('playback.continuous')
      && (getSettingsPreferences().continuousPlay || queue?.shuffle === true)
      && queue !== null
      && queue.currentIndex !== null
      && queue.currentIndex + 1 < queue.order.length;

    previousSampleRef.current = durationMs;
    failedLoopRangeKeyRef.current = null;

    if (state.isRepeatActive) {
      void seekPlayer(0, 'Repeat seek')
        .then(() => {
          previousSampleRef.current = 0;
          state.beginPlaybackTraversal(0);
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

    if (hasContinuousNext) {
      state.setCurrentTime(durationMs);
      // Preserve the playing intent so the completion transaction starts the next destination.
      // Completion flushes and keeps any dirty per-song draft automatically; manual song changes
      // retain the explicit Save / Keep Draft / Cancel guard.
      state.setIsPlaying(true);
      const switchPromise = state.advanceTrackAfterCompletion();
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
  }, [currentAudioUri, player, seekPlayer]);

  useEffect(() => {
    completionHandledRef.current = false;
  }, [currentAudioUri]);

  useEffect(() => {
    playerStatusRef.current = player.currentStatus;
    setLoadedPlayer(player.isLoaded ? player : null);
    const subscription = player.addListener('playbackStatusUpdate', status => {
      if (useStudioStore.getState().currentAudioUri !== currentAudioUri) return;
      playerStatusRef.current = status;
      setLoadedPlayer(status.isLoaded ? player : null);
      const currentState = useStudioStore.getState();
      // The replacement starts at zero. Its status must not overwrite the saved position
      // or user intent while its ready/seek/play sequence is still in flight.
      const recovery = recoveryRef.current;
      if (recovery?.playStarted && player !== recovery.previousPlayer && status.didJustFinish) {
        recoveryRef.current = null;
      } else if (recovery || !status.isLoaded) {
        return;
      }
      if (status.playing) lastPlaybackActiveAtRef.current = Date.now();
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
  }, [currentAudioUri, handleTrackCompletion, holdPlaybackIntent, player, seekPlayer, setSongDuration]);

  const reloadPlayer = useCallback((positionMs: number, shouldPlay: boolean) => {
    const state = useStudioStore.getState();
    if (Platform.OS !== 'ios' || !currentAudioUri || state.currentAudioUri !== currentAudioUri
      || state.switchPhase !== 'idle' || recoveryRef.current || AppState.currentState !== 'active') return;
    transportCommand.current++;
    resetSeekPipeline();
    if (playbackIntentTimerRef.current !== null) clearTimeout(playbackIntentTimerRef.current);
    playbackIntentRef.current = null;
    recoveryRef.current = { uri: currentAudioUri, previousPlayer: player, positionMs, shouldPlay, playStarted: false };
    state.setCurrentTime(positionMs);
    state.setIsPlaying(shouldPlay);
    setPlayerGeneration(value => value + 1);
  }, [currentAudioUri, player, resetSeekPipeline]);

  useEffect(() => {
    const recovery = recoveryRef.current;
    if (!recovery || recovery.previousPlayer === player || recovery.uri !== currentAudioUri) return;
    let active = true;
    const current = () => active && recoveryRef.current === recovery
      && useStudioStore.getState().currentAudioUri === recovery.uri
      && useStudioStore.getState().switchPhase === 'idle';
    const restore = async () => {
      await waitForPlayer(() => player.isLoaded, current, PLAYER_READY_TIMEOUT_MS);
      if (!current()) return;
      await withAudioOperationTimeout(setAudioModeAsync(playbackAudioMode),
        PLAY_START_TIMEOUT_MS, 'Restore iOS audio session');
      if (!current()) return;
      setAudioModeReady(true);
      let positionMs: number;
      do {
        positionMs = recovery.positionMs;
        await seekPlayer(positionMs / 1000, 'Restore playback position');
      } while (current() && positionMs !== recovery.positionMs);
      if (!current()) return;
      useStudioStore.getState().beginPlaybackTraversal(positionMs);
      previousSampleRef.current = positionMs;
      if (!recovery.shouldPlay) return;
      const start = player.currentTime;
      recovery.playStarted = true;
      player.play();
      await waitForPlayer(() => clockMoved(player.currentTime, start),
        () => current() && recovery.shouldPlay, PLAY_START_TIMEOUT_MS);
    };
    void restore().catch(error => {
      if (!current()) return;
      console.error('Same-song playback recovery failed', error);
      try {
        player.pause();
      } catch (pauseError) {
        console.error('Recovery pause failed', pauseError);
      }
      checkNextPlay.current = true;
      useStudioStore.getState().setIsPlaying(false);
      showPrompt('Playback Error', 'Couldn’t resume this song. Tap Play to try again.');
    }).finally(() => {
      if (active && recoveryRef.current === recovery) recoveryRef.current = null;
    });
    return () => { active = false; };
  }, [currentAudioUri, player, seekPlayer]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', nextState => {
      const becameActive = nextState === 'active' && previousState !== 'active';
      previousState = nextState;
      if (foregroundPlayerTimerRef.current !== null) clearTimeout(foregroundPlayerTimerRef.current);
      if (!becameActive) {
        transportCommand.current++;
        const recovery = recoveryRef.current;
        if (recovery && !recovery.playStarted) {
          recovery.shouldPlay = false;
          useStudioStore.getState().setIsPlaying(false);
        }
        return;
      }
      resetSeekPipeline();
      checkNextPlay.current = true;
      foregroundPlayerTimerRef.current = setTimeout(() => {
        const state = useStudioStore.getState();
        if (!checkNextPlay.current || !currentAudioUri || state.currentAudioUri !== currentAudioUri
          || state.switchPhase !== 'idle' || Platform.OS !== 'ios') return;
        try {
          if (player.isLoaded) return;
        } catch (error) {
          console.warn('Foreground player is unavailable', error);
        }
        reloadPlayer(state.currentTime, state.isPlaying);
      }, FOREGROUND_PLAYER_RECHECK_MS);
    });
    return () => {
      subscription.remove();
      if (foregroundPlayerTimerRef.current !== null) clearTimeout(foregroundPlayerTimerRef.current);
    };
  }, [currentAudioUri, player, reloadPlayer, resetSeekPipeline]);

  useEffect(() => subscribeToOutputRouteUnavailable(() => {
    const state = useStudioStore.getState();
    const wasPlaying = state.isPlaying
      || playerStatusRef.current.playing
      || playbackIntentRef.current === true
      || Date.now() - lastPlaybackActiveAtRef.current < 750;
    if (!wasPlaying) return;

    if (getSettingsPreferences().pauseOnHeadsetDisconnect) {
      transportCommand.current++;
      const recovery = recoveryRef.current;
      if (recovery) {
        recovery.shouldPlay = false;
        if (recovery.playStarted) recoveryRef.current = null;
      }
      player.pause();
      holdPlaybackIntent(false, PLAYBACK_INTENT_SETTLE_MS);
      return;
    }

    // expo-audio pauses on iOS oldDeviceUnavailable before publishing the route event. When the
    // user opts out, resume after that native pause settles so playback continues on the new route.
    const command = transportCommand.current;
    setTimeout(() => {
      if (!mountedRef.current || command !== transportCommand.current
        || getSettingsPreferences().pauseOnHeadsetDisconnect) return;
      player.play();
      holdPlaybackIntent(true, PLAYBACK_INTENT_SETTLE_MS);
    }, 120);
  }), [holdPlaybackIntent, player]);

  useEffect(() => {
    updateTrackSwitchPlayer({
      uri: currentAudioUri,
      get isLoaded() { return player.isLoaded; },
      pause: () => player.pause(),
      play: () => player.play(),
      seekTo: milliseconds => seekPlayer(milliseconds / 1000, 'Song-switch seek'),
    });
    return () => updateTrackSwitchPlayer(null);
  }, [currentAudioUri, player, seekPlayer]);

  useEffect(() => {
    if (!player) return;
    if (playbackRateTimerRef.current !== null) {
      clearTimeout(playbackRateTimerRef.current);
      playbackRateTimerRef.current = null;
    }
    const effectivePlaybackSpeed = playbackSpeedAvailable
      ? playbackSpeed
      : DEFAULT_PLAYBACK_SPEED;
    const sourceChanged = playbackRateSourceRef.current !== currentAudioUri;
    const alreadyApplied = !sourceChanged
      && appliedPlaybackSpeedRef.current === effectivePlaybackSpeed;
    if (alreadyApplied) return;

    const applyPlaybackRate = () => {
      playbackRateTimerRef.current = null;
      try {
        player.shouldCorrectPitch = true;
        player.setPlaybackRate(effectivePlaybackSpeed, 'high');
        playbackRateSourceRef.current = currentAudioUri;
        appliedPlaybackSpeedRef.current = effectivePlaybackSpeed;
      } catch (playbackRateError) {
        console.error('Playback speed configuration error:', playbackRateError);
        showError(
          'Playback Speed Error',
          'Couldn’t change speed. You can keep playing at the previous speed.',
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
  }, [currentAudioUri, isPlaying, playbackSpeed, playbackSpeedAvailable, player, showError]);

  useEffect(() => {
    let mounted = true;
    setAudioModeAsync(playbackAudioMode).then(() => {
      if (mounted) setAudioModeReady(true);
    }).catch((audioModeError: unknown) => {
      console.error('Audio mode configuration error:', audioModeError);
      showError('Audio Setup Error', 'Restart BeatNote to set up playback again.');
    });
    return () => { mounted = false; };
  }, [showError]);

  useEffect(() => {
    if (Platform.OS === 'web' || !audioModeReady || currentAudioUri === null || !playerIsLoaded) return;
    if (!remoteControlsAvailable) {
      // Lite: drop Now Playing / headset / Control Centre registration if Pro was just switched off.
      if (lockScreenActiveRef.current) {
        lockScreenActiveRef.current = false;
        try {
          player.clearLockScreenControls();
        } catch (lockScreenError) {
          console.error('Lock screen controls clear error:', lockScreenError);
        }
      }
      return;
    }
    try {
      lockScreenActiveRef.current = true;
      player.setActiveForLockScreen(true, {
        title: lockScreenTitle,
        artist: 'BeatNote',
      }, {
        showSeekBackward: getSettingsPreferences().remoteButtonMode === 'seek',
        showSeekForward: getSettingsPreferences().remoteButtonMode === 'seek',
      });
    } catch (lockScreenError) {
      console.error('Lock screen controls setup error:', lockScreenError);
    }
    // Expo releases and unregisters the previous native player when its source changes or the hook
    // unmounts. Calling clearLockScreenControls from React cleanup races that release and can address
    // an already-disposed SharedObject on iOS.
  }, [audioModeReady, currentAudioUri, lockScreenTitle, player, playerIsLoaded, remoteControlsAvailable]);

  // Configure the system buttons after Expo registers the Now Playing player.
  const remoteMode = audioModeReady && playerIsLoaded && currentAudioUri && remoteControlsAvailable
    ? remoteButtonMode : 'off';
  const canGoBack = !remoteLocked && remoteIndex !== null && remoteIndex > 0;
  const canGoForward = !remoteLocked && remoteIndex !== null && remoteIndex + 1 < remoteCount;
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void configureRemoteButtons(remoteMode, remoteSeekSeconds, canGoBack, canGoForward)
      .catch(error => console.error('Control Centre buttons:', error));
  }, [remoteMode, remoteSeekSeconds, canGoBack, canGoForward, player, lockScreenTitle, currentAudioUri]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const unsubscribe = subscribeToRemoteTrack(direction => {
      if (!isCapabilityAvailable('playback.remoteControls') || getSettingsPreferences().remoteButtonMode !== 'tracks') return;
      const state = useStudioStore.getState();
      const change = direction === 'next' ? state.nextTrack() : state.previousTrack(true);
      void change.then(result => {
        if (result.kind === 'failed') state.notify(result.reason.message);
      }).catch(error => console.error('Control Centre track change:', error));
    });
    return () => {
      unsubscribe();
      void configureRemoteButtons('off', 10, false, false).catch(error => console.error('Control Centre cleanup:', error));
    };
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!player) return;
    const intervalId = perfBegin('playback.toggle');
    const command = ++transportCommand.current;
    const state = useStudioStore.getState();
    const targetPlaying = !state.isPlaying;
    const positionMs = state.songDuration > 0 && state.currentTime >= state.songDuration - END_OF_TRACK_TOLERANCE_MS
      ? 0 : state.currentTime;
    const current = () => mountedRef.current && command === transportCommand.current
      && useStudioStore.getState().currentAudioUri === currentAudioUri
      && useStudioStore.getState().switchPhase === 'idle';
    try {
      const recovering = recoveryRef.current;
      if (recovering) {
        recovering.shouldPlay = targetPlaying;
        state.setIsPlaying(targetPlaying);
        if (!targetPlaying && recovering.playStarted) {
          recoveryRef.current = null;
          player.pause();
        }
        return;
      }
      const verifyStart = Platform.OS === 'ios' && targetPlaying && checkNextPlay.current;
      if (verifyStart) checkNextPlay.current = false;
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
          useStudioStore.getState().beginPlaybackTraversal(0);
          setViewportStartTime(0); // Reset viewport for both single and stems modes
          await seekPlayer(0, 'Restart seek');
          previousSampleRef.current = 0;
          failedLoopRangeKeyRef.current = null;
        } else {
          // Paused native status already keeps the store aligned with the player. Re-seeking here
          // delayed every ordinary Play command and made the transport feel unresponsive.
          previousSampleRef.current = currentTime;
        }
        if (!current()) return;
        const start = verifyStart ? player.currentTime : 0;
        await withAudioOperationTimeout(player.play(), PLAYBACK_INTENT_COMMAND_TIMEOUT_MS, 'Start playback');
        if (verifyStart) {
          await waitForPlayer(() => clockMoved(player.currentTime, start) || playerStatusRef.current.didJustFinish,
            current, PLAY_START_TIMEOUT_MS);
        }
        if (!current()) return;
        holdPlaybackIntent(true, PLAYBACK_INTENT_SETTLE_MS);
      }
    } catch (error) {
      if (!current()) return;
      if (Platform.OS === 'ios' && targetPlaying && currentAudioUri && AppState.currentState === 'active') {
        console.warn('Retrying playback with a fresh player', error);
        reloadPlayer(positionMs, true);
        return;
      }
      playbackIntentRef.current = null;
      if (playbackIntentTimerRef.current !== null) {
        clearTimeout(playbackIntentTimerRef.current);
        playbackIntentTimerRef.current = null;
      }
      console.error('Playback error:', error);
      setIsPlaying(playerStatusRef.current.playing);
      showPrompt('Playback Error', 'Failed to control audio playback');
    } finally {
      perfEndAfterFrame(intervalId);
    }
  }, [currentAudioUri, holdPlaybackIntent, player, reloadPlayer, seekPlayer, setIsPlaying]);

  const seekToPosition = useCallback(async (position: number): Promise<void> => {
    if (!player) return;

    transportCommand.current++;
    const intervalId = perfBegin(
      loopDecisionSuspendedRef.current && seekDrainRef.current === null ? 'seek.scrub' : 'seek.tap',
    );
    const { songDuration } = useStudioStore.getState();
    const clampedPosition = Math.max(0, Math.min(position, songDuration));
    // Visual feedback is immediate for every tap; only the newest target reaches the player.
    useStudioStore.getState().beginPlaybackTraversal(clampedPosition);
    const recovery = recoveryRef.current;
    if (recovery && !recovery.playStarted) {
      recovery.positionMs = clampedPosition;
      perfEndAfterFrame(intervalId);
      return;
    }
    recoveryRef.current = null;
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
            await seekPlayer(target / 1000, 'Timeline seek'); // Convert to seconds
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
        if (!mountedRef.current || seekEpoch !== seekEpochRef.current) return;
        pendingSeekRef.current = null;
        console.error('Seek error:', error);
        showPrompt('Seek Error', 'Couldn’t move to that point in the song');
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
  }, [holdPlaybackIntent, player, seekPlayer, setCurrentTime]);

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
      void seekPlayer(currentTime / 1000, 'Marker-alignment seek').catch((seekError: unknown) => {
        console.error('Marker-alignment seek failed', seekError);
      }); // Convert to seconds
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
  }, [activeLayerId, addMarker, isPlaying, layers, player, removeMarker, seekPlayer]);

  // Handle playback position updates and end-of-track detection
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      if (recoveryRef.current) return;
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
          void seekPlayer(decision.targetMs / 1000, 'Loop-boundary seek')
            .then(() => {
              player.play();
              useStudioStore.getState().beginPlaybackTraversal(decision.targetMs);
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
  }, [handleTrackCompletion, player, isPlaying, seekPlayer, setCurrentTime, setIsPlaying]);

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
