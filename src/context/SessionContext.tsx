// Session Context - Global state management for canvas
// Manages canvas state, user journey, and insights tracking
// Integrates with existing SessionStateManager for backward compatibility

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import type { CanvasState, SessionContextValue } from './SessionContextTypes';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const initialCanvasState: CanvasState = {
  currentLane: 'readiness',
  userJourney: [],
  navigationHistory: ['readiness'],
  historyIndex: 0,
  isReady: false,
  intensity: 5,
  needsExtraction: false,
  selectedTopic: null,
  miningResults: {},
  selectedCategory: null,
  selectedSubcategory: null,
  selectedThoughts: [],
  minedInsights: [],
  exportableData: {}
};

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>(initialCanvasState);
  const [sessionData, setSessionData] = useState<Record<string, any>>({});

  // Initialize session data
  const initializeSession = () => {
    const sessionId = generateSessionId();
    setSessionData({
      sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionHealth: 'healthy'
    });
    // eslint-disable-next-line no-console
    console.log('Canvas session initialized:', sessionId);
  };

  React.useEffect(() => {
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSessionId = (): string => {
    return 'canvas_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const updateCanvasState: SessionContextValue['updateCanvasState'] = (updates) => {
    setCanvasState(prev => {
      const newState = { ...prev, ...updates };
      setSessionData(prevSession => ({
        ...prevSession,
        lastActivity: new Date().toISOString(),
        sessionHealth: 'healthy'
      }));
      return newState;
    });
  };

  const addInsight: SessionContextValue['addInsight'] = (insight) => {
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
    setCanvasState(prev => ({
      ...prev,
      exportableData: {
        ...prev.exportableData,
        insights: prev.minedInsights,
        lastUpdated: new Date().toISOString()
      }
    }));
    // eslint-disable-next-line no-console
    console.log('Insight added:', insightWithTimestamp);
  };

  const generateInsightId = (): string => {
    return 'insight_' + Math.random().toString(36).substr(2, 9);
  };

  const updateJourney: SessionContextValue['updateJourney'] = (laneInfo) => {
    setCanvasState(prev => {
      const existingIndex = prev.userJourney.findIndex(step => step.lane === laneInfo.lane);
      let newJourney;
      if (existingIndex >= 0) {
        newJourney = [...prev.userJourney];
        newJourney[existingIndex] = {
          ...newJourney[existingIndex],
          ...laneInfo,
          timestamp: new Date().toISOString()
        };
      } else {
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

  // Navigation helpers
  const navigateToLane: SessionContextValue['navigateToLane'] = (lane: string) => {
    setCanvasState(prev => {
      const newHistory = [...prev.navigationHistory];
      if (prev.currentLane !== lane) {
        newHistory.push(lane);
      }
      return {
        ...prev,
        currentLane: lane,
        navigationHistory: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  };

  const goBack: SessionContextValue['goBack'] = () => {
    setCanvasState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        const targetLane = prev.navigationHistory[newIndex];
        return {
          ...prev,
          currentLane: targetLane,
          historyIndex: newIndex
        };
      }
      return prev;
    });
  };

  const goForward: SessionContextValue['goForward'] = () => {
    setCanvasState(prev => {
      if (prev.historyIndex < prev.navigationHistory.length - 1) {
        const newIndex = prev.historyIndex + 1;
        const targetLane = prev.navigationHistory[newIndex];
        return {
          ...prev,
          currentLane: targetLane,
          historyIndex: newIndex
        };
      }
      return prev;
    });
  };

  // Reset session
  const resetSession: SessionContextValue['resetSession'] = () => {
    setCanvasState(initialCanvasState);
    setSessionData({});
    initializeSession();
    // eslint-disable-next-line no-console
    console.log('Canvas session cleared');
  };

  // Additional methods for testing and functionality
  const trackContentInteraction: SessionContextValue['trackContentInteraction'] = (interaction) => {
    // eslint-disable-next-line no-console
    console.log('Content interaction tracked:', interaction);
  };

  const trackMiningProgress: SessionContextValue['trackMiningProgress'] = (progress) => {
    // eslint-disable-next-line no-console
    console.log('Mining progress tracked:', progress);
  };

  const updateMiningResults: SessionContextValue['updateMiningResults'] = (results) => {
    setCanvasState(prev => ({
      ...prev,
      miningResults: { ...prev.miningResults, ...results }
    }));
  };

  const prepareContentQuery: SessionContextValue['prepareContentQuery'] = (query) => {
    return `${query.type}:${JSON.stringify(query.params)}`;
  };

  const handleContentError: SessionContextValue['handleContentError'] = (error, context) => {
    // eslint-disable-next-line no-console
    console.error('Content error handled:', error, context);
  };

  const getSessionMetrics: SessionContextValue['getSessionMetrics'] = () => {
    const sessionDuration = Date.now() - new Date(sessionData.startTime || Date.now()).getTime();
    return {
      sessionDuration,
      insightCount: canvasState.minedInsights.length,
      lanesVisited: canvasState.navigationHistory.length,
      completedLanes: canvasState.userJourney.filter(j => j.completed).length,
      currentLane: canvasState.currentLane,
      isReady: canvasState.isReady,
      hasSelectedTopic: !!canvasState.selectedTopic,
      miningResultsCount: Object.keys(canvasState.miningResults).length,
      sessionHealth: sessionData.sessionHealth || 'healthy'
    };
  };

  const getInsightsByType: SessionContextValue['getInsightsByType'] = (type) => {
    return canvasState.minedInsights.filter(insight => insight.type === type);
  };

  // Context value
  const contextValue: SessionContextValue = {
    canvasState,
    sessionData,
    updateCanvasState,
    resetSession,
    goBack,
    goForward,
    navigateToLane,
    addInsight,
    updateJourney,
    trackContentInteraction,
    trackMiningProgress,
    updateMiningResults,
    prepareContentQuery,
    handleContentError,
    getSessionMetrics,
    getInsightsByType
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook for accessing session context
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

export default SessionContext;