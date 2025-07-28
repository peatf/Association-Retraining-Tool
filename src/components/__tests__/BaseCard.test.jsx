/**
 * BaseCard.test.jsx
 * Tests for the BaseCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BaseCard from '../BaseCard';

describe('BaseCard Component', () => {
  const defaultProps = {
    title: 'Test Card',
    testId: 'test-card',
    children: <div>Test content</div>
  };

  it('renders with basic props', () => {
    render(<BaseCard {...defaultProps} />);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });

  it('applies correct accessibility attributes', () => {
    render(<BaseCard {...defaultProps} />);
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Test Card');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('shows loading state correctly', () => {
    render(<BaseCard {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
    expect(screen.getByTestId('test-card')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows error state correctly', () => {
    const errorMessage = 'Test error message';
    render(<BaseCard {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    render(<BaseCard {...defaultProps} isCompleted={true} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows active state correctly', () => {
    render(<BaseCard {...defaultProps} isActive={true} />);
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveClass('card-active');
  });

  it('calls onComplete when complete button is clicked', () => {
    const onComplete = vi.fn();
    render(<BaseCard {...defaultProps} onComplete={onComplete} />);
    
    const completeButton = screen.getByText('Complete This Step');
    fireEvent.click(completeButton);
    
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when skip button is clicked', () => {
    const onSkip = vi.fn();
    render(<BaseCard {...defaultProps} onSkip={onSkip} />);
    
    const skipButton = screen.getByText('Skip For Now');
    fireEvent.click(skipButton);
    
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation correctly', () => {
    const onActivate = vi.fn();
    render(<BaseCard {...defaultProps} onActivate={onActivate} />);
    
    const card = screen.getByTestId('test-card');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(onActivate).toHaveBeenCalledWith(true);
  });

  it('respects disabled state', () => {
    const onComplete = vi.fn();
    const onActivate = vi.fn();
    
    render(
      <BaseCard 
        {...defaultProps} 
        disabled={true}
        onComplete={onComplete}
        onActivate={onActivate}
      />
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('tabIndex', '-1');
    
    const completeButton = screen.getByText('Complete This Step');
    expect(completeButton).toBeDisabled();
  });

  it('hides actions when showActions is false', () => {
    render(<BaseCard {...defaultProps} showActions={false} />);
    
    expect(screen.queryByText('Complete This Step')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip For Now')).not.toBeInTheDocument();
  });

  it('uses custom button text', () => {
    render(
      <BaseCard 
        {...defaultProps} 
        completionText="Custom Complete"
        skipText="Custom Skip"
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );
    
    expect(screen.getByText('Custom Complete')).toBeInTheDocument();
    expect(screen.getByText('Custom Skip')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BaseCard {...defaultProps} className="custom-class" />);
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveClass('custom-class');
  });

  it('provides screen reader status updates', () => {
    const { rerender } = render(<BaseCard {...defaultProps} />);
    
    // Test loading state
    rerender(<BaseCard {...defaultProps} loading={true} />);
    expect(screen.getByText('Card is loading')).toBeInTheDocument();
    
    // Test error state
    rerender(<BaseCard {...defaultProps} error="Test error" />);
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    
    // Test completed state
    rerender(<BaseCard {...defaultProps} isCompleted={true} />);
    expect(screen.getByText('Card completed')).toBeInTheDocument();
    
    // Test active state
    rerender(<BaseCard {...defaultProps} isActive={true} />);
    expect(screen.getByText('Card is active')).toBeInTheDocument();
  });
});