/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.ts'],
  moduleNameMapper: {
    // Mock AsyncStorage — not available in Node
    '@react-native-async-storage/async-storage': '<rootDir>/tests/unit/__mocks__/asyncStorage.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true } }],
  },
};
