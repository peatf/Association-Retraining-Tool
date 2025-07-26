# Design Document

## Overview

The Association-Retraining Tool implements a completely client-side, privacy-first architecture for delivering personalized psychological interventions using a high-fidelity, modern machine learning NLP engine. The system operates entirely within the user's browser using Transformers.js with zero-shot text classification, self-hosted ML models, and sophisticated psychological understanding. No backend dependencies are required for core functionality, ensuring complete user privacy and data sovereignty while delivering therapeutically robust interventions through CBT, Socratic questioning, and ACT techniques with unprecedented accuracy and nuance.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client-Side Application"
        UI[HTML/CSS Interface]
        FLOW[User Flow Controller]
        NLP[High-Fidelity NLP Engine - Transformers.js]
        PIPELINE[Singleton Pipeline Manager]
        ENGINE[Psychological Engine]
        CONTENT[JSON Content Loader]
        CALENDAR[ICS Generator]
        STATE[Session State Manager]
        LOADER[Model Loading Manager]
    end
    
    subgraph "Self-Hosted ML Model"
        MODEL[Xenova/nli-deberta-v3-base]
        MODELFILES[Local Model Files (.onnx, config.json, tokenizer.json)]
    end
    
    subgraph "Content Structure"
        TOPICS[Topics JSON]
        EMOTIONS[Emotion Palettes JSON]
        THOUGHTBUFFET[Thought Buffet JSON - Psychological Labels]
        FALLBACK[Generic Fallback Content JSON]
        ACT_CONTENT[ACT Defusion JSON]
    end
    
    subgraph "Core Therapeutic Modules"
        CBT[CBT Module]
        SOCRATIC[Socratic Module]
        ACT[ACT Module]
        SELECTOR[Technique Selector]
        CLASSIFIER[Zero-Shot Text Classifier]
    end
    
    UI --> FLOW
    FLOW --> ENGINE
    ENGINE --> SELECTOR
    SELECTOR --> CBT
    SELECTOR --> SOCRATIC
    SELECTOR --> ACT
    ENGINE --> CONTENT
    CONTENT --> TOPICS
    CONTENT --> EMOTIONS
    CONTENT --> THOUGHTBUFFET
    CONTENT --> FALLBACK
    CONTENT --> ACT_CONTENT
    FLOW --> NLP
    NLP --> PIPELINE
    PIPELINE --> CLASSIFIER
    CLASSIFIER --> MODEL
    MODEL --> MODELFILES
    FLOW --> CALENDAR
    FLOW --> STATE
    FLOW --> LOADER
    LOADER --> MODEL
