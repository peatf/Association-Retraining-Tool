// Canvas Error Boundary - Catches React errors and provides recovery
// Preserves user insights and provides graceful error handling

import React from 'react';
import styled from 'styled-components';
import errorHandlingService from '../services/ErrorHandlingService';

interface ErrorButtonProps {
  primary?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  sessionData?: Record<string, any>;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 2rem auto;
  max-width: 600px;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
`;

const ErrorTitle = styled.h2`
  color: #e74c3c;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 500px;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorButton = styled.button<ErrorButtonProps>`
  background: ${props => props.primary ? '#3498db' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#2980b9' : '#5a6268'};
  }
`;

const ErrorDetails = styled.details`
  margin-top: 2rem;
  text-align: left;
  max-width: 100%;
  
  summary {
    cursor: pointer;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.8rem;
    color: #666;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

class CanvasErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Canvas Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Use error handling service to log and handle the error
    const errorContext = {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'CanvasErrorBoundary',
      retryCount: this.state.retryCount,
      props: this.props
    };
    
    errorHandlingService.handleComponentError('CanvasErrorBoundary', error, errorContext);
    
    // Preserve session data
    this.preserveSessionData();
  }
  
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };
  
  handleRestart = () => {
    // Clear any stored session data and reload
    try {
      localStorage.removeItem('clarity_canvas_session');
      window.location.reload();
    } catch (e) {
      // Fallback if localStorage is not available
      window.location.reload();
    }
  };
  
  preserveSessionData = () => {
    try {
      // Get current session data from context or props
      const sessionData = this.props.sessionData || {};
      
      // Use error handling service to preserve session
      if (this.state.error) {
        errorHandlingService.handleSessionError(this.state.error, sessionData);
      }
    } catch (preservationError) {
      console.warn('Could not preserve session data:', preservationError);
    }
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      errorStats: errorHandlingService.getErrorStats()
    };
    
    // Use error handling service to log the report
    errorHandlingService.logError('Error Report Generated', errorReport);
    
    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. You can share this with support if needed.');
      })
      .catch(() => {
        // Fallback: show error in a new window
        const errorWindow = window.open('', '_blank');
        if (errorWindow) {
          errorWindow.document.write(`
            <html>
              <head><title>Error Report</title></head>
              <body>
                <h2>Clarity Canvas Error Report</h2>
                <pre>${JSON.stringify(errorReport, null, 2)}</pre>
              </body>
            </html>
          `);
        }
      });
  };
  
  render() {
    if (this.state.hasError) {
      const isRepeatedError = this.state.retryCount > 2;
      
      return (
        <ErrorContainer data-testid="error-boundary">
          <ErrorIcon>⚠️</ErrorIcon>
          
          <ErrorTitle>
            {isRepeatedError ? 'Persistent Issue Detected' : 'Something went wrong'}
          </ErrorTitle>
          
          <ErrorMessage>
            {isRepeatedError 
              ? 'The canvas encountered repeated errors. Your insights have been preserved, but you may need to restart your session.'
              : 'We encountered an unexpected issue with the canvas interface. Your insights have been preserved and you can try again.'
            }
          </ErrorMessage>
          
          <ErrorActions>
            {!isRepeatedError && (
              <ErrorButton 
                primary 
                onClick={this.handleRetry}
                data-testid="retry-button"
              >
                Try Again
              </ErrorButton>
            )}
            
            <ErrorButton 
              onClick={this.handleRestart}
              data-testid="restart-button"
            >
              Restart Session
            </ErrorButton>
            
            <ErrorButton 
              onClick={this.handleReportError}
              data-testid="report-error-button"
            >
              Report Issue
            </ErrorButton>
          </ErrorActions>
          
          {process.env.NODE_ENV === 'development' && (
            <ErrorDetails>
              <summary>Error Details (Development)</summary>
              <pre>
                <strong>Error:</strong> {this.state.error?.toString()}
                
                <strong>Stack:</strong>
                {this.state.error?.stack}
                
                <strong>Component Stack:</strong>
                {this.state.errorInfo?.componentStack}
              </pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }
    
    return this.props.children;
  }
}

export default CanvasErrorBoundary;