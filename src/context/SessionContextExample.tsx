import React from 'react';
import { useSession } from './SessionContext';

/**
 * Example component demonstrating how to use the enhanced SessionContext
 * This shows the key patterns for canvas state management and content pipeline integration
 */
const SessionContextExample = () => {
  const {
    // Core state
    canvasState,
    sessionData,
    
    // State management
    updateCanvasState,
    navigateToLane,
    addInsight,
    
    // Enhanced tracking
    trackContentInteraction,
    trackMiningProgress,
    updateMiningResults,
    
    // Content pipeline integration
    prepareContentQuery,
    handleContentError,
    
    // Utilities
    getSessionMetrics,
    getInsightsByType
  } = useSession();

  // Example: Readiness assessment
  const handleReadinessCheck = (isReady: boolean, intensity: number) => {
    updateCanvasState({ 
      isReady, 
      intensity 
    });
    
    if (isReady) {
      navigateToLane('mining');
    }
    
    // Track the readiness decision
    addInsight({
      text: `Readiness assessment: ${isReady ? 'Ready' : 'Not ready'} (intensity: ${intensity})`,
      source: 'readiness_gate',
      type: 'readiness_assessment',
      metadata: { isReady, intensity }
    });
  };

  // Example: Content interaction tracking
  const handlePromptSelection = async (promptId: string, promptText: string) => {
    try {
      // Track the interaction
      trackContentInteraction?.({
        type: 'mining_prompt',
        content: promptId,
        metadata: { action: 'selected' }
      });
      
      // Prepare query for content pipeline
      const query = prepareContentQuery?.({ type: 'getMiningPrompts', params: {
        topic: canvasState.selectedTopic,
        type: 'neutralize'
      }});
      
      console.log('Content query prepared:', query);
      
      // Simulate content loading and track progress
      trackMiningProgress?.({
        type: 'neutralize',
        step: 'prompt_selected',
        data: { promptId, promptText }
      });
      
    } catch (error) {
      handleContentError?.(error as Error, {
        action: 'prompt_selection',
        promptId,
        currentLane: canvasState.currentLane
      });
    }
  };

  // Example: Mining completion
  const handleMiningComplete = (miningType: string, results: Record<string, any>) => {
    updateMiningResults?.({ [miningType]: results });
    
    // Navigate to next step
    if (miningType === 'dataExtraction') {
      navigateToLane('picker');
    }
  };

  // Example: Getting insights by type
  const getContentInteractions = () => {
    return getInsightsByType?.('content_interaction') || [];
  };

  // Example: Session health check
  const checkSessionHealth = () => {
    const metrics = getSessionMetrics?.() || {};
    console.log('Current session health:', metrics);
    
    if (metrics.sessionDuration > 30 * 60 * 1000) { // 30 minutes
      console.warn('Long session detected, consider break reminder');
    }
  };

  return (
    <div className="session-context-example">
      <h2>Session Context Example</h2>
      
      <div className="session-info">
        <h3>Current State</h3>
        <p>Lane: {canvasState.currentLane}</p>
        <p>Ready: {canvasState.isReady ? 'Yes' : 'No'}</p>
        <p>Intensity: {canvasState.intensity}/10</p>
        <p>Selected Topic: {canvasState.selectedTopic || 'None'}</p>
        <p>Insights: {canvasState.minedInsights.length}</p>
        <p>Session ID: {sessionData.sessionId}</p>
      </div>

      <div className="actions">
        <h3>Example Actions</h3>
        
        <button onClick={() => handleReadinessCheck(true, 6)}>
          Mark Ready (Intensity 6)
        </button>
        
        <button onClick={() => handlePromptSelection('prompt-1', 'Example prompt text')}>
          Select Mining Prompt
        </button>
        
        <button onClick={() => handleMiningComplete('neutralize', { selectedPrompt: 'test' })}>
          Complete Neutralize Mining
        </button>
        
        <button onClick={() => updateCanvasState({ selectedTopic: 'relationships' })}>
          Select Relationships Topic
        </button>
        
        <button onClick={checkSessionHealth}>
          Check Session Health
        </button>
        
        <button onClick={() => console.log('Content interactions:', getContentInteractions())}>
          Show Content Interactions
        </button>
      </div>

      <div className="insights">
        <h3>Recent Insights</h3>
        {canvasState.minedInsights.slice(-3).map((insight, index) => (
          <div key={index} className="insight-item">
            <strong>{insight.type || 'insight'}:</strong> {insight.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionContextExample;