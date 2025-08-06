// ErrorHandler.js
// Comprehensive error handling for potential issues like content loading failures or NLP processing errors
// Provides graceful fallbacks and user-friendly error messages

class ErrorHandler {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
        this.errorLog = [];
        this.maxLogSize = 50; // Keep last 50 errors
        this.fallbackContent = this.initializeFallbackContent();
        
        // Register with session manager
        if (sessionManager) {
            sessionManager.addErrorHandler(this.handleSessionError.bind(this));
        }
    }

    /**
     * Initialize fallback content for various error scenarios
     */
    initializeFallbackContent() {
        return {
            therapeutic: {
                generic: [
                    "It's okay to feel uncertain right now. Your willingness to explore your thoughts shows strength.",
                    "Take a moment to breathe. You don't need to have everything figured out.",
                    "Your feelings are valid, even when they're difficult to understand.",
                    "This moment of challenge is temporary and will pass.",
                    "You are worthy of compassion, especially from yourself."
                ],
                completion: "You've taken time to reflect on your thoughts and feelings. That's a meaningful step toward emotional wellness."
            },
            topics: {
                'Money': { palette: ['anxious', 'overwhelmed', 'worried', 'stressed'] },
                'Romance': { palette: ['lonely', 'uncertain', 'hopeful', 'confused'] },
                'Self-Image': { palette: ['self-critical', 'uncertain', 'reflective', 'growing'] }
            },
            loading: {
                messages: [
                    "Setting up your experience...",
                    "Preparing personalized content...",
                    "Almost ready...",
                    "Finalizing setup..."
                ]
            }
        };
    }

    /**
     * Handle content loading failures
     * @param {string} contentType - Type of content that failed to load
     * @param {Error} error - The error that occurred
     * @returns {any} Fallback content
     */
    handleContentLoadingError(contentType, error) {
        this.logError('Content Loading', error, { contentType });

        switch (contentType) {
            case 'topics':
                return {
                    topics: ['Money', 'Romance', 'Self-Image'],
                    topicDescriptions: {
                        'Money': 'Financial concerns and abundance mindset',
                        'Romance': 'Relationships and emotional connections',
                        'Self-Image': 'Self-worth and personal identity'
                    },
                    topicIcons: {
                        'Money': '💰',
                        'Romance': '💕',
                        'Self-Image': '🪞'
                    }
                };

            case 'emotions':
                return this.fallbackContent.topics;

            case 'therapeutic':
                return {
                    'Money': {
                        'Scarcity': {
                            cbtSequence: [
                                {
                                    step: 1,
                                    prompt: "What's one piece of evidence that you have managed resources effectively in the past?",
                                    type: "socratic"
                                },
                                {
                                    step: 2,
                                    prompt: "Instead of 'There is never enough', could the thought be 'I can work with what I have'?",
                                    type: "cbt"
                                }
                            ]
                        }
                    }
                };

            case 'thought-buffet':
                return {
                    generic_fallback: this.fallbackContent.therapeutic.generic
                };

            default:
                return this.fallbackContent.therapeutic.generic;
        }
    }

    /**
     * Handle NLP processing errors
     * @param {Error} error - The NLP error
     * @param {string} userText - The text that failed to process
     * @returns {Object} Fallback response
     */
    handleNLPError(error, userText = '') {
        this.logError('NLP Processing', error, { 
            userTextLength: userText.length,
            hasUserText: userText.length > 0
        });

        // Return generic fallback content for NLP failures
        return {
            classification: 'generic_fallback',
            confidence: 0.0,
            content: this.fallbackContent.therapeutic.generic,
            fallbackReason: 'NLP processing unavailable'
        };
    }

    /**
     * Handle model loading errors
     * @param {Error} error - The model loading error
     * @returns {Object} Fallback response
     */
    handleModelLoadingError(error) {
        this.logError('Model Loading', error);

        return {
            shouldUseFallback: true,
            fallbackMessage: "We'll use our built-in therapeutic content to provide you with a meaningful experience.",
            userMessage: "Your experience will continue with our carefully crafted therapeutic guidance."
        };
    }

    /**
     * Handle UI/Navigation errors
     * @param {Error} error - The UI error
     * @param {string} currentScreen - Current screen when error occurred
     * @returns {Object} Recovery instructions
     */
    handleUIError(error, currentScreen = 'unknown') {
        this.logError('UI Error', error, { currentScreen });

        // Determine safe screen to navigate to
        const safeScreens = ['landing', 'readiness', 'topic'];
        const fallbackScreen = safeScreens.includes(currentScreen) ? currentScreen : 'landing';

        return {
            shouldResetToScreen: fallbackScreen,
            userMessage: "We've encountered a small issue. Let's continue from a safe point.",
            preserveSession: currentScreen !== 'landing'
        };
    }

    /**
     * Handle calendar generation errors
     * @param {Error} error - The calendar error
     * @param {string} frequency - The frequency that failed
     * @returns {Object} Error response
     */
    handleCalendarError(error, frequency) {
        this.logError('Calendar Generation', error, { frequency });

        return {
            userMessage: `Unable to generate ${frequency} reminders. This might be due to browser restrictions.`,
            suggestion: "You can manually set reminders in your calendar app for emotional wellness check-ins.",
            canRetry: true
        };
    }

    /**
     * Handle session errors from SessionStateManager
     * @param {Object} errorInfo - Error information from session manager
     */
    handleSessionError(errorInfo) {
        this.logError('Session Error', errorInfo.error, {
            sessionDuration: errorInfo.sessionDuration,
            currentScreen: errorInfo.currentScreen
        });

        // For critical session errors, suggest reset
        if (errorInfo.type === 'Session Validation') {
            this.showUserError(
                "We've detected an issue with your session. Would you like to start fresh?",
                'session-reset'
            );
        }
    }

    /**
     * Show user-friendly error message
     * @param {string} message - User-friendly error message
     * @param {string} type - Error type for styling
     */
    showUserError(message, type = 'general') {
        // Create error notification element
        const errorElement = document.createElement('div');
        errorElement.className = `error-notification error-${type}`;
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p class="error-message">${message}</p>
                <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">
                    Dismiss
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(errorElement);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 8000);
    }

    /**
     * Log error with context
     * @param {string} category - Error category
     * @param {Error|any} error - Error object or message
     * @param {Object} context - Additional context
     */
    logError(category, error, context = {}) {
        const errorEntry = {
            timestamp: Date.now(),
            category,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            context,
            sessionHealth: this.sessionManager ? this.sessionManager.getSessionHealth() : null
        };

        this.errorLog.push(errorEntry);

        // Maintain log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        console.error(`[ErrorHandler] ${category}:`, error, context);
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const categories = {};
        this.errorLog.forEach(entry => {
            categories[entry.category] = (categories[entry.category] || 0) + 1;
        });

        return {
            totalErrors: this.errorLog.length,
            categories,
            recentErrors: this.errorLog.slice(-5),
            sessionHealth: this.sessionManager ? this.sessionManager.getSessionHealth() : null
        };
    }

    /**
     * Check if system is in a healthy state
     * @returns {boolean} True if system is healthy
     */
    isSystemHealthy() {
        const recentErrors = this.errorLog.filter(
            entry => Date.now() - entry.timestamp < 60000 // Last minute
        );

        // System is unhealthy if more than 3 errors in the last minute
        return recentErrors.length <= 3;
    }

    /**
     * Get fallback therapeutic content
     * @param {string} type - Type of content needed
     * @returns {any} Fallback content
     */
    getFallbackContent(type = 'generic') {
        switch (type) {
            case 'therapeutic':
                return this.fallbackContent.therapeutic.generic;
            case 'completion':
                return this.fallbackContent.therapeutic.completion;
            case 'loading':
                return this.fallbackContent.loading.messages;
            default:
                return this.fallbackContent.therapeutic.generic;
        }
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('[ErrorHandler] Error log cleared');
    }

    /**
     * Export error log for debugging (removes sensitive data)
     * @returns {Object} Sanitized error log
     */
    exportErrorLog() {
        return {
            timestamp: Date.now(),
            totalErrors: this.errorLog.length,
            errors: this.errorLog.map(entry => ({
                timestamp: entry.timestamp,
                category: entry.category,
                error: typeof entry.error === 'object' ? entry.error.message : entry.error,
                context: {
                    ...entry.context,
                    // Remove any potentially sensitive context
                    userText: entry.context.userText ? '[REDACTED]' : undefined
                }
            }))
        };
    }
}

export default ErrorHandler;