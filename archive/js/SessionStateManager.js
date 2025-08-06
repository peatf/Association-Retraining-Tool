/**
 * SessionStateManager - Handles transient, memory-only session storage
 * All data is stored in memory and automatically cleared on session end or page refresh
 * No persistent storage or tracking - privacy-first design
 */
class SessionStateManager {
    constructor() {
        this.sessionData = {};
        this.initialized = false;
        this.errorHandlers = [];
        
        // Automatically clear session on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSession();
        });
        
        // Clear session on page visibility change (tab switch, etc.)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.clearSession();
            }
        });
        
        // Handle unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });
    }

    /**
     * Initialize a new session with default state
     */
    initializeSession() {
        this.sessionData = {
            currentScreen: 'landing',
            intensity: null,
            selectedTopic: null,
            selectedEmotion: null,
            userText: null,
            extractedKeywords: [],
            selectedSubtopic: null,
            currentTechnique: null,
            journeySequence: [],
            currentStep: 0,
            totalSteps: 0,
            alternativeAngleClicks: 0,
            completionSummary: null,
            sessionStartTime: Date.now()
        };
        
        this.initialized = true;
        console.log('Session initialized with privacy-first memory storage');
        return this.sessionData;
    }

    /**
     * Update a specific key in the session state
     * @param {string} key - The key to update
     * @param {any} value - The value to set
     */
    updateState(key, value) {
        if (!this.initialized) {
            this.initializeSession();
        }
        
        this.sessionData[key] = value;
        console.log(`Session state updated: ${key}`, value);
    }

    /**
     * Get the current session state
     * @returns {Object} Current session state
     */
    getCurrentState() {
        if (!this.initialized) {
            return this.initializeSession();
        }
        
        return { ...this.sessionData }; // Return a copy to prevent external mutation
    }

    /**
     * Get a specific value from session state
     * @param {string} key - The key to retrieve
     * @returns {any} The value for the key
     */
    getState(key) {
        if (!this.initialized) {
            this.initializeSession();
        }
        
        return this.sessionData[key];
    }

    /**
     * Check if session is initialized
     * @returns {boolean} True if session is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Clear all session data - called automatically on page unload
     * This ensures no user data persists beyond the session
     */
    clearSession() {
        if (this.initialized) {
            console.log('Clearing session data for privacy protection');
            
            // Overwrite sensitive data before clearing
            Object.keys(this.sessionData).forEach(key => {
                if (typeof this.sessionData[key] === 'string') {
                    this.sessionData[key] = '';
                } else if (Array.isArray(this.sessionData[key])) {
                    this.sessionData[key] = [];
                } else {
                    this.sessionData[key] = null;
                }
            });
            
            this.sessionData = {};
            this.initialized = false;
        }
    }

    /**
     * Get session duration in milliseconds
     * @returns {number} Session duration
     */
    getSessionDuration() {
        if (!this.initialized || !this.sessionData.sessionStartTime) {
            return 0;
        }
        
        return Date.now() - this.sessionData.sessionStartTime;
    }

    /**
     * Reset session to initial state (useful for starting over)
     */
    resetSession() {
        this.clearSession();
        return this.initializeSession();
    }

    /**
     * Add an error handler callback
     * @param {Function} handler - Error handler function
     */
    addErrorHandler(handler) {
        if (typeof handler === 'function') {
            this.errorHandlers.push(handler);
        }
    }

    /**
     * Remove an error handler callback
     * @param {Function} handler - Error handler function to remove
     */
    removeErrorHandler(handler) {
        const index = this.errorHandlers.indexOf(handler);
        if (index > -1) {
            this.errorHandlers.splice(index, 1);
        }
    }

    /**
     * Handle errors and notify registered handlers
     * @param {string} type - Error type
     * @param {Error|any} error - Error object or message
     */
    handleError(type, error) {
        const errorInfo = {
            type,
            error,
            timestamp: Date.now(),
            sessionDuration: this.getSessionDuration(),
            currentScreen: this.getState('currentScreen'),
            userAgent: navigator.userAgent
        };

        console.error(`[SessionStateManager] ${type}:`, error);

        // Notify all registered error handlers
        this.errorHandlers.forEach(handler => {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        });
    }

    /**
     * Validate session state integrity
     * @returns {boolean} True if session state is valid
     */
    validateSessionState() {
        try {
            if (!this.initialized) {
                return false;
            }

            // Check for required properties
            const requiredProps = ['currentScreen', 'sessionStartTime'];
            for (const prop of requiredProps) {
                if (!(prop in this.sessionData)) {
                    this.handleError('Session Validation', new Error(`Missing required property: ${prop}`));
                    return false;
                }
            }

            // Validate screen state
            const validScreens = [
                'landing', 'readiness', 'topic', 'emotion', 'starting-text', 
                'model-loading', 'journey', 'act-defusion', 'completion', 'calendar'
            ];
            
            if (!validScreens.includes(this.sessionData.currentScreen)) {
                this.handleError('Session Validation', new Error(`Invalid screen state: ${this.sessionData.currentScreen}`));
                return false;
            }

            return true;
        } catch (error) {
            this.handleError('Session Validation', error);
            return false;
        }
    }

    /**
     * Safely update state with validation
     * @param {string} key - The key to update
     * @param {any} value - The value to set
     * @returns {boolean} True if update was successful
     */
    safeUpdateState(key, value) {
        try {
            if (!this.initialized) {
                this.initializeSession();
            }

            // Validate key
            if (typeof key !== 'string' || key.length === 0) {
                throw new Error('Invalid key provided for state update');
            }

            // Store previous value for rollback
            const previousValue = this.sessionData[key];

            // Update state
            this.sessionData[key] = value;

            // Validate state after update
            if (!this.validateSessionState()) {
                // Rollback on validation failure
                this.sessionData[key] = previousValue;
                return false;
            }

            console.log(`Session state safely updated: ${key}`, value);
            return true;
        } catch (error) {
            this.handleError('State Update', error);
            return false;
        }
    }

    /**
     * Get session health information
     * @returns {Object} Session health data
     */
    getSessionHealth() {
        return {
            initialized: this.initialized,
            isValid: this.validateSessionState(),
            duration: this.getSessionDuration(),
            currentScreen: this.getState('currentScreen'),
            dataSize: JSON.stringify(this.sessionData).length,
            errorHandlerCount: this.errorHandlers.length
        };
    }
}

export default SessionStateManager;