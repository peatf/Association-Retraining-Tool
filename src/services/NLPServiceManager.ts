/**
 * NLP Service Manager
 * Centralizes loading states, error handling, and coordination between NLP services
 * Provides a unified interface for all AI/NLP functionality
 */

import nlpService from './NLPService';
import embeddingService from './EmbeddingService';
import sentimentAnalysisService from './SentimentAnalysisService';
import recommendationService from './RecommendationService';

export interface ServiceStatus {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  modelInfo?: any;
}

export interface NLPSystemStatus {
  nlp: ServiceStatus;
  embedding: ServiceStatus;
  sentiment: ServiceStatus;
  recommendation: ServiceStatus;
  overall: {
    readyServices: number;
    totalServices: number;
    isFullyReady: boolean;
    hasErrors: boolean;
  };
}

export interface LoadingProgress {
  serviceName: string;
  progress: number; // 0-100
  stage: string;
  estimatedTimeRemaining?: number;
}

export type ServiceEventType = 'loading' | 'loaded' | 'error' | 'progress';

export interface ServiceEvent {
  type: ServiceEventType;
  serviceName: string;
  data?: any;
  error?: Error;
}

class NLPServiceManager {
  private eventListeners: Map<ServiceEventType, Array<(event: ServiceEvent) => void>> = new Map();
  private loadingStartTimes: Map<string, number> = new Map();
  private readonly MEMORY_THRESHOLD_MB = 250; // Max memory budget for all models

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners for service loading
   * @private
   */
  private initializeEventListeners(): void {
    // Initialize event listener arrays
    (['loading', 'loaded', 'error', 'progress'] as ServiceEventType[]).forEach(type => {
      this.eventListeners.set(type, []);
    });
  }

