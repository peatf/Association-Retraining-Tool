export interface CanvasState {
  // Navigation
  currentLane: string;
  userJourney: Array<{
    lane: string;
    timestamp: string;
    completed?: boolean;
    data?: Record<string, any>;
  }>;
  navigationHistory: string[];
  historyIndex: number;
  
  // Readiness Assessment
  isReady: boolean;
  intensity: number;
  
  // Thought Mining
  needsExtraction: boolean;
  selectedTopic: string | null;
  miningResults: Record<string, any>;
  
  // Thought Picker
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedThoughts: string[];
  selectedThought?: string | null; // Add this for backward compatibility
  
  // Export Data
  minedInsights: Array<{
    text: string;
    timestamp: string;
    source: string;
    type?: string; // Add type field for insights
    metadata?: Record<string, any>;
  }>;
  exportableData: Record<string, any>;
}

export interface SessionContextValue {
  canvasState: CanvasState;
  sessionData: Record<string, any>;
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  resetSession: () => void;
  goBack: () => void;
  goForward: () => void;
  navigateToLane: (lane: string) => void;
  addInsight: (insight: { 
    text: string; 
    source: string; 
    type?: string;
    metadata?: Record<string, any> 
  }) => void;
  updateJourney: (laneInfo: { 
    lane: string;
    completed?: boolean;
    data?: Record<string, any>;
  }) => void;
  // Additional methods for testing and functionality
  trackContentInteraction?: (interaction: { type: string; content: string; metadata?: Record<string, any> }) => void;
  trackMiningProgress?: (progress: { type: string; step: string; data?: Record<string, any> }) => void;
  updateMiningResults?: (results: Record<string, any>) => void;
  prepareContentQuery?: (query: { type: string; params: Record<string, any> }) => string;
  handleContentError?: (error: Error, context: Record<string, any>) => void;
  getSessionMetrics?: () => Record<string, any>;
  getInsightsByType?: (type: string) => Array<{ text: string; timestamp: string; source: string; type?: string; metadata?: Record<string, any> }>;
  legacySessionManager?: any;
}
