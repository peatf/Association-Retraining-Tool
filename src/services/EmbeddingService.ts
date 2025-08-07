/**
 * Embedding Service
 * Provides text embedding functionality for semantic search
 * Uses @xenova/transformers for local inference with all-MiniLM-L6-v2
 */

import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  metadata?: Record<string, any>;
}

export interface SimilarityResult {
  text: string;
  similarity: number;
  metadata?: Record<string, any>;
}

class EmbeddingService {
  private embeddingPipeline: FeatureExtractionPipeline | null = null;
  private isLoading = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
  private readonly EMBEDDING_DIM = 384; // all-MiniLM-L6-v2 produces 384-dimensional embeddings

  constructor() {
    // Preload the model
    this.preloadModel();
  }

  /**
   * Preload the embedding model
   */
  private async preloadModel(): Promise<void> {
    if (this.embeddingPipeline || this.isLoading) {
      return this.loadingPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadingPromise = this._loadModel();
    return this.loadingPromise;
  }

  private async _loadModel(): Promise<void> {
    try {
      this.embeddingPipeline = await pipeline(
        'feature-extraction',
        this.MODEL_NAME
      );
      
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.warn('Failed to load embedding model with fp16, falling back to default:', error);
      
      try {
        this.embeddingPipeline = await pipeline(
          'feature-extraction',
          this.MODEL_NAME
        );
        console.log('Embedding model loaded with default settings');
      } catch (fallbackError) {
        console.error('Failed to load embedding model:', fallbackError);
        this.embeddingPipeline = null;
        throw fallbackError;
      }
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  /**
   * Generate embeddings for a single text
   * @param text - Input text to embed
   * @param metadata - Optional metadata to attach
   * @returns Promise<EmbeddingResult | null>
   */
  async embedText(text: string, metadata?: Record<string, any>): Promise<EmbeddingResult | null> {
    if (!text?.trim()) {
      return null;
    }

    try {
      await this.preloadModel();
      
      if (!this.embeddingPipeline) {
        throw new Error('Embedding model failed to load');
      }

      // Get embeddings - returns tensor data
      const output = await this.embeddingPipeline(text, { pooling: 'mean', normalize: true });
      
      // Convert tensor to array
      let embedding: number[];
      if (output.data) {
        embedding = Array.from(output.data);
      } else if (Array.isArray(output)) {
        embedding = output;
      } else {
        // Handle other tensor formats
        embedding = Array.from(output.tolist ? output.tolist()[0] : output);
      }

      // Ensure embedding has correct dimensions
      if (embedding.length !== this.EMBEDDING_DIM) {
        console.warn(`Expected embedding dim ${this.EMBEDDING_DIM}, got ${embedding.length}`);
      }

      return {
        embedding,
        text,
        metadata
      };

    } catch (error) {
      console.error('Text embedding error:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to embed
   * @param metadata - Optional metadata array (same length as texts)
   * @returns Promise<EmbeddingResult[]>
   */
  async embedTexts(
    texts: string[], 
    metadata?: Record<string, any>[]
  ): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const meta = metadata?.[i];
      
      const result = await this.embedText(text, meta);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param embedding1 - First embedding vector
   * @param embedding2 - Second embedding vector
   * @returns Cosine similarity score (0-1)
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Find most similar texts to a query embedding
   * @param queryEmbedding - Query embedding vector
   * @param candidates - Array of candidate embeddings with metadata
   * @param topK - Number of top results to return (default: 10)
   * @param threshold - Minimum similarity threshold (default: 0.0)
   * @returns Sorted array of similarity results
   */
  findSimilar(
    queryEmbedding: number[],
    candidates: EmbeddingResult[],
    topK: number = 10,
    threshold: number = 0.0
  ): SimilarityResult[] {
    const similarities = candidates
      .map(candidate => ({
        text: candidate.text,
        similarity: this.cosineSimilarity(queryEmbedding, candidate.embedding),
        metadata: candidate.metadata
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return similarities;
  }

  /**
   * Search for similar texts using text query
   * @param query - Text query to search for
   * @param candidates - Array of candidate embeddings
   * @param topK - Number of results to return
   * @param threshold - Minimum similarity threshold
   * @returns Promise<SimilarityResult[]>
   */
  async searchSimilar(
    query: string,
    candidates: EmbeddingResult[],
    topK: number = 10,
    threshold: number = 0.0
  ): Promise<SimilarityResult[]> {
    const queryEmbedding = await this.embedText(query);
    if (!queryEmbedding) {
      return [];
    }

    return this.findSimilar(queryEmbedding.embedding, candidates, topK, threshold);
  }

  /**
   * Calculate mean pooling of multiple embeddings
   * @param embeddings - Array of embedding vectors
   * @returns Mean-pooled embedding vector
   */
  meanPooling(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      return new Array(this.EMBEDDING_DIM).fill(0);
    }

    const dim = embeddings[0].length;
    const mean = new Array(dim).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dim; i++) {
        mean[i] += embedding[i];
      }
    }

    for (let i = 0; i < dim; i++) {
      mean[i] /= embeddings.length;
    }

    return mean;
  }

  /**
   * Normalize an embedding vector to unit length
   * @param embedding - Input embedding vector
   * @returns Normalized embedding vector
   */
  normalize(embedding: number[]): number[] {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return embedding;
    
    return embedding.map(val => val / norm);
  }

  /**
   * Check if the embedding service is ready
   * @returns boolean indicating if model is loaded
   */
  isReady(): boolean {
    return this.embeddingPipeline !== null && !this.isLoading;
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
      embeddingDim: this.EMBEDDING_DIM,
      isLoaded: this.embeddingPipeline !== null,
      isLoading: this.isLoading
    };
  }

  /**
   * Dispose of the model and free memory
   */
  async dispose(): Promise<void> {
    if (this.embeddingPipeline) {
      try {
        await this.embeddingPipeline.dispose();
        this.embeddingPipeline = null;
        console.log('Embedding model disposed');
      } catch (error) {
        console.error('Error disposing embedding model:', error);
      }
    }
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
export default embeddingService;