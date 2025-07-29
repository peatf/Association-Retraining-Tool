// Session Context - Global state management for canvas
// Manages canvas state, user journey, and insights tracking
// Integrates with existing SessionStateManager for backward compatibility

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import SessionStateManager from '../../js/SessionStateManager.js';

const SessionContext = createContext();

// Initial canvas state
const initialCanvasState = {
  // Navigation
  currentLane: 'readiness',
  userJourney: [],
  navigationHistory: ['readiness'],
  historyIndex: 0,
  
  // Readiness Assessment
  isReady: false,
  intensity: 5,
  
  // Thought Mining
  needsExtraction: false,
  selectedTopic: null,
  miningResults: {},
  
  // Thought Picker
  selectedCategory: null,
  selectedSubcategory: null,
  selectedThoughts: [],
  
  // Export Data
  minedInsights: [],
  exportableData: {}
};

export function SessionProvider({ children }) {
  const [canvasState, setCanvasState] = useState(initialCanvasState);
  const [sessionData, setSessionData] = useState({});
  const sessionManagerRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    migrateLegacySession();
    
    // Cleanup on unmount
    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.clearSession();
      }
    };
  }, []);

  const initializeSession = () => {
    // Initialize legacy SessionStateManager for backward compatibility
    if (!sessionManagerRef.current) {
      sessionManagerRef.current = new SessionStateManager();
      sessionManagerRef.current.initializeSession();
    }
    
    const sessionId = generateSessionId();
    setSessionData({
      sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      legacySessionHealth: sessionManagerRef.current.getSessionHealth()
    });
    
    console.log('Canvas session initialized:', sessionId);
    console.log('Legacy session manager integrated');
  };

  const generateSessionId = () => {
    return 'canvas_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const updateCanvasState = (updates) => {
    setCanvasState(prev => {
      const newState = { ...prev, ...updates };
      
      // Update last activity
      setSessionData(prevSession => ({
        ...prevSession,
        lastActivity: new Date().toISOString(),
        legacySessionHealth: sessionManagerRef.current?.getSessionHealth()
      }));
      
      // Sync relevant state with legacy SessionStateManager for backward compatibility
      if (sessionManagerRef.current) {
        if (updates.selectedTopic) {
          sessionManagerRef.current.safeUpdateState('selectedTopic', updates.selectedTopic);
        }
        if (updates.intensity !== undefined) {
          sessionManagerRef.current.safeUpdateState('intensity', updates.intensity);
        }
        if (updates.currentLane) {
          // Map canvas lanes to legacy screen states
          const screenMapping = {
            'readiness': 'readiness',
            'mining': 'journey',
            'picker': 'topic'
          };
          sessionManagerRef.current.safeUpdateState('currentScreen', screenMapping[updates.currentLane] || updates.currentLane);
        }
      }
      
      return newState;
    });
  };

  const addInsight = (insight) => {
    const insightWithTimestamp = {
      ...insight,
      timestamp: new Date().toISOString(),
      id: generateInsightId(),
      sessionId: sessionData.sessionId
    };
    
    setCanvasState(prev => ({
      ...prev,
      minedInsights: [...prev.minedInsights, insightWithTimestamp]
    }));
    
    // Update exportable data for easy access
    setCanvasState(prev => ({
      ...prev,
      exportableData: {
        ...prev.exportableData,
        insights: prev.minedInsights,
        lastUpdated: new Date().toISOString()
      }
    }));
    
    console.log('Insight added:', insightWithTimestamp);
  };

  const generateInsightId = () => {
    return 'insight_' + Math.random().toString(36).substr(2, 9);
  };

  const updateJourney = (laneInfo) => {
    setCanvasState(prev => {
      const existingIndex = prev.userJourney.findIndex(step => step.lane === laneInfo.lane);
      
      let newJourney;
      if (existingIndex >= 0) {
        // Update existing step
        newJourney = [...prev.userJourney];
        newJourney[existingIndex] = {
          ...newJourney[existingIndex],
          ...laneInfo,
          timestamp: new Date().toISOString()
        };
      } else {
        // Add new step
        newJourney = [...prev.userJourney, {
          ...laneInfo,
          timestamp: new Date().toISOString()
        }];
      }
      
      return {
        ...prev,
        userJourney: newJourney
      };
    });
  };

  const navigateToLane = (targetLane) => {
    setCanvasState(prev => {
      // Update navigation history
      const newHistory = [...prev.navigationHistory.slice(0, prev.historyIndex + 1), targetLane];
      const newIndex = newHistory.length - 1;
      
      return {
        ...prev,
        currentLane: targetLane,
        navigationHistory: newHistory,
        historyIndex: newIndex
      };
    });
    
    updateJourney({
      lane: targetLane,
      completed: false
    });
  };

  const completeLane = (laneType, results = {}) => {
    updateJourney({
      lane: laneType,
      completed: true,
      results
    });
    
    // Add results as insights if they contain meaningful data
    if (results.insights) {
      addInsight({
        type: laneType,
        content: results.insights,
        source: 'lane_completion'
      });
    }
  };

  const clearSession = () => {
    // Clear legacy session manager
    if (sessionManagerRef.current) {
      sessionManagerRef.current.clearSession();
    }
    
    setCanvasState(initialCanvasState);
    setSessionData({});
    initializeSession();
    console.log('Canvas session cleared');
  };

  const getSessionSummary = () => {
    return {
      sessionData,
      canvasState: {
        currentLane: canvasState.currentLane,
        journeyLength: canvasState.userJourney.length,
        insightCount: canvasState.minedInsights.length,
        isReady: canvasState.isReady,
        selectedTopic: canvasState.selectedTopic
      }
    };
  };

  // Export session data for debugging (development only)
  const exportSessionForDebug = () => {
    if (process.env.NODE_ENV === 'development') {
      return {
        sessionData,
        canvasState,
        legacyState: sessionManagerRef.current?.getCurrentState(),
        timestamp: new Date().toISOString()
      };
    }
    return null;
  };

  // Enhanced insight tracking methods
  const trackContentInteraction = (contentType, contentId, action) => {
    const interaction = {
      type: 'content_interaction',
      contentType, // 'mining_prompt', 'replacement_thought', etc.
      contentId,
      action, // 'viewed', 'selected', 'completed'
      timestamp: new Date().toISOString(),
      sessionId: sessionData.sessionId,
      currentLane: canvasState.currentLane
    };
    
    addInsight(interaction);
  };

  const trackMiningProgress = (miningType, step, data) => {
    const progress = {
      type: 'mining_progress',
      miningType, // 'neutralize', 'commonGround', 'dataExtraction'
      step,
      data,
      timestamp: new Date().toISOString(),
      sessionId: sessionData.sessionId
    };
    
    addInsight(progress);
  };

  const updateMiningResults = (miningType, results) => {
    setCanvasState(prev => ({
      ...prev,
      miningResults: {
        ...prev.miningResults,
        [miningType]: {
          ...results,
          timestamp: new Date().toISOString()
        }
      }
    }));
    
    // Track as insight
    addInsight({
      type: 'mining_completion',
      miningType,
      results,
      source: 'thought_mining'
    });
  };

  const getInsightsByType = (type) => {
    return canvasState.minedInsights.filter(insight => insight.type === type);
  };

  const getSessionMetrics = () => {
    const startTime = new Date(sessionData.startTime);
    const now = new Date();
    const duration = now - startTime;
    
    return {
      sessionDuration: duration,
      insightCount: canvasState.minedInsights.length,
      lanesVisited: canvasState.userJourney.length,
      completedLanes: canvasState.userJourney.filter(step => step.completed).length,
      currentLane: canvasState.currentLane,
      isReady: canvasState.isReady,
      hasSelectedTopic: !!canvasState.selectedTopic,
      miningResultsCount: Object.keys(canvasState.miningResults).length,
      legacySessionHealth: sessionManagerRef.current?.getSessionHealth()
    };
  };

  const migrateLegacySession = () => {
    if (sessionManagerRef.current) {
      const legacyState = sessionManagerRef.current.getCurrentState();
      if (legacyState) {
        updateCanvasState({
          selectedTopic: legacyState.selectedTopic,
          intensity: legacyState.intensity,
        });
      }
    }
  };

  // Content pipeline integration helpers
  const prepareContentQuery = (queryType, params = {}) => {
    return {
      queryType,
      params: {
        ...params,
        sessionId: sessionData.sessionId,
        currentLane: canvasState.currentLane,
        selectedTopic: canvasState.selectedTopic,
        intensity: canvasState.intensity
      },
      timestamp: new Date().toISOString()
    };
  };

  const handleContentError = (error, context) => {
    const errorInsight = {
      type: 'content_error',
      error: error.message || 'Unknown error',
      context,
      timestamp: new Date().toISOString(),
      sessionId: sessionData.sessionId,
      currentLane: canvasState.currentLane
    };
    
    addInsight(errorInsight);
    
    // Also log to legacy session manager for backward compatibility
    if (sessionManagerRef.current) {
      sessionManagerRef.current.handleError('Content Pipeline Error', error);
    }
  };

  // Navigation history management
  const canNavigateBack = () => {
    return canvasState.historyIndex > 0;
  };

  const canNavigateForward = () => {
    return canvasState.historyIndex < canvasState.navigationHistory.length - 1;
  };

  const navigateBack = () => {
    if (canNavigateBack()) {
      setCanvasState(prev => {
        const newIndex = prev.historyIndex - 1;
        const targetLane = prev.navigationHistory[newIndex];
        
        return {
          ...prev,
          currentLane: targetLane,
          historyIndex: newIndex
        };
      });
    }
  };

  const navigateForward = () => {
    if (canNavigateForward()) {
      setCanvasState(prev => {
        const newIndex = prev.historyIndex + 1;
        const targetLane = prev.navigationHistory[newIndex];
        
        return {
          ...prev,
          currentLane: targetLane,
          historyIndex: newIndex
        };
      });
    }
  };

  const getNavigationState = () => {
    return {
      canGoBack: canNavigateBack(),
      canGoForward: canNavigateForward(),
      currentIndex: canvasState.historyIndex,
      historyLength: canvasState.navigationHistory.length,
      history: canvasState.navigationHistory
    };
  };

  const contextValue = {
    // State
    canvasState,
    sessionData,
    
    // Core Actions
    updateCanvasState,
    addInsight,
    updateJourney,
    navigateToLane,
    completeLane,
    clearSession,
    
    // Navigation History
    canNavigateBack,
    canNavigateForward,
    navigateBack,
    navigateForward,
    getNavigationState,
    
    // Enhanced Insight Tracking
    trackContentInteraction,
    trackMiningProgress,
    updateMiningResults,
    getInsightsByType,
    
    // Content Pipeline Integration
    prepareContentQuery,
    handleContentError,
    
    // Utilities
    getSessionSummary,
    getSessionMetrics,
    exportSessionForDebug,
    
    // Legacy Integration
    legacySessionManager: sessionManagerRef.current
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook for accessing session context
export function useSession() {
  const context = useContext(SessionContext);
  
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  
  return context;
}

export default SessionContext;