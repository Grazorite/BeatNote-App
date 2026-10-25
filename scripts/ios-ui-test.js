const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

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

async function runWithOpenUrl(command, args, simulatorId, url) {
  const child = spawn(command, args, {
    cwd: root,
    env: environment,
    stdio: 'inherit',
  });
  let delivered = false;
  const delivery = setTimeout(() => {
    try {
      run('xcrun', ['simctl', 'openurl', simulatorId, url]);
      delivered = true;
    } catch (error) {
      child.kill('SIGTERM');
      console.error('Unable to deliver the Open In fixture', error);
    }
  }, 12000);
  const status = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  clearTimeout(delivery);
  if (status !== 0) throw new Error(`${command} failed with exit code ${status}`);
  if (!delivered) throw new Error('Open In test ended before the fixture could be delivered');
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
  return selected;
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

function localFileProviderStorage(simulatorDataPath) {
  const appGroups = path.join(simulatorDataPath, 'Containers', 'Shared', 'AppGroup');
  for (const entry of fs.readdirSync(appGroups)) {
    const group = path.join(appGroups, entry);
    const metadata = path.join(group, '.com.apple.mobile_container_manager.metadata.plist');
    const storage = path.join(group, 'File Provider Storage');
    if (!fs.existsSync(metadata) || !fs.existsSync(storage)) continue;
    try {
      const identifier = capture('plutil', [
        '-extract', 'MCMMetadataIdentifier', 'raw', '-o', '-', metadata,
      ]);
      if (identifier === 'group.com.apple.FileProvider.LocalStorage') return storage;
    } catch {}
  }
  throw new Error('Unable to locate the simulator On My iPhone provider storage.');
}

function stagePickerFixtures(simulatorId, simulatorDataPath) {
  const appBundle = path.join(derivedData, 'Build', 'Products', 'Debug-iphonesimulator', 'BeatNote.app');
  if (!fs.existsSync(appBundle)) throw new Error(`Built app not found at ${appBundle}`);

  // Keep native journeys independent and force Files to register the current app container. An
  // in-place reinstall preserves both application data and Files' cached provider identity, which
  // can leave the picker displaying documents from a previous BeatNote container.
  spawnSync('xcrun', ['simctl', 'terminate', simulatorId, 'com.apple.DocumentsApp'], {
    cwd: root,
    env: environment,
    stdio: 'ignore',
  });
  spawnSync('xcrun', ['simctl', 'uninstall', simulatorId, 'com.beatnote.app'], {
    cwd: root,
    env: environment,
    stdio: 'ignore',
  });
  run('xcrun', ['simctl', 'install', simulatorId, appBundle]);

  const container = capture('xcrun', ['simctl', 'get_app_container', simulatorId, 'com.beatnote.app', 'data']);
  const documents = path.join(container, 'Documents');
  const pickerStorage = localFileProviderStorage(simulatorDataPath);
  fs.mkdirSync(documents, { recursive: true });
  const fixtureNames = [
    'test-audio.wav',
    'background-audio.m4a',
    'long-test-track.m4a',
    'valid-import.csv',
    'invalid-import.csv',
  ];
  for (const filename of fixtureNames) {
    const fixture = path.join(root, 'tests', 'fixtures', filename);
    fs.copyFileSync(fixture, path.join(documents, filename));
    fs.copyFileSync(fixture, path.join(pickerStorage, filename));
  }
  // Restart Files once more after staging so the freshly populated BeatNote folder is discoverable.
  spawnSync('xcrun', ['simctl', 'terminate', simulatorId, 'com.apple.DocumentsApp'], {
    cwd: root,
    env: environment,
    stdio: 'ignore',
  });
}

function stageOpenInFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'beatnote-open-in-'));
  const destination = path.join(directory, 'open-in-audio.m4a');
  fs.copyFileSync(path.join(root, 'tests', 'fixtures', 'background-audio.m4a'), destination);
  // Keep repeated simulator runs deterministic: the import pipeline deduplicates by content hash,
  // while AVFoundation safely ignores trailing metadata bytes after the M4A container.
  fs.appendFileSync(destination, `beatnote-open-in-${Date.now()}`);
  return { directory, url: pathToFileURL(destination).href };
}

async function main() {
  let metroPid;
  try {
    run('npx', ['expo', 'prebuild', '--platform', 'ios'], {
      env: { ...environment, CI: '1' },
    });
    const simulator = selectSimulator();
    const simulatorId = simulator.udid;
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

    const testBaseArgs = xcodebuild.filter((arg) => arg !== 'build-for-testing');
    const openInTest = 'BeatNoteUITests/BeatNoteUITests/testOpenInAudioImportsIntoLibrary';
    const pickerTests = [
      'testStudioLaunchesAndDocumentPickerOpens',
      'testAudioAnnotationAndProjectRestore',
      'testLoopRangeToggleAndTransportFits',
      'testCsvImportAndShareSheetExport',
      'testAudioContinuesWhileAppIsInBackground',
      'testLandscapeGesturesAndCompactControls',
    ];
    const runPickerTest = (testName) => {
      stagePickerFixtures(simulatorId, simulator.dataPath);
      const resultBundle = path.join(
        iosDirectory,
        'build',
        `BeatNoteUITests-${testName}-${Date.now()}.xcresult`,
      );
      run('xcodebuild', [
        ...testBaseArgs,
        'test-without-building',
        '-resultBundlePath', resultBundle,
        '-only-testing:BeatNoteUITests/BeatNoteUITests/' + testName,
      ]);
      console.log(`${testName} UI test result bundle: ${resultBundle}`);
    };
    const runOpenInTest = async () => {
      const resultBundle = path.join(
        iosDirectory,
        'build',
        `BeatNoteOpenInUITest-${Date.now()}.xcresult`,
      );
      const testArgs = [
        ...testBaseArgs,
        'test-without-building',
        '-resultBundlePath', resultBundle,
        '-only-testing:' + openInTest,
      ];
      const fixture = stageOpenInFixture();
      try {
        await runWithOpenUrl('xcodebuild', testArgs, simulatorId, fixture.url);
      } finally {
        fs.rmSync(fixture.directory, { recursive: true, force: true });
      }
      console.log(`Open In UI test result bundle: ${resultBundle}`);
    };

    if (process.env.IOS_TEST_ONLY === 'testOpenInAudioImportsIntoLibrary') {
      await runOpenInTest();
    } else if (process.env.IOS_TEST_ONLY) {
      runPickerTest(process.env.IOS_TEST_ONLY);
    } else {
      // XCTest and Files retain process/provider state between cases in one invocation. Reinstall
      // and restage before each retained journey so the aggregate gate is deterministic.
      for (const testName of pickerTests) runPickerTest(testName);
      await runOpenInTest();
    }
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
