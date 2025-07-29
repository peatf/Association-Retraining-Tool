import { describe, it, expect, vi } from 'vitest';
import errorHandlingService from '../../src/services/ErrorHandlingService.js';

describe('ErrorHandlingService', () => {
  it('should return fallback data after 3 attempts', () => {
    const operation = 'testOperation';
    const error = new Error('test error');
    const context = { test: 'context' };

    // First 3 attempts should return no fallback
    for (let i = 0; i < 3; i++) {
      const result = errorHandlingService.handleContentServiceError(operation, error, context);
      expect(result.useFallback).toBe(false);
      expect(result.fallbackData).toBe(null);
    }

    // 4th attempt should return fallback data
    const result = errorHandlingService.handleContentServiceError(operation, error, context);
    expect(result.useFallback).toBe(true);
    expect(result.fallbackData).toEqual([]);
  });

  it('should clear retry attempts', () => {
    const operation = 'testOperation';
    const error = new Error('test error');
    const context = { test: 'context' };

    // First 3 attempts should return no fallback
    for (let i = 0; i < 3; i++) {
      const result = errorHandlingService.handleContentServiceError(operation, error, context);
      expect(result.useFallback).toBe(false);
      expect(result.fallbackData).toBe(null);
    }

    // Clear retry attempts
    errorHandlingService.clearRetryAttempts(`${operation}_${JSON.stringify(context)}`);

    // Next attempt should not use fallback
    const result = errorHandlingService.handleContentServiceError(operation, error, context);
    expect(result.useFallback).toBe(false);
    expect(result.fallbackData).toBe(null);
  });
});
