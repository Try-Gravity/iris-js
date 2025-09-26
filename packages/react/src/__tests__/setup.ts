import '@testing-library/jest-dom';

// Mock window.open for click URL testing
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
});

// Mock fetch for impression URL testing
(globalThis as any).fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
