/**
 * ContentSearchService
 * Provides methods to query the content index for categories, subcategories,
 * and replacement thoughts. Integrates with the content-index.bin structure.
 * Enhanced with error handling and graceful degradation.
 */

import errorHandlingService from '../services/ErrorHandlingService';

interface ContentEntry {
  category: string;
  subcategories: string[];
  summaryForVectorization: string;
  miningPrompts: {
    [key: string]: string[];
  };
  replacementThoughts: string[];
  chunks?: Array<{
    text: string;
    metadata?: Record<string, any>;
  }>;
}

interface ContentIndex {
  metadata: {
    categories: string[];
    subcategories: {
      [category: string]: string[];
    };
    totalEntries?: number;
    totalChunks?: number;
  };
  entries: ContentEntry[];
  version: string;
  timestamp: number;
  fallback?: boolean;
}

interface ErrorResult {
  useFallback: boolean;
  fallbackData: any;
}

interface SearchResult {
  text: string;
  category: string;
  subcategories: string[];
  metadata?: Record<string, any>;
  relevance: number;
}

interface ContentStats {
  version: string;
  timestamp: number;
  categories: number;
  totalEntries?: number;
  totalChunks?: number;
  subcategoriesPerCategory: Array<{
    category: string;
    subcategories: number;
  }>;
}

function isValidEntry(entry: any): entry is ContentEntry {
  return entry && entry.category && Array.isArray(entry.subcategories) && entry.summaryForVectorization && entry.miningPrompts && Array.isArray(entry.replacementThoughts);
}

class ContentSearchService {
  private contentIndex: ContentIndex | null;
  private isLoaded: boolean;
  private loadingPromise: Promise<ContentIndex> | null;
  private cache: Map<string, any>;

  constructor() {
    this.contentIndex = null;
    this.isLoaded = false;
    this.loadingPromise = null;
    this.cache = new Map();
  }

  /**
   * Load the content index from the binary file with enhanced error handling
   */
  async loadContentIndex(): Promise<ContentIndex> {
    if (this.isLoaded && this.contentIndex) {
      return this.contentIndex;
    }

    // Prevent multiple simultaneous loading attempts
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._performLoad();
    return this.loadingPromise;
  }

