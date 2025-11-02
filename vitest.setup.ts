import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for React Flow
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

// Mock D3 event for React Flow drag interactions
// @ts-expect-error - d3 event is used internally by React Flow
global.d3 = {
  event: null,
};
