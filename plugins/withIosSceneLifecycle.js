const fs = require('fs');
const path = require('path');
const {
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
} = require('@expo/config-plugins');

const APP_TARGET = 'BeatNote';
const SCENE_DELEGATE_FILE = 'SceneDelegate.swift';
const SCENE_DELEGATE_PROJECT_PATH = `${APP_TARGET}/${SCENE_DELEGATE_FILE}`;
const APP_GROUP = 'BeatNote';
const SCENE_METHOD_MARKER = 'makeReactNativeWindow(for windowScene: UIWindowScene)';
const LEGACY_WINDOW_MARKER = 'window = UIWindow(frame: UIScreen.main.bounds)';

const sceneDelegateSource = `import UIKit

public final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  public var window: UIWindow?

  private var beatNoteAppDelegate: AppDelegate? {
    UIApplication.shared.delegate as? AppDelegate
  }

  public func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }
    guard let appDelegate = beatNoteAppDelegate else {
      fatalError("BeatNote AppDelegate is unavailable while connecting the window scene")
    }

    window = appDelegate.makeReactNativeWindow(for: windowScene)
    forward(connectionOptions, to: appDelegate)
  }

  public func sceneDidBecomeActive(_ scene: UIScene) {
    beatNoteAppDelegate?.applicationDidBecomeActive(UIApplication.shared)
  }

  public func sceneWillResignActive(_ scene: UIScene) {
    beatNoteAppDelegate?.applicationWillResignActive(UIApplication.shared)
  }

  public func sceneDidEnterBackground(_ scene: UIScene) {
    beatNoteAppDelegate?.applicationDidEnterBackground(UIApplication.shared)
  }

  public func sceneWillEnterForeground(_ scene: UIScene) {
    beatNoteAppDelegate?.applicationWillEnterForeground(UIApplication.shared)
  }

  public func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate = beatNoteAppDelegate else { return }
    URLContexts.forEach { forward($0, to: appDelegate) }
  }

  public func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate = beatNoteAppDelegate else { return }
    _ = appDelegate.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }

  private func forward(
    _ connectionOptions: UIScene.ConnectionOptions,
    to appDelegate: AppDelegate
  ) {
    connectionOptions.urlContexts.forEach { forward($0, to: appDelegate) }
    connectionOptions.userActivities.forEach { userActivity in
      _ = appDelegate.application(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in }
      )
    }
  }

  private func forward(_ context: UIOpenURLContext, to appDelegate: AppDelegate) {
    var options: [UIApplication.OpenURLOptionsKey: Any] = [
      .openInPlace: context.options.openInPlace,
    ]
    if let sourceApplication = context.options.sourceApplication {
      options[.sourceApplication] = sourceApplication
    }
    if let annotation = context.options.annotation {
      options[.annotation] = annotation
    }
    _ = appDelegate.application(
      UIApplication.shared,
      open: context.url,
      options: options
    )
  }
}
`;

function patchAppDelegate(contents) {
  const legacyWindowBlock = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;
  const sceneWindowMethod = `  public func makeReactNativeWindow(for windowScene: UIWindowScene) -> UIWindow {
    guard let sceneWindow = window else {
      fatalError("React Native window is unavailable while connecting the window scene")
    }

    sceneWindow.windowScene = windowScene
    sceneWindow.makeKeyAndVisible()
    return sceneWindow
  }

`;

  const bindFactory = '    bindReactNativeFactory(factory)\n';
  let updated = contents
    .replace('  private var initialLaunchOptions: [UIApplication.LaunchOptionsKey: Any]?\n', '')
    .replace('    initialLaunchOptions = launchOptions\n', '');

  if (updated.includes(SCENE_METHOD_MARKER)) {
    if (!updated.includes(LEGACY_WINDOW_MARKER)) {
      if (!updated.includes(bindFactory)) {
        throw new Error('Unable to locate bindReactNativeFactory in AppDelegate.swift');
      }
      updated = updated.replace(bindFactory, `${bindFactory}\n${legacyWindowBlock}`);
    }
    return updated.replace(
      /  public func makeReactNativeWindow\(for windowScene: UIWindowScene\) -> UIWindow \{[\s\S]*?\n  \}\n\n(?=  \/\/ Linking API)/,
      sceneWindowMethod
    );
  }

  const factoryProperty = '  var reactNativeFactory: RCTReactNativeFactory?\n';
  if (!updated.includes(factoryProperty)) {
    throw new Error('Unable to locate the React Native factory in AppDelegate.swift');
  }

  if (!updated.includes(bindFactory)) {
    throw new Error('Unable to locate bindReactNativeFactory in AppDelegate.swift');
  }

  if (!updated.includes(LEGACY_WINDOW_MARKER)) {
    throw new Error('Unable to locate the legacy AppDelegate window bootstrap');
  }

  const linkingMarker = '  // Linking API\n';
  if (!updated.includes(linkingMarker)) {
    throw new Error('Unable to locate the AppDelegate linking extension point');
  }
  return updated.replace(linkingMarker, `${sceneWindowMethod}${linkingMarker}`);
}

function appTargetId(project) {
  const targets = project.pbxNativeTargetSection();
  return Object.keys(targets).find((key) => (
    !key.endsWith('_comment')
    && targets[key].name?.replace(/"/g, '') === APP_TARGET
    && targets[key].productType === '"com.apple.product-type.application"'
  ));
}

function hasSceneDelegate(project) {
  const references = project.pbxFileReferenceSection();
  for (const key of Object.keys(references)) {
    if (key.endsWith('_comment')) continue;
    const reference = references[key];
    const referencePath = reference.path?.replace(/"/g, '');
    if (referencePath !== SCENE_DELEGATE_FILE
      && referencePath !== SCENE_DELEGATE_PROJECT_PATH) continue;
    reference.path = SCENE_DELEGATE_PROJECT_PATH;
    return true;
  }
  return false;
}

module.exports = function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, infoPlistConfig => {
    infoPlistConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: 'Default Configuration',
          UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
        }],
      },
    };
    return infoPlistConfig;
  });

  config = withAppDelegate(config, appDelegateConfig => {
    if (appDelegateConfig.modResults.language !== 'swift') {
      throw new Error('withIosSceneLifecycle requires a Swift AppDelegate');
    }
    appDelegateConfig.modResults.contents = patchAppDelegate(
      appDelegateConfig.modResults.contents
    );
    return appDelegateConfig;
  });

  config = withDangerousMod(config, ['ios', async dangerousConfig => {
    const destination = path.join(
      dangerousConfig.modRequest.platformProjectRoot,
      APP_GROUP,
      SCENE_DELEGATE_FILE
    );
    await fs.promises.writeFile(destination, sceneDelegateSource);
    return dangerousConfig;
  }]);

  config = withXcodeProject(config, xcodeConfig => {
    const project = xcodeConfig.modResults;
    if (hasSceneDelegate(project)) return xcodeConfig;

    const target = appTargetId(project);
    const group = project.findPBXGroupKey({ name: APP_GROUP });
    if (!target || !group) {
      throw new Error('Unable to locate the BeatNote app target/group for SceneDelegate.swift');
    }
    project.addSourceFile(SCENE_DELEGATE_PROJECT_PATH, { target }, group);
    return xcodeConfig;
  });

  return config;
};

module.exports.patchAppDelegate = patchAppDelegate;
module.exports.sceneDelegateSource = sceneDelegateSource;