  private async _performLoad(): Promise<ContentIndex> {
    try {
      let contentIndexData: ContentIndex;
      
      // Check if we're in Node.js environment (for testing)
      if (typeof window === 'undefined') {
        // Node.js environment - read file directly
        const fs = await import('fs');
        const path = await import('path');
        const indexPath = path.resolve('public/content/content-index.bin');
        
        if (fs.existsSync(indexPath)) {
          const rawData = fs.readFileSync(indexPath, 'utf8');
          contentIndexData = JSON.parse(rawData) as ContentIndex;
        } else {
          throw new Error('Content index file not found');
        }
      } else {
        // Browser environment - use fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch('/public/content/content-index.bin', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to load content index: ${response.status} ${response.statusText}`);
          }
          contentIndexData = await response.json() as ContentIndex;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      }
      
      this.contentIndex = contentIndexData;
      this.isLoaded = true;
      this.loadingPromise = null;
      
      // Clear any previous retry attempts on success
      errorHandlingService.clearRetryAttempts('contentService_loadIndex');
      
      console.log('Content index loaded:', {
        version: this.contentIndex.version,
        categories: this.contentIndex.metadata.categories.length,
        entries: this.contentIndex.metadata.totalEntries
      });
      
      return this.contentIndex;
    } catch (error: unknown) {
      this.loadingPromise = null;
      
      // Handle error with fallback
      const errorResult = await errorHandlingService.handleContentServiceError(
        'loadIndex', 
        error, 
        { operation: 'loadContentIndex' }
      ) as ErrorResult;
      
      if (errorResult.useFallback) {
        // Use fallback structure
        this.contentIndex = {
          metadata: {
            categories: errorResult.fallbackData || [],
            subcategories: {}
          },
          entries: [],
          version: 'fallback',
          timestamp: Date.now(),
          fallback: true
        };
        this.isLoaded = true;
        
        console.warn('Using fallback content structure due to loading error');
        return this.contentIndex;
      }
      
      // Re-throw if we can't use fallback
      throw error;
    }
  }

  /**
   * Get all top-level categories with error handling
   * @returns {Promise<string[]>} Array of category names
   */
  async getCategories(): Promise<string[]> {
    const cacheKey = 'getCategories';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.cache.has(cacheKey + '-promise')) {
      return this.cache.get(cacheKey + '-promise');
    }

    const promise = (async (): Promise<string[]> => {
      try {
        const contentIndex = await this.loadContentIndex();
        const categories = contentIndex.metadata.categories || [];
        this.cache.set(cacheKey, categories);
        return categories;
      } catch (error: unknown) {
        const errorResult = await errorHandlingService.handleContentServiceError(
          'getCategories',
          error
        ) as ErrorResult;
        return errorResult.fallbackData || [];
      } finally {
        this.cache.delete(cacheKey + '-promise');
      }
    })();

    this.cache.set(cacheKey + '-promise', promise);
    return promise;
  }

  /**
   * Get subcategories for a specific category with error handling
   * @param {string} category - The category name
   * @returns {Promise<string[]>} Array of subcategory names
   */
  async getSubcategories(category: string): Promise<string[]> {
    const cacheKey = `getSubcategories-${category}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.cache.has(cacheKey + '-promise')) {
      return this.cache.get(cacheKey + '-promise');
    }

    const promise = (async (): Promise<string[]> => {
      try {
        const contentIndex = await this.loadContentIndex();
        const subcategories = contentIndex.metadata.subcategories[category] || [];
        this.cache.set(cacheKey, subcategories);
        return subcategories;
      } catch (error: unknown) {
        const errorResult = await errorHandlingService.handleContentServiceError(
          'getSubcategories',
          error,
          { category }
        ) as ErrorResult;
        return errorResult.fallbackData || [];
      } finally {
        this.cache.delete(cacheKey + '-promise');
      }
    })();

    this.cache.set(cacheKey + '-promise', promise);
    return promise;
  }

  /**
   * Get replacement thoughts filtered by category, subcategory, and intensity level with error handling
   * @param {string} category - The category name
   * @param {string} subcategory - The subcategory name (optional)
   * @param {number} maxIntensity - Maximum intensity level (optional)
   * @returns {Promise<string[]>} Array of replacement thoughts
   */
  async getReplacementThoughts(category: string, subcategory: string | null = null, maxIntensity: number = 10): Promise<string[]> {
    const cacheKey = `getReplacementThoughts-${category}-${subcategory}-${maxIntensity}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.cache.has(cacheKey + '-promise')) {
      return this.cache.get(cacheKey + '-promise');
    }

    const promise = (async (): Promise<string[]> => {
      try {
        const contentIndex = await this.loadContentIndex();

        const replacementThoughts: string[] = [];

        // Find entries that match the category
        const matchingEntries = contentIndex.entries.filter(entry => {
        if (!isValidEntry(entry)) return false;
          if (entry.category !== category) return false;
          if (subcategory && !entry.subcategories.includes(subcategory)) return false;
          return true;
        });

        // Extract replacement thoughts from matching entries
        for (const entry of matchingEntries) {
          if (entry.replacementThoughts && Array.isArray(entry.replacementThoughts)) {
            replacementThoughts.push(...entry.replacementThoughts);
          }
        }

        // For now, we don't have intensity levels in the data structure
        // This could be enhanced in the future
        this.cache.set(cacheKey, replacementThoughts);
        return replacementThoughts;
      } catch (error: unknown) {
        const errorResult = await errorHandlingService.handleContentServiceError(
          'getReplacementThoughts',
          error,
          { category, subcategory, maxIntensity }
        ) as ErrorResult;
        return errorResult.fallbackData || [];
      } finally {
        this.cache.delete(cacheKey + '-promise');
      }
    })();

    this.cache.set(cacheKey + '-promise', promise);
    return promise;
  }

  /**
   * Get mining prompts for a specific category and type with error handling
   * @param {string} category - The category name
   * @param {string} type - The prompt type ('neutralize', 'commonGround', 'dataExtraction')
   * @returns {Promise<string[]>} Array of mining prompts
   */
  async getMiningPrompts(category: string, type: string): Promise<string[]> {
    const cacheKey = `getMiningPrompts-${category}-${type}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.cache.has(cacheKey + '-promise')) {
      return this.cache.get(cacheKey + '-promise');
    }

    const promise = (async (): Promise<string[]> => {
      try {
        const contentIndex = await this.loadContentIndex();

        const prompts: string[] = [];

        // Find entries that match the category
        const matchingEntries = contentIndex.entries.filter(entry =>
          isValidEntry(entry) && entry.category === category
        );

        // Extract mining prompts from matching entries
        for (const entry of matchingEntries) {
          if (entry.miningPrompts && entry.miningPrompts[type]) {
            prompts.push(...entry.miningPrompts[type]);
          }
        }

        this.cache.set(cacheKey, prompts);
        return prompts;
      } catch (error: unknown) {
        const errorResult = await errorHandlingService.handleContentServiceError(
          'getMiningPrompts',
          error,
          { category, type }
        ) as ErrorResult;
        return errorResult.fallbackData || [];
      } finally {
        this.cache.delete(cacheKey + '-promise');
      }
    })();

    this.cache.set(cacheKey + '-promise', promise);
    return promise;
  }

  /**
   * Search content by text query
   * @param query - Search query
   * @param category - Optional category filter
   * @returns Array of matching content chunks
   */
  async searchContent(query: string, category: string | null = null): Promise<SearchResult[]> {
    const contentIndex = await this.loadContentIndex();
    
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    for (const entry of contentIndex.entries) {
      if (category && entry.category !== category) continue;
      
      // Search through chunks
      for (const chunk of entry.chunks || []) {
        if (chunk.text.toLowerCase().includes(queryLower)) {
          results.push({
            text: chunk.text,
            category: entry.category,
            subcategories: entry.subcategories,
            metadata: chunk.metadata,
            relevance: this.calculateRelevance(chunk.text, query)
          });
        }
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Simple relevance calculation
   * @private
   * @param text - The content text
   * @param query - The search query
   * @returns Relevance score
   */
  private calculateRelevance(text: string, query: string): number {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Count exact matches
    const exactMatches = (textLower.match(new RegExp(queryLower, 'g')) || []).length;
    
    // Boost shorter texts with matches
    const lengthBoost = 1 / (text.length / 100);
    
    return exactMatches + lengthBoost;
  }

  /**
   * Get content statistics
   * @returns Statistics about the content index
   */
  async getStats(): Promise<ContentStats> {
    const contentIndex = await this.loadContentIndex();
    
    return {
      version: contentIndex.version,
      timestamp: contentIndex.timestamp,
      categories: contentIndex.metadata.categories.length,
      totalEntries: contentIndex.metadata.totalEntries,
      totalChunks: contentIndex.metadata.totalChunks,
      subcategoriesPerCategory: Object.entries(contentIndex.metadata.subcategories)
        .map(([cat, subs]) => ({ category: cat, subcategories: subs.length }))
    };
  }
}

// Export singleton instance
export const contentSearchService = new ContentSearchService();
export default contentSearchService;