```

### Privacy-First Architecture

- **No Backend Dependencies**: All core functionality operates client-side
- **Self-Hosted ML Models**: Transformers.js models hosted locally with no external network requests
- **Local Session Management**: Transient state stored only in browser memory
- **Automatic Data Purging**: All user data cleared on session end or page refresh
- **Client-Side NLP**: High-fidelity text processing using local Transformers.js zero-shot classification
- **Model Caching**: Browser caches ML models locally for subsequent sessions
- **Local Calendar Generation**: ICS files generated client-side with no server interaction
- **Confidence-Based Fallbacks**: Generic content served for ambiguous inputs without external processing

## Components and Interfaces

### Client-Side Components

#### 1. User Flow Controller
```javascript
class UserFlowController {
  navigateToScreen(screenId) // Manages screen transitions with animations
  updateProgressIndicator(currentStep, totalSteps) // Updates visual progress dots
  handleUserInput(inputType, value) // Processes user interactions
  validateFlowState() // Ensures proper flow progression
}
```

#### 2. Psychological Engine
```javascript
class PsychologicalEngine {
  selectTechnique(emotionalState, intensity, keywords) // Chooses CBT, Socratic, or ACT
  buildJourneySequence(topic, subtopic, technique) // Creates 5-7 step sequence
  getNextPrompt(currentState, userAction) // Returns next therapeutic prompt
  handleAlternativeAngle(currentPrompt, attemptCount) // Manages "try another angle" logic
  triggerACTDefusion(topic, emotionalState) // Initiates ACT defusion exercises
}
```

#### 3. Content Manager
```javascript
class ContentManager {
  loadTherapeuticContent() // Loads all JSON content files
  getEmotionPalette(topic) // Returns topic-specific emotion arrays
  getSubtopicContent(topic, subtopic) // Gets CBT/Socratic content for subtopic
  getACTDefusionExercises(topic) // Returns ACT exercises for topic
  selectSubtopicByKeywords(topic, keywords, emotion) // Intelligent subtopic selection
}
```

#### 4. High-Fidelity NLP Engine
```javascript
class HighFidelityNLPEngine {
  async initializeModel(progressCallback) // Initializes Transformers.js pipeline with progress updates
  async classifyText(text, candidateLabels) // Performs zero-shot text classification
  getConfidenceThreshold() // Returns minimum confidence threshold for classification
  selectBestLabel(classificationResults) // Intelligently selects highest-confidence label
  handleLowConfidence(classificationResults) // Manages fallback for ambiguous inputs
  generateFallbackContent() // Returns generic supportive content for low-confidence cases
}
```

#### 5. Singleton Pipeline Manager
```javascript
class SingletonPipelineManager {
  static async getInstance(progressCallback) // Returns singleton pipeline instance
  static isModelLoaded() // Checks if model is ready for classification
  static async classify(text, labels, options) // Main classification method
  static getLoadingProgress() // Returns current model loading progress
  static clearInstance() // Clears singleton for testing/reset
}
```

#### 6. Model Loading Manager
```javascript
class ModelLoadingManager {
  displayLoadingIndicator() // Shows graceful loading UI with positive messaging
  updateProgress(percentage, message) // Updates progress bar and status text
  hideLoadingIndicator() // Removes loading UI when model is ready
  handleLoadingError(error) // Manages model loading failures gracefully
  generateProgressMessages() // Creates encouraging loading messages
}
```

#### 5. Session State Manager
```javascript
class SessionStateManager {
  initializeSession() // Creates new session state
  updateState(key, value) // Updates session variables
  getCurrentState() // Returns current session state
  clearSession() // Purges all session data
  // No persistent storage - all data in memory only
}
```

#### 6. Calendar Generator
```javascript
class CalendarGenerator {
  generateICSFile(frequency) // Creates downloadable .ICS calendar file
  formatReminderContent() // Generates generic reminder text
  triggerDownload(icsContent) // Initiates file download
  // Completely client-side, no server interaction
}
```

### Therapeutic Technique Modules

#### 1. CBT Module
```javascript
class CBTModule {
  getReframingPrompts(subtopic, step) // Returns progressive CBT reframes
  generateAlternativeThoughts(originalThought) // Creates thought alternatives
  buildCBTSequence(subtopic) // Creates structured CBT journey
}
```

#### 2. Socratic Module
```javascript
class SocraticModule {
  getGuidedQuestions(subtopic, step) // Returns progressive Socratic questions
  buildQuestionSequence(userContext) // Creates questioning flow
  generateFollowUpQuestions(userResponse) // Adaptive questioning
}
```

#### 3. ACT Module
```javascript
class ACTModule {
  getDefusionExercises(topic) // Returns mindfulness/defusion exercises
  generateMindfulnessPrompts(emotionalState) // Creates present-moment awareness exercises
  buildACTSequence(intensity) // Creates ACT intervention flow
}
```

### UI Components

#### 1. Screen Manager
- Handles smooth transitions between 9 distinct screens
- Manages screen-specific animations and micro-interactions
- Implements responsive design for mobile and desktop
- Controls visual progress indicators

#### 2. Progress Indicator
- Displays filled dots showing journey progression
- Updates dynamically as user advances through steps
- Provides visual feedback for completion status
- Supports 5-7 step journey visualization

#### 3. Animation Controller
- Manages subtle micro-animations for completion screen
- Handles smooth transitions between prompts
- Implements calming visual effects
- Controls celebratory completion animations

## Data Models

### Client-Side Session State
```javascript
{
  currentScreen: "landing|readiness|topic|emotion|starting-text|journey|act-defusion|completion|calendar",
  intensity: 0-10, // From readiness check slider
  selectedTopic: "Money|Romance|Self-Image",
  selectedEmotion: "string", // From topic-specific emotion palette
  userText: "string", // Optional text input
  extractedKeywords: ["string"], // NLP-extracted keywords
  selectedSubtopic: "string", // Intelligently selected based on keywords/emotion
  currentTechnique: "cbt|socratic|act",
  journeySequence: [
    {
      step: "number",
      type: "cbt|socratic|act",
      prompt: "string",
      completed: "boolean"
    }
  ],
  currentStep: "number",
  totalSteps: "number",
  alternativeAngleClicks: "number", // Counter for ACT defusion trigger
  completionSummary: "string" // Emotional shift summary
}
```

### JSON Content Structure

#### Topics Configuration (topics.json)
```javascript
{
  "topics": ["Money", "Romance", "Self-Image"],
  "topicDescriptions": {
    "Money": "Financial concerns, scarcity, and abundance mindset",
    "Romance": "Relationships, dating, and emotional connections", 
    "Self-Image": "Self-worth, confidence, and personal identity"
  }
}
```

#### Emotion Palettes (emotions.json)
```javascript
{
  "Money": {
    "palette": ["anxious", "resentful", "overwhelmed", "insecure", "ashamed", "fearful"],
    "descriptions": {
      "anxious": "Worried about financial security",
      "resentful": "Angry about financial limitations",
      // ... additional descriptions
    }
  },
  "Romance": {
    "palette": ["lonely", "rejected", "unworthy", "desperate", "heartbroken", "jealous"],
    "descriptions": {
      // ... emotion descriptions
    }
  },
  "Self-Image": {
    "palette": ["inadequate", "worthless", "embarrassed", "disappointed", "self-critical", "defeated"],
    "descriptions": {
      // ... emotion descriptions  
    }
  }
}
```

#### High-Fidelity NLP Configuration (nlp-config.json)
```javascript
{
  "candidateLabels": [
    "feeling of worthlessness",
    "anxiety about the future", 
    "lack of motivation",
    "conflict between desire and action",
    "self-criticism",
    "fear of failure",
    "financial scarcity mindset",
    "loneliness in relationships",
    "imposter syndrome",
    "procrastination due to feeling overwhelmed",
    "perfectionism paralysis",
    "social comparison anxiety",
    "rejection sensitivity",
    "abandonment fears",
    "career dissatisfaction",
    "body image concerns",
    "relationship conflict avoidance",
    "decision-making paralysis",
    "chronic self-doubt",
    "emotional numbness"
  ],
  "confidenceThreshold": 0.45,
  "modelConfig": {
    "modelName": "Xenova/nli-deberta-v3-base",
    "localModelPath": "/models/",
    "allowRemoteModels": false,
    "multiLabel": true
  }
}
```

#### Thought Buffet Content (thought-buffet.json)
```javascript
{
  "feeling_of_worthlessness": [
    "My inherent worth is not defined by my thoughts, feelings, or achievements.",
    "This is just a feeling; it is not the truth of who I am.",
    "I will treat myself with the same kindness I would offer a friend feeling this way.",
    "My value as a person exists independent of my current emotional state.",
    "These difficult feelings are temporary visitors, not permanent residents."
  ],
  "conflict_between_desire_and_action": [
    "It's okay that my actions and desires aren't perfectly aligned right now. I can hold both feelings at once.",
    "My awareness of this conflict is a powerful first step toward change.",
    "I will focus on compassion for myself, not judgment for my lack of action.",
    "Small steps toward alignment are still meaningful progress.",
    "This internal tension shows I care deeply about growth and authenticity."
  ],
  "anxiety_about_the_future": [
    "I cannot control the future, but I can influence how I respond to uncertainty.",
    "My anxiety shows that I care about outcomes, which reflects my values.",
    "I will focus on what I can control in this present moment.",
    "Uncertainty is uncomfortable, but it also holds space for positive possibilities.",
    "I have navigated uncertainty before and found my way through."
  ],
  "financial_scarcity_mindset": [
    "My relationship with money reflects learned patterns that I can gradually shift.",
    "Scarcity thinking served a purpose once, but I can choose abundance thinking now.",
    "I have managed resources effectively in the past and can do so again.",
    "My worth is not determined by my financial situation.",
    "I can take one small step today toward financial wellness and security."
  ],
  "imposter_syndrome": [
    "My achievements are real, even when my confidence wavers.",
    "Feeling like an imposter often means I'm growing and challenging myself.",
    "I belong in spaces where I've earned my place through effort and skill.",
    "Everyone feels uncertain sometimes; it doesn't invalidate my competence.",
    "I can acknowledge my accomplishments while still having room to grow."
  ],
  // ... additional psychological labels with 3-5 reframes each
  "generic_fallback": [
    "It's okay if my thoughts feel tangled right now.",
    "I don't need to have it all figured out.",
    "My feelings are valid, even if they're hard to put into words.",
    "This moment of difficulty is temporary and will pass.",
    "I am worthy of compassion, especially from myself.",
    "Taking time to reflect on my thoughts shows strength and self-awareness."
  ]
}
```

#### Legacy Therapeutic Content Structure (therapeutic-content.json)
```javascript
{
  "Money": {
    "subtopics": {
      "Scarcity": {
        "keywordTriggers": ["enough", "never", "lack", "poor", "broke", "insufficient"],
        "emotionTriggers": ["anxious", "fearful", "overwhelmed"],
        "cbtSequence": [
          {
            "step": 1,
            "prompt": "What's one piece of evidence that you have been able to get what you need in the past?",
            "type": "socratic"
          },
          {
            "step": 2, 
            "prompt": "Instead of 'There is never enough', could the thought be 'I can manage my resources effectively'?",
            "type": "cbt"
          }
          // ... 5-7 total steps
        ]
      },
      "Debt/Shame": {
        "keywordTriggers": ["debt", "shame", "embarrassed", "guilty", "terrible"],
        "emotionTriggers": ["ashamed", "resentful", "insecure"],
        "cbtSequence": [
          // ... therapeutic sequence
        ]
      }
    },
    "actDefusion": [
      "Imagine your troubling thought gently drifting by on a cloud.",
      "Thank your mind for the thought, and gently return your focus to your breath.",
      "Notice the thought about money, and imagine placing it in a balloon and letting it float away."
      // ... additional ACT exercises
    ]
  }
  // ... Romance and Self-Image content
}
```

### User Flow State Transitions
```javascript
const FLOW_STATES = {
  LANDING: "landing",
  READINESS_CHECK: "readiness", 
  TOPIC_SELECTION: "topic",
  EMOTION_SELECTION: "emotion",
  STARTING_TEXT: "starting-text",
  THERAPEUTIC_JOURNEY: "journey",
  ACT_DEFUSION: "act-defusion", 
  COMPLETION: "completion",
  CALENDAR_SETUP: "calendar"
};

