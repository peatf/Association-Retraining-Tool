// Garden State Types - Type definitions for the Inner Garden UI state management
// Manages the 5-step garden journey: Night Sky → Map → Field → Reflection → Path

export type StepType = 'nightSky' | 'mapTransition' | 'fieldEntry' | 'botanicalReflection' | 'gardenPath';
export type GateType = 'open' | 'partial' | 'closed';
export type TopicType = 'money' | 'relationships' | 'selfImage';
export type FlowerState = 'bud' | 'neutral' | 'fullbloom' | 'wilted';
export type SunlightLevel = 'low' | 'mid' | 'high';
export type MiningPhase = 1 | 2 | 3;
export type TransitionPhase = 'fade' | 'reveal' | 'zoom' | 'complete';

// Core Garden State Interface
export interface GardenState {
  // Navigation
  currentStep: StepType;
  stepHistory: StepType[];
  canGoBack: boolean;
  
  // Step 1: Night Sky
  readinessLevel: number; // 0-100
  selectedGate: GateType | null;
  showRestMessage: boolean;
  
  // Step 2: Map Transition
  transitionPhase: TransitionPhase;
  selectedTopic: TopicType | null;
  
  // Step 3: Field Entry
  userThought: string;
  isPersistentThought: boolean;
  
  // Step 4: Botanical Reflection
  currentMiningPhase: MiningPhase;
  flowerState: FlowerState;
  miningResults: MiningResult[];
  
  // Step 5: Garden Path
  sunlightLevel: SunlightLevel;
  availableThoughts: ThoughtOption[];
  selectedThoughts: BouquetItem[];
  
  // Export & Session
  sessionInsights: SessionInsight[];
  exportData: ExportData | null;
  
  // UI State
  isTransitioning: boolean;
  isLoading: boolean;
  error: string | null;
}

// Mining Result for each phase of botanical reflection
export interface MiningResult {
  phase: MiningPhase;
  type: 'neutralize' | 'commonGround' | 'dataExtraction';
  userInput: string;
  selectedPrompts: string[];
  aiResponse?: string;
  timestamp: string;
  completed: boolean;
}

// Bouquet item for final thought selection
export interface BouquetItem {
  id: string;
  content: string;
  intensity: SunlightLevel;
  flowerType: string; // Asset filename
  position: { x: number; y: number };
  selected: boolean;
  category: string;
  subcategory?: string;
}

// Thought option from content service
export interface ThoughtOption {
  id: string;
  content: string;
  category: string;
  subcategory: string;
  intensity: SunlightLevel;
  tags: string[];
  source: 'curated' | 'ai-generated';
}

// Session insight collected during journey
export interface SessionInsight {
  id: string;
  type: 'readiness' | 'thought' | 'mining' | 'selection';
  content: string;
  step: StepType;
  timestamp: string;
  metadata: Record<string, any>;
}

// Final export data structure
export interface ExportData {
  sessionId: string;
  completedAt: string;
  gardenJourney: {
    readiness: {
      level: number;
      gate: GateType;
    };
    topic: TopicType;
    originalThought: string;
    isPersistent: boolean;
    miningResults: MiningResult[];
    selectedThoughts: BouquetItem[];
    insights: SessionInsight[];
  };
  exportFormat: 'json' | 'pdf' | 'image';
}

// Animation state management
export interface AnimationState {
  // Global animation control
  isAnimating: boolean;
  currentAnimation: string | null;
  animationQueue: AnimationQueueItem[];
  
  // Step-specific animations
  nightSkyAnimations: {
    cloudsBack: boolean;
    cloudsFront: boolean;
    starsTwinkling: boolean;
    gateGlows: Record<GateType, number>;
  };
  
  mapTransitionAnimations: {
    skyFadeOut: boolean;
    mapReveal: boolean;
    zoomToFlowerBeds: boolean;
  };
  
  fieldEntryAnimations: {
    diveIntoField: boolean;
    journalAppear: boolean;
    petalDrift: boolean;
  };
  
  botanicalReflectionAnimations: {
    flowerTransformation: boolean;
    rootsGrowth: boolean;
    phaseTransitions: boolean;
  };
  
