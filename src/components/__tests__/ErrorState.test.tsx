/**
 * ErrorState.test.jsx
 * Tests for the ErrorState component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorState from '../common/ErrorState';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  }
}));

describe('ErrorState', () => {
  const defaultProps = {
    title: "Test Error",
    message: "This is a test error message",
    testId: "test-error"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ErrorState {...defaultProps} />);
    
    expect(screen.getByTestId('test-error')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('This is a test error message')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState {...defaultProps} onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('test-error-retry');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent('Try Again');
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn().mockResolvedValue();
    render(<ErrorState {...defaultProps} onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('test-error-retry');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during retry', async () => {
    const onRetry = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ErrorState {...defaultProps} onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('test-error-retry');
    fireEvent.click(retryButton);
    
    expect(retryButton).toHaveTextContent('Retrying...');
    expect(retryButton).toBeDisabled();
    
    await waitFor(() => {
      expect(retryButton).toHaveTextContent('Try Again');
      expect(retryButton).not.toBeDisabled();
    });
  });

  it('renders fallback button when onFallback is provided', () => {
    const onFallback = vi.fn();
    render(<ErrorState {...defaultProps} onFallback={onFallback} />);
    
    const fallbackButton = screen.getByTestId('test-error-fallback');
    expect(fallbackButton).toBeInTheDocument();
    expect(fallbackButton).toHaveTextContent('Continue Anyway');
  });

  it('calls onFallback when fallback button is clicked', () => {
    const onFallback = vi.fn();
    render(<ErrorState {...defaultProps} onFallback={onFallback} />);
    
    const fallbackButton = screen.getByTestId('test-error-fallback');
    fireEvent.click(fallbackButton);
    
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('renders report button when onReport is provided', () => {
    const onReport = vi.fn();
    render(<ErrorState {...defaultProps} onReport={onReport} />);
    
    const reportButton = screen.getByTestId('test-error-report');
    expect(reportButton).toBeInTheDocument();
    expect(reportButton).toHaveTextContent('Report Issue');
  });

  it('calls onReport with error details when report button is clicked', () => {
    const onReport = vi.fn();
    const error = new Error('Test error');
    render(<ErrorState {...defaultProps} error={error} onReport={onReport} />);
    
    const reportButton = screen.getByTestId('test-error-report');
    fireEvent.click(reportButton);
    
    expect(onReport).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Error',
        message: 'This is a test error message',
        error: 'Error: Test error',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String)
      })
    );
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error with stack');
    error.stack = 'Error: Test error\n    at test.js:1:1';
    
    render(<ErrorState {...defaultProps} error={error} showDetails={true} />);
    
    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('does not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Test error with stack');
    render(<ErrorState {...defaultProps} error={error} showDetails={true} />);
    
    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('renders with custom icon and type', () => {
    render(
      <ErrorState 
        {...defaultProps} 
        icon="🚨" 
        type="warning"
      />
    );
    
    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('renders with custom button text', () => {
    const onRetry = vi.fn();
    const onFallback = vi.fn();
    const onReport = vi.fn();
    
    render(
      <ErrorState 
        {...defaultProps}
        onRetry={onRetry}
        onFallback={onFallback}
        onReport={onReport}
        retryText="Retry Now"
        fallbackText="Skip This"
        reportText="Send Report"
      />
    );
    
    expect(screen.getByText('Retry Now')).toBeInTheDocument();
    expect(screen.getByText('Skip This')).toBeInTheDocument();
    expect(screen.getByText('Send Report')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorState {...defaultProps} />);
    
    const container = screen.getByTestId('test-error');
    expect(container).toHaveAttribute('role', 'alert');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('handles retry failure gracefully', async () => {
    const onRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ErrorState {...defaultProps} onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('test-error-retry');
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(retryButton).toHaveTextContent('Try Again');
      expect(retryButton).not.toBeDisabled();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Retry failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});