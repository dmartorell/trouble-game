module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx)',
    '**/*.(test|spec).+(ts|tsx)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/utils/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-haptics|expo-modules-core)/)',
  ],
  verbose: true,
};
