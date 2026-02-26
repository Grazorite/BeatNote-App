---
inclusion: always
---

# BeatNote — iOS & TestFlight Setup

## Status

Apple Developer account not yet purchased. All config below is ready to activate once the account exists.

## Prerequisites checklist

- [ ] Purchase Apple Developer Program membership ($99/year) at developer.apple.com
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Log in: `eas login`
- [ ] Create EAS project: `eas init` — this generates the real `projectId` for `app.json`
- [ ] Update `app.json` → `expo.extra.eas.projectId` with the generated ID
- [ ] Update `eas.json` → `submit.production.ios` with real Apple ID, ASC App ID, and Team ID

## Build profiles (eas.json)

Three profiles are configured:

| Profile | Purpose | Distribution |
| --- | --- | --- |
| `development` | Local dev with dev client | Internal (ad-hoc) |
| `preview` | TestFlight beta | Internal |
| `production` | App Store submission | Store |

## Running a TestFlight build

```bash
# Build for TestFlight (simulator-off, real device)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --profile preview
```

## iOS-specific features planned

### Share sheet (import/export)

- Register BeatNote as a handler for audio file types in `app.json` under `ios.infoPlist`
- Use `expo-sharing` for outbound share (CSV, PDF, project file)
- Use `expo-document-picker` (already installed) for inbound — it surfaces the share sheet automatically

### Files app integration

- Use `expo-file-system` (already installed) to read/write to the app's Documents directory
- Documents directory is accessible via the Files app when `UIFileSharingEnabled` is set in Info.plist

### iCloud sync

- Use `expo-file-system` with iCloud container paths
- Requires `iCloud` capability in the Apple Developer portal and `com.apple.developer.icloud-container-identifiers` entitlement
- Project files (`.beatnote`) sync automatically once written to the iCloud container path

### Background audio

- `expo-audio` handles background audio via the `AVAudioSession` category
- Add `UIBackgroundModes: ["audio"]` to `app.json` → `ios.infoPlist` when implementing

### Haptic feedback (tap-to-beat)

- Use `expo-haptics` for light impact feedback on marker placement
- Keep it optional — add a toggle in settings

## Bundle identifier

`com.beatnote.app` — set in `app.json`. Do not change without updating the Apple Developer portal.

## Info.plist keys to add (app.json → ios.infoPlist)

```json
{
  "UIFileSharingEnabled": true,
  "LSSupportsOpeningDocumentsInPlace": true,
  "UIBackgroundModes": ["audio"],
  "CFBundleDocumentTypes": [
    {
      "CFBundleTypeName": "BeatNote Project",
      "CFBundleTypeExtensions": ["beatnote"],
      "CFBundleTypeRole": "Editor"
    }
  ]
}
```

## Native modules

The following features require native iOS modules (Swift bridging via Expo Modules API):

| Feature | Module location | Status |
| --- | --- | --- |
| Pitch-preserving slow-down | `modules/audio-time-stretch/` | Planned |
| Demucs CoreML inference | `modules/stem-separation/` | Planned |
| Waveform extraction (mobile) | `modules/waveform-extractor/` | Planned |

Use `expo-modules-core` to write these as Expo Modules (Swift + TypeScript interface). Do not use bare `react-native` native modules.
