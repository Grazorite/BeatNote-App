const { withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

module.exports = function withVersionConsistency(config) {
  const version = config.version;
  if (!version) throw new Error('Expo config must define a user-facing version');

  config = withInfoPlist(config, (infoPlistConfig) => {
    infoPlistConfig.modResults.CFBundleShortVersionString = version;
    return infoPlistConfig;
  });

  return withXcodeProject(config, (xcodeConfig) => {
    const configurations = xcodeConfig.modResults.pbxXCBuildConfigurationSection();
    for (const [key, configuration] of Object.entries(configurations)) {
      if (key.endsWith('_comment') || !configuration.buildSettings) continue;
      const infoPlist = configuration.buildSettings.INFOPLIST_FILE?.replace(/"/g, '');
      if (infoPlist === 'BeatNote/Info.plist') {
        configuration.buildSettings.MARKETING_VERSION = version;
      }
    }
    return xcodeConfig;
  });
};
