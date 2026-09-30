const fs = require('fs');
const path = require('path');
const { withXcodeProject } = require('@expo/config-plugins');

const APP_TARGET = 'BeatNote';
const TEST_TARGET = 'BeatNoteUITests';
const TEST_SOURCE = '../tests/ios/BeatNoteUITests.swift';
const TEST_BUNDLE_ID = 'com.beatnote.app.uitests';

function targetId(project, name) {
  const targets = project.pbxNativeTargetSection();
  const matches = Object.keys(targets).filter((key) => {
    if (key.endsWith('_comment')) return false;
    return targets[key].name?.replace(/"/g, '') === name;
  });
  return matches.find((key) => targets[key].productType === '"com.apple.product-type.bundle.ui-testing"') || matches[0];
}

function removeDependency(project, parentTargetId, dependencyTargetId) {
  const targets = project.pbxNativeTargetSection();
  const dependencies = project.hash.project.objects.PBXTargetDependency || {};
  const proxies = project.hash.project.objects.PBXContainerItemProxy || {};
  const parent = targets[parentTargetId];

  parent.dependencies = parent.dependencies.filter(({ value }) => {
    const dependency = dependencies[value];
    if (dependency?.target !== dependencyTargetId) return true;

    const proxyId = dependency.targetProxy;
    delete dependencies[value];
    delete dependencies[`${value}_comment`];
    delete proxies[proxyId];
    delete proxies[`${proxyId}_comment`];
    return false;
  });
}

function removeTarget(project, id) {
  const targets = project.pbxNativeTargetSection();
  const target = targets[id];
  if (!target) return;

  for (const [parentId, parent] of Object.entries(targets)) {
    if (parentId.endsWith('_comment')) continue;
    removeDependency(project, parentId, id);
  }

  const objects = project.hash.project.objects;
  const targetDependencies = objects.PBXTargetDependency || {};
  const proxies = objects.PBXContainerItemProxy || {};
  for (const { value } of target.dependencies || []) {
    const dependency = targetDependencies[value];
    if (!dependency) continue;
    const proxyId = dependency.targetProxy;
    delete targetDependencies[value];
    delete targetDependencies[`${value}_comment`];
    delete proxies[proxyId];
    delete proxies[`${proxyId}_comment`];
  }

  for (const { value: phaseId } of target.buildPhases || []) {
    for (const [sectionName, section] of Object.entries(objects)) {
      if (!sectionName.endsWith('BuildPhase') || !section[phaseId]) continue;
      delete section[phaseId];
      delete section[`${phaseId}_comment`];
    }
  }

  const configListId = target.buildConfigurationList;
  const configList = objects.XCConfigurationList?.[configListId];
  for (const { value: configId } of configList?.buildConfigurations || []) {
    delete objects.XCBuildConfiguration[configId];
    delete objects.XCBuildConfiguration[`${configId}_comment`];
  }
  delete objects.XCConfigurationList?.[configListId];
  delete objects.XCConfigurationList?.[`${configListId}_comment`];

  const productRef = target.productReference;
  delete objects.PBXFileReference?.[productRef];
  delete objects.PBXFileReference?.[`${productRef}_comment`];
  for (const [groupName, group] of Object.entries(objects.PBXGroup || {})) {
    if (groupName.endsWith('_comment')) continue;
    group.children = group.children.filter(({ value }) => value !== productRef);
  }

  const productBuildFiles = new Set();
  for (const [fileId, buildFile] of Object.entries(objects.PBXBuildFile || {})) {
    if (fileId.endsWith('_comment') || buildFile.fileRef !== productRef) continue;
    productBuildFiles.add(fileId);
    delete objects.PBXBuildFile[fileId];
    delete objects.PBXBuildFile[`${fileId}_comment`];
  }
  for (const sectionName of ['PBXCopyFilesBuildPhase', 'PBXFrameworksBuildPhase', 'PBXResourcesBuildPhase', 'PBXSourcesBuildPhase']) {
    for (const phase of Object.values(objects[sectionName] || {})) {
      if (typeof phase === 'object' && phase.files) {
        phase.files = phase.files.filter(({ value }) => !productBuildFiles.has(value));
      }
    }
  }

  delete targets[id];
  delete targets[`${id}_comment`];
  const projectObject = project.getFirstProject().firstProject;
  projectObject.targets = projectObject.targets.filter(({ value }) => value !== id);
  delete projectObject.attributes.TargetAttributes[id];
}

function ensureTestTarget(project) {
  const appTargetId = targetId(project, APP_TARGET);
  if (!appTargetId) throw new Error(`Xcode app target "${APP_TARGET}" was not found`);

  const targets = project.pbxNativeTargetSection();
  const namedTargets = Object.keys(targets).filter((key) => (
    !key.endsWith('_comment') && targets[key].name?.replace(/"/g, '') === TEST_TARGET
  ));
  let testTargetId = namedTargets.find((key) => (
    targets[key].productType === '"com.apple.product-type.bundle.ui-testing"'
  ));

  if (!testTargetId && namedTargets.length > 0) {
    testTargetId = namedTargets[0];
  } else if (!testTargetId) {
    testTargetId = project.addTarget(TEST_TARGET, 'unit_test_bundle', 'tests/ios', TEST_BUNDLE_ID).uuid;
  }

  for (const duplicateId of namedTargets) {
    if (duplicateId !== testTargetId) removeTarget(project, duplicateId);
  }

  const nativeTarget = project.pbxNativeTargetSection()[testTargetId];
  nativeTarget.productType = '"com.apple.product-type.bundle.ui-testing"';
  nativeTarget.name = `"${TEST_TARGET}"`;
  nativeTarget.productName = `"${TEST_TARGET}"`;

  // The xcode package's generic addTarget helper adds the reverse dependency.
  removeDependency(project, appTargetId, testTargetId);
  project.hash.project.objects.PBXTargetDependency ||= {};
  project.hash.project.objects.PBXContainerItemProxy ||= {};
  const dependencies = project.hash.project.objects.PBXTargetDependency || {};
  const alreadyDependsOnApp = (nativeTarget.dependencies || []).some(({ value }) => (
    dependencies[value]?.target === appTargetId
  ));
  if (!alreadyDependsOnApp) project.addTargetDependency(testTargetId, [appTargetId]);

  const sourcePhaseIds = nativeTarget.buildPhases
    .filter(({ comment }) => comment === 'Sources')
    .map(({ value }) => value);
  const sourcePhases = project.hash.project.objects.PBXSourcesBuildPhase || {};
  const buildFiles = project.pbxBuildFileSection();
  const hasTestSource = sourcePhaseIds.some((phaseId) => {
    const phase = sourcePhases[phaseId];
    return phase.files.some(({ value }) => {
      const buildFile = buildFiles[value];
      const file = buildFile && project.pbxFileReferenceSection()[buildFile.fileRef];
      return file?.path?.replace(/"/g, '') === TEST_SOURCE;
    });
  });

  if (!hasTestSource) {
    project.addBuildPhase([TEST_SOURCE], 'PBXSourcesBuildPhase', 'Sources', testTargetId);
  }

  const updatedSourcePhaseIds = nativeTarget.buildPhases
    .filter(({ comment }) => comment === 'Sources')
    .map(({ value }) => value);
  const keepSourcePhase = updatedSourcePhaseIds.find((phaseId) => (
    (sourcePhases[phaseId]?.files || []).some(({ value }) => {
      const buildFile = buildFiles[value];
      const file = buildFile && project.pbxFileReferenceSection()[buildFile.fileRef];
      return file?.path?.replace(/"/g, '') === TEST_SOURCE;
    })
  )) || updatedSourcePhaseIds[0];
  for (const phaseId of updatedSourcePhaseIds) {
    if (phaseId === keepSourcePhase) continue;
    delete sourcePhases[phaseId];
    delete sourcePhases[`${phaseId}_comment`];
  }
  nativeTarget.buildPhases = nativeTarget.buildPhases.filter(({ value, comment }) => (
    comment !== 'Sources' || value === keepSourcePhase
  ));

  const hasFrameworkPhase = nativeTarget.buildPhases.some(({ comment }) => comment === 'Frameworks');
  if (!hasFrameworkPhase) {
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', testTargetId);
  }
  project.addFramework('XCTest.framework', { target: testTargetId, link: true });

  const settings = {
    CODE_SIGNING_ALLOWED: 'NO',
    GENERATE_INFOPLIST_FILE: 'YES',
    IPHONEOS_DEPLOYMENT_TARGET: '15.1',
    PRODUCT_BUNDLE_IDENTIFIER: `"${TEST_BUNDLE_ID}"`,
    PRODUCT_NAME: `"${TEST_TARGET}"`,
    SWIFT_VERSION: '5.0',
    TARGETED_DEVICE_FAMILY: '"1,2"',
    TEST_TARGET_NAME: APP_TARGET,
  };
  const configurationList = project.hash.project.objects.XCConfigurationList[nativeTarget.buildConfigurationList];
  for (const { value: configurationId } of configurationList.buildConfigurations) {
    const configuration = project.hash.project.objects.XCBuildConfiguration[configurationId];
    delete configuration.buildSettings.INFOPLIST_FILE;
    Object.assign(configuration.buildSettings, settings);
  }

  const projectObject = project.getFirstProject().firstProject;
  projectObject.attributes.TargetAttributes[testTargetId] = {
    CreatedOnToolsVersion: '27.0',
    TestTargetID: appTargetId,
  };

  return { appTargetId, testTargetId };
}

function schemeXml(appTargetId, testTargetId) {
  const buildable = (id, name) => `
            <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id}" BuildableName="${name}" BlueprintName="${name.replace(/\.(app|xctest)$/, '')}" ReferencedContainer="container:BeatNote.xcodeproj"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2700" version="2.0">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
    <BuildActionEntries>
      <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">${buildable(appTargetId, 'BeatNote.app')}
      </BuildActionEntry>
      <BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="NO">${buildable(testTargetId, `${TEST_TARGET}.xctest`)}
      </BuildActionEntry>
    </BuildActionEntries>
  </BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES">
    <Testables>
      <TestableReference skipped="NO" parallelizable="NO">${buildable(testTargetId, `${TEST_TARGET}.xctest`)}
      </TestableReference>
    </Testables>
    <MacroExpansion>${buildable(appTargetId, 'BeatNote.app')}
    </MacroExpansion>
  </TestAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES">
    <BuildableProductRunnable runnableDebuggingMode="0">${buildable(appTargetId, 'BeatNote.app')}
    </BuildableProductRunnable>
  </LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES">
    <BuildableProductRunnable runnableDebuggingMode="0">${buildable(appTargetId, 'BeatNote.app')}
    </BuildableProductRunnable>
  </ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
`;
}

module.exports = function withIosUiTests(config) {
  return withXcodeProject(config, async (config) => {
    const { appTargetId, testTargetId } = ensureTestTarget(config.modResults);
    const schemeDirectory = path.join(config.modRequest.platformProjectRoot, 'BeatNote.xcodeproj', 'xcshareddata', 'xcschemes');
    await fs.promises.mkdir(schemeDirectory, { recursive: true });
    await fs.promises.writeFile(
      path.join(schemeDirectory, 'BeatNote.xcscheme'),
      schemeXml(appTargetId, testTargetId)
    );
    return config;
  });
};
