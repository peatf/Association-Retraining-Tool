/**
 * BaseCard.jsx
 * Reusable base card component for the Clarity Canvas system
 * Provides consistent structure, states, animations, and accessibility
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SkeletonCard, ErrorState, Spinner } from './common';
import errorHandlingService from '../services/ErrorHandlingService';
import './BaseCard.css';

interface BaseCardProps {
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  onActivate?: (active: boolean) => void;
  onComplete?: () => void;
  loading?: boolean;
  error?: string | Error | null;
  testId?: string;
  className?: string;
  showActions?: boolean;
  completionText?: string;
  skipText?: string;
  onSkip?: () => void;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({ 
  title, 
  children, 
  isActive = false, 
  isCompleted = false, 
  onActivate, 
  onComplete,
  loading = false,
  error = null,
  testId,
  className = '',
  showActions = true,
  completionText = 'Complete This Step',
  skipText = 'Skip For Now',
  onSkip,
  disabled = false,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel
}) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isActive]);

  // Animation variants for card states
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1
    },
    hover: {
      scale: 1.02,
      y: -2
    },
    tap: {
      scale: 0.98
    }
  };

  // Determine card state classes
  const getCardStateClass = (): string => {
    if (error) return 'card-error';
    if (loading) return 'card-loading';
    if (isCompleted) return 'card-completed';
    if (isActive) return 'card-active';
    return 'card-default';
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onActivate && !isActive && !disabled) {
        onActivate(true);
      }
    }
  };

  // Generate unique IDs for accessibility
  const cardId = testId ? `${testId}-card` : undefined;
  const contentId = testId ? `${testId}-content` : undefined;
  const actionsId = testId ? `${testId}-actions` : undefined;

  return (
    <motion.div
      className={`base-card ${getCardStateClass()} ${className}`}
      variants={shouldReduceMotion ? {} : cardVariants}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={!disabled && !loading && !shouldReduceMotion ? "hover" : undefined}
      whileTap={!disabled && !loading && !shouldReduceMotion ? "tap" : undefined}
      data-testid={testId}
      id={cardId}
      ref={cardRef}
      role="region"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy || contentId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-title" id={`${testId}-title`}>
          {title}
        </h3>
        
        {/* State Indicators */}
        <div className="card-state-indicators" aria-hidden="true">
          {loading && (
            <div className="state-indicator loading-indicator">
              <span className="loading-dot"></span>
            </div>
          )}
          {error && (
            <div className="state-indicator error-indicator">
              <span className="error-icon">⚠</span>
            </div>
          )}
          {isCompleted && (
            <div className="state-indicator completion-indicator">
              <span className="completion-icon">✓</span>
            </div>
          )}
          {isActive && !isCompleted && !loading && !error && (
            <div className="state-indicator active-indicator">
              <span className="active-pulse"></span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div 
        className="card-content"
        id={contentId}
        role="main"
        aria-live={loading ? "polite" : undefined}
      >
        {loading && (
          <div className="card-loading-state">
            <SkeletonCard testId={`${testId}-skeleton`} />
          </div>
        )}
        
        {error && (
          <ErrorState
            title="Something went wrong"
            message={typeof error === 'string' ? error : "This card encountered an issue loading its content."}
            error={typeof error === 'object' ? error : null}
            onRetry={() => window.location.reload()}
            onFallback={() => {
              // Clear error and continue with fallback content
              if (onActivate) onActivate(false);
            }}
            onReport={(errorReport) => {
              errorHandlingService.logError('BaseCard Error Report', errorReport);
              navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2));
            }}
            testId={`${testId}-error`}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )}
        
        {!loading && !error && children}
      </div>

      {/* Card Actions */}
      {showActions && !loading && !error && (
        <div 
          className="card-actions"
          id={actionsId}
          role="group"
          aria-labelledby={`${testId}-title`}
        >
          {!isCompleted && onComplete && (
            <motion.button
              className="btn-primary card-complete-btn"
              onClick={onComplete}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-describedby={contentId}
            >
              {completionText}
            </motion.button>
          )}
          
          {(onSkip || onActivate) && !isCompleted && (
            <motion.button
              className="btn-secondary card-skip-btn"
              onClick={onSkip || (() => onActivate && onActivate(false))}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {skipText}
            </motion.button>
          )}
          
          {isCompleted && (
            <div className="completion-message" role="status" aria-live="polite">
              <span className="completion-text">Completed</span>
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Status Updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading && "Card is loading"}
        {error && `Error: ${error}`}
        {isCompleted && "Card completed"}
        {isActive && !isCompleted && "Card is active"}
      </div>
    </motion.div>
  );
};

export default BaseCard;