module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/__tests__/setup.ts',
    '/src/__tests__/jest.d.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*'
  ],

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};