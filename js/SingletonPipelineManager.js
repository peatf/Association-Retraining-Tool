/**
 * SingletonPipelineManager - Manages Transformers.js pipeline with lazy loading
 * Ensures only one instance of the model is loaded for efficiency
 * Handles model loading progress and privacy-first configuration
 */

import { pipeline, env } from '@xenova/transformers';
import { modelConfig, transformersConfig } from './nlpConfig.js';

class SingletonPipelineManager {
    static instance = null;
    static pipeline = null;
    static isLoading = false;
    static loadingProgress = 0;
    static progressCallback = null;

    /**
     * Get the singleton instance of the pipeline manager
     * @param {Function} progressCallback - Optional callback for loading progress
     * @returns {Promise<SingletonPipelineManager>} The singleton instance
     */
    static async getInstance(progressCallback = null) {
        if (SingletonPipelineManager.instance) {
            return SingletonPipelineManager.instance;
        }

        SingletonPipelineManager.instance = new SingletonPipelineManager();
        SingletonPipelineManager.progressCallback = progressCallback;
        
        // Configure Transformers.js environment for privacy-first operation
        // Note: Models will be cached locally after first download
        env.allowRemoteModels = transformersConfig.allowRemoteModels;
        env.localModelPath = transformersConfig.localModelPath;
        
        return SingletonPipelineManager.instance;
    }

    /**
     * Initialize the zero-shot classification pipeline
     * @returns {Promise<Object>} The initialized pipeline
     */
    async initializePipeline() {
        if (SingletonPipelineManager.pipeline) {
            return SingletonPipelineManager.pipeline;
        }

        if (SingletonPipelineManager.isLoading) {
            // Wait for existing loading to complete
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!SingletonPipelineManager.isLoading && SingletonPipelineManager.pipeline) {
                        resolve(SingletonPipelineManager.pipeline);
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        SingletonPipelineManager.isLoading = true;
        
        try {
            console.log('Initializing Transformers.js pipeline with privacy-first configuration...');
            
            // Update progress
            this.updateProgress(10, 'Initializing model environment...');
            
            // Create the zero-shot classification pipeline
            SingletonPipelineManager.pipeline = await pipeline(
                'zero-shot-classification',
                modelConfig.modelName,
                {
                    progress_callback: (progress) => {
                        this.handleModelProgress(progress);
                    },
                    device: modelConfig.device,
                    quantized: modelConfig.quantized
                }
            );

            this.updateProgress(100, 'Model ready for classification');
            console.log('Transformers.js pipeline initialized successfully');
            
            return SingletonPipelineManager.pipeline;
            
        } catch (error) {
            console.error('Failed to initialize Transformers.js pipeline:', error);
            throw new Error(`Model initialization failed: ${error.message}`);
        } finally {
            SingletonPipelineManager.isLoading = false;
        }
    }

    /**
     * Handle model loading progress updates
     * @param {Object} progress - Progress information from Transformers.js
     */
    handleModelProgress(progress) {
        if (progress && progress.progress !== undefined) {
            const percentage = Math.round(progress.progress * 100);
            let message = 'Loading model...';
            
            if (progress.file) {
                message = `Loading ${progress.file}...`;
            }
            
            this.updateProgress(percentage, message);
        }
    }

    /**
     * Update loading progress and call progress callback
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    updateProgress(percentage, message) {
        SingletonPipelineManager.loadingProgress = percentage;
        
        if (SingletonPipelineManager.progressCallback) {
            SingletonPipelineManager.progressCallback(percentage, message);
        }
        
        console.log(`Model loading: ${percentage}% - ${message}`);
    }

    /**
     * Perform zero-shot text classification
     * @param {string} text - Text to classify
     * @param {Array<string>} labels - Candidate labels for classification
     * @param {Object} options - Classification options
     * @returns {Promise<Object>} Classification results
     */
    async classify(text, labels, options = {}) {
        if (!SingletonPipelineManager.pipeline) {
            await this.initializePipeline();
        }

        try {
            const result = await SingletonPipelineManager.pipeline(text, labels, {
                multi_label: modelConfig.multiLabel,
                ...options
            });

            // Sort results by score (highest confidence first)
            if (result.scores && result.labels) {
                const sortedResults = result.labels.map((label, index) => ({
                    label,
                    score: result.scores[index]
                })).sort((a, b) => b.score - a.score);

                return {
                    labels: sortedResults.map(r => r.label),
                    scores: sortedResults.map(r => r.score),
                    sequence: text
                };
            }

            return result;
            
        } catch (error) {
            console.error('Classification failed:', error);
            throw new Error(`Text classification failed: ${error.message}`);
        }
    }

    /**
     * Check if the model is currently loaded and ready
     * @returns {boolean} True if model is ready
     */
    static isModelLoaded() {
        return SingletonPipelineManager.pipeline !== null && !SingletonPipelineManager.isLoading;
    }

    /**
     * Get current loading progress
     * @returns {number} Progress percentage (0-100)
     */
    static getLoadingProgress() {
        return SingletonPipelineManager.loadingProgress;
    }

    /**
     * Clear the singleton instance (useful for testing or reset)
     */
    static clearInstance() {
        SingletonPipelineManager.instance = null;
        SingletonPipelineManager.pipeline = null;
        SingletonPipelineManager.isLoading = false;
        SingletonPipelineManager.loadingProgress = 0;
        SingletonPipelineManager.progressCallback = null;
    }

    /**
     * Check if model is currently loading
     * @returns {boolean} True if model is loading
     */
    static isModelLoading() {
        return SingletonPipelineManager.isLoading;
    }
}

export default SingletonPipelineManager;