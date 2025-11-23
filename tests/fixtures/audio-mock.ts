// Mock implementations for audio testing
export const mockDocumentPicker = {
  getDocumentAsync: async () => ({
    canceled: false,
    assets: [{
      uri: 'file://test-audio.mp3',
      name: 'test-audio.mp3',
      type: 'audio/mpeg',
      size: 1024000
    }]
  })
};

export const mockAudioPlayer = (overrides = {}) => ({
  duration: 180,
  currentTime: 0,
  isLoaded: true,
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  ...overrides
});

export const mockUseAudioPlayer = (playerOverrides = {}) => {
  const player = mockAudioPlayer(playerOverrides);
  return () => player;
};