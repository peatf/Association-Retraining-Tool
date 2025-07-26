/**
 * HighFidelityNLPEngine - Advanced text classification for therapeutic interventions
 * Uses Transformers.js zero-shot classification to understand psychological states
 * Provides confidence-based content selection with fallback mechanisms
 */

import SingletonPipelineManager from './SingletonPipelineManager.js';
import { candidateLabels, confidenceThreshold } from './nlpConfig.js';

class HighFidelityNLPEngine {
    constructor() {
        this.pipelineManager = null;
        this.thoughtBuffet = null;
        this.isInitialized = false;
        this.confidenceThreshold = confidenceThreshold;
        
        this.init();
    }

    /**
     * Initialize the NLP engine and load thought buffet content
     */
    async init() {
        try {
            // Load thought buffet content
            await this.loadThoughtBuffet();
            console.log('HighFidelityNLPEngine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize HighFidelityNLPEngine:', error);
            throw error;
        }
    }

    /**
     * Load the thought buffet JSON content
     */
    async loadThoughtBuffet() {
        try {
            const response = await fetch('./js/thought-buffet.json');
            if (!response.ok) {
                throw new Error(`Failed to load thought buffet: ${response.status}`);
            }
            
            this.thoughtBuffet = await response.json();
            console.log('Thought buffet loaded with', Object.keys(this.thoughtBuffet).length, 'categories');
        } catch (error) {
            console.error('Error loading thought buffet:', error);
            // Provide minimal fallback content
            this.thoughtBuffet = {
                "generic_fallback": [
                    "It's okay if my thoughts feel tangled right now.",
                    "I don't need to have it all figured out.",
                    "My feelings are valid, even if they're hard to put into words.",
                    "This moment of difficulty is temporary and will pass.",
                    "I am worthy of compassion, especially from myself."
                ]
            };
        }
    }

