/**
 * PsychologicalEngine - Central class to manage the user's therapeutic journey
 * Handles technique selection, journey sequencing, and therapeutic path routing
 * Privacy-first design with no external data transmission
 */
class PsychologicalEngine {
    constructor(sessionManager, contentManager) {
        this.sessionManager = sessionManager;
        this.contentManager = contentManager;
        this.currentJourney = null;
        this.nlpEngine = null; // Will be set when NLP engine is available
    }

    /**
     * Set the NLP engine for high-fidelity text classification
     * @param {Object} nlpEngine - The high-fidelity NLP engine instance
     */
    setNLPEngine(nlpEngine) {
        this.nlpEngine = nlpEngine;
    }

    /**
     * Select the appropriate therapeutic technique based on user state
     * @param {Object} userState - Current user session state
     * @returns {string} Selected technique: 'cbt', 'socratic', 'act', or 'nlp-buffet'
     */
    selectTechnique(userState) {
        const { intensity, userText, selectedTopic, selectedEmotion } = userState;

        // High intensity (7+) automatically routes to ACT defusion
        if (intensity >= 7) {
            return 'act';
        }

        // If user provided text and NLP engine is available, use NLP-driven approach
        if (userText && userText.trim() && this.nlpEngine) {
            return 'nlp-buffet';
        }

        // For legacy flow without text input, use topic/emotion-based selection
        if (selectedTopic && selectedEmotion) {
            // Mix of CBT and Socratic based on emotion type
            const emotionIntensity = this._getEmotionIntensity(selectedEmotion);
            
            if (emotionIntensity === 'high') {
                return 'cbt'; // CBT reframes for intense emotions
            } else if (emotionIntensity === 'medium') {
                return Math.random() > 0.5 ? 'cbt' : 'socratic'; // Mix for moderate emotions
            } else {
                return 'socratic'; // Socratic questioning for milder emotions
            }
        }

        // Default fallback
        return 'cbt';
    }

    /**
     * Build the therapeutic journey sequence based on selected technique and user state
     * @param {Object} userState - Current user session state
     * @returns {Array} Array of therapeutic steps (5-7 steps)
     */
    async buildJourneySequence(userState) {
        const technique = this.selectTechnique(userState);
        const { selectedTopic, selectedEmotion, userText, intensity } = userState;

        let sequence = [];

        try {
            if (technique === 'nlp-buffet' && this.nlpEngine && userText) {
                // Use NLP-driven "Thought Buffet" approach
                sequence = await this._buildNLPBuffetSequence(userText);
            } else if (technique === 'act') {
                // Build ACT defusion sequence
                sequence = this._buildACTSequence(selectedTopic, intensity);
            } else {
                // Build legacy therapeutic content sequence (CBT/Socratic)
                sequence = this._buildLegacySequence(selectedTopic, selectedEmotion, technique);
            }

            // Store the journey in session
            this.currentJourney = {
                technique,
                sequence,
                currentStep: 0,
                totalSteps: sequence.length,
                alternativeAttempts: 0
            };

            // Update session state
            this.sessionManager.updateState('currentTechnique', technique);
            this.sessionManager.updateState('journeySequence', sequence);
            this.sessionManager.updateState('currentStep', 0);
            this.sessionManager.updateState('totalSteps', sequence.length);

            return sequence;

        } catch (error) {
            console.error('Error building journey sequence:', error);
            // Fallback to generic supportive sequence
            return this._buildFallbackSequence();
        }
    }

    /**
     * Get the next therapeutic prompt based on current state and user action
     * @param {string} action - User action: 'continue' or 'try-another'
     * @returns {Object} Next prompt object with content and metadata
     */
    getNextPrompt(action = 'continue') {
        if (!this.currentJourney) {
            throw new Error('No active journey. Call buildJourneySequence first.');
        }

        const { sequence, currentStep, totalSteps } = this.currentJourney;

        if (action === 'try-another') {
            this.currentJourney.alternativeAttempts++;
            
            // After 2 "try another angle" clicks, trigger ACT defusion
            if (this.currentJourney.alternativeAttempts >= 2) {
                return this._triggerACTDefusion();
            }

            // Return alternative prompt for current step
            const currentPrompt = sequence[currentStep];
            return {
                content: currentPrompt.alternative || currentPrompt.content,
                type: currentPrompt.type,
                step: currentStep + 1,
                totalSteps,
                isAlternative: true,
                isComplete: false
            };
        }

        if (action === 'continue') {
            // Reset alternative attempts for new step
            this.currentJourney.alternativeAttempts = 0;
            
            // Advance to next step
            this.currentJourney.currentStep++;
            const newStep = this.currentJourney.currentStep;

            // Update session state
            this.sessionManager.updateState('currentStep', newStep);

            // Check if journey is complete
            if (newStep >= totalSteps) {
                return {
                    content: this._generateCompletionSummary(),
                    type: 'completion',
                    step: newStep,
                    totalSteps,
                    isComplete: true
                };
            }

            // Return next step
            const nextPrompt = sequence[newStep];
            return {
                content: nextPrompt.content,
                type: nextPrompt.type,
                step: newStep + 1,
                totalSteps,
                isAlternative: false,
                isComplete: false
            };
        }

        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Trigger ACT defusion exercise when user feels stuck
     * @returns {Object} ACT defusion prompt
     */
    _triggerACTDefusion() {
        const userState = this.sessionManager.getCurrentState();
        const { selectedTopic } = userState;

        const actContent = this.contentManager.getACTDefusionExercise(selectedTopic);
        
        // Update session to indicate ACT defusion mode
        this.sessionManager.updateState('currentScreen', 'act-defusion');
        
        return {
            content: actContent.instructions,
            type: 'act-defusion',
            actExercise: actContent,
            isComplete: false,
            requiresACTFlow: true
        };
    }

    /**
     * Build NLP-driven "Thought Buffet" sequence using text classification
     * @param {string} userText - User's input text
     * @returns {Array} Sequence of therapeutic prompts
     */
    async _buildNLPBuffetSequence(userText) {
        try {
            // Classify the user's text using NLP engine
            const classification = await this.nlpEngine.classifyText(userText);
            const thoughtBuffet = this.contentManager.getThoughtBuffet();

            let selectedBuffet;
            
            if (classification.confidence >= 0.45 && thoughtBuffet[classification.label]) {
                // Use high-confidence classification
                selectedBuffet = thoughtBuffet[classification.label];
            } else {
                // Use generic fallback for low confidence
                selectedBuffet = thoughtBuffet.generic_fallback;
            }

            // Create sequence from thought buffet (3-5 reframing statements)
            return selectedBuffet.map((statement, index) => ({
                content: statement,
                alternative: `Let's try a different perspective: ${statement}`,
                type: 'nlp-reframe',
                step: index
            }));

        } catch (error) {
            console.error('Error in NLP classification:', error);
            // Fallback to generic supportive content
            const thoughtBuffet = this.contentManager.getThoughtBuffet();
            return thoughtBuffet.generic_fallback.map((statement, index) => ({
                content: statement,
                alternative: `Here's another way to think about it: ${statement}`,
                type: 'nlp-reframe-fallback',
                step: index
            }));
        }
    }

    /**
     * Build ACT defusion sequence for high intensity or stuck users
     * @param {string} topic - Selected topic
     * @param {number} intensity - Emotional intensity level
     * @returns {Array} ACT defusion sequence
     */
    _buildACTSequence(topic, intensity) {
        const actExercise = this.contentManager.getACTDefusionExercise(topic);
        
        // Create a single-step sequence that leads to ACT defusion screen
        return [{
            content: actExercise.instructions,
            alternative: "Let's try a mindful approach to these thoughts.",
            type: 'act-defusion',
            step: 0,
            actExercise: actExercise
        }];
    }

    /**
     * Build legacy therapeutic sequence using topic/emotion-based content
     * @param {string} topic - Selected topic
     * @param {string} emotion - Selected emotion
     * @param {string} technique - Selected technique ('cbt' or 'socratic')
     * @returns {Array} Therapeutic sequence
     */
    _buildLegacySequence(topic, emotion, technique) {
        const therapeuticContent = this.contentManager.getTherapeuticContent();
        
        if (therapeuticContent.sequences[topic] && therapeuticContent.sequences[topic][emotion]) {
            const emotionSequence = therapeuticContent.sequences[topic][emotion];
            
            // Filter by technique if specified, otherwise use all
            if (technique === 'cbt') {
                return emotionSequence.filter(step => step.type === 'cbt_reframe');
            } else if (technique === 'socratic') {
                return emotionSequence.filter(step => step.type === 'socratic');
            } else {
                return emotionSequence; // Return mixed sequence
            }
        }

        // Fallback if no specific content found
        return this._buildFallbackSequence();
    }

    /**
     * Build fallback sequence for error cases
     * @returns {Array} Generic supportive sequence
     */
    _buildFallbackSequence() {
        return [
            {
                content: "It's okay if your thoughts feel tangled right now.",
                alternative: "Your feelings are valid, even if they're hard to put into words.",
                type: 'fallback',
                step: 0
            },
            {
                content: "This moment of difficulty is temporary and will pass.",
                alternative: "You are worthy of compassion, especially from yourself.",
                type: 'fallback',
                step: 1
            },
            {
                content: "Taking time to reflect on your thoughts shows strength and self-awareness.",
                alternative: "You can be gentle with yourself as you navigate whatever you're experiencing.",
                type: 'fallback',
                step: 2
            }
        ];
    }

    /**
     * Generate completion summary based on journey
     * @returns {string} Completion summary text
     */
    _generateCompletionSummary() {
        const userState = this.sessionManager.getCurrentState();
        const { selectedTopic, selectedEmotion, intensity, currentTechnique } = userState;

        const topicText = selectedTopic ? selectedTopic.toLowerCase() : 'this area of your life';
        const emotionText = selectedEmotion ? `feeling ${selectedEmotion}` : 'these difficult emotions';

        if (currentTechnique === 'act') {
            return `You started feeling overwhelmed about ${topicText}, and through mindful awareness, you've created space between yourself and those intense thoughts.`;
        } else if (currentTechnique === 'nlp-buffet') {
            return `You've worked through your thoughts with personalized insights and found new ways to understand your experience with ${topicText}.`;
        } else if (intensity >= 7) {
            return `You started feeling overwhelmed about ${topicText}, and you've worked through those intense feelings to find a more balanced perspective.`;
        } else if (intensity >= 4) {
            return `You began ${emotionText} about ${topicText}, and you've worked through those feelings to find a more balanced perspective.`;
        } else {
            return `Even though you started in a relatively calm state, you've deepened your understanding of ${topicText} and strengthened your emotional resilience.`;
        }
    }

    /**
     * Get emotion intensity level for technique selection
     * @param {string} emotion - Selected emotion
     * @returns {string} Intensity level: 'low', 'medium', or 'high'
     */
    _getEmotionIntensity(emotion) {
        const highIntensityEmotions = ['overwhelmed', 'ashamed', 'desperate', 'heartbroken', 'worthless', 'defeated'];
        const mediumIntensityEmotions = ['anxious', 'resentful', 'lonely', 'rejected', 'inadequate', 'embarrassed'];
        
        if (highIntensityEmotions.includes(emotion)) {
            return 'high';
        } else if (mediumIntensityEmotions.includes(emotion)) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Reset the current journey (useful for starting over)
     */
    resetJourney() {
        this.currentJourney = null;
        this.sessionManager.updateState('currentTechnique', null);
        this.sessionManager.updateState('journeySequence', []);
        this.sessionManager.updateState('currentStep', 0);
        this.sessionManager.updateState('totalSteps', 0);
    }

    /**
     * Get current journey status
     * @returns {Object|null} Current journey state or null if no active journey
     */
    getCurrentJourney() {
        return this.currentJourney ? { ...this.currentJourney } : null;
    }
}

export default PsychologicalEngine;