// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest, beforeAll, afterAll, afterEach } from '@jest/globals';

// Polyfill setImmediate for opensearch client
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((cb: any, ...args: any[]) => setTimeout(cb, 0, ...args)) as any;
  global.clearImmediate = (id: any) => clearTimeout(id);
}

// Mock environment variables
(process.env as any).NODE_ENV = 'test';

// Suppress console errors in tests (optional - remove if you want to see all errors)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock fetch if needed
global.fetch = jest.fn() as any;

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
