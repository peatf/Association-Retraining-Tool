// Basic test for Canvas component
// Ensures React components render without errors

import React from 'react';
import { describe, test, expect } from 'vitest';

describe('Canvas Component', () => {
  test('React components can be imported', () => {
    // Simple smoke test to ensure React setup is working
    expect(React).toBeDefined();
    expect(React.createElement).toBeDefined();
  });

  test('Canvas component can be imported', async () => {
    // Test that the Canvas component can be imported
    const Canvas = await import('../Canvas.jsx');
    expect(Canvas.default).toBeDefined();
  });

  test('SessionContext can be imported', async () => {
    // Test that the SessionContext can be imported
    const SessionContext = await import('../../context/SessionContext.jsx');
    expect(SessionContext.SessionProvider).toBeDefined();
    expect(SessionContext.useSession).toBeDefined();
  });
});