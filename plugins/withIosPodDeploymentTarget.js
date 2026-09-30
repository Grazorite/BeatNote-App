const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# BeatNote: align pod targets with the app deployment target.';
const POST_INSTALL_ANCHOR = `      :ccache_enabled => ccache_enabled?(podfile_properties),
    )`;

/**
 * Ensures third-party pods with obsolete deployment targets build with current Xcode versions.
 */
module.exports = function withIosPodDeploymentTarget(config) {
  return withPodfile(config, (podfileConfig) => {
    const podfile = podfileConfig.modResults.contents;

    if (podfile.includes(MARKER)) {
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
      end
    end`;

    podfileConfig.modResults.contents = podfile.replace(
      POST_INSTALL_ANCHOR,
      deploymentTargetOverride
    );
    return podfileConfig;
  });
};
