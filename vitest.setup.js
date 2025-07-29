/**
 * vitest.setup.js
 * ------------------------------------------------------------------
 * JSDOM (used by Vitest in `environment: 'jsdom'`) does not ship with
 * the PointerEvent constructor.  Several keyboard‑navigation tests for
 * Motion‑dom and Testing‑Library expect PointerEvent to exist.  We add
 * a minimal shim so those tests don’t throw.
 */
import { vi } from 'vitest';

global.PointerEvent = window.PointerEvent = class PointerEvent extends Event {};

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
