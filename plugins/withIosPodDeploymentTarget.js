const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# BeatNote: align pod targets with the app deployment target.';
const FMT_MARKER = '# BeatNote: Xcode 27 rejects fmt 11 consteval checks under C++20.';
const POST_INSTALL_ANCHOR = `      :ccache_enabled => ccache_enabled?(podfile_properties),
    )`;

/**
 * Ensures third-party pods with obsolete deployment targets build with current Xcode versions.
 */
module.exports = function withIosPodDeploymentTarget(config) {
  return withPodfile(config, (podfileConfig) => {
    const podfile = podfileConfig.modResults.contents;

    if (podfile.includes(FMT_MARKER)) {
      return podfileConfig;
    }

    if (podfile.includes(MARKER)) {
      const targetAssignment = `        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] =
          podfile_properties['ios.deploymentTarget'] || '15.1'`;
      if (!podfile.includes(targetAssignment)) {
        throw new Error('Unable to locate the existing BeatNote pod target override');
      }
      podfileConfig.modResults.contents = podfile.replace(
        targetAssignment,
        `${targetAssignment}
        if target.name == 'fmt'
          ${FMT_MARKER}
          build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end`
      );
      return podfileConfig;
    }

    if (!podfile.includes(POST_INSTALL_ANCHOR)) {
      throw new Error('Unable to locate the React Native post_install block in the generated Podfile');
    }

    const deploymentTargetOverride = `${POST_INSTALL_ANCHOR}

    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] =
          podfile_properties['ios.deploymentTarget'] || '15.1'
        if target.name == 'fmt'
          ${FMT_MARKER}
          build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;

    podfileConfig.modResults.contents = podfile.replace(
      POST_INSTALL_ANCHOR,
      deploymentTargetOverride
    );
    return podfileConfig;
  });
};