  gardenPathAnimations: {
    sunlightOverlay: boolean;
    flowerWiggle: boolean;
    bouquetCollection: boolean;
  };
}

export interface AnimationQueueItem {
  id: string;
  type: 'gsap' | 'css' | 'webm';
  target: string;
  properties: Record<string, any>;
  duration: number;
  delay?: number;
  ease?: string;
  onComplete?: () => void;
  onStart?: () => void;
}

// Garden Context Value
export interface GardenContextValue {
  // State
  gardenState: GardenState;
  animationState: AnimationState;
  
  // Navigation Actions
  navigateToStep: (step: StepType) => void;
  goBack: () => void;
  canNavigateBack: () => boolean;
  
  // Step 1: Night Sky Actions
  updateReadiness: (level: number) => void;
  selectGate: (gate: GateType) => void;
  proceedFromGate: () => void;
  showRestMessage: (show: boolean) => void;
  
  // Step 2: Map Transition Actions
  selectTopic: (topic: TopicType) => void;
  updateTransitionPhase: (phase: TransitionPhase) => void;
  
  // Step 3: Field Entry Actions
  submitThought: (thought: string, isPersistent: boolean) => void;
  updateThought: (thought: string) => void;
  
  // Step 4: Botanical Reflection Actions
  startMiningPhase: (phase: MiningPhase) => void;
  completeMiningPhase: (result: MiningResult) => void;
  updateFlowerState: (state: FlowerState) => void;
  
  // Step 5: Garden Path Actions
  updateSunlightLevel: (level: SunlightLevel) => void;
  loadThoughtOptions: (topic: TopicType, intensity: SunlightLevel) => Promise<ThoughtOption[]>;
  selectThought: (thought: ThoughtOption) => void;
  removeSelectedThought: (thoughtId: string) => void;
  
  // Export Actions
  createBouquet: () => BouquetItem[];
  exportSession: (format: 'json' | 'pdf' | 'image') => Promise<ExportData>;
  resetGarden: () => void;
  
  // Animation Actions
  queueAnimation: (animation: AnimationQueueItem) => void;
  clearAnimationQueue: () => void;
  setAnimating: (isAnimating: boolean) => void;
  
  // Utility Actions
  addInsight: (insight: Omit<SessionInsight, 'id' | 'timestamp'>) => void;
  updateError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Asset Preloader Types
export interface AssetManifest {
  critical: string[]; // Must load before app starts
  step1: string[]; // Night sky assets
  step2: string[]; // Map transition assets
  step3: string[]; // Field entry assets
  step4: string[]; // Botanical reflection assets
  step5: string[]; // Garden path assets
  decorative: string[]; // Can load progressively
}

export interface LoadingProgress {
  total: number;
  loaded: number;
  currentAsset: string;
  progress: number; // 0-100
  errors: string[];
}

// Hook return types
export interface UseGardenState {
  gardenState: GardenState;
  actions: Omit<GardenContextValue, 'gardenState' | 'animationState'>;
}

export interface UseGardenAnimations {
  animationState: AnimationState;
  queueAnimation: (animation: AnimationQueueItem) => void;
  clearAnimationQueue: () => void;
  setAnimating: (isAnimating: boolean) => void;
}

export interface UseAssetLoader {
  loadingProgress: LoadingProgress;
  isLoading: boolean;
  hasError: boolean;
  preloadAssets: (assets: string[]) => Promise<void>;
  preloadStep: (step: StepType) => Promise<void>;
}

// Content Integration Types (for existing content service)
export interface ContentQuery {
  topic: TopicType;
  phase?: MiningPhase;
  intensity?: SunlightLevel;
  category?: string;
  subcategory?: string;
}

export interface ContentResponse {
  prompts?: string[];
  thoughts?: ThoughtOption[];
  metadata?: Record<string, any>;
}

// Error Types
export type GardenError = 
  | 'ASSET_LOAD_FAILED'
  | 'CONTENT_LOAD_FAILED'
  | 'ANIMATION_FAILED'
  | 'STATE_UPDATE_FAILED'
  | 'EXPORT_FAILED'
  | 'SESSION_RECOVERY_FAILED';

export interface GardenErrorDetails {
  type: GardenError;
  message: string;
  step?: StepType;
  details?: Record<string, any>;
  timestamp: string;
}