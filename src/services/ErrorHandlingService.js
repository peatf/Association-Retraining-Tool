/**
 * ErrorHandlingService.js
 * Enhanced error handling service for React components
 * Provides graceful degradation and recovery mechanisms
 */

class ErrorHandlingService {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.retryAttempts = new Map(); // Track retry attempts per error type
    this.maxRetries = 3;
    this.fallbackContent = this.initializeFallbackContent();
    this.errorListeners = new Set();
    
    // Initialize error reporting
    this.setupGlobalErrorHandling();
  }

  /**
   * Initialize fallback content for various scenarios
   */
  initializeFallbackContent() {
    return {
      contentService: {
        categories: ['Money', 'Relationships', 'Self-Image'],
        subcategories: {
          'Money': ['Financial Security', 'Abundance', 'Career'],
          'Relationships': ['Self-Love', 'Communication', 'Boundaries'],
          'Self-Image': ['Self-Worth', 'Confidence', 'Growth']
        },
        miningPrompts: {
          neutralize: [
            "What if this thought is just information, not truth?",
            "Can I observe this thought without becoming it?",
            "What would I tell a friend having this thought?",
            "Is this thought helping or hurting me right now?",
            "What if I could hold this thought more lightly?"
          ],
          commonGround: [
            "What is this thought trying to protect me from?",
            "When did I first learn to think this way?",
            "What positive intention might be behind this thought?",
            "How has this thought served me in the past?",
            "What does this thought want me to know?"
          ],
          dataExtraction: [
            "Is this thought about the past or the future?",
            "Does this thought make me feel expanded or contracted?",
            "Is this thought based on facts or assumptions?",
            "Does this thought move me toward or away from my goals?",
            "Is this thought coming from fear or love?"
          ]
        },
        replacementThoughts: [
          "I am learning and growing every day.",
          "I can handle whatever comes my way.",
          "This feeling is temporary and will pass.",
          "I choose thoughts that serve my wellbeing.",
          "I am worthy of love and respect."
        ]
      },
      ui: {
        loadingMessages: [
          "Preparing your experience...",
          "Loading therapeutic content...",
          "Setting up your session...",
          "Almost ready..."
        ],
        errorMessages: {
          generic: "We encountered a temporary issue. Your progress has been saved.",
          contentLoading: "Unable to load content right now. Using backup guidance.",
          networkError: "Connection issue detected. Working in offline mode.",
          modelLoading: "AI features temporarily unavailable. Core functionality remains."
        }
      }
    };
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled Promise Rejection', event.reason, {
        promise: event.promise,
        url: window.location.href
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError('Global JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    });
  }

  /**
   * Handle content service errors with fallback
   */
  async handleContentServiceError(operation, error, params = {}) {
    const errorKey = `contentService_${operation}`;
    this.logError('Content Service', error, { operation, params });

    // Check retry attempts
    const attempts = this.retryAttempts.get(errorKey) || 0;
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(errorKey, attempts + 1);
      
      // Provide retry mechanism
      return {
        success: false,
        canRetry: true,
        retryCount: attempts + 1,
        fallbackData: this.getFallbackContentData(operation, params),
        error: this.createUserFriendlyError(error, operation)
      };
    }

    // Max retries reached, provide fallback
    return {
      success: false,
      canRetry: false,
      fallbackData: this.getFallbackContentData(operation, params),
      error: this.createUserFriendlyError(error, operation),
      useFallback: true
    };
  }

  /**
   * Get fallback content data based on operation
   */
  getFallbackContentData(operation, params) {
    const { contentService } = this.fallbackContent;
    
    switch (operation) {
      case 'getCategories':
        return contentService.categories;
        
      case 'getSubcategories':
        return contentService.subcategories[params.category] || [];
        
      case 'getMiningPrompts':
        return contentService.miningPrompts[params.type] || [];
        
      case 'getReplacementThoughts':
        return contentService.replacementThoughts;
        
      default:
        return [];
    }
  }

  /**
   * Handle component errors with recovery options
   */
  handleComponentError(componentName, error, context = {}) {
    this.logError('Component Error', error, { componentName, ...context });

    const errorInfo = {
      title: this.getErrorTitle(componentName, error),
      message: this.getErrorMessage(componentName, error),
      canRetry: this.canRetryError(error),
      canFallback: this.canFallbackError(componentName),
      recoveryOptions: this.getRecoveryOptions(componentName, error)
    };

    // Notify error listeners
    this.notifyErrorListeners({
      type: 'component',
      componentName,
      error,
      context,
      errorInfo
    });

    return errorInfo;
  }

  /**
   * Handle session errors with preservation
   */
  handleSessionError(error, sessionData = {}) {
    this.logError('Session Error', error, { sessionData });

    // Preserve session data
    try {
      const preservedData = {
        timestamp: Date.now(),
        sessionData,
        error: error.message,
        recovery: true
      };
      
      localStorage.setItem('clarity_canvas_recovery', JSON.stringify(preservedData));
    } catch (storageError) {
      console.warn('Could not preserve session data:', storageError);
    }

    return {
      title: "Session Issue Detected",
      message: "Your progress has been saved. You can continue from where you left off.",
      canRecover: true,
      preservedData: sessionData
    };
  }

  /**
   * Create user-friendly error messages
   */
  createUserFriendlyError(error, context = '') {
    const baseMessage = this.fallbackContent.ui.errorMessages;
    
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return {
        title: "Connection Issue",
        message: baseMessage.networkError,
        type: 'warning',
        icon: '📡'
      };
    }
    
    if (error.message.includes('content') || context.includes('content')) {
      return {
        title: "Content Loading Issue",
        message: baseMessage.contentLoading,
        type: 'warning',
        icon: '📄'
      };
    }
    
    if (error.message.includes('model') || context.includes('model')) {
      return {
        title: "AI Features Unavailable",
        message: baseMessage.modelLoading,
        type: 'info',
        icon: '🤖'
      };
    }
    
    return {
      title: "Temporary Issue",
      message: baseMessage.generic,
      type: 'error',
      icon: '⚠️'
    };
  }

  /**
   * Get error title based on component and error
   */
  getErrorTitle(componentName, error) {
    const componentTitles = {
      'BaseCard': 'Card Loading Issue',
      'Canvas': 'Canvas Display Issue',
      'ThoughtMining': 'Mining Process Issue',
      'ThoughtPicker': 'Thought Selection Issue',
      'ReadinessGate': 'Readiness Check Issue'
    };
    
    return componentTitles[componentName] || 'Component Issue';
  }

  /**
   * Get error message based on component and error
   */
  getErrorMessage(componentName, error) {
    const componentMessages = {
      'BaseCard': 'This card encountered an issue loading its content. You can try again or skip to continue.',
      'Canvas': 'The canvas layout had a display issue. Your progress is saved.',
      'ThoughtMining': 'The thought mining process encountered an issue. Your insights are preserved.',
      'ThoughtPicker': 'The thought selection tool had an issue. You can try again or continue with manual input.',
      'ReadinessGate': 'The readiness assessment had an issue. You can proceed directly to the main experience.'
    };
    
    return componentMessages[componentName] || 'This component encountered an unexpected issue.';
  }

  /**
   * Determine if error can be retried
   */
  canRetryError(error) {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'AbortError',
      'TypeError' // Often network-related
    ];
    
    return retryableErrors.some(type => 
      error.name === type || 
      error.message.toLowerCase().includes(type.toLowerCase()) ||
      error.toString().toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Determine if component can fallback
   */
  canFallbackError(componentName) {
    const fallbackComponents = [
      'BaseCard',
      'ThoughtMining', 
      'ThoughtPicker',
      'Canvas'
    ];
    
    return fallbackComponents.includes(componentName);
  }

  /**
   * Get recovery options for component
   */
  getRecoveryOptions(componentName, error) {
    const options = [];
    
    if (this.canRetryError(error)) {
      options.push({
        type: 'retry',
        label: 'Try Again',
        action: 'retry'
      });
    }
    
    if (this.canFallbackError(componentName)) {
      options.push({
        type: 'fallback',
        label: 'Continue Anyway',
        action: 'fallback'
      });
    }
    
    options.push({
      type: 'report',
      label: 'Report Issue',
      action: 'report'
    });
    
    return options;
  }

  /**
   * Log error with context
   */
  logError(category, error, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      category,
      error: {
        name: error?.name || 'Unknown',
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack
      },
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(errorEntry);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    console.error(`[ErrorHandlingService] ${category}:`, error, context);
  }

  /**
   * Add error listener
   */
  addErrorListener(listener) {
    this.errorListeners.add(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener) {
    this.errorListeners.delete(listener);
  }

  /**
   * Notify error listeners
   */
  notifyErrorListeners(errorEvent) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorEvent);
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError);
      }
    });
  }

  /**
   * Clear retry attempts for successful operations
   */
  clearRetryAttempts(operation) {
    this.retryAttempts.delete(operation);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const categories = {};
    const recentErrors = this.errorLog.filter(
      entry => Date.now() - entry.timestamp < 300000 // Last 5 minutes
    );

    this.errorLog.forEach(entry => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      categories,
      retryAttempts: Object.fromEntries(this.retryAttempts),
      isHealthy: recentErrors.length < 5
    };
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog() {
    return {
      timestamp: Date.now(),
      stats: this.getErrorStats(),
      errors: this.errorLog.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        category: entry.category,
        error: {
          name: entry.error.name,
          message: entry.error.message
        },
        context: {
          ...entry.context,
          // Remove potentially sensitive data
          sessionData: entry.context.sessionData ? '[PRESERVED]' : undefined
        }
      }))
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.retryAttempts.clear();
    console.log('[ErrorHandlingService] Error log cleared');
  }

  /**
   * Check if system is healthy
   */
  isSystemHealthy() {
    const stats = this.getErrorStats();
    return stats.isHealthy && stats.recentErrors < 3;
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;