const VALID_TRANSITIONS = {
  [FLOW_STATES.LANDING]: [FLOW_STATES.READINESS_CHECK],
  [FLOW_STATES.READINESS_CHECK]: [FLOW_STATES.TOPIC_SELECTION, FLOW_STATES.ACT_DEFUSION],
  [FLOW_STATES.TOPIC_SELECTION]: [FLOW_STATES.EMOTION_SELECTION],
  [FLOW_STATES.EMOTION_SELECTION]: [FLOW_STATES.STARTING_TEXT],
  [FLOW_STATES.STARTING_TEXT]: [FLOW_STATES.THERAPEUTIC_JOURNEY, FLOW_STATES.ACT_DEFUSION],
  [FLOW_STATES.THERAPEUTIC_JOURNEY]: [FLOW_STATES.ACT_DEFUSION, FLOW_STATES.COMPLETION],
  [FLOW_STATES.ACT_DEFUSION]: [FLOW_STATES.COMPLETION],
  [FLOW_STATES.COMPLETION]: [FLOW_STATES.CALENDAR_SETUP, FLOW_STATES.LANDING],
  [FLOW_STATES.CALENDAR_SETUP]: [FLOW_STATES.LANDING]
};
```

## Error Handling

### Client-Side Error Handling
- **Model Loading Failures**: Graceful fallback to generic therapeutic content with user-friendly error messages
- **Content Loading Failures**: Graceful fallback to embedded default content
- **NLP Processing Errors**: Fallback to generic fallback content when classification fails
- **Low Confidence Classifications**: Automatic fallback to universally supportive therapeutic statements
- **Invalid User Input**: Client-side validation with helpful error messages
- **Session State Corruption**: Automatic session reset with user notification
- **Browser Compatibility Issues**: Progressive enhancement with feature detection
- **Memory Constraints**: Efficient model loading with memory management for resource-limited devices

### User Experience Error Handling
- **Missing Content**: Display helpful messages and alternative options
- **Flow State Errors**: Automatic correction or guided restart
- **Animation Failures**: Graceful degradation to static interface
- **Accessibility Issues**: Fallback to high-contrast, screen-reader friendly modes

### Privacy Protection
- **Automatic Data Purging**: All session data cleared on errors or page refresh
- **No Persistent Storage**: Prevents data leakage across sessions
- **Local Processing Only**: No external data transmission for core functionality

## Testing Strategy

### Client-Side Unit Testing
1. **Psychological Engine Tests**
   - Technique selection logic based on intensity, keywords, and emotions
   - Journey sequence building for 5-7 step therapeutic flows
   - Alternative angle handling and ACT defusion triggering
   - Subtopic selection intelligence using NLP keywords

2. **Content Management Tests**
   - JSON content loading and parsing
   - Emotion palette retrieval for each topic
   - Therapeutic content filtering and selection
   - Fallback content handling for missing data

3. **High-Fidelity NLP Engine Tests**
   - Zero-shot text classification accuracy with psychological labels
   - Confidence threshold validation and fallback triggering
   - Model loading and initialization with progress tracking
   - Singleton pipeline manager instance management
   - Multi-label classification for complex psychological states
   - Transformers.js integration and local model hosting verification

4. **User Flow Tests**
   - Screen transition logic and validation
   - Progress indicator updates
   - Session state management
   - Flow state validation and error correction

### Integration Testing
1. **Complete User Journey Tests**
   - End-to-end flow from landing to completion
   - All 9 screen transitions with proper state management
   - Multi-step therapeutic journey progression
   - ACT defusion branch triggering and completion

2. **Content Integration Tests**
   - JSON content loading across all topics and subtopics
   - NLP keyword matching with therapeutic content
   - Technique selection integration with content delivery
   - Calendar generation with proper ICS formatting

3. **Cross-Browser Compatibility Tests**
   - Modern browser support (Chrome, Firefox, Safari, Edge)
   - Mobile responsiveness across devices
   - Progressive enhancement for older browsers
   - Accessibility compliance testing

### User Experience Testing
1. **Therapeutic Effectiveness Tests**
   - User flow completion rates
   - Emotional shift perception (qualitative feedback)
   - Technique preference patterns
   - Session duration and engagement metrics

2. **Usability Testing**
   - Interface intuitiveness and clarity
   - Progress indicator effectiveness
   - Animation and transition smoothness
   - Error message helpfulness

3. **Accessibility Testing**
   - Screen reader compatibility
   - Keyboard navigation support
   - Color contrast compliance
   - Focus management and visual indicators

### Privacy and Security Testing
1. **Data Protection Verification**
   - No persistent storage of user data
   - Automatic session data purging
   - No external data transmission for core functionality
   - Local-only NLP processing verification

2. **Client-Side Security Tests**
   - Content integrity and availability
   - Session state isolation between users
   - Browser security feature compatibility
   - XSS prevention in user input handling

## Implementation Considerations

### Performance Optimization
- **Model Caching**: Browser caches Transformers.js models locally for subsequent sessions
- **Lazy Model Loading**: ML model loads only when needed with singleton pattern for efficiency
- **JSON Content Preloading**: Load all therapeutic content on initial page load for instant access
- **NLP Processing Optimization**: Efficient zero-shot classification with result caching and confidence thresholds
- **Progressive Enhancement**: Core functionality works without ML model, enhanced with high-fidelity classification
- **Memory Management**: Automatic cleanup of session data, model instances, and unused content references
- **Animation Performance**: Hardware-accelerated CSS transitions and transforms
- **Loading Experience**: Graceful model initialization with progress indicators and positive messaging

### Client-Side Architecture Benefits
- **Zero Server Dependencies**: Complete functionality without backend infrastructure
- **Instant Response Times**: No network latency for core therapeutic interactions
- **Offline Capability**: Full functionality available without internet connection after initial load
- **Privacy by Design**: No data transmission means no privacy concerns
- **Cost Effectiveness**: No server hosting or maintenance costs

### Content Management Strategy
- **Modular JSON Structure**: Easy addition of new topics, subtopics, and therapeutic techniques
- **Version Control**: Content updates through simple JSON file replacements
- **Localization Support**: Structure supports multiple language content files
- **A/B Testing**: Different content variations can be tested through JSON configuration
- **Content Validation**: Client-side validation ensures content integrity and completeness

### User Experience Considerations
- **Progressive Disclosure**: Information revealed gradually to prevent cognitive overload
- **Accessibility First**: WCAG 2.1 AA compliance built into core design
- **Mobile-First Design**: Optimized for touch interactions and small screens
- **Therapeutic Pacing**: Deliberate timing and transitions to support therapeutic process
- **Error Recovery**: Graceful handling of user mistakes with helpful guidance

### Deployment and Distribution
- **Static Site Hosting**: Can be deployed to any static hosting service (GitHub Pages, Netlify, etc.)
- **CDN Distribution**: Global content delivery for fast loading worldwide
- **Offline PWA**: Progressive Web App capabilities for offline usage
- **Browser Compatibility**: Graceful degradation for older browsers
- **Security Headers**: Proper CSP and security headers for client-side protection

### Future Enhancement Pathways
- **Additional Therapeutic Modalities**: Easy integration of new psychological techniques
- **Personalization Engine**: Enhanced NLP for more sophisticated content selection
- **Progress Tracking**: Optional anonymous usage analytics for effectiveness measurement
- **Community Features**: Potential for anonymous peer support integration
- **Professional Integration**: Therapist dashboard for monitoring client progress (with consent)