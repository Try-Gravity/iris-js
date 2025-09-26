/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      // Add any custom matchers if needed
    }
  }
}

export {};
