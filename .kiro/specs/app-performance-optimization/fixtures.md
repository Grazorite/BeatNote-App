# Performance Reference Fixtures

All timings are milliseconds. Keep copyrighted local songs outside the repository; record only an
absolute local path and SHA-256. Regenerate project descriptors with seed `20261029` whenever a
song duration changes.

## Audio register

| ID | Duration | Format / codec | Sample rate | Channels | Bit rate | Size | SHA-256 / local path | Status |
|---|---:|---|---:|---:|---:|---:|---|---|
| S-short | 45.000 s | M4A / AAC | 44.1 kHz | 2 | 150,798 b/s | 848,243 B | `d0980e892d58feff964945dd26a040bd8b9b871f37345a7494e15cd92bfda2be` · `tests/fixtures/performance/s-short-120bpm.m4a` | Tracked, redistributable generated fixture |
| S-medium-m4a | 233.433 s | M4A / AAC | 44.1 kHz | 2 | 267,116 b/s | 7,794,219 B | `a6972ee6b7f4bd1c992b112f94e0e5c5989c65df68856f064536af8ddc827f28` · `/Volumes/s_cx_g/projects/BeatNote-App/.local/performance-fixtures/s-medium.m4a` | Local-only representative derivative |
| S-medium-mp3 | 233.433 s | MP3 | 44.1 kHz | 2 | 320,105 b/s | 9,340,386 B | `fc37a31c1422820ab922b8c57ccf2d2370ae3a3554b3f9958936bb731abed86d` · `/Volumes/s_cx_g/projects/BeatNote-App/.local/performance-fixtures/s-medium.mp3` | Local-only representative derivative |
| S-long | 150.000 s | M4A / AAC | 44.1 kHz | 1 | 94,061 b/s | 1,763,656 B | `280e1941528c696aca883876bae1e28262cc11b76ba932bdd9642338cacd5491` · `tests/fixtures/long-test-track.m4a` | Tracked, redistributable generated fixture |
| S-stress-wav | 600.000 s | WAV / PCM s16le | 44.1 kHz | 2 | 1,411,201 b/s | 105,840,078 B | `1c2b5cc14b59f9708e952d32d47d71ddc723bf21d4fb0198707f0c3f05d89c9f` · `/Volumes/s_cx_g/projects/BeatNote-App/.local/performance-fixtures/s-stress.wav` | Local-only representative derivative |
| S-stress-m4a | 600.000 s | M4A / AAC | 44.1 kHz | 2 | 266,708 b/s | 20,003,158 B | `56ef2a01f7504ae6c9bf492f44fe3f09cb25515cb5eee4d16eedf004c18420dc` · `/Volumes/s_cx_g/projects/BeatNote-App/.local/performance-fixtures/s-stress.m4a` | Local-only representative derivative |

The short fixture is a 120 BPM click over a quiet reference tone. It was generated locally with:

```bash
mkdir -p tests/fixtures/performance
ffmpeg -f lavfi \
  -i "aevalsrc=0.15*sin(2*PI*110*t)+if(lt(mod(t\,0.5)\,0.025)\,0.8*sin(2*PI*1000*t)\,0):s=44100:d=45" \
  -ac 2 -c:a aac -b:a 256k tests/fixtures/performance/s-short-120bpm.m4a
```

Use `ffprobe` for metadata and `shasum -a 256 <path>` for identity. The reported bit rate is the
encoded file's measured rate, not the requested encoder ceiling.

The medium fixtures are local AAC and 320 kb/s MP3 encodes of the same 233.433-second
representative Logic source. The stress fixtures loop that source to exactly 600 seconds and encode
it as 44.1 kHz stereo PCM s16le WAV and AAC. They live under the repository's ignored `.local/`
directory and must never be added to Git. If regenerated, update every measured field and checksum
before comparing a new run with an earlier baseline.

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

The current local project pairs were generated under
`/Volumes/s_cx_g/projects/BeatNote-App/.local/performance-projects/` with seed `20261029`:

| Song / density | Descriptor SHA-256 | CSV SHA-256 |
|---|---|---|
| S-medium / 0 | `6a0e9b9152707e90b2b386222e73b79a9d32c3c5a3a6acc90851b611464a83d5` | `d2c1f74c7bb63e1e0e447dff483596009225c07db34721546fb600603f8f464c` |
| S-medium / 50 | `87bef4326b27c482b74e6d1bdc98e251963c5b264040a3595e9f62e62f0bb37d` | `93d6fe2c52d44e42d74b8ea05d573762c451f02468ce5a0d747e48d0bf8148c9` |
| S-medium / 500 | `51db588a98a827f55550ad8ea6f4a406c33c42fd9ac75c6925459ce77f22e3a6` | `ea012b2825d995bb92001b87a5fabeefef565fc093af138369bbd9e53b235fb5` |
| S-long / 0 | `8d55a17f83fcf74da00a2b39292df4f0dad4acd8eba4e11132d707fdf5e420a7` | `d2c1f74c7bb63e1e0e447dff483596009225c07db34721546fb600603f8f464c` |
| S-long / 50 | `de49785b060638f8d7a0db4a03289b532e4ed8667783c518bdad5863baf944b0` | `7ca5bbc7090552a57e57d4ae2433cb907d2b73377e112b8cc5b0768910927eb0` |
| S-long / 500 | `e3f1618348ee7b64c8b4621b87b250f8d27d109bd14741a68c9ce978acb7f89e` | `437e4dccbd566172ca6dcfeb5e26190309e6414c847400df72bcd14c2cc178a4` |
