/**
 * ErrorHandlingService.test.js
 * Tests for the ErrorHandlingService
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { errorHandlingService } from '../ErrorHandlingService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

describe('ErrorHandlingService', () => {
  let errorService: typeof errorHandlingService;

  beforeEach(() => {
    errorService = errorHandlingService;
    // Clear existing error log and retry attempts
    errorService.clearErrorLog();
    vi.clearAllMocks();
    // Clear console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Content Service Error Handling', () => {
    it('handles content service errors with retry capability', async () => {
      const error = new Error('Network error');
      const result = await errorService.handleContentServiceError('getCategories', error);

      expect(result.success).toBe(false);
      expect(result.canRetry).toBe(true);
      expect(result.retryCount).toBe(1);
      expect(result.fallbackData).toEqual(['Money', 'Relationships', 'Self-Image']);
    });

    it('provides fallback after max retries', async () => {
      const error = new Error('Persistent error');
      
      // Simulate multiple retry attempts
      await errorService.handleContentServiceError('getCategories', error);
      await errorService.handleContentServiceError('getCategories', error);
      await errorService.handleContentServiceError('getCategories', error);
      const result = await errorService.handleContentServiceError('getCategories', error);

      expect(result.canRetry).toBe(false);
      expect(result.useFallback).toBe(true);
      expect(result.fallbackData).toEqual(['Money', 'Relationships', 'Self-Image']);
    });

    it('provides correct fallback data for different operations', async () => {
      const error = new Error('Test error');

      const categoriesResult = await errorService.handleContentServiceError('getCategories', error);
      expect(categoriesResult.fallbackData).toEqual(['Money', 'Relationships', 'Self-Image']);

      const subcategoriesResult = await errorService.handleContentServiceError('getSubcategories', error, { category: 'Money' });
      expect(subcategoriesResult.fallbackData).toEqual(['Financial Security', 'Abundance', 'Career']);

      const miningResult = await errorService.handleContentServiceError('getMiningPrompts', error, { type: 'neutralize' });
      expect(miningResult.fallbackData).toHaveLength(5);
      expect(miningResult.fallbackData[0]).toContain('information, not truth');
    });
  });

  describe('Component Error Handling', () => {
    it('handles component errors with appropriate recovery options', () => {
      const error = new Error('Component render error');
      const result = errorService.handleComponentError('BaseCard', error, { props: {} });

      expect(result.title).toBe('Card Loading Issue');
      expect(result.message).toContain('card encountered an issue');
      expect(result.canRetry).toBe(true);
      expect(result.canFallback).toBe(true);
      expect(result.recoveryOptions).toHaveLength(3); // retry, fallback, report
    });

    it('determines retry capability based on error type', () => {
      const networkError = new Error('NetworkError');
      networkError.name = 'NetworkError';
      
      const syntaxError = new Error('SyntaxError');
      syntaxError.name = 'SyntaxError';

      expect(errorService.canRetryError(networkError)).toBe(true);
      expect(errorService.canRetryError(syntaxError)).toBe(false);
    });

    it('determines fallback capability based on component type', () => {
      expect(errorService.canFallbackError('BaseCard')).toBe(true);
      expect(errorService.canFallbackError('UnknownComponent')).toBe(false);
    });
  });

  describe('Session Error Handling', () => {
    it('preserves session data on error', () => {
      const error = new Error('Session error');
      const sessionData = { currentLane: 'mining', insights: ['test insight'] };
      
      const result = errorService.handleSessionError(error, sessionData);

      expect(result.canRecover).toBe(true);
      expect(result.preservedData).toEqual(sessionData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clarity_canvas_recovery',
        expect.stringContaining('test insight')
      );
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const error = new Error('Session error');
      const sessionData = { currentLane: 'mining' };
      
      // Should not throw
      expect(() => {
        errorService.handleSessionError(error, sessionData);
      }).not.toThrow();
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('creates appropriate error messages for different error types', () => {
      const networkError = new Error('fetch failed');
      const contentError = new Error('content not found');
      const modelError = new Error('model loading failed');
      const genericError = new Error('unknown error');

      const networkResult = errorService.createUserFriendlyError(networkError);
      expect(networkResult.title).toBe('Connection Issue');
      expect(networkResult.type).toBe('warning');
      expect(networkResult.icon).toBe('📡');

      const contentResult = errorService.createUserFriendlyError(contentError, 'content');
      expect(contentResult.title).toBe('Content Loading Issue');
      expect(contentResult.type).toBe('warning');

      const modelResult = errorService.createUserFriendlyError(modelError, 'model');
      expect(modelResult.title).toBe('AI Features Unavailable');
      expect(modelResult.type).toBe('info');

      const genericResult = errorService.createUserFriendlyError(genericError);
      expect(genericResult.title).toBe('Temporary Issue');
      expect(genericResult.type).toBe('error');
    });
  });

  describe('Error Logging and Statistics', () => {
    it('logs errors with proper context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      errorService.logError('Test Category', error, context);

      const stats = errorService.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.categories['Test Category']).toBe(1);
    });

    it('maintains error log size limit', () => {
      // Add more errors than the limit
      for (let i = 0; i < 150; i++) {
        errorService.logError('Test', new Error(`Error ${i}`));
      }

      const stats = errorService.getErrorStats();
      expect(stats.totalErrors).toBe(100); // maxLogSize
    });

    it('tracks recent errors for health check', () => {
      // Add old errors
      const oldTimestamp = Date.now() - 400000; // 6+ minutes ago
      errorService.getErrorLogForTesting().push({
        timestamp: oldTimestamp,
        source: 'Test',
        message: 'old error',
        details: {},
        category: 'Old Error',
        error: { name: 'Error', message: 'old error' }
      });

      // Add recent errors
      errorService.logError('Recent', new Error('recent error'));

      const stats = errorService.getErrorStats();
      expect(stats.recentErrors).toBe(1); // Only recent errors
      expect(stats.isHealthy).toBe(true);
    });

    it('determines system health based on recent errors', () => {
      // Add many recent errors
      for (let i = 0; i < 6; i++) {
        errorService.logError('Recent', new Error(`Recent error ${i}`));
      }

      expect(errorService.isSystemHealthy()).toBe(false);
    });
  });

  describe('Error Listeners', () => {
    it('adds and removes error listeners', () => {
      const listener = vi.fn();
      
      errorService.addErrorListener(listener);
      expect(errorService.getErrorListenersForTesting().has(listener)).toBe(true);
      
      errorService.removeErrorListener(listener);
      expect(errorService.getErrorListenersForTesting().has(listener)).toBe(false);
    });

    it('notifies error listeners on component errors', () => {
      const listener = vi.fn();
      errorService.addErrorListener(listener);

      const error = new Error('Test error');
      errorService.handleComponentError('TestComponent', error);

      expect(listener).toHaveBeenCalledWith(
        error,
        undefined, // source is undefined in errorEvent
        undefined  // details is undefined in errorEvent
      );
    });

    it('handles listener errors gracefully', () => {
      const faultyListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      errorService.addErrorListener(faultyListener);
      
      // Should not throw when notifying listeners
      expect(() => {
        errorService.handleComponentError('TestComponent', new Error('Test'));
      }).not.toThrow();
    });
  });

  describe('Retry Management', () => {
    it('clears retry attempts on success', () => {
      errorService.getRetryAttemptsForTesting().set('test_operation', 2);
      
      errorService.clearRetryAttempts('test_operation');
      
      expect(errorService.getRetryAttemptsForTesting().has('test_operation')).toBe(false);
    });

    it('tracks retry attempts per operation', async () => {
      const error = new Error('Test error');
      
      await errorService.handleContentServiceError('testOp', error);
      await errorService.handleContentServiceError('testOp', error);
      
      const stats = errorService.getErrorStats();
      expect(stats.retryAttempts['contentService_testOp']).toBe(2);
    });
  });

  describe('Error Export', () => {
    it('exports sanitized error log', () => {
      const error = new Error('Test error');
      errorService.logError('Test', error, { userText: 'sensitive data' });

      const exported = errorService.exportErrorLog();

      expect(exported.timestamp).toBeDefined();
      expect(exported.stats).toBeDefined();
      expect(exported.errors).toHaveLength(1);
      expect(exported.errors[0].context.userText).toBe('[REDACTED]');
    });
  });

  describe('Cleanup', () => {
    it('clears error log and retry attempts', () => {
            errorService.logError('Test', new Error('test'));
      errorService.getRetryAttemptsForTesting().set('test', 1);
      
      errorService.clearErrorLog();
      
      expect(errorService.getErrorLogForTesting()).toHaveLength(0);
      expect(errorService.getRetryAttemptsForTesting().size).toBe(0);
    });
  });
});