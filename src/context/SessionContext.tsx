// Session Context - Global state management for canvas
// Manages canvas state, user journey, and insights tracking
// Integrates with existing SessionStateManager for backward compatibility

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import SessionStateManager from '../../js/SessionStateManager';
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
  const sessionManagerRef = useRef<any>(null);

  // Initialize session manager and session data
  const initializeSession = () => {
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
    // eslint-disable-next-line no-console
    console.log('Canvas session initialized:', sessionId);
    // eslint-disable-next-line no-console
    console.log('Legacy session manager integrated');
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
        legacySessionHealth: sessionManagerRef.current?.getSessionHealth()
      }));
      if (sessionManagerRef.current) {
        if (updates.selectedTopic) {
          sessionManagerRef.current.safeUpdateState('selectedTopic', updates.selectedTopic);
        }
        if (updates.intensity !== undefined) {
          sessionManagerRef.current.safeUpdateState('intensity', updates.intensity);
        }
        if (updates.currentLane) {
          const screenMapping: Record<string, string> = {
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
    if (sessionManagerRef.current) {
      sessionManagerRef.current.clearSession();
    }
    setCanvasState(initialCanvasState);
    setSessionData({});
    initializeSession();
    // eslint-disable-next-line no-console
    console.log('Canvas session cleared');
  };

  // Context value
  const contextValue: SessionContextValue = {
    canvasState,
    sessionData,
    updateCanvasState,
    resetSession,
    goBack,
    goForward,
    addInsight,
    updateJourney
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