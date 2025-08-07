/**
 * Sentiment Analysis Service
 * Provides sentiment analysis and intensity mapping for emotional content
 * Uses @xenova/transformers with DistilBERT for local inference
 */

import { pipeline, Pipeline } from '@xenova/transformers';

export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE';
  confidence: number;
  intensity: number; // 1-9 scale mapped from sentiment confidence
  rawScore: number; // Original model score before transformation
}

export interface IntensityMapping {
  minIntensity: number;
  maxIntensity: number;
  scalingFactor: number;
}

class SentimentAnalysisService {
  private sentimentPipeline: Pipeline | null = null;
  private isLoading = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly MODEL_NAME = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

  // Intensity mapping configuration
  private readonly INTENSITY_CONFIG: IntensityMapping = {
    minIntensity: 1,
    maxIntensity: 9,
    scalingFactor: 2.5 // Adjust this to control sensitivity
  };

  constructor() {
    // Preload the model
    this.preloadModel();
  }

  /**
   * Preload the sentiment analysis model
   */
  private async preloadModel(): Promise<void> {
    if (this.sentimentPipeline || this.isLoading) {
      return this.loadingPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadingPromise = this._loadModel();
    return this.loadingPromise;
  }

  private async _loadModel(): Promise<void> {
    try {
      this.sentimentPipeline = await pipeline(
        'sentiment-analysis',
        this.MODEL_NAME,
        {
          device: 'webgpu',
          dtype: 'fp16'
        }
      );
      
      console.log('Sentiment analysis model loaded successfully');
    } catch (error) {
      console.warn('Failed to load WebGPU sentiment model, falling back to CPU:', error);
      
      try {
        this.sentimentPipeline = await pipeline(
          'sentiment-analysis',
          this.MODEL_NAME
        );
        console.log('Sentiment analysis model loaded with CPU fallback');
      } catch (cpuError) {
        console.error('Failed to load sentiment analysis model:', cpuError);
        this.sentimentPipeline = null;
        throw cpuError;
      }
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  /**
   * Analyze sentiment and map to intensity scale
   * @param text - Input text to analyze
   * @returns Promise<SentimentResult | null>
   */
  async analyzeSentiment(text: string): Promise<SentimentResult | null> {
    if (!text?.trim()) {
      return null;
    }

    try {
      await this.preloadModel();
      
      if (!this.sentimentPipeline) {
        throw new Error('Sentiment analysis model failed to load');
      }

      // Get sentiment analysis result
      const result = await this.sentimentPipeline(text);
      
      // Extract sentiment and confidence
      const sentiment = result.label as 'POSITIVE' | 'NEGATIVE';
      const confidence = result.score;
      const rawScore = sentiment === 'POSITIVE' ? confidence : -confidence;

      // Map to intensity scale (1-9)
      const intensity = this.mapSentimentToIntensity(sentiment, confidence);

      return {
        sentiment,
        confidence,
        intensity,
        rawScore
      };

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return null;
    }
  }

  /**
   * Map sentiment confidence to 1-9 intensity scale
   * Uses tanh-based scaling for better distribution
   * @private
   * @param sentiment - POSITIVE or NEGATIVE
   * @param confidence - Model confidence score (0-1)
   * @returns Intensity score (1-9)
   */
  private mapSentimentToIntensity(sentiment: 'POSITIVE' | 'NEGATIVE', confidence: number): number {
    const { minIntensity, maxIntensity, scalingFactor } = this.INTENSITY_CONFIG;
    
    // For negative sentiment, higher confidence = higher intensity
    // For positive sentiment, map to lower intensity (less distressing)
    let baseScore: number;
    
    if (sentiment === 'NEGATIVE') {
      // Negative thoughts: higher confidence = higher intensity (more distressing)
      baseScore = confidence;
    } else {
      // Positive thoughts: higher confidence = lower intensity (less distressing)
      // Invert the score so positive sentiment maps to lower intensity
      baseScore = 1 - confidence;
    }

    // Apply tanh scaling for better distribution
    // This compresses extreme values while preserving mid-range sensitivity
    const scaledScore = Math.tanh(baseScore * scalingFactor);
    
    // Map to 1-9 scale
    const intensity = minIntensity + (scaledScore * (maxIntensity - minIntensity));
    
    // Round to nearest integer and clamp
    return Math.max(minIntensity, Math.min(maxIntensity, Math.round(intensity)));
  }

  /**
   * Analyze multiple texts for sentiment
   * @param texts - Array of texts to analyze
   * @returns Promise<SentimentResult[]>
   */
  async analyzeSentiments(texts: string[]): Promise<SentimentResult[]> {
    const results: SentimentResult[] = [];
    
    for (const text of texts) {
      const result = await this.analyzeSentiment(text);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Get intensity score for a thought (main interface for UI)
   * @param thoughtText - The user's thought text
   * @param fallbackIntensity - Fallback intensity if analysis fails (default: 5)
   * @returns Promise<number> - Intensity score (1-9)
   */
  async getThoughtIntensity(thoughtText: string, fallbackIntensity: number = 5): Promise<number> {
    const result = await this.analyzeSentiment(thoughtText);
    return result?.intensity ?? fallbackIntensity;
  }

  /**
   * Classify thought distress level based on intensity
   * @param intensity - Intensity score (1-9)
   * @returns Distress level category
   */
  classifyDistressLevel(intensity: number): 'low' | 'moderate' | 'high' | 'severe' {
    if (intensity <= 2) return 'low';
    if (intensity <= 4) return 'moderate';
    if (intensity <= 6) return 'high';
    return 'severe';
  }

  /**
   * Get color coding for intensity visualization
   * @param intensity - Intensity score (1-9)
   * @returns CSS color value
   */
  getIntensityColor(intensity: number): string {
    // Green to red gradient based on intensity
    const colors = [
      '#28a745', // 1-2: Green (calm)
      '#28a745',
      '#ffc107', // 3-4: Yellow (mild)
      '#ffc107',
      '#fd7e14', // 5-6: Orange (moderate)
      '#fd7e14',
      '#dc3545', // 7-8: Red (high)
      '#dc3545',
      '#721c24'  // 9: Dark red (severe)
    ];
    
    return colors[Math.max(0, Math.min(8, intensity - 1))];
  }

  /**
   * Get descriptive text for intensity level
   * @param intensity - Intensity score (1-9)
   * @returns Human-readable description
   */
  getIntensityDescription(intensity: number): string {
    const descriptions = [
      'Very calm',        // 1
      'Calm',             // 2
      'Slightly unsettled', // 3
      'Mildly distressing', // 4
      'Moderately intense', // 5
      'Quite distressing',  // 6
      'Very distressing',   // 7
      'Highly intense',     // 8
      'Overwhelming'        // 9
    ];
    
    return descriptions[Math.max(0, Math.min(8, intensity - 1))];
  }

  /**
   * Update intensity mapping configuration
   * @param config - New intensity mapping configuration
   */
  updateIntensityMapping(config: Partial<IntensityMapping>): void {
    Object.assign(this.INTENSITY_CONFIG, config);
  }

  /**
   * Get current intensity mapping configuration
   * @returns Current intensity configuration
   */
  getIntensityConfig(): IntensityMapping {
    return { ...this.INTENSITY_CONFIG };
  }

  /**
   * Check if the sentiment service is ready
   * @returns boolean indicating if model is loaded
   */
  isReady(): boolean {
    return this.sentimentPipeline !== null && !this.isLoading;
  }

  /**
   * Check if the service is loading
   * @returns boolean indicating loading state
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Get model information
   * @returns object with model details
   */
  getModelInfo() {
    return {
      modelName: this.MODEL_NAME,
      isLoaded: this.sentimentPipeline !== null,
      isLoading: this.isLoading,
      intensityRange: [this.INTENSITY_CONFIG.minIntensity, this.INTENSITY_CONFIG.maxIntensity]
    };
  }

  /**
   * Dispose of the model and free memory
   */
  async dispose(): Promise<void> {
    if (this.sentimentPipeline) {
      try {
        await this.sentimentPipeline.dispose();
        this.sentimentPipeline = null;
        console.log('Sentiment analysis model disposed');
      } catch (error) {
        console.error('Error disposing sentiment model:', error);
      }
    }
  }
}

// Export singleton instance
export const sentimentAnalysisService = new SentimentAnalysisService();
export default sentimentAnalysisService;