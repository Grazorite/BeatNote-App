const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packageJson = require(path.join(root, 'package.json'));
const appJson = require(path.join(root, 'app.json'));
const expected = packageJson.version;
const mismatches = [];

if (appJson.expo.version !== expected) {
  mismatches.push(`app.json expo.version is ${appJson.expo.version}, expected ${expected}`);
}

const infoPlistPath = path.join(root, 'ios', 'BeatNote', 'Info.plist');
if (fs.existsSync(infoPlistPath)) {
  const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
  const shortVersion = infoPlist.match(
    /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/,
  )?.[1];
  if (shortVersion !== expected) {
    mismatches.push(`generated iOS CFBundleShortVersionString is ${shortVersion ?? 'missing'}, expected ${expected}`);
  }
}

const xcodeProjectPath = path.join(root, 'ios', 'BeatNote.xcodeproj', 'project.pbxproj');
if (fs.existsSync(xcodeProjectPath)) {
  const project = fs.readFileSync(xcodeProjectPath, 'utf8');
  const marketingVersions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)]
    .map(match => match[1].replace(/"/g, ''));
  const inconsistent = marketingVersions.filter(version => version !== expected);
  if (marketingVersions.length === 0 || inconsistent.length > 0) {
    mismatches.push(
      `generated iOS MARKETING_VERSION values are ${marketingVersions.join(', ') || 'missing'}, expected ${expected}`,
    );
  }
}

if (mismatches.length > 0) {
  console.error(`Version consistency check failed:\n- ${mismatches.join('\n- ')}`);
  process.exit(1);
}

console.log(`Version consistency check passed: ${expected}`);
