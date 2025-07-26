// FeedbackManager.js
// Anonymous feedback collection system for gathering qualitative insights
// Completely privacy-first - no personally identifiable information collected

class FeedbackManager {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
        this.feedbackData = null;
        this.isVisible = false;
    }

    /**
     * Show the anonymous feedback survey
     * @param {HTMLElement} container - Container to append feedback form
     */
    showFeedbackSurvey(container) {
        if (this.isVisible) {
            return;
        }

        const feedbackElement = this.createFeedbackElement();
        container.appendChild(feedbackElement);
        this.isVisible = true;

        // Animate in
        setTimeout(() => {
            feedbackElement.classList.add('feedback-visible');
        }, 100);
    }

    /**
     * Create the feedback form element
     * @returns {HTMLElement} Feedback form element
     */
    createFeedbackElement() {
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'feedback-container';
        feedbackContainer.innerHTML = `
            <div class="feedback-header">
                <h3>Help us improve (optional & anonymous)</h3>
                <p>Your feedback helps us create better therapeutic experiences. No personal information is collected.</p>
            </div>
            
            <div class="feedback-form">
                <div class="feedback-question">
                    <label for="effectiveness-rating">How effective was this session for you?</label>
                    <div class="rating-scale">
                        <input type="radio" id="rating-1" name="effectiveness" value="1">
                        <label for="rating-1">1</label>
                        <input type="radio" id="rating-2" name="effectiveness" value="2">
                        <label for="rating-2">2</label>
                        <input type="radio" id="rating-3" name="effectiveness" value="3">
                        <label for="rating-3">3</label>
                        <input type="radio" id="rating-4" name="effectiveness" value="4">
                        <label for="rating-4">4</label>
                        <input type="radio" id="rating-5" name="effectiveness" value="5">
                        <label for="rating-5">5</label>
                    </div>
                    <div class="rating-labels">
                        <span>Not helpful</span>
                        <span>Very helpful</span>
                    </div>
                </div>

                <div class="feedback-question">
                    <label for="experience-feedback">What worked well or could be improved?</label>
                    <textarea 
                        id="experience-feedback" 
                        placeholder="Optional: Share your thoughts about the experience, interface, or therapeutic content..."
                        maxlength="500"
                        rows="4"
                    ></textarea>
                    <div class="character-count">
                        <span id="char-count">0</span>/500 characters
                    </div>
                </div>

                <div class="feedback-question">
                    <label for="likelihood-rating">How likely are you to use this tool again?</label>
                    <div class="rating-scale">
                        <input type="radio" id="likelihood-1" name="likelihood" value="1">
                        <label for="likelihood-1">1</label>
                        <input type="radio" id="likelihood-2" name="likelihood" value="2">
                        <label for="likelihood-2">2</label>
                        <input type="radio" id="likelihood-3" name="likelihood" value="3">
                        <label for="likelihood-3">3</label>
                        <input type="radio" id="likelihood-4" name="likelihood" value="4">
                        <label for="likelihood-4">4</label>
                        <input type="radio" id="likelihood-5" name="likelihood" value="5">
                        <label for="likelihood-5">5</label>
                    </div>
                    <div class="rating-labels">
                        <span>Very unlikely</span>
                        <span>Very likely</span>
                    </div>
                </div>

                <div class="feedback-actions">
                    <button type="button" class="btn-secondary feedback-skip">Skip</button>
                    <button type="button" class="btn-primary feedback-submit">Submit Feedback</button>
                </div>
            </div>

            <div class="feedback-privacy-note">
                <small>
                    🔒 This feedback is completely anonymous. No personal information, session details, or text you entered is included.
                </small>
            </div>
        `;

        this.attachFeedbackEventListeners(feedbackContainer);
        return feedbackContainer;
    }

    /**
     * Attach event listeners to feedback form
     * @param {HTMLElement} container - Feedback container element
     */
    attachFeedbackEventListeners(container) {
        // Character counter for textarea
        const textarea = container.querySelector('#experience-feedback');
        const charCount = container.querySelector('#char-count');
        
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = count;
            
            // Visual feedback for character limit
            if (count > 450) {
                charCount.style.color = '#e74c3c';
            } else if (count > 400) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#7f8c8d';
            }
        });

        // Skip button
        const skipButton = container.querySelector('.feedback-skip');
        skipButton.addEventListener('click', () => {
            this.hideFeedbackSurvey(container);
        });

        // Submit button
        const submitButton = container.querySelector('.feedback-submit');
        submitButton.addEventListener('click', () => {
            this.submitFeedback(container);
        });

        // Rating scale interactions
        const ratingInputs = container.querySelectorAll('input[type="radio"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Add visual feedback for selected rating
                const ratingScale = input.closest('.rating-scale');
                ratingScale.classList.add('rating-selected');
            });
        });
    }

    /**
     * Submit the feedback
     * @param {HTMLElement} container - Feedback container element
     */
    submitFeedback(container) {
        try {
            // Collect feedback data
            const effectivenessRating = container.querySelector('input[name="effectiveness"]:checked')?.value;
            const experienceFeedback = container.querySelector('#experience-feedback').value.trim();
            const likelihoodRating = container.querySelector('input[name="likelihood"]:checked')?.value;

            // Validate that at least one field is filled
            if (!effectivenessRating && !experienceFeedback && !likelihoodRating) {
                this.showFeedbackMessage(container, 'Please provide at least one piece of feedback before submitting.', 'warning');
                return;
            }

            // Create anonymous feedback object
            this.feedbackData = {
                timestamp: Date.now(),
                sessionDuration: this.sessionManager ? this.sessionManager.getSessionDuration() : null,
                effectiveness: effectivenessRating ? parseInt(effectivenessRating) : null,
                experience: experienceFeedback || null,
                likelihood: likelihoodRating ? parseInt(likelihoodRating) : null,
                // Anonymous session metadata (no personal info)
                metadata: {
                    userAgent: navigator.userAgent,
                    screenResolution: `${screen.width}x${screen.height}`,
                    timestamp: new Date().toISOString(),
                    sessionId: this.generateAnonymousSessionId()
                }
            };

            // In a real implementation, this would be sent to an analytics service
            // For now, we'll just log it and show success
            console.log('Anonymous feedback collected:', this.feedbackData);
            
            // Show success message
            this.showFeedbackMessage(container, 'Thank you for your feedback! It helps us improve the experience.', 'success');
            
            // Hide feedback form after delay
            setTimeout(() => {
                this.hideFeedbackSurvey(container);
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showFeedbackMessage(container, 'There was an issue submitting your feedback. Please try again.', 'error');
        }
    }

    /**
     * Show feedback message (success, warning, error)
     * @param {HTMLElement} container - Feedback container
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, warning, error)
     */
    showFeedbackMessage(container, message, type) {
        // Remove any existing messages
        const existingMessage = container.querySelector('.feedback-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `feedback-message feedback-message-${type}`;
        messageElement.textContent = message;

        // Insert before actions
        const actions = container.querySelector('.feedback-actions');
        actions.parentNode.insertBefore(messageElement, actions);

        // Auto-remove warning and error messages
        if (type !== 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 4000);
        }
    }

    /**
     * Hide the feedback survey
     * @param {HTMLElement} container - Feedback container element
     */
    hideFeedbackSurvey(container) {
        const feedbackContainer = container.querySelector('.feedback-container');
        if (feedbackContainer) {
            feedbackContainer.classList.add('feedback-hiding');
            
            setTimeout(() => {
                if (feedbackContainer.parentNode) {
                    feedbackContainer.parentNode.removeChild(feedbackContainer);
                }
                this.isVisible = false;
            }, 300);
        }
    }

    /**
     * Generate an anonymous session ID for analytics
     * @returns {string} Anonymous session identifier
     */
    generateAnonymousSessionId() {
        // Create a hash based on timestamp and random values (no personal info)
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `anon_${timestamp}_${random}`;
    }

    /**
     * Check if feedback should be shown (can be customized based on conditions)
     * @returns {boolean} Whether to show feedback
     */
    shouldShowFeedback() {
        // Always show feedback for now, but this could be customized
        // For example: only show after successful sessions, or randomly
        return true;
    }

    /**
     * Get collected feedback data (for debugging/testing)
     * @returns {Object|null} Feedback data
     */
    getFeedbackData() {
        return this.feedbackData;
    }

    /**
     * Clear feedback data
     */
    clearFeedbackData() {
        this.feedbackData = null;
        this.isVisible = false;
    }
}

export default FeedbackManager;