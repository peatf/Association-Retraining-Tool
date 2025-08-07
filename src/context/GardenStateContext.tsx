// Garden State Context - State management for the Inner Garden UI
// Manages the 5-step garden journey and coordinates with existing SessionContext

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import type { 
  GardenState, 
  GardenContextValue, 
  AnimationState,
  StepType,
  GateType,
  TopicType,
  FlowerState,
  SunlightLevel,
  MiningPhase,
  MiningResult,
  TransitionPhase,
  ThoughtOption,
  BouquetItem,
  SessionInsight,
  ExportData,
  AnimationQueueItem
} from './GardenStateTypes';

const GardenStateContext = createContext<GardenContextValue | undefined>(undefined);

// Initial garden state
const initialGardenState: GardenState = {
  // Navigation
  currentStep: 'nightSky',
  stepHistory: ['nightSky'],
  canGoBack: false,
  
  // Step 1: Night Sky
  readinessLevel: 50,
  selectedGate: null,
  showRestMessage: false,
  
  // Step 2: Map Transition
  transitionPhase: 'fade',
  selectedTopic: null,
  
  // Step 3: Field Entry
  userThought: '',
  isPersistentThought: false,
  
  // Step 4: Botanical Reflection
  currentMiningPhase: 1,
  flowerState: 'bud',
  miningResults: [],
  
  // Step 5: Garden Path
  sunlightLevel: 'mid',
  availableThoughts: [],
  selectedThoughts: [],
  
  // Export & Session
  sessionInsights: [],
  exportData: null,
  
  // UI State
  isTransitioning: false,
  isLoading: false,
  error: null,
};

// Initial animation state
const initialAnimationState: AnimationState = {
  isAnimating: false,
  currentAnimation: null,
  animationQueue: [],
  
  nightSkyAnimations: {
    cloudsBack: true,
    cloudsFront: true,
    starsTwinkling: true,
    gateGlows: { open: 0, partial: 0, closed: 0 },
  },
  
  mapTransitionAnimations: {
    skyFadeOut: false,
    mapReveal: false,
    zoomToFlowerBeds: false,
  },
  
  fieldEntryAnimations: {
    diveIntoField: false,
    journalAppear: false,
    petalDrift: false,
  },
  
  botanicalReflectionAnimations: {
    flowerTransformation: false,
    rootsGrowth: false,
    phaseTransitions: false,
  },
  
  gardenPathAnimations: {
    sunlightOverlay: false,
    flowerWiggle: false,
    bouquetCollection: false,
  },
};

interface GardenStateProviderProps {
  children: ReactNode;
}

