# Physical Performance Scenarios

Use the same script for Debug+Metro and Release-local. TestFlight repeats it once distribution is
available. Debug measurements diagnose only; they cannot pass acceptance.

## Run preparation

1. Record device, iOS, build type, commit, song checksum, project descriptor checksum, Low Power
   Mode, native refresh rate, battery percentage, charging state, and starting thermal state.
2. Set fixed brightness, disable Low Power Mode, close unrelated foreground apps, and let the phone
   idle for five minutes. Force-quit BeatNote before each set.
3. Import the named song and open the fixed project from `fixtures.md`. Confirm speed 1×, Repeat and
   Shuffle off, **Show waveform (Pro) on**, and no analysis already running unless the scenario asks
   for it. Historical waveform baselines used decoded artwork; a run with the new off-by-default
   solid bars is a separate Lite configuration and must never be compared as an O-3 after-row.
4. Capture 240-fps video with the whole phone and touching finger visible, or capture touch events,
   BeatNote signposts, and Animation Hitches together. Record the method and its resolution.
5. Run one warm-up repetition. Then record at least 20 repetitions per interaction without changing
   the project. Report p50, p90, and maximum; retain the raw observations outside the repository.

## Interaction set (Requirement 2.1)

For the baseline, run once with S-medium/50 and once with S-long/500.

| Scenario | Exact repetition | First feedback | Commit / end point |
|---|---|---|---|
| Wrapped tap seek | Tap a fixed visible timestamp at 30%, then 70%, alternating | First frame with playhead at target | First audio/status position within ±20 ms |
| Overview tap seek | Tap the same two normalized positions on overview | Overview/playhead moves | First accurate audio/status position |
| Scrub | Drag wrapped waveform from 25% to 75% over two seconds | Playhead begins following | Maximum frame lag during drag; final accurate position |
| Play/pause | Alternate Play and Pause at a fixed position | Icon/pressed state changes | Audible start or stop |
| Queue controls | In a three-song queue, repeat First, Previous, Next, Shuffle | Pressed state | Title update; playable audio; waveform rendered |
| Repeat / inner loop | Toggle each off/on at a fixed stopped position | Pressed/selected state | n/a |
| Speed | Step 1×→1.1× and back | Value/pressed state | Native rate applied; listen for interruption |
| Marker add/remove | At a fixed stopped timestamp, add then remove through dock | Marker appears/disappears | n/a |
| Annotation open | Select a fixed marker and open editor | Editor first visible | Input focused and keyboard settled |
| Annotation save | Replace text with a fixed ten-character value and Save | Editor begins dismissal | Editor gone and callout updated |
| Annotation dismiss | Reopen, change text, Cancel | Editor begins dismissal | Editor gone and original text retained |
| Library open | Open from Song Title control | Sheet begins moving | Sheet settled and focus available |
| Track switch | Select the paired medium/long item | Title changes | First playable audio and first rendered waveform |

During playback, separately capture 60 seconds of steady playback, ten seconds of continuous scrub,
Library open/close, and annotation open/save with keyboard. Record JS/UI frame time, Core Animation
hitches, tasks longer than 50 ms, and 60/120 Hz context.

After the waveform-on keep/revert decision is complete, repeat steady playback and continuous scrub
once with waveform artwork off. Record that row as the Lite solid-bar configuration; it measures the
product-tier cost boundary, not the waveform optimisation itself.

## Contention set

Repeat wrapped seek, play/pause, marker add/remove, and annotation save while each condition is
active: waveform extraction; BPM analysis; a 500-marker autosave; track-switch persistence; and all
four combined. Listen for dropouts and retain audio-session stall/interruption logs. During a track
switch cancel BPM analysis and measure request-to-cancel completion; the limit is 250 ms.

## Session and memory set (Requirement 7.1)

Run S-long and S-stress separately. Start Allocations generations after the song and fixed project
are loaded. For 30 minutes: play continuously with the fixed loop enabled; seek at each 10-second
boundary; add a marker every 30 seconds; save one annotation every two minutes; switch tracks every
five minutes and return to the first track after the tenth switch. Record physical footprint, CPU,
energy, thermal state, and signpost counts at minutes 5, 15, and 30. Take a generation mark at every
switch. Run Leaks at minute 30. In a separate run, background BeatNote for 15 minutes while playing.

Stop a run if iOS reports serious/critical thermal state, audio becomes unsafe to monitor, or the
app crashes. Record the partial result and cool the phone before retrying; do not hide the failure.
