// Garden Error Boundary - Garden-themed error handling with insight preservation
// Gracefully handles errors while maintaining the immersive garden experience

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  errorId: string;
}

// Default garden-themed error fallback
const GardenErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetError, 
  errorId 
}) => {
  return (
    <div 
      className="garden-error-boundary"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, var(--garden-night-primary) 0%, var(--garden-night-secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-garden-dialogs)',
        color: 'var(--garden-moonlight)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          maxWidth: '500px',
          padding: 'var(--garden-spacing-xxl)',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--garden-radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--garden-shadow-strong)',
        }}
      >
        {/* Garden-themed error icon */}
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            fontSize: '4rem',
            marginBottom: 'var(--garden-spacing-lg)',
          }}
        >
          🌱💔
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            margin: 0,
            marginBottom: 'var(--garden-spacing-md)',
            fontSize: '1.5rem',
            fontWeight: 600,
          }}
        >
          A Tender Sprout Has Wilted
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{
            margin: 0,
            marginBottom: 'var(--garden-spacing-lg)',
            fontSize: '1rem',
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        >
          Something unexpected happened in your inner garden. Your insights and progress are safe, 
          and we can help you tend to this together.
        </motion.p>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            style={{
              marginBottom: 'var(--garden-spacing-lg)',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: 'var(--garden-spacing-md)',
              borderRadius: 'var(--garden-radius-md)',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
            }}
          >
            <summary style={{ cursor: 'pointer', marginBottom: 'var(--garden-spacing-sm)' }}>
              Technical Details (Dev Mode)
            </summary>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  <br /><br />
                  <strong>Stack:</strong>
                  <br />
                  {error.stack}
                </>
              )}
            </div>
            <div style={{ marginTop: 'var(--garden-spacing-sm)', opacity: 0.7 }}>
              <strong>Error ID:</strong> {errorId}
            </div>
          </motion.details>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          style={{
            display: 'flex',
            gap: 'var(--garden-spacing-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={resetError}
            className="garden-button"
            style={{
              background: 'var(--garden-moonlight)',
              color: 'var(--garden-night-primary)',
              border: 'none',
              padding: 'var(--garden-spacing-md) var(--garden-spacing-lg)',
              borderRadius: 'var(--garden-radius-md)',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--garden-transition-fast)',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--garden-shadow-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--garden-shadow-soft)';
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              color: 'var(--garden-moonlight)',
              border: '1px solid var(--garden-moonlight)',
              padding: 'var(--garden-spacing-md) var(--garden-spacing-lg)',
              borderRadius: 'var(--garden-radius-md)',
              fontSize: '1rem',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'all var(--garden-transition-fast)',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Fresh Start
          </button>
        </motion.div>

        {/* Gentle encouragement */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            margin: 0,
            marginTop: 'var(--garden-spacing-lg)',
            fontSize: '0.85rem',
            opacity: 0.7,
            fontStyle: 'italic',
          }}
        >
          Even in digital gardens, unexpected weather happens. Your growth continues. 🌿
        </motion.p>
      </motion.div>
    </div>
  );
};

class GardenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `garden_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with garden context
    console.error('Garden Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Preserve user insights in localStorage as backup
    try {
      const gardenState = localStorage.getItem('garden-session-backup');
      if (gardenState) {
        const errorBackup = {
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          gardenState: JSON.parse(gardenState),
          error: {
            message: error.message,
            stack: error.stack,
          },
        };
        localStorage.setItem('garden-error-backup', JSON.stringify(errorBackup));
      }
    } catch (backupError) {
      console.warn('Failed to create error backup:', backupError);
    }

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error monitoring service
      // reportError({
      //   error,
      //   errorInfo,
      //   errorId: this.state.errorId,
      //   context: 'garden-ui',
      // });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallbackComponent || GardenErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId || 'unknown'}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling garden-specific errors in components
export function useGardenErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Garden Error${context ? ` in ${context}` : ''}:`, error);
    
    // Create error report
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Store for debugging
    console.table(errorReport);

    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service
    }
  }, []);

  return { handleError };
}

// Error recovery utilities
export const GardenErrorRecovery = {
  // Attempt to recover garden state from backup
  recoverGardenState: (): any | null => {
    try {
      const backup = localStorage.getItem('garden-session-backup');
      return backup ? JSON.parse(backup) : null;
    } catch {
      return null;
    }
  },

  // Clear error backups
  clearErrorBackups: (): void => {
    try {
      localStorage.removeItem('garden-error-backup');
      localStorage.removeItem('garden-session-backup');
    } catch {
      // Silent fail
    }
  },

  // Check if there's a recoverable error
  hasRecoverableError: (): boolean => {
    try {
      return Boolean(localStorage.getItem('garden-error-backup'));
    } catch {
      return false;
    }
  },
};

export default GardenErrorBoundary;