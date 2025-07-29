/**
 * ErrorState.jsx
 * Reusable error state component for displaying friendly error messages
 * with retry options and graceful degradation
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: #fff;
  border: 1px solid #f8d7da;
  border-radius: 8px;
  margin: 1rem 0;
  min-height: 200px;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
  color: #dc3545;
`;

const ErrorTitle = styled.h3`
  color: #721c24;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: #721c24;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 400px;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorButton = styled(motion.button)`
  background: ${props => props.primary ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#c82333' : '#5a6268'};
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorDetails = styled.details`
  margin-top: 1.5rem;
  text-align: left;
  max-width: 100%;
  
  summary {
    cursor: pointer;
    color: #6c757d;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    
    &:hover {
      color: #495057;
    }
  }
  
  pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.75rem;
    color: #6c757d;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
  }
`;

const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an unexpected issue. Please try again.",
  error = null,
  onRetry = null,
  onFallback = null,
  onReport = null,
  retryText = "Try Again",
  fallbackText = "Continue Anyway",
  reportText = "Report Issue",
  showDetails = false,
  testId = "error-state",
  className = "",
  icon = "⚠️",
  type = "error" // error, warning, info
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReport = () => {
    if (!onReport) return;
    
    const errorReport = {
      title,
      message,
      error: error?.toString(),
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    onReport(errorReport);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          borderColor: '#ffeaa7',
          backgroundColor: '#fffbf0',
          iconColor: '#fdcb6e',
          titleColor: '#8b6914',
          messageColor: '#8b6914'
        };
      case 'info':
        return {
          borderColor: '#74b9ff',
          backgroundColor: '#f0f8ff',
          iconColor: '#0984e3',
          titleColor: '#2d3748',
          messageColor: '#4a5568'
        };
      default: // error
        return {
          borderColor: '#f8d7da',
          backgroundColor: '#fff',
          iconColor: '#dc3545',
          titleColor: '#721c24',
          messageColor: '#721c24'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const containerVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <ErrorContainer
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
      data-testid={testId}
      role="alert"
      aria-live="polite"
      style={{
        borderColor: typeStyles.borderColor,
        backgroundColor: typeStyles.backgroundColor
      }}
    >
      <ErrorIcon style={{ color: typeStyles.iconColor }}>
        {icon}
      </ErrorIcon>
      
      <ErrorTitle style={{ color: typeStyles.titleColor }}>
        {title}
      </ErrorTitle>
      
      <ErrorMessage style={{ color: typeStyles.messageColor }}>
        {message}
      </ErrorMessage>
      
      <ErrorActions>
        {onRetry && (
          <ErrorButton
            primary
            onClick={handleRetry}
            disabled={isRetrying}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            data-testid={`${testId}-retry`}
            aria-label={isRetrying ? "Retrying..." : retryText}
          >
            {isRetrying ? "Retrying..." : retryText}
          </ErrorButton>
        )}
        
        {onFallback && (
          <ErrorButton
            onClick={onFallback}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            data-testid={`${testId}-fallback`}
          >
            {fallbackText}
          </ErrorButton>
        )}
        
        {onReport && (
          <ErrorButton
            onClick={handleReport}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            data-testid={`${testId}-report`}
          >
            {reportText}
          </ErrorButton>
        )}
      </ErrorActions>
      
      {showDetails && error && process.env.NODE_ENV === 'development' && (
        <ErrorDetails>
          <summary>Error Details (Development)</summary>
          <pre>
            <strong>Error:</strong> {error.toString()}
            
            {error.stack && (
              <>
                <strong>Stack Trace:</strong>
                {error.stack}
              </>
            )}
            
            <strong>Timestamp:</strong> {new Date().toISOString()}
          </pre>
        </ErrorDetails>
      )}
    </ErrorContainer>
  );
};

export default ErrorState;