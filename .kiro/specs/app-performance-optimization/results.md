# Performance Results Register

Only recorded measurements belong here. Simulator and estimated values must be labelled and cannot
pass. Raw traces, videos, and profiler exports stay outside the repository.

| Date | Commit | Device | iOS | Build | Song (duration/format) | Markers | Scenario | Metric | Method | n | p50 | p90 | Max | Threshold | Pass | Trace / note |
|---|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---:|---|---|---|
| 2026-10-30 | `e4f1900` | iPhone 17 Pro Simulator | 26.2 | Debug+XCTest | Generated click WAV, 12 s/44.1 kHz mono | 0 | Import + automatic BPM | Required signpost interval presence | Instruments Logging / `os-signpost` export | 1 | — | — | — | JS + waveform + BPM labels present | n/a (simulator) | `/private/tmp/beatnote-signposts-local-gates.trace`; observed `track.switch`, `waveform.decode`, `bpm.analysis`, `draft.write` |
| 2026-10-30 | `915117e` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=0` | Same user-selected library song; metadata not captured | Not captured | 60 s steady foreground playback | Average process CPU | Time Profiler, 1 ms running samples / 61.022411 s sample window | 1 | 46.97% | — | — | Flag-on overhead ≤ 1 pp and ≤ 1% relative | Pass (paired result) | `/private/tmp/beatnote-perf-off-time-profiler-v2.trace`; 28,662 running samples; Fair thermal state; bundle SHA-256 `527ce6f9a0261ff4c7776c656c760e935669afad8b97fc07152f6aff5f33200c` |
| 2026-10-30 | `915117e` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | Same user-selected library song; metadata not captured | Not captured | 60 s steady foreground playback | Average process CPU | Time Profiler, 1 ms running samples / 60.934824 s sample window | 1 | 42.95% | — | — | Flag-on overhead ≤ 1 pp and ≤ 1% relative | Pass (0 positive overhead) | `/private/tmp/beatnote-perf-on-time-profiler.trace`; 26,169 running samples; Fair thermal state; on-off delta -4.02 pp (-8.57% relative), capped positive overhead 0; bundle SHA-256 `79f6fcebce5e3862ca1b1d19d1c23930bc50d8ab5da6de651d6ec092e1ea08e7` |
| 2026-10-30 | `36a266f` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | S-medium M4A, 233.433 s/44.1 kHz stereo, SHA-256 `a697fc1cc7eb0db6f27e036d584d64de9a23c22c9d219af55bb3465e2e0d071a` | 50 | Wrapped waveform tap seek, paced | Handler entry through player seek completion and following animation frame | Gated post-signpost unified-log duration | 20 | 46.77 ms | 51.20 ms | 54.01 ms | Playhead first feedback ≤ 100 ms; audible position ≤ 200 ms | Pass for instrumented completion only | `/private/tmp/beatnote-s-medium-50-wrapped-seek-fallback.trace`; final 20 of 25 captured intervals form the requested sample, first five treated as warm-up; thermal state and audible-position accuracy were not captured |
| 2026-10-30 | `a3df85f` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | S-medium M4A, 233.433 s/44.1 kHz stereo | 50 | Wrapped waveform tap seek, slow then rapid | Interaction hitch ratio | Animation Hitches; 1,658.698 ms total hitch time / 51.348242 s interaction | 1 | 32.30 ms/s | — | — | < 10 ms/s (interactive scrub/transition target used as nearest proxy) | Fail (proxy) | `/private/tmp/beatnote-s-medium-50-wrapped-seek-animation-hitches.trace`; six hitches; Nominal thermal state; user observed visible rapid-tap lag |
| 2026-10-30 | `a3df85f` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | S-medium M4A, 233.433 s/44.1 kHz stereo | 50 | Wrapped waveform tap seek, slow then rapid | Longest hitch | Animation Hitches | 6 hitches | — | — | 550.12 ms | Diagnostic only; 50 ms ceiling applies to steady playback | n/a | Same trace; hitch durations 550.121, 166.703, 533.451, 187.541, 187.541, and 33.341 ms |
| 2026-10-30 | `7037118` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | S-medium M4A, 233.433 s/44.1 kHz stereo, SHA-256 `a697fc1cc7eb0db6f27e036d584d64de9a23c22c9d219af55bb3465e2e0d071a` | 50 | Continuous cross-row wrapped-waveform scrub | BeatNote hitch duration and interaction ratio | Animation Hitches; first coordinated 10 s of BeatNote hitch activity | 152 | 16.67 ms | 116.69 ms | 383.42 ms | < 10 ms/s | Fail: 703.49 ms/s | `/private/tmp/beatnote-s-medium-50-continuous-scrub-v4.trace`; 7,034.902 ms summed hitch time; Nominal thermal state; capture began only after explicit `RECORDING NOW` cue |
| 2026-10-30 | `7037118` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | S-medium M4A, 233.433 s/44.1 kHz stereo, SHA-256 `a697fc1cc7eb0db6f27e036d584d64de9a23c22c9d219af55bb3465e2e0d071a` | 50 | Steady foreground playback, untouched | BeatNote hitch duration and 60 s ratio | Animation Hitches; final 60 s of a coordinated 66.146213 s capture | 4 | 33.34 ms | 33.34 ms | 33.34 ms | < 5 ms/s; max < 50 ms | Pass: 1.94 ms/s | `/private/tmp/beatnote-s-medium-50-steady-playback.trace`; 116.692 ms summed hitch time; Nominal thermal state |

The paired physical rows above pass only the instrumentation-overhead gate. They are a single
same-song comparison with uncaptured song metadata and visible run-to-run variance, so they do not
replace the repeated physical latency, frame, memory, or energy baselines required by Phase 1.

The paced seek interval ends only after the native player seek promise resolves and one animation
frame runs. It is stronger than a handler-only timing but does not independently prove the first
changed video frame, audible audio at the target, or ±20 ms position accuracy. The hitch result is a
diagnostic proxy because Requirement 3 does not define a dedicated tap-seek hitch threshold; the
required playback, continuous-scrub, sheet, and keyboard scenarios remain open.

The continuous-scrub row is the first required Requirement 3 interaction rather than a proxy. Its
ten-second window begins with the first BeatNote hitch after the coordinated start cue. Raw hitch
activity continued after release, so a separate steady-playback capture is still required rather
than attributing the tail to scrubbing.

The separate untouched 60-second playback row passes both steady thresholds. Ordinary playback
therefore does not explain the dense post-scrub tail; the tail remains part of the scrub or its
recovery until profiling identifies the responsible work.

## Optimisation decisions

For each O-1…O-11 change, link the matching before/after rows and record `keep` or `revert` with the
Requirement 10.4 reason. No decision has been made yet.
