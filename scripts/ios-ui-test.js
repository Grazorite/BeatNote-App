const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const iosDirectory = path.join(root, 'ios');
const derivedData = path.join(iosDirectory, 'build', 'UITestDerivedData');
const developerDir = process.env.DEVELOPER_DIR || '/Applications/Xcode.app/Contents/Developer';
const environment = { ...process.env, DEVELOPER_DIR: developerDir, EXPO_NO_TELEMETRY: '1' };

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
    stdio: 'inherit',
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: root, env: environment, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result.stdout.trim();
}

function selectSimulator() {
  const devices = JSON.parse(capture('xcrun', ['simctl', 'list', 'devices', 'available', '--json']));
  const all = Object.values(devices.devices).flat();
  const selected = process.env.IOS_SIMULATOR_ID
    ? all.find((device) => device.udid === process.env.IOS_SIMULATOR_ID)
    : all.find((device) => device.state === 'Booted')
      || all.find((device) => device.name === 'iPhone 17 Pro')
      || all.find((device) => device.name.startsWith('iPhone'));
  if (!selected) throw new Error('No available iPhone simulator. Set IOS_SIMULATOR_ID to a simulator UDID.');

  if (selected.state !== 'Booted') {
    run('xcrun', ['simctl', 'boot', selected.udid]);
  }
  run('xcrun', ['simctl', 'bootstatus', selected.udid, '-b']);
  return selected.udid;
}

async function startMetroIfNeeded() {
  try {
    const response = await fetch('http://127.0.0.1:8081/status');
    if (response.ok) return null;
  } catch {}

  const metro = spawn('npx', ['expo', 'start', '--dev-client', '--localhost', '--port', '8081'], {
    cwd: root,
    env: environment,
    stdio: 'ignore',
    detached: true,
  });
  metro.unref();

  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8081/status');
      if (response.ok) return metro.pid;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  try { process.kill(-metro.pid, 'SIGTERM'); } catch {}
  throw new Error('Metro did not become ready on port 8081.');
}

function stagePickerFixtures(simulatorId) {
  const appBundle = path.join(derivedData, 'Build', 'Products', 'Debug-iphonesimulator', 'BeatNote.app');
  if (!fs.existsSync(appBundle)) throw new Error(`Built app not found at ${appBundle}`);
  run('xcrun', ['simctl', 'install', simulatorId, appBundle]);

  const container = capture('xcrun', ['simctl', 'get_app_container', simulatorId, 'com.beatnote.app', 'data']);
  const documents = path.join(container, 'Documents');
  fs.mkdirSync(documents, { recursive: true });
  for (const filename of ['test-audio.wav', 'background-audio.m4a', 'valid-import.csv', 'invalid-import.csv']) {
    fs.copyFileSync(path.join(root, 'tests', 'fixtures', filename), path.join(documents, filename));
  }
}

async function main() {
  let metroPid;
  try {
    run('npx', ['expo', 'prebuild', '--platform', 'ios'], {
      env: { ...environment, CI: '1' },
    });
    const simulatorId = selectSimulator();
    metroPid = await startMetroIfNeeded();

    const xcodebuild = [
      '-quiet',
      '-workspace', path.join(iosDirectory, 'BeatNote.xcworkspace'),
      '-scheme', 'BeatNote',
      '-destination', `platform=iOS Simulator,id=${simulatorId}`,
      '-derivedDataPath', derivedData,
      '-parallel-testing-enabled', 'NO',
      'build-for-testing',
    ];
    run('xcodebuild', xcodebuild);
    stagePickerFixtures(simulatorId);

    const resultBundle = path.join(iosDirectory, 'build', `BeatNoteUITests-${Date.now()}.xcresult`);
    const testArgs = xcodebuild.filter((arg) => arg !== 'build-for-testing');
    testArgs.push('test-without-building', '-resultBundlePath', resultBundle);
    if (process.env.IOS_TEST_ONLY) {
      testArgs.push('-only-testing:BeatNoteUITests/BeatNoteUITests/' + process.env.IOS_TEST_ONLY);
    }
    run('xcodebuild', testArgs);
    console.log(`UI test result bundle: ${resultBundle}`);
  } finally {
    if (metroPid) {
      try { process.kill(-metroPid, 'SIGTERM'); } catch {}
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