export function GardenStateProvider({ children }: GardenStateProviderProps) {
  const [gardenState, setGardenState] = useState<GardenState>(initialGardenState);
  const [animationState, setAnimationState] = useState<AnimationState>(initialAnimationState);
  const sessionIdRef = useRef<string>();

  // Generate session ID
  const generateSessionId = (): string => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = 'garden_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    return sessionIdRef.current;
  };

  // === NAVIGATION ACTIONS ===
  
  const navigateToStep = useCallback((step: StepType) => {
    setGardenState(prev => ({
      ...prev,
      currentStep: step,
      stepHistory: [...prev.stepHistory, step],
      canGoBack: prev.stepHistory.length > 0,
      isTransitioning: true,
    }));
    
    // Add insight for navigation
    addInsight({
      type: 'readiness',
      content: `Navigated to ${step}`,
      step,
      metadata: { previousStep: gardenState.currentStep },
    });
  }, [gardenState.currentStep]);

  const goBack = useCallback(() => {
    setGardenState(prev => {
      if (prev.stepHistory.length <= 1) return prev;
      
      const newHistory = prev.stepHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      
      return {
        ...prev,
        currentStep: previousStep,
        stepHistory: newHistory,
        canGoBack: newHistory.length > 1,
        isTransitioning: true,
      };
    });
  }, []);

  const canNavigateBack = useCallback(() => {
    return gardenState.stepHistory.length > 1;
  }, [gardenState.stepHistory.length]);

  // === STEP 1: NIGHT SKY ACTIONS ===
  
  const updateReadiness = useCallback((level: number) => {
    setGardenState(prev => ({ ...prev, readinessLevel: level }));
    
    // Update gate selection based on readiness level
    let gate: GateType;
    if (level < 30) gate = 'closed';
    else if (level <= 70) gate = 'partial';
    else gate = 'open';
    
    selectGate(gate);
  }, []);

  const selectGate = useCallback((gate: GateType) => {
    setGardenState(prev => ({ ...prev, selectedGate: gate }));
    
    // Update gate glows in animation state
    setAnimationState(prev => ({
      ...prev,
      nightSkyAnimations: {
        ...prev.nightSkyAnimations,
        gateGlows: {
          open: gate === 'open' ? 1 : 0,
          partial: gate === 'partial' ? 1 : 0,
          closed: gate === 'closed' ? 1 : 0,
        },
      },
    }));
  }, []);

  const proceedFromGate = useCallback(() => {
    if (gardenState.selectedGate === 'closed') {
      showRestMessage(true);
    } else {
      // Proceed to map transition after delay
      setTimeout(() => {
        navigateToStep('mapTransition');
      }, 500);
    }
  }, [gardenState.selectedGate, navigateToStep]);

  const showRestMessage = useCallback((show: boolean) => {
    setGardenState(prev => ({ ...prev, showRestMessage: show }));
  }, []);

  // === STEP 2: MAP TRANSITION ACTIONS ===
  
  const selectTopic = useCallback((topic: TopicType) => {
    setGardenState(prev => ({ ...prev, selectedTopic: topic }));
    
    addInsight({
      type: 'selection',
      content: `Selected topic: ${topic}`,
      step: 'mapTransition',
      metadata: { topic },
    });
    
    // Navigate to field entry
    setTimeout(() => {
      navigateToStep('fieldEntry');
    }, 1000);
  }, [navigateToStep]);

  const updateTransitionPhase = useCallback((phase: TransitionPhase) => {
    setGardenState(prev => ({ ...prev, transitionPhase: phase }));
  }, []);

  // === STEP 3: FIELD ENTRY ACTIONS ===
  
  const updateThought = useCallback((thought: string) => {
    setGardenState(prev => ({ ...prev, userThought: thought }));
  }, []);

  const submitThought = useCallback((thought: string, isPersistent: boolean) => {
    setGardenState(prev => ({
      ...prev,
      userThought: thought,
      isPersistentThought: isPersistent,
    }));
    
    addInsight({
      type: 'thought',
      content: thought,
      step: 'fieldEntry',
      metadata: { isPersistent },
    });
    
    // Navigate based on persistence
    const nextStep = isPersistent ? 'botanicalReflection' : 'gardenPath';
    setTimeout(() => {
      navigateToStep(nextStep);
    }, 500);
  }, [navigateToStep]);

  // === STEP 4: BOTANICAL REFLECTION ACTIONS ===
  
  const startMiningPhase = useCallback((phase: MiningPhase) => {
    setGardenState(prev => ({ ...prev, currentMiningPhase: phase }));
  }, []);

  const completeMiningPhase = useCallback((result: MiningResult) => {
    setGardenState(prev => ({
      ...prev,
      miningResults: [...prev.miningResults, result],
    }));
    
    addInsight({
      type: 'mining',
      content: `Completed ${result.type} phase`,
      step: 'botanicalReflection',
      metadata: { phase: result.phase, type: result.type },
    });
    
    // Update flower state and progress to next phase
    if (result.phase === 1) {
      updateFlowerState('neutral');
      startMiningPhase(2);
    } else if (result.phase === 2) {
      updateFlowerState('fullbloom');
      startMiningPhase(3);
    } else {
      // All phases complete, navigate to garden path
      setTimeout(() => {
        navigateToStep('gardenPath');
      }, 1000);
    }
  }, [navigateToStep]);

  const updateFlowerState = useCallback((state: FlowerState) => {
    setGardenState(prev => ({ ...prev, flowerState: state }));
  }, []);

  // === STEP 5: GARDEN PATH ACTIONS ===
  
  const updateSunlightLevel = useCallback((level: SunlightLevel) => {
    setGardenState(prev => ({ ...prev, sunlightLevel: level }));
    
    // Reload thoughts based on new intensity
    if (gardenState.selectedTopic) {
      loadThoughtOptions(gardenState.selectedTopic, level);
    }
  }, [gardenState.selectedTopic]);

  const loadThoughtOptions = useCallback(async (topic: TopicType, intensity: SunlightLevel): Promise<ThoughtOption[]> => {
    setLoading(true);
    
    try {
      // TODO: Integrate with ContentSearchService
      // For now, return mock data
      const mockThoughts: ThoughtOption[] = [
        {
          id: `thought-${Date.now()}-1`,
          content: `A ${intensity} intensity thought about ${topic}`,
          category: topic,
          subcategory: 'general',
          intensity,
          tags: [topic, intensity],
          source: 'curated',
        },
      ];
      
      setGardenState(prev => ({ ...prev, availableThoughts: mockThoughts }));
      return mockThoughts;
    } catch (error) {
      updateError('Failed to load thought options');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectThought = useCallback((thought: ThoughtOption) => {
    const bouquetItem: BouquetItem = {
      id: thought.id,
      content: thought.content,
      intensity: thought.intensity,
      flowerType: `picker_flower_generic${Math.floor(Math.random() * 16) + 1}.png`,
      position: { x: 0, y: 0 }, // Will be set by animation
      selected: true,
      category: thought.category,
      subcategory: thought.subcategory,
    };
    
    setGardenState(prev => ({
      ...prev,
      selectedThoughts: [...prev.selectedThoughts, bouquetItem],
    }));
    
    addInsight({
      type: 'selection',
      content: thought.content,
      step: 'gardenPath',
      metadata: { thoughtId: thought.id, intensity: thought.intensity },
    });
  }, []);

  const removeSelectedThought = useCallback((thoughtId: string) => {
    setGardenState(prev => ({
      ...prev,
      selectedThoughts: prev.selectedThoughts.filter(t => t.id !== thoughtId),
    }));
  }, []);

  // === EXPORT ACTIONS ===
  
  const createBouquet = useCallback((): BouquetItem[] => {
    return gardenState.selectedThoughts;
  }, [gardenState.selectedThoughts]);

  const exportSession = useCallback(async (format: 'json' | 'pdf' | 'image'): Promise<ExportData> => {
    const exportData: ExportData = {
      sessionId: generateSessionId(),
      completedAt: new Date().toISOString(),
      gardenJourney: {
        readiness: {
          level: gardenState.readinessLevel,
          gate: gardenState.selectedGate!,
        },
        topic: gardenState.selectedTopic!,
        originalThought: gardenState.userThought,
        isPersistent: gardenState.isPersistentThought,
        miningResults: gardenState.miningResults,
        selectedThoughts: gardenState.selectedThoughts,
        insights: gardenState.sessionInsights,
      },
      exportFormat: format,
    };
    
    setGardenState(prev => ({ ...prev, exportData }));
    return exportData;
  }, [gardenState]);

  const resetGarden = useCallback(() => {
    setGardenState(initialGardenState);
    setAnimationState(initialAnimationState);
    sessionIdRef.current = undefined;
  }, []);

  // === ANIMATION ACTIONS ===
  
  const queueAnimation = useCallback((animation: AnimationQueueItem) => {
    setAnimationState(prev => ({
      ...prev,
      animationQueue: [...prev.animationQueue, animation],
    }));
  }, []);

  const clearAnimationQueue = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      animationQueue: [],
    }));
  }, []);

  const setAnimating = useCallback((isAnimating: boolean) => {
    setAnimationState(prev => ({
      ...prev,
      isAnimating,
    }));
    
    setGardenState(prev => ({
      ...prev,
      isTransitioning: isAnimating,
    }));
  }, []);

  // === UTILITY ACTIONS ===
  
  const addInsight = useCallback((insight: Omit<SessionInsight, 'id' | 'timestamp'>) => {
    const fullInsight: SessionInsight = {
      ...insight,
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    
    setGardenState(prev => ({
      ...prev,
      sessionInsights: [...prev.sessionInsights, fullInsight],
    }));
  }, []);

  const updateError = useCallback((error: string | null) => {
    setGardenState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setGardenState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // Context value
  const contextValue: GardenContextValue = {
    // State
    gardenState,
    animationState,
    
    // Navigation Actions
    navigateToStep,
    goBack,
    canNavigateBack,
    
    // Step 1: Night Sky Actions
    updateReadiness,
    selectGate,
    proceedFromGate,
    showRestMessage,
    
    // Step 2: Map Transition Actions
    selectTopic,
    updateTransitionPhase,
    
    // Step 3: Field Entry Actions
    submitThought,
    updateThought,
    
    // Step 4: Botanical Reflection Actions
    startMiningPhase,
    completeMiningPhase,
    updateFlowerState,
    
    // Step 5: Garden Path Actions
    updateSunlightLevel,
    loadThoughtOptions,
    selectThought,
    removeSelectedThought,
    
    // Export Actions
    createBouquet,
    exportSession,
    resetGarden,
    
    // Animation Actions
    queueAnimation,
    clearAnimationQueue,
    setAnimating,
    
    // Utility Actions
    addInsight,
    updateError,
    setLoading,
  };

  return (
    <GardenStateContext.Provider value={contextValue}>
      {children}
    </GardenStateContext.Provider>
  );
}

// Hook for accessing garden context
export function useGardenState(): GardenContextValue {
  const context = useContext(GardenStateContext);
  if (context === undefined) {
    throw new Error('useGardenState must be used within a GardenStateProvider');
  }
  return context;
}

// Convenience hooks for specific parts of the state
export function useGardenStep() {
  const { gardenState, navigateToStep, goBack, canNavigateBack } = useGardenState();
  return {
    currentStep: gardenState.currentStep,
    stepHistory: gardenState.stepHistory,
    canGoBack: gardenState.canGoBack,
    navigateToStep,
    goBack,
    canNavigateBack,
  };
}

export function useGardenAnimations() {
  const { animationState, queueAnimation, clearAnimationQueue, setAnimating } = useGardenState();
  return {
    animationState,
    queueAnimation,
    clearAnimationQueue,
    setAnimating,
  };
}

export function useGardenInsights() {
  const { gardenState, addInsight } = useGardenState();
  return {
    insights: gardenState.sessionInsights,
    addInsight,
  };
}