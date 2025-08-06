/**
 * ModelLoadingManager - Manages the model loading UI experience
 * Provides therapeutic messaging and smooth progress updates during model initialization
 */

class ModelLoadingManager {
    constructor() {
        this.loadingScreen = null;
        this.progressFill = null;
        this.progressPercentage = null;
        this.loadingMessage = null;
        this.currentProgress = 0;
        this.isVisible = false;
        
        // Therapeutic loading messages
        this.loadingMessages = [
            "Warming up the engine...",
            "Preparing your personalized experience...",
            "Setting up privacy-first processing...",
            "Calibrating therapeutic understanding...",
            "Loading compassionate intelligence...",
            "Initializing mindful responses...",
            "Preparing thoughtful guidance...",
            "Setting up secure processing...",
            "Almost ready to begin your journey...",
            "Finalizing your private therapeutic space..."
        ];
        
        this.init();
    }

    /**
     * Initialize the loading manager and get DOM references
     */
    init() {
        this.loadingScreen = document.getElementById('screen-model-loading');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.loadingMessage = document.getElementById('loading-message');
        
        if (!this.loadingScreen) {
            console.error('Model loading screen not found in DOM');
            return;
        }
        
        console.log('ModelLoadingManager initialized');
    }

    /**
     * Display the loading screen with initial setup
     */
    displayLoadingIndicator() {
        if (!this.loadingScreen) {
            console.error('Loading screen not available');
            return;
        }

        // Hide all other screens
        const allScreens = document.querySelectorAll('#app-container > div');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show loading screen
        this.loadingScreen.classList.add('active');
        this.isVisible = true;
        
        // Reset progress
        this.updateProgress(0, this.loadingMessages[0]);
        
        console.log('Model loading screen displayed');
    }

    /**
     * Update the progress bar and message
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} message - Optional custom message
     */
    updateProgress(percentage, message = null) {
        if (!this.isVisible || !this.progressFill || !this.progressPercentage) {
            return;
        }

        // Ensure percentage is within bounds
        percentage = Math.max(0, Math.min(100, percentage));
        this.currentProgress = percentage;

        // Update progress bar
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${Math.round(percentage)}%`;

        // Update message
        if (message) {
            this.updateMessage(message);
        } else {
            // Use contextual message based on progress
            const messageIndex = Math.min(
                Math.floor((percentage / 100) * this.loadingMessages.length),
                this.loadingMessages.length - 1
            );
            this.updateMessage(this.loadingMessages[messageIndex]);
        }

        console.log(`Model loading progress: ${percentage}% - ${this.loadingMessage?.textContent || 'No message'}`);
    }

    /**
     * Update the loading message with smooth transition
     * @param {string} message - Message to display
     */
    updateMessage(message) {
        if (!this.loadingMessage) {
            return;
        }

        // Fade out current message
        this.loadingMessage.style.opacity = '0';
        
        setTimeout(() => {
            this.loadingMessage.textContent = message;
            this.loadingMessage.style.opacity = '1';
        }, 150);
    }

    /**
     * Hide the loading screen and transition to next screen
     * @param {string} nextScreenId - ID of the next screen to show
     */
    hideLoadingIndicator(nextScreenId = 'screen-journey') {
        if (!this.isVisible) {
            return;
        }

        // Ensure we're at 100% before hiding
        this.updateProgress(100, "Ready! Let's begin your journey...");
        
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.remove('active');
            }
            
            // Show next screen
            const nextScreen = document.getElementById(nextScreenId);
            if (nextScreen) {
                nextScreen.classList.add('active');
            }
            
            this.isVisible = false;
            console.log('Model loading screen hidden, transitioning to:', nextScreenId);
        }, 800); // Brief delay to show completion
    }

    /**
     * Handle loading errors gracefully
     * @param {Error} error - The error that occurred
     */
    handleLoadingError(error) {
        console.error('Model loading error:', error);
        
        if (!this.isVisible) {
            return;
        }

        // Update UI to show error state
        this.updateMessage("Having trouble loading the model. Falling back to basic mode...");
        
        // After a brief delay, continue with fallback
        setTimeout(() => {
            this.hideLoadingIndicator('screen-journey');
        }, 2000);
    }

    /**
     * Generate encouraging progress messages based on current progress
     * @param {number} progress - Current progress percentage
     * @returns {string} Contextual message
     */
    generateProgressMessage(progress) {
        if (progress < 10) {
            return "Initializing secure environment...";
        } else if (progress < 25) {
            return "Loading therapeutic intelligence...";
        } else if (progress < 50) {
            return "Preparing personalized responses...";
        } else if (progress < 75) {
            return "Calibrating empathetic understanding...";
        } else if (progress < 95) {
            return "Almost ready for your journey...";
        } else {
            return "Ready! Let's begin...";
        }
    }

    /**
     * Get current loading progress
     * @returns {number} Current progress percentage
     */
    getCurrentProgress() {
        return this.currentProgress;
    }

    /**
     * Check if loading screen is currently visible
     * @returns {boolean} True if loading screen is visible
     */
    isLoadingVisible() {
        return this.isVisible;
    }

    /**
     * Reset the loading manager state
     */
    reset() {
        this.currentProgress = 0;
        this.isVisible = false;
        
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        
        if (this.progressPercentage) {
            this.progressPercentage.textContent = '0%';
        }
        
        if (this.loadingMessage) {
            this.loadingMessage.textContent = this.loadingMessages[0];
        }
        
        console.log('ModelLoadingManager reset');
    }
}

export default ModelLoadingManager;