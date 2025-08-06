import { describe, it, expect, vi } from 'vitest';
import errorHandlingService from '../../src/services/ErrorHandlingService.ts';

describe('ErrorHandlingService', () => {
  it('should return fallback data after 3 attempts', async () => {
    const operation = 'testOperation';
    const error = new Error('test error');
    const context = { test: 'context' };

    // First 3 attempts should return retry with fallback data
    for (let i = 0; i < 3; i++) {
      const result = await errorHandlingService.handleContentServiceError(operation, error, context);
      expect(result.success).toBe(false);
      expect(result.canRetry).toBe(true);
      expect(result.retryCount).toBe(i + 1);
      expect(result.fallbackData).toEqual([]); // Default fallback is empty array
    }

    // 4th attempt should reach max retries and return useFallback
    const result = await errorHandlingService.handleContentServiceError(operation, error, context);
    expect(result.success).toBe(false);
    expect(result.canRetry).toBe(false);
    expect(result.useFallback).toBe(true);
    expect(result.fallbackData).toEqual([]);
  });

  it('should clear retry attempts', async () => {
    const operation = 'testOperation2'; // Use different operation to avoid state pollution
    const error = new Error('test error');
    const context = { test: 'context' };

    // Make some attempts
    for (let i = 0; i < 3; i++) {
      const result = await errorHandlingService.handleContentServiceError(operation, error, context);
      expect(result.success).toBe(false);
      expect(result.canRetry).toBe(true);
      expect(result.retryCount).toBe(i + 1);
    }

    // Clear attempts using the correct key format
    errorHandlingService.clearRetryAttempts(`contentService_${operation}`);

    // Next attempt should be treated as first attempt again
    const result = await errorHandlingService.handleContentServiceError(operation, error, context);
    expect(result.success).toBe(false);
    expect(result.canRetry).toBe(true);
    expect(result.retryCount).toBe(1); // Back to first attempt
  });
});
