const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const OLD_SEEK = `    await ref.currentItem?.seek(to: time, toleranceBefore: toleranceBefore, toleranceAfter: toleranceAfter\t)
    updateStatus(with: [
      "currentTime": currentTime
    ])`;

const FIXED_SEEK = `    await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
      ref.seek(to: time, toleranceBefore: toleranceBefore, toleranceAfter: toleranceAfter) { [weak self] _ in
        if let self {
          self.updateStatus(with: [
            "currentTime": self.currentTime
          ])
        }
        continuation.resume()
      }
    }`;

const RELEASE_ANCHOR = `  public override func sharedObjectWillRelease() {
    owningRegistry?.remove(self)`;

const FIXED_RELEASE = `  public override func sharedObjectWillRelease() {
    ref.currentItem?.cancelPendingSeeks()
    owningRegistry?.remove(self)`;

/** Backport Expo's published iOS seek lifetime fix while BeatNote remains on SDK 54. */
module.exports = function withExpoAudioIosSeekFix(config) {
  return withDangerousMod(config, ['ios', async modConfig => {
    const sourcePath = path.join(
      modConfig.modRequest.projectRoot,
      'node_modules',
      'expo-audio',
      'ios',
      'AudioPlayer.swift',
    );
    let source = fs.readFileSync(sourcePath, 'utf8');

    if (!source.includes(FIXED_SEEK)) {
      if (!source.includes(OLD_SEEK)) {
        throw new Error('Unsupported expo-audio AudioPlayer.seekTo implementation; review the BeatNote backport');
      }
      source = source.replace(OLD_SEEK, FIXED_SEEK);
    }

    if (!source.includes('ref.currentItem?.cancelPendingSeeks()')) {
      if (!source.includes(RELEASE_ANCHOR)) {
        throw new Error('Unable to locate expo-audio sharedObjectWillRelease for the seek backport');
      }
      source = source.replace(RELEASE_ANCHOR, FIXED_RELEASE);
    }

    fs.writeFileSync(sourcePath, source);
    return modConfig;
  }]);
};
