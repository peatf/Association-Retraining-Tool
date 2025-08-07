/**
 * Recommendation Service
 * Provides intelligent content recommendations based on user preferences and behavior
 * Uses embedding similarity and user interaction history
 */

import embeddingService, { EmbeddingResult } from './EmbeddingService';
import contentSearchService from './ContentSearchService';

export interface UserProfile {
  preferredCategories: string[];
  likedContent: string[];
  dislikedContent: string[];
  completedSessions: number;
  lastActive: number;
  profileVector?: number[]; // Mean embedding of liked content
}

export interface RecommendationResult {
  text: string;
  category: string;
  subcategories: string[];
  relevanceScore: number;
  reason: string; // Why this was recommended
  metadata?: Record<string, any>;
}

export interface RecommendationOptions {
  category?: string;
  excludeViewed?: boolean;
  diversityWeight?: number; // 0-1, higher = more diversity
  maxResults?: number;
}

class RecommendationService {
  private readonly STORAGE_KEY = 'clarityCanvas_userProfile';
  private userProfile: UserProfile | null = null;
  private profileEmbedding: number[] | null = null;

  constructor() {
    this.loadUserProfile();
  }

  /**
   * Load user profile from storage
   * @private
   */
  private loadUserProfile(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.userProfile = JSON.parse(stored);
        this.profileEmbedding = this.userProfile?.profileVector || null;
      } else {
        this.initializeProfile();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.initializeProfile();
    }
  }

  /**
   * Initialize a new user profile
   * @private
   */
  private initializeProfile(): void {
    this.userProfile = {
      preferredCategories: [],
      likedContent: [],
      dislikedContent: [],
      completedSessions: 0,
      lastActive: Date.now(),
      profileVector: undefined
    };
    this.saveUserProfile();
  }

  /**
   * Save user profile to storage
   * @private
   */
  private saveUserProfile(): void {
    if (this.userProfile) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userProfile));
      } catch (error) {
        console.error('Error saving user profile:', error);
      }
    }
  }

  /**
   * Record user interaction with content
   * @param contentText - The content the user interacted with
   * @param action - 'like' | 'dislike' | 'view' | 'complete'
   * @param category - Content category
   * @param metadata - Additional metadata
   */
  async recordInteraction(
    contentText: string,
    action: 'like' | 'dislike' | 'view' | 'complete',
    category?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.userProfile) {
      this.initializeProfile();
    }

    const profile = this.userProfile!;
    
    // Update based on action
    switch (action) {
      case 'like':
        if (!profile.likedContent.includes(contentText)) {
          profile.likedContent.push(contentText);
          // Remove from disliked if present
          profile.dislikedContent = profile.dislikedContent.filter(text => text !== contentText);
        }
        if (category && !profile.preferredCategories.includes(category)) {
          profile.preferredCategories.push(category);
        }
        break;
        
      case 'dislike':
        if (!profile.dislikedContent.includes(contentText)) {
          profile.dislikedContent.push(contentText);
          // Remove from liked if present
          profile.likedContent = profile.likedContent.filter(text => text !== contentText);
        }
        break;
        
      case 'complete':
        profile.completedSessions++;
        break;
    }

    profile.lastActive = Date.now();

    // Update profile embedding if we have liked content
    if (profile.likedContent.length > 0) {
      await this.updateProfileEmbedding();
    }

    this.saveUserProfile();
  }

  /**
   * Update the user's profile embedding based on liked content
   * @private
   */
  private async updateProfileEmbedding(): Promise<void> {
    if (!this.userProfile || this.userProfile.likedContent.length === 0) {
      return;
    }

    try {
      // Get embeddings for all liked content
      const likedEmbeddings: number[][] = [];
      
      for (const content of this.userProfile.likedContent) {
        const embedding = await embeddingService.embedText(content);
        if (embedding) {
          likedEmbeddings.push(embedding.embedding);
        }
      }

      if (likedEmbeddings.length > 0) {
        // Calculate mean embedding as profile vector
        this.profileEmbedding = embeddingService.meanPooling(likedEmbeddings);
        this.userProfile.profileVector = this.profileEmbedding;
        this.saveUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile embedding:', error);
    }
  }

  /**
   * Get personalized content recommendations
   * @param options - Recommendation options
   * @returns Promise<RecommendationResult[]>
   */
  async getContentRecommendations(options: RecommendationOptions = {}): Promise<RecommendationResult[]> {
    const {
      category,
      excludeViewed = true,
      diversityWeight = 0.3,
      maxResults = 5
    } = options;

    try {
      // Get all available content through search
      const searchResults = await contentSearchService.searchContentSemantic(
        '', // Empty query to get all content
        category,
        maxResults * 3 // Get more candidates for filtering
      );

      if (searchResults.length === 0) {
        return [];
      }

      let candidates = searchResults;

      // Filter out viewed/disliked content if requested
      if (excludeViewed && this.userProfile) {
        const viewedContent = new Set([
          ...this.userProfile.likedContent,
          ...this.userProfile.dislikedContent
        ]);
        candidates = candidates.filter(result => !viewedContent.has(result.text));
      }

      // Score candidates based on user profile
      const scoredCandidates = await this.scoreCandidates(candidates, diversityWeight);

      // Sort by score and return top results
      return scoredCandidates
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);

    } catch (error) {
      console.error('Error getting content recommendations:', error);
      return [];
    }
  }

  /**
   * Score recommendation candidates based on user profile
   * @private
   * @param candidates - Content candidates to score
   * @param diversityWeight - Weight for diversity scoring
   * @returns Promise<RecommendationResult[]>
   */
  private async scoreCandidates(
    candidates: Array<{text: string, category: string, subcategories: string[], metadata?: any}>,
    diversityWeight: number
  ): Promise<RecommendationResult[]> {
    const results: RecommendationResult[] = [];

    for (const candidate of candidates) {
      let score = 0.5; // Base score
      let reason = 'General recommendation';

      // Category preference scoring
      if (this.userProfile?.preferredCategories.includes(candidate.category)) {
        score += 0.3;
        reason = `You've shown interest in ${candidate.category} content`;
      }

      // Similarity to profile embedding
      if (this.profileEmbedding) {
        try {
          const candidateEmbedding = await embeddingService.embedText(candidate.text);
          if (candidateEmbedding) {
            const similarity = embeddingService.cosineSimilarity(
              this.profileEmbedding,
              candidateEmbedding.embedding
            );
            score += similarity * 0.4; // Weight similarity score
            if (similarity > 0.7) {
              reason = 'Similar to content you\'ve liked before';
            }
          }
        } catch (error) {
          console.error('Error calculating similarity:', error);
        }
      }

      // Diversity penalty (reduce score for very similar content)
      if (diversityWeight > 0) {
        const diversityPenalty = this.calculateDiversityPenalty(candidate, results);
        score -= diversityPenalty * diversityWeight;
      }

      // Freshness bonus for new users
      if (!this.userProfile || this.userProfile.completedSessions < 3) {
        score += 0.1;
        reason = 'Great for getting started';
      }

      results.push({
        text: candidate.text,
        category: candidate.category,
        subcategories: candidate.subcategories,
        relevanceScore: Math.max(0, Math.min(1, score)), // Clamp to 0-1
        reason,
        metadata: candidate.metadata
      });
    }

    return results;
  }

  /**
   * Calculate diversity penalty to avoid recommending too similar content
   * @private
   * @param candidate - Current candidate
   * @param existingResults - Already selected results
   * @returns Diversity penalty (0-1)
   */
  private calculateDiversityPenalty(
    candidate: {category: string, subcategories: string[]},
    existingResults: RecommendationResult[]
  ): number {
    if (existingResults.length === 0) return 0;

    let maxSimilarity = 0;
    for (const existing of existingResults) {
      let similarity = 0;
      
      // Category similarity
      if (existing.category === candidate.category) {
        similarity += 0.5;
      }
      
      // Subcategory overlap
      const overlapCount = candidate.subcategories.filter(sub => 
        existing.subcategories.includes(sub)
      ).length;
      const totalSubs = Math.max(candidate.subcategories.length, existing.subcategories.length);
      if (totalSubs > 0) {
        similarity += (overlapCount / totalSubs) * 0.5;
      }
      
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return maxSimilarity;
  }

  /**
   * Get recommendations for next content after completing a session
   * @param completedContent - Content just completed
   * @param category - Current category
   * @returns Promise<RecommendationResult[]>
   */
  async getNextRecommendations(
    completedContent: string,
    category: string
  ): Promise<RecommendationResult[]> {
    // Record the completion
    await this.recordInteraction(completedContent, 'complete', category);

    // Get recommendations with higher diversity weight for post-completion
    return this.getContentRecommendations({
      category,
      excludeViewed: true,
      diversityWeight: 0.5,
      maxResults: 3
    });
  }

  /**
   * Get user profile statistics
   * @returns User profile information
   */
  getUserStats(): {
    completedSessions: number;
    likedContentCount: number;
    preferredCategories: string[];
    daysActive: number;
  } | null {
    if (!this.userProfile) return null;

    const daysActive = Math.ceil((Date.now() - this.userProfile.lastActive) / (1000 * 60 * 60 * 24));

    return {
      completedSessions: this.userProfile.completedSessions,
      likedContentCount: this.userProfile.likedContent.length,
      preferredCategories: this.userProfile.preferredCategories,
      daysActive
    };
  }

  /**
   * Reset user profile (for testing or user request)
   */
  resetProfile(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeProfile();
    this.profileEmbedding = null;
  }

  /**
   * Export user profile (for data portability)
   * @returns Serialized user profile
   */
  exportProfile(): string | null {
    return this.userProfile ? JSON.stringify(this.userProfile, null, 2) : null;
  }

  /**
   * Import user profile (for data portability)
   * @param profileData - Serialized user profile
   */
  importProfile(profileData: string): boolean {
    try {
      const profile = JSON.parse(profileData);
      if (profile && typeof profile === 'object') {
        this.userProfile = profile;
        this.profileEmbedding = profile.profileVector || null;
        this.saveUserProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing profile:', error);
      return false;
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
export default recommendationService;