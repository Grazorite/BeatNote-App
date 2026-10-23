const { withInfoPlist } = require('@expo/config-plugins');

const AUDIO_DOCUMENT_TYPE = {
  CFBundleTypeName: 'Audio',
  CFBundleTypeRole: 'Viewer',
  LSHandlerRank: 'Alternate',
  LSItemContentTypes: [
    'public.mp3',
    'com.microsoft.waveform-audio',
    'public.mpeg-4-audio',
    'com.apple.m4a-audio',
    'public.aac-audio',
    'org.xiph.ogg-audio',
    'org.xiph.flac',
  ],
};

const importedAudioType = (identifier, description, extension, mimeType) => ({
  UTTypeIdentifier: identifier,
  UTTypeDescription: description,
  UTTypeConformsTo: ['public.audio'],
  UTTypeTagSpecification: {
    'public.filename-extension': [extension],
    'public.mime-type': [mimeType],
  },
});

const IMPORTED_AUDIO_TYPES = [
  importedAudioType('org.xiph.ogg-audio', 'Ogg Audio', 'ogg', 'audio/ogg'),
  importedAudioType('org.xiph.flac', 'FLAC Audio', 'flac', 'audio/flac'),
];

module.exports = function withAudioDocumentTypes(config) {
  return withInfoPlist(config, infoPlistConfig => {
    const info = infoPlistConfig.modResults;
    const existingDocumentTypes = Array.isArray(info.CFBundleDocumentTypes)
      ? info.CFBundleDocumentTypes
      : [];
    info.CFBundleDocumentTypes = [
      ...existingDocumentTypes.filter(entry => entry.CFBundleTypeName !== 'Audio'),
      AUDIO_DOCUMENT_TYPE,
    ];

    const importedTypes = Array.isArray(info.UTImportedTypeDeclarations)
      ? info.UTImportedTypeDeclarations
      : [];
    const audioIdentifiers = new Set(IMPORTED_AUDIO_TYPES.map(entry => entry.UTTypeIdentifier));
    info.UTImportedTypeDeclarations = [
      ...importedTypes.filter(entry => !audioIdentifiers.has(entry.UTTypeIdentifier)),
      ...IMPORTED_AUDIO_TYPES,
    ];

    info.LSSupportsOpeningDocumentsInPlace = false;
    return infoPlistConfig;
  });
};
