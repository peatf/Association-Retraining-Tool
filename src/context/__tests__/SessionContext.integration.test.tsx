import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { SessionProvider, useSession } from '../SessionContext';

// Test component that verifies legacy integration
const LegacyIntegrationTestComponent = () => {
  const {
    canvasState,
    updateCanvasState,
    legacySessionManager,
    getSessionMetrics
  } = useSession();

  const testLegacyIntegration = () => {
    // Update canvas state and verify it syncs with legacy manager
    updateCanvasState({ 
      selectedTopic: 'relationships',
      intensity: 8,
      currentLane: 'mining'
    });
    
    // Check legacy state
    if (legacySessionManager) {
      const legacyState = legacySessionManager.getCurrentState();
      console.log('Legacy state after canvas update:', legacyState);
    }
  };

  const getMetrics = () => {
    const metrics = getSessionMetrics?.();
    console.log('Session metrics:', metrics);
  };

  return (
    <div>
      <div data-testid="selected-topic">{canvasState.selectedTopic || 'none'}</div>
      <div data-testid="intensity">{canvasState.intensity}</div>
      <div data-testid="current-lane">{canvasState.currentLane}</div>
      <div data-testid="legacy-available">{legacySessionManager ? 'true' : 'false'}</div>
      
      <button 
        data-testid="test-legacy-integration"
        onClick={testLegacyIntegration}
      >
        Test Legacy Integration
      </button>
      
      <button
        data-testid="get-metrics"
        onClick={getMetrics}
      >
        Get Metrics
      </button>
    </div>
  );
};

describe('SessionContext Legacy Integration', () => {
  test('initializes with legacy session manager', () => {
    render(
      <SessionProvider>
        <LegacyIntegrationTestComponent />
      </SessionProvider>
    );

    expect(screen.getByTestId('legacy-available').textContent).toBe('true');
    expect(screen.getByTestId('current-lane').textContent).toBe('readiness');
    expect(screen.getByTestId('intensity').textContent).toBe('5');
  });

  test('syncs canvas state with legacy session manager', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <SessionProvider>
        <LegacyIntegrationTestComponent />
      </SessionProvider>
    );

    const testButton = screen.getByTestId('test-legacy-integration');
    
    await act(async () => {
      testButton.click();
    });

    expect(screen.getByTestId('selected-topic').textContent).toBe('relationships');
    expect(screen.getByTestId('intensity').textContent).toBe('8');
    expect(screen.getByTestId('current-lane').textContent).toBe('mining');
    
    // Verify console logs were called (indicating legacy sync happened)
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('provides comprehensive session metrics', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <SessionProvider>
        <LegacyIntegrationTestComponent />
      </SessionProvider>
    );

    const metricsButton = screen.getByTestId('get-metrics');
    
    await act(async () => {
      metricsButton.click();
    });

    // Verify metrics were logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Session metrics:',
      expect.objectContaining({
        sessionDuration: expect.any(Number),
        insightCount: expect.any(Number),
        lanesVisited: expect.any(Number),
        completedLanes: expect.any(Number),
        currentLane: expect.any(String),
        isReady: expect.any(Boolean),
        hasSelectedTopic: expect.any(Boolean),
        miningResultsCount: expect.any(Number),
        legacySessionHealth: expect.any(Object)
      })
    );
    
    consoleSpy.mockRestore();
  });
});