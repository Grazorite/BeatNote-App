# Performance Results Register

Only recorded measurements belong here. Simulator and estimated values must be labelled and cannot
pass. Raw traces, videos, and profiler exports stay outside the repository.

| Date | Commit | Device | iOS | Build | Song (duration/format) | Markers | Scenario | Metric | Method | n | p50 | p90 | Max | Threshold | Pass | Trace / note |
|---|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---:|---|---|---|
| 2026-10-30 | `e4f1900` | iPhone 17 Pro Simulator | 26.2 | Debug+XCTest | Generated click WAV, 12 s/44.1 kHz mono | 0 | Import + automatic BPM | Required signpost interval presence | Instruments Logging / `os-signpost` export | 1 | — | — | — | JS + waveform + BPM labels present | n/a (simulator) | `/private/tmp/beatnote-signposts-local-gates.trace`; observed `track.switch`, `waveform.decode`, `bpm.analysis`, `draft.write` |
| 2026-10-30 | `915117e` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=0` | Same user-selected library song; metadata not captured | Not captured | 60 s steady foreground playback | Average process CPU | Time Profiler, 1 ms running samples / 61.022411 s sample window | 1 | 46.97% | — | — | Flag-on overhead ≤ 1 pp and ≤ 1% relative | Pass (paired result) | `/private/tmp/beatnote-perf-off-time-profiler-v2.trace`; 28,662 running samples; Fair thermal state; bundle SHA-256 `527ce6f9a0261ff4c7776c656c760e935669afad8b97fc07152f6aff5f33200c` |
| 2026-10-30 | `915117e` | iPhone 15 Pro Max | 27.0.1 | Release-local, `EXPO_PUBLIC_BEATNOTE_PERF=1` | Same user-selected library song; metadata not captured | Not captured | 60 s steady foreground playback | Average process CPU | Time Profiler, 1 ms running samples / 60.934824 s sample window | 1 | 42.95% | — | — | Flag-on overhead ≤ 1 pp and ≤ 1% relative | Pass (0 positive overhead) | `/private/tmp/beatnote-perf-on-time-profiler.trace`; 26,169 running samples; Fair thermal state; on-off delta -4.02 pp (-8.57% relative), capped positive overhead 0; bundle SHA-256 `79f6fcebce5e3862ca1b1d19d1c23930bc50d8ab5da6de651d6ec092e1ea08e7` |

The paired physical rows above pass only the instrumentation-overhead gate. They are a single
same-song comparison with uncaptured song metadata and visible run-to-run variance, so they do not
replace the repeated physical latency, frame, memory, or energy baselines required by Phase 1.

## Optimisation decisions

For each O-1…O-11 change, link the matching before/after rows and record `keep` or `revert` with the
Requirement 10.4 reason. No decision has been made yet.