  /**
   * Subscribe to service events
   * @param eventType - Type of event to listen for
   * @param callback - Callback function
   */
  addEventListener(eventType: ServiceEventType, callback: (event: ServiceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * Remove event listener
   * @param eventType - Type of event
   * @param callback - Callback to remove
   */
  removeEventListener(eventType: ServiceEventType, callback: (event: ServiceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const filtered = listeners.filter(listener => listener !== callback);
    this.eventListeners.set(eventType, filtered);
  }

  /**
   * Emit a service event
   * @private
   * @param event - Event to emit
   */
  private emitEvent(event: ServiceEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  /**
   * Get current status of all NLP services
   * @returns NLPSystemStatus
   */
  getSystemStatus(): NLPSystemStatus {
    const nlpStatus = this.getServiceStatus('nlp');
    const embeddingStatus = this.getServiceStatus('embedding');
    const sentimentStatus = this.getServiceStatus('sentiment');
    const recommendationStatus = this.getServiceStatus('recommendation');

    const services = [nlpStatus, embeddingStatus, sentimentStatus, recommendationStatus];
    const readyServices = services.filter(s => s.isLoaded && !s.error).length;
    const hasErrors = services.some(s => s.error !== null);

    return {
      nlp: nlpStatus,
      embedding: embeddingStatus,
      sentiment: sentimentStatus,
      recommendation: recommendationStatus,
      overall: {
        readyServices,
        totalServices: services.length,
        isFullyReady: readyServices === services.length,
        hasErrors
      }
    };
  }

  /**
   * Get status of a specific service
   * @private
   * @param serviceName - Name of the service
   * @returns ServiceStatus
   */
  private getServiceStatus(serviceName: string): ServiceStatus {
    let service: any;
    let modelInfo: any;

    switch (serviceName) {
      case 'nlp':
        service = nlpService;
        modelInfo = nlpService.getModelInfo();
        break;
      case 'embedding':
        service = embeddingService;
        modelInfo = embeddingService.getModelInfo();
        break;
      case 'sentiment':
        service = sentimentAnalysisService;
        modelInfo = sentimentAnalysisService.getModelInfo();
        break;
      case 'recommendation':
        service = recommendationService;
        modelInfo = { isLoaded: true, isLoading: false }; // Recommendation service doesn't use models
        break;
      default:
        return { isLoaded: false, isLoading: false, error: new Error('Unknown service'), modelInfo: null };
    }

    return {
      isLoaded: service.isReady ? service.isReady() : true,
      isLoading: service.isModelLoading ? service.isModelLoading() : false,
      error: null, // Services don't currently expose error state
      modelInfo
    };
  }

  /**
   * Preload all NLP services with progress tracking
   * @param options - Loading options
   * @returns Promise<void>
   */
  async preloadAllServices(options: {
    priority?: ('nlp' | 'embedding' | 'sentiment')[];
    maxConcurrent?: number;
  } = {}): Promise<void> {
    const { priority = ['sentiment', 'nlp', 'embedding'], maxConcurrent = 2 } = options;

    this.emitEvent({ type: 'loading', serviceName: 'system', data: { stage: 'Initializing AI services...' } });

    // Load services in priority order with concurrency limit
    const loadQueue = [...priority];
    const loadPromises: Promise<void>[] = [];

    while (loadQueue.length > 0 || loadPromises.length > 0) {
      // Start new loads up to concurrency limit
      while (loadQueue.length > 0 && loadPromises.length < maxConcurrent) {
        const serviceName = loadQueue.shift()!;
        const promise = this.loadService(serviceName);
        loadPromises.push(promise);
      }

      // Wait for at least one to complete
      if (loadPromises.length > 0) {
        await Promise.race(loadPromises);
        // Remove completed promises
        for (let i = loadPromises.length - 1; i >= 0; i--) {
          const promise = loadPromises[i];
          if (await this.isPromiseSettled(promise)) {
            loadPromises.splice(i, 1);
          }
        }
      }
    }

    this.emitEvent({ type: 'loaded', serviceName: 'system', data: { stage: 'All services ready' } });
  }

  /**
   * Load a specific service with progress tracking
   * @private
   * @param serviceName - Name of service to load
   * @returns Promise<void>
   */
  private async loadService(serviceName: string): Promise<void> {
    this.loadingStartTimes.set(serviceName, Date.now());
    
    this.emitEvent({
      type: 'loading',
      serviceName,
      data: { stage: `Loading ${serviceName} model...` }
    });

    try {
      let service: any;
      switch (serviceName) {
        case 'nlp':
          service = nlpService;
          break;
        case 'embedding':
          service = embeddingService;
          break;
        case 'sentiment':
          service = sentimentAnalysisService;
          break;
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }

      // Services auto-load, so we just need to wait for them to be ready
      const checkReady = async (): Promise<void> => {
        if (service.isReady()) {
          return;
        }
        
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkReady();
      };

      await checkReady();

      const loadTime = Date.now() - (this.loadingStartTimes.get(serviceName) || Date.now());
      
      this.emitEvent({
        type: 'loaded',
        serviceName,
        data: { 
          stage: `${serviceName} ready`,
          loadTime: `${(loadTime / 1000).toFixed(1)}s`
        }
      });

    } catch (error) {
      this.emitEvent({
        type: 'error',
        serviceName,
        error: error as Error
      });
      throw error;
    } finally {
      this.loadingStartTimes.delete(serviceName);
    }
  }

  /**
   * Check if a promise is settled (for concurrency management)
   * @private
   * @param promise - Promise to check
   * @returns Promise<boolean>
   */
  private async isPromiseSettled(promise: Promise<void>): Promise<boolean> {
    try {
      await promise;
      return true;
    } catch {
      return true; // Settled (rejected)
    }
  }

  /**
   * Get memory usage estimates for loaded models
   * @returns Memory usage information
   */
  getMemoryUsage(): {
    estimatedTotalMB: number;
    breakdown: Array<{service: string, estimatedMB: number}>;
    withinBudget: boolean;
  } {
    const breakdown = [
      { service: 'nlp', estimatedMB: nlpService.isReady() ? 36 : 0 }, // nli-deberta-v3-xsmall
      { service: 'embedding', estimatedMB: embeddingService.isReady() ? 22 : 0 }, // all-MiniLM-L6-v2
      { service: 'sentiment', estimatedMB: sentimentAnalysisService.isReady() ? 65 : 0 }, // distilbert-sst-2
      { service: 'recommendation', estimatedMB: 5 }, // Profile data and logic
    ];

    const estimatedTotalMB = breakdown.reduce((sum, item) => sum + item.estimatedMB, 0);

    return {
      estimatedTotalMB,
      breakdown: breakdown.filter(item => item.estimatedMB > 0),
      withinBudget: estimatedTotalMB <= this.MEMORY_THRESHOLD_MB
    };
  }

  /**
   * Gracefully dispose of all services
   * @returns Promise<void>
   */
  async disposeAllServices(): Promise<void> {
    const disposePromises = [
      nlpService.dispose(),
      embeddingService.dispose(),
      sentimentAnalysisService.dispose()
      // recommendationService doesn't need disposal
    ];

    await Promise.allSettled(disposePromises);
    
    this.emitEvent({
      type: 'loaded', // Using 'loaded' to indicate completion
      serviceName: 'system',
      data: { stage: 'All services disposed' }
    });
  }

  /**
   * Check if the system can handle a specific operation
   * @param operation - Operation to check ('classify' | 'embed' | 'sentiment' | 'recommend')
   * @returns boolean
   */
  canPerformOperation(operation: 'classify' | 'embed' | 'sentiment' | 'recommend'): boolean {
    switch (operation) {
      case 'classify':
        return nlpService.isReady();
      case 'embed':
        return embeddingService.isReady();
      case 'sentiment':
        return sentimentAnalysisService.isReady();
      case 'recommend':
        return true; // Recommendation service is always ready
      default:
        return false;
    }
  }

  /**
   * Safe wrapper for NLP operations with fallback handling
   * @param operation - Operation to perform
   * @param fallback - Fallback value if operation fails
   * @param notify - Whether to notify about errors
   * @returns Promise<T>
   */
  async safeOperation<T>(
    operation: () => Promise<T>,
    fallback: T,
    notify: boolean = true
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (notify) {
        console.error('NLP operation failed:', error);
        this.emitEvent({
          type: 'error',
          serviceName: 'operation',
          error: error as Error
        });
      }
      return fallback;
    }
  }
}

// Export singleton instance
export const nlpServiceManager = new NLPServiceManager();
export default nlpServiceManager;