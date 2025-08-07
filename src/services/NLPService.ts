/**
 * NLP Service
 * Provides automatic topic classification using zero-shot NLI models
 * Integrates with @xenova/transformers for local inference
 */

import { pipeline, ZeroShotClassificationPipeline } from "@xenova/transformers";

export interface TopicClassificationResult {
  topic: string;
  confidence: number;
}

export interface ClassificationError {
  message: string;
  fallback: boolean;
}

class NLPService {
  private classifierPipeline: ZeroShotClassificationPipeline | null = null;
  private isLoading = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly MODEL_NAME = "Xenova/nli-deberta-v3-xsmall";

  private readonly TOPIC_LABELS = [
    "This thought is about money, finances, financial security, or economic concerns",
    "This thought is about relationships, connection, trust, intimacy, or interpersonal issues",
    "This thought is about self-image, self-worth, personal identity, or confidence",
  ];

  private readonly TOPIC_MAPPING = ["Money", "Relationships", "Self-Image"];

  constructor() {
    // Initialize loading state
    this.preloadModel();
  }

  /**
   * Preload the NLI model for topic classification
   */
  private async preloadModel(): Promise<void> {
    if (this.classifierPipeline || this.isLoading) {
      return this.loadingPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadingPromise = this._loadModel();
    return this.loadingPromise;
  }

  private async _loadModel(): Promise<void> {
    try {
      this.classifierPipeline = await pipeline(
        "zero-shot-classification",
        this.MODEL_NAME
      );

      console.log("NLP classifier model loaded successfully");
    } catch (error) {
      console.error("Failed to load NLP classifier model:", error);
      this.classifierPipeline = null;
      throw error;
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  /**
   * Classify a thought into one of the main topic categories
   * @param thoughtText - The user's thought text to classify
   * @param confidenceThreshold - Minimum confidence required (default: 0.3)
   * @returns Promise<TopicClassificationResult | null>
   */
  async classifyThought(
    thoughtText: string,
    confidenceThreshold: number = 0.3
  ): Promise<TopicClassificationResult | null> {
    if (!thoughtText?.trim()) {
      return null;
    }

    try {
      // Ensure model is loaded
      await this.preloadModel();

      if (!this.classifierPipeline) {
        throw new Error("NLP model failed to load");
      }

      // Run zero-shot classification
      const result = await this.classifierPipeline(
        thoughtText,
        this.TOPIC_LABELS
      );

      // Handle result type - ensure we have a single result object
      const singleResult = Array.isArray(result) ? result[0] : result;

      // Extract top prediction
      const topLabel = singleResult.labels[0];
      const topScore = singleResult.scores[0];

      if (topScore < confidenceThreshold) {
        console.log(`Classification confidence too low: ${topScore}`);
        return null;
      }

      // Map back to our topic names
      const topicIndex = this.TOPIC_LABELS.indexOf(topLabel);
      const topic = this.TOPIC_MAPPING[topicIndex];

      return {
        topic,
        confidence: topScore,
      };
    } catch (error) {
      console.error("Topic classification error:", error);
      return null;
    }
  }

  /**
   * Get all available topic classifications with confidence scores
   * @param thoughtText - The user's thought text to classify
   * @returns Promise<TopicClassificationResult[]>
   */
  async getAllTopicScores(
    thoughtText: string
  ): Promise<TopicClassificationResult[]> {
    if (!thoughtText?.trim()) {
      return [];
    }

    try {
      await this.preloadModel();

      if (!this.classifierPipeline) {
        throw new Error("NLP model failed to load");
      }

      const result = await this.classifierPipeline(
        thoughtText,
        this.TOPIC_LABELS
      );

      // Handle result type - ensure we have a single result object
      const singleResult = Array.isArray(result) ? result[0] : result;

      return singleResult.labels.map((label: string, index: number) => {
        const topicIndex = this.TOPIC_LABELS.indexOf(label);
        return {
          topic: this.TOPIC_MAPPING[topicIndex],
          confidence: singleResult.scores[index],
        };
      });
    } catch (error) {
      console.error("Topic scoring error:", error);
      return [];
    }
  }

  /**
   * Check if the NLP service is ready for inference
   * @returns boolean indicating if the model is loaded
   */
  isReady(): boolean {
    return this.classifierPipeline !== null && !this.isLoading;
  }

  /**
   * Check if the NLP service is currently loading
   * @returns boolean indicating loading state
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Get the model information
   * @returns object with model details
   */
  getModelInfo() {
    return {
      modelName: this.MODEL_NAME,
      isLoaded: this.classifierPipeline !== null,
      isLoading: this.isLoading,
      supportedTopics: this.TOPIC_MAPPING,
    };
  }

  /**
   * Dispose of the model and free memory
   */
  async dispose(): Promise<void> {
    if (this.classifierPipeline) {
      try {
        await this.classifierPipeline.dispose();
        this.classifierPipeline = null;
        console.log("NLP classifier model disposed");
      } catch (error) {
        console.error("Error disposing NLP model:", error);
      }
    }
  }
}

// Export singleton instance
export const nlpService = new NLPService();
export default nlpService;
