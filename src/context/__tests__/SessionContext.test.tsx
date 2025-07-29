import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { SessionProvider, useSession } from '../SessionContext';

// Test component that uses the session context
const TestComponent = () => {
  const {
    canvasState,
    updateCanvasState,
    addInsight,
    navigateToLane,
    trackContentInteraction,
    getSessionMetrics
  } = useSession();

  return (
    <div>
      <div data-testid="current-lane">{canvasState.currentLane}</div>
      <div data-testid="insight-count">{canvasState.minedInsights.length}</div>
      <div data-testid="is-ready">{canvasState.isReady.toString()}</div>
      
      <button 
        data-testid="update-readiness"
        onClick={() => updateCanvasState({ isReady: true, intensity: 7 })}
      >
        Set Ready
      </button>
      
      <button
        data-testid="navigate-mining"
        onClick={() => navigateToLane('mining')}
      >
        Go to Mining
      </button>
      
      <button
        data-testid="add-insight"
        onClick={() => addInsight({ type: 'test', content: 'Test insight' })}
      >
        Add Insight
      </button>
      
      <button
        data-testid="track-interaction"
        onClick={() => trackContentInteraction('mining_prompt', 'test-prompt-1', 'selected')}
      >
        Track Interaction
      </button>
      
      <button
        data-testid="get-metrics"
        onClick={() => {
          const metrics = getSessionMetrics();
          console.log('Session metrics:', metrics);
        }}
      >
        Get Metrics
      </button>
    </div>
  );
};

describe('SessionContext', () => {
  test('provides initial canvas state', () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    expect(screen.getByTestId('current-lane').textContent).toBe('readiness');
    expect(screen.getByTestId('insight-count').textContent).toBe('0');
    expect(screen.getByTestId('is-ready').textContent).toBe('false');
  });

  test('updates canvas state correctly', async () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    const updateButton = screen.getByTestId('update-readiness');
    
    await act(async () => {
      updateButton.click();
    });

    expect(screen.getByTestId('is-ready').textContent).toBe('true');
  });

  test('navigates between lanes', async () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    const navigateButton = screen.getByTestId('navigate-mining');
    
    await act(async () => {
      navigateButton.click();
    });

    expect(screen.getByTestId('current-lane').textContent).toBe('mining');
  });

  test('adds insights correctly', async () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    const addInsightButton = screen.getByTestId('add-insight');
    
    await act(async () => {
      addInsightButton.click();
    });

    expect(screen.getByTestId('insight-count').textContent).toBe('1');
  });

  test('tracks content interactions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    const trackButton = screen.getByTestId('track-interaction');
    
    await act(async () => {
      trackButton.click();
    });

    expect(screen.getByTestId('insight-count').textContent).toBe('1');
    
    consoleSpy.mockRestore();
  });

  test('throws error when useSession used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useSession();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useSession must be used within a SessionProvider');
    
    consoleSpy.mockRestore();
  });
});