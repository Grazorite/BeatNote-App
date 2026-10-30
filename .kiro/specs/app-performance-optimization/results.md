# Performance Results Register

Only recorded measurements belong here. Simulator and estimated values must be labelled and cannot
pass. Raw traces, videos, and profiler exports stay outside the repository.

| Date | Commit | Device | iOS | Build | Song (duration/format) | Markers | Scenario | Metric | Method | n | p50 | p90 | Max | Threshold | Pass | Trace / note |
|---|---|---|---|---|---|---:|---|---|---|---:|---:|---:|---:|---|---|---|
| 2026-10-30 | `e4f1900` | iPhone 17 Pro Simulator | 26.2 | Debug+XCTest | Generated click WAV, 12 s/44.1 kHz mono | 0 | Import + automatic BPM | Required signpost interval presence | Instruments Logging / `os-signpost` export | 1 | — | — | — | JS + waveform + BPM labels present | n/a (simulator) | `/private/tmp/beatnote-signposts-local-gates.trace`; observed `track.switch`, `waveform.decode`, `bpm.analysis`, `draft.write` |

No physical baseline has been captured yet; simulator evidence cannot pass an acceptance threshold.

## Optimisation decisions

For each O-1…O-11 change, link the matching before/after rows and record `keep` or `revert` with the
Requirement 10.4 reason. No decision has been made yet.
