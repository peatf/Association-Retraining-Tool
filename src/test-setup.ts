// Test setup for Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment for tests
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.fetch = vi.fn();