    /**
     * Initialize the model with progress callback
     * @param {Function} progressCallback - Callback for loading progress updates
     * @returns {Promise<void>}
     */
    async initializeModel(progressCallback = null) {
        try {
            console.log('Initializing NLP model...');
            
            // Get singleton pipeline manager instance
            this.pipelineManager = await SingletonPipelineManager.getInstance(progressCallback);
            
            // Initialize the pipeline
            await this.pipelineManager.initializePipeline();
            
            this.isInitialized = true;
            console.log('NLP model initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize NLP model:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Classify user text against psychological candidate labels
     * @param {string} text - User input text to classify
     * @param {Array<string>} customLabels - Optional custom labels (defaults to configured labels)
     * @returns {Promise<Object>} Classification results with confidence scores
     */
    async classifyText(text, customLabels = null) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Invalid text input for classification');
        }

        const labels = customLabels || candidateLabels;
        
        try {
            // Ensure model is initialized
            if (!this.isInitialized) {
                await this.initializeModel();
            }

            console.log('Classifying text:', text.substring(0, 100) + '...');
            console.log('Using labels:', labels.length, 'psychological categories');

            // Perform zero-shot classification
            const result = await this.pipelineManager.classify(text, labels, {
                multi_label: true
            });

            // Process and sort results
            const processedResults = this.processClassificationResults(result, text);
            
            console.log('Classification completed. Top result:', processedResults.labels[0], 
                       'with confidence:', processedResults.scores[0]);

            return processedResults;

        } catch (error) {
            console.error('Text classification failed:', error);
            
            // Return fallback result for graceful degradation
            return this.createFallbackClassification(text);
        }
    }

    /**
     * Process raw classification results from the model
     * @param {Object} rawResult - Raw result from pipeline
     * @param {string} originalText - Original input text
     * @returns {Object} Processed classification results
     */
    processClassificationResults(rawResult, originalText) {
        // Ensure we have the expected structure
        if (!rawResult.labels || !rawResult.scores) {
            console.warn('Unexpected classification result structure:', rawResult);
            return this.createFallbackClassification(originalText);
        }

        // Results should already be sorted by confidence from SingletonPipelineManager
        const sortedResults = rawResult.labels.map((label, index) => ({
            label: label.replace(/\s+/g, '_').toLowerCase(), // Normalize label format
            score: rawResult.scores[index],
            confidence: rawResult.scores[index]
        })).sort((a, b) => b.confidence - a.confidence);

        return {
            labels: sortedResults.map(r => r.label),
            scores: sortedResults.map(r => r.score),
            confidences: sortedResults.map(r => r.confidence),
            sequence: originalText,
            topLabel: sortedResults[0]?.label,
            topConfidence: sortedResults[0]?.confidence || 0,
            isHighConfidence: (sortedResults[0]?.confidence || 0) >= this.confidenceThreshold
        };
    }

    /**
     * Create fallback classification for error cases
     * @param {string} text - Original input text
     * @returns {Object} Fallback classification result
     */
    createFallbackClassification(text) {
        return {
            labels: ['generic_fallback'],
            scores: [0.3], // Low confidence to trigger fallback content
            confidences: [0.3],
            sequence: text,
            topLabel: 'generic_fallback',
            topConfidence: 0.3,
            isHighConfidence: false,
            isFallback: true
        };
    }

    /**
     * Select the best therapeutic content based on classification results
     * @param {Object} classificationResult - Result from classifyText
     * @returns {Object} Selected therapeutic content
     */
    selectBestThoughtBuffet(classificationResult) {
        const { topLabel, topConfidence, isHighConfidence } = classificationResult;

        console.log(`Selecting content for label: ${topLabel}, confidence: ${topConfidence}`);

        // Use high-confidence classification
        if (isHighConfidence && this.thoughtBuffet[topLabel]) {
            const content = this.thoughtBuffet[topLabel];
            return {
                label: topLabel,
                confidence: topConfidence,
                content: this.selectRandomContent(content),
                allContent: content,
                isHighConfidence: true,
                source: 'classification'
            };
        }

        // Fallback to generic content for low confidence
        console.log('Using generic fallback due to low confidence or missing content');
        const fallbackContent = this.thoughtBuffet['generic_fallback'] || [
            "It's okay if my thoughts feel tangled right now.",
            "I don't need to have it all figured out.",
            "My feelings are valid, even if they're hard to put into words."
        ];

        return {
            label: 'generic_fallback',
            confidence: topConfidence,
            content: this.selectRandomContent(fallbackContent),
            allContent: fallbackContent,
            isHighConfidence: false,
            source: 'fallback'
        };
    }

    /**
     * Select random content from an array to provide variety
     * @param {Array<string>} contentArray - Array of content options
     * @returns {string} Randomly selected content
     */
    selectRandomContent(contentArray) {
        if (!Array.isArray(contentArray) || contentArray.length === 0) {
            return "I am worthy of compassion, especially from myself.";
        }

        const randomIndex = Math.floor(Math.random() * contentArray.length);
        return contentArray[randomIndex];
    }

    /**
     * Get multiple content options for variety
     * @param {Object} classificationResult - Result from classifyText
     * @param {number} count - Number of content options to return
     * @returns {Array<Object>} Array of content options
     */
    getMultipleContentOptions(classificationResult, count = 3) {
        const { labels, confidences } = classificationResult;
        const options = [];

        // Get content from top labels
        for (let i = 0; i < Math.min(labels.length, count); i++) {
            const label = labels[i];
            const confidence = confidences[i];

            if (confidence >= this.confidenceThreshold && this.thoughtBuffet[label]) {
                options.push({
                    label,
                    confidence,
                    content: this.selectRandomContent(this.thoughtBuffet[label]),
                    source: 'classification'
                });
            }
        }

        // Fill remaining slots with generic fallback if needed
        while (options.length < count) {
            const fallbackContent = this.thoughtBuffet['generic_fallback'] || [];
            options.push({
                label: 'generic_fallback',
                confidence: 0.3,
                content: this.selectRandomContent(fallbackContent),
                source: 'fallback'
            });
        }

        return options;
    }

    /**
     * Get confidence threshold for classification
     * @returns {number} Confidence threshold (0-1)
     */
    getConfidenceThreshold() {
        return this.confidenceThreshold;
    }

    /**
     * Set confidence threshold for classification
     * @param {number} threshold - New threshold (0-1)
     */
    setConfidenceThreshold(threshold) {
        if (threshold >= 0 && threshold <= 1) {
            this.confidenceThreshold = threshold;
            console.log('Confidence threshold updated to:', threshold);
        } else {
            console.warn('Invalid confidence threshold. Must be between 0 and 1.');
        }
    }

    /**
     * Handle low confidence classifications with graceful fallback
     * @param {Object} classificationResult - Classification result
     * @returns {Object} Fallback content selection
     */
    handleLowConfidence(classificationResult) {
        console.log('Handling low confidence classification');
        
        const fallbackContent = this.thoughtBuffet['generic_fallback'] || [
            "It's okay if my thoughts feel tangled right now.",
            "I don't need to have it all figured out.",
            "My feelings are valid, even if they're hard to put into words.",
            "This moment of difficulty is temporary and will pass.",
            "I am worthy of compassion, especially from myself."
        ];

        return {
            label: 'generic_fallback',
            confidence: classificationResult.topConfidence,
            content: this.selectRandomContent(fallbackContent),
            allContent: fallbackContent,
            isHighConfidence: false,
            source: 'low_confidence_fallback'
        };
    }

    /**
     * Generate fallback content for error cases
     * @returns {Object} Generic supportive content
     */
    generateFallbackContent() {
        const fallbackContent = [
            "I am worthy of compassion, especially from myself.",
            "It's okay to feel uncertain sometimes.",
            "This difficult moment will pass.",
            "I can be gentle with myself as I navigate this.",
            "My feelings are valid and deserve acknowledgment."
        ];

        return {
            label: 'system_fallback',
            confidence: 0.2,
            content: this.selectRandomContent(fallbackContent),
            allContent: fallbackContent,
            isHighConfidence: false,
            source: 'system_fallback'
        };
    }

    /**
     * Check if the model is ready for classification
     * @returns {boolean} True if model is initialized and ready
     */
    isModelReady() {
        return this.isInitialized && SingletonPipelineManager.isModelLoaded();
    }

    /**
     * Get available psychological labels
     * @returns {Array<string>} Array of candidate labels
     */
    getAvailableLabels() {
        return [...candidateLabels];
    }

    /**
     * Get available thought buffet categories
     * @returns {Array<string>} Array of available categories
     */
    getAvailableCategories() {
        return this.thoughtBuffet ? Object.keys(this.thoughtBuffet) : [];
    }

    /**
     * Reset the engine state
     */
    reset() {
        this.isInitialized = false;
        this.pipelineManager = null;
        console.log('HighFidelityNLPEngine reset');
    }
}

export default HighFidelityNLPEngine;