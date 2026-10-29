# Performance Reference Fixtures

All timings are milliseconds. Keep copyrighted local songs outside the repository; record only an
absolute local path and SHA-256. Regenerate project descriptors with seed `20261029` whenever a
song duration changes.

## Audio register

| ID | Duration | Format / codec | Sample rate | Channels | Bit rate | Size | SHA-256 / local path | Status |
|---|---:|---|---:|---:|---:|---:|---|---|
| S-short | 45.000 s | M4A / AAC | 44.1 kHz | 2 | 150,798 b/s | 848,243 B | `d0980e892d58feff964945dd26a040bd8b9b871f37345a7494e15cd92bfda2be` · `tests/fixtures/performance/s-short-120bpm.m4a` | Tracked, redistributable generated fixture |
| S-medium-m4a | 3–4 min | M4A / AAC | — | — | — | — | Record local path + checksum before first baseline | Required locally |
| S-medium-mp3 | 3–4 min | MP3 320 kb/s | — | — | 320 kb/s target | — | Record local path + checksum before first baseline | Required locally |
| S-long | 150.000 s | M4A / AAC | 44.1 kHz | 1 | 94,061 b/s | 1,763,656 B | `280e1941528c696aca883876bae1e28262cc11b76ba932bdd9642338cacd5491` · `tests/fixtures/long-test-track.m4a` | Tracked, redistributable generated fixture |
| S-stress-wav | ≥ 8 min | WAV PCM | — | 2 | — | — | Record local path + checksum before first baseline | Required locally |
| S-stress-m4a | Same source as S-stress-wav | M4A / AAC | — | 2 | — | — | Record local path + checksum before first baseline | Required locally |

The short fixture is a 120 BPM click over a quiet reference tone. It was generated locally with:

```bash
mkdir -p tests/fixtures/performance
ffmpeg -f lavfi \
  -i "aevalsrc=0.15*sin(2*PI*110*t)+if(lt(mod(t\,0.5)\,0.025)\,0.8*sin(2*PI*1000*t)\,0):s=44100:d=45" \
  -ac 2 -c:a aac -b:a 256k tests/fixtures/performance/s-short-120bpm.m4a
```

Use `ffprobe` for metadata and `shasum -a 256 <path>` for identity. The reported bit rate is the
encoded file's measured rate, not the requested encoder ceiling.

## Fixed project densities

The canonical generator produces 0-, 50-, and 500-marker descriptors. Markers are spread across
the usable song duration and six layers; every fifth marker is annotated (20%). Every descriptor
also fixes BPM 120, anchor 0, eight-count display on, and a loop from 25% to 50% of the song.

```bash
node scripts/generate-performance-projects.js \
  --song-id=s-medium \
  --duration-ms=212000 \
  --out=/tmp/beatnote-performance-projects
```

The JSON descriptor is the canonical reference. The paired CSV is the device-loadable marker and
annotation payload. For the zero-marker case start from a newly imported song; for 50/500 import the
CSV through Project Manager with replacement confirmed. Apply the descriptor's BPM, anchor,
dance-count, and loop values, save as `PERF <song-id> <density>`, then do not edit it during a run.

Before measuring, record the generated files' SHA-256 beside the relevant Results Register rows.
The generator is temporary development tooling and is removed in task 19 after final acceptance.
