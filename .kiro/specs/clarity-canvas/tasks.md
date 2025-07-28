# Clarity Canvas Implementation Plan

## Guiding Principles

- **User Experience First**: Every component must feel tactile, responsive, and therapeutically supportive
- **Privacy by Design**: All processing remains client-side with no data transmission
- **Progressive Enhancement**: Core functionality works without AI, enhanced features gracefully degrade
- **Accessibility First**: Full keyboard navigation, screen reader support, and inclusive design

## Phase 1: Foundation & React Infrastructure

**Objective**: Establish the React application foundation, global state management, and core canvas layout system.

**Definition of Done**: A working React application with canvas layout, session management, and basic navigation between lanes.

- [x] 1. React Application Setup

  - Install React, ReactDOM, and essential dependencies (Framer Motion, styled-components)
  - Create src/index.js as the main entry point with React.StrictMode
  - Set up the main App.jsx component with canvas container structure
  - Configure build system to work with existing content pipeline
  - _Requirements: 3.1, 3.2_

- [x] 1.1 Environment and Configuration Setup

  - Create environment configuration for CONTENT_INDEX_PATH and other canvas settings
  - Add validation to ensure required environment variables are present
  - Implement configuration system that supports dev/staging/prod content branches
  - Add feature flag infrastructure for gradual rollout and A/B testing
  - _Requirements: 6.1, 6.2_

- [x] 2. Global State Management

  - Create SessionContext with canvas state management (currentLane, userJourney, insights)
  - Implement SessionProvider with state updates, insight tracking, and session clearing
  - Create useSession hook for accessing canvas state throughout component tree
  - Integrate with existing SessionStateManager for backward compatibility
  - _Requirements: 5.1, 5.2_

- [x] 3. Canvas Layout System

  - Build Canvas.jsx as the main layout container with lane management
  - Create Lane.jsx component for organizing cards within lanes
  - Implement responsive grid system that adapts from 3-lane desktop to single-column mobile
  - Add CSS-in-JS styling with design tokens for consistent theming
  - _Requirements: 3.2, 3.3, 7.4_

- [ ] 4. Navigation Infrastructure
  - Create Breadcrumb.jsx component for journey tracking and backtracking
  - Implement navigation state management with history and forward/back functionality
  - Build Footer.jsx with export controls and session management
  - Add keyboard navigation support for all navigation elements
  - _Requirements: 3.3, 7.3, 9.2_

## Phase 2: Card System Foundation

**Objective**: Build the reusable card system that will power all therapeutic interactions.

**Definition of Done**: A complete BaseCard component with loading states, error handling, and accessibility features that can be extended for specific card types.

- [x] 5. Base Card Component

  - Create BaseCard.jsx with consistent card structure (header, content, actions)
  - Implement card states: active, completed, loading, error with visual indicators
  - Add Framer Motion animations for card entry, hover, and state transitions
  - Include comprehensive accessibility attributes (ARIA labels, roles, keyboard support)
  - _Requirements: 3.2, 7.3, 8.3, 9.1_

- [-] 6. Error Handling System

  - Build ErrorState component for displaying friendly error messages with retry options
  - Create CanvasErrorBoundary to catch unexpected errors and preserve user insights
  - Implement graceful degradation when ContentSearchService fails
  - Add error recovery mechanisms that don't lose user progress
  - _Requirements: 8.1, 8.2, 8.5, 8.6_

- [x] 6.1 Global Error Boundary Implementation

  - Create top-level React ErrorBoundary that catches all unexpected JavaScript errors
  - Display friendly "Something went wrong" card while preserving user insights
  - Add error reporting to capture error details for debugging
  - Implement session recovery that allows users to continue after errors
  - _Requirements: 8.6, 9.1_

- [x] 6.2 PsychologicalEngine robustness
  - Integrate error handling into PsychologicalEngine to catch and gracefully handle AI model failures.
  - Ensure that if the HighFidelityNLPEngine fails, the system falls back to the SingletonPipelineManager without disrupting the user flow.
  - Add unit tests to verify that the fallback mechanism works as expected.
  - _Requirements: 8.2, 8.5_

- [x] 6.3 – Integrate the new error-handling system into the main UI flows.

- [x] 7. Loading and Spinner System
  - Create reusable Spinner component with different sizes and accessibility support
  - Build skeleton loading states for cards while content loads
  - Implement loading state management that doesn't block user interactions
  - Add progress indicators for multi-step processes
  - _Requirements: 8.3, 7.2, 9.1_

## Phase 3: Readiness Gate Implementation

**Objective**: Build the entry point assessment system that determines user readiness and routes appropriately.

**Definition of Done**: A complete readiness assessment flow with Yes/No prompts, intensity slider, and gentle off-ramp for users not ready to proceed.

- [x] 8. Readiness Assessment Card

  - Create ReadinessGate.jsx with readiness question and Yes/No buttons
  - Implement intensity slider (0-10) with clear labeling and accessibility
  - Add visual feedback for intensity levels with appropriate messaging
  - Include data-testid attributes for automated testing
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2_

- [x] 9. Centering Exercise Off-Ramp

  - Build CenteringExercise.jsx component for users not ready to proceed
  - Create gentle, supportive content for emotional regulation
  - Implement completion flow that returns users to readiness assessment
  - Add option to exit gracefully without proceeding to main flow
  - _Requirements: 1.4, 1.6_

- [x] 10. Readiness Flow Integration
  - Integrate readiness assessment with canvas navigation system
  - Implement routing logic based on readiness and intensity levels
  - Add session state tracking for readiness decisions
  - Create smooth transitions between readiness states
  - _Requirements: 1.5, 3.3_

## Phase 4: Thought Mining Card System

**Objective**: Build the core interactive card system for thought processing using the three-step mining sequence.

**Definition of Done**: Complete thought mining flow with Neutralize, Common Ground, and Data Extraction cards that dynamically load content from ContentSearchService.

- [x] 11. Card Neutralize Implementation

  - Create CardNeutralize.jsx that loads prompts using ContentSearchService.getMiningPrompts(topic, 'neutralize')
  - Implement prompt selection interface with clear visual feedback
  - Add completion logic that captures selected prompt and timestamp
  - Include error handling for content loading failures with retry mechanisms
  - _Requirements: 2.4, 5.1, 8.1, 9.1_

- [x] 12. Card Common Ground Implementation

  - Build CardCommonGround.jsx using ContentSearchService.getMiningPrompts(topic, 'commonGround')
  - Create interface for exploring protective intention questions
  - Implement insights capture with textarea for user reflections
  - Add completion logic that saves insights and progression state
  - _Requirements: 2.5, 5.1, 8.1, 9.1_

- [ ] 13. Card Data Extraction Implementation

  - Create CardDataExtraction.jsx with ContentSearchService.getMiningPrompts(topic, 'dataExtraction')
  - Build either/or question interface with clear option selection
  - Implement response tracking and extracted data summarization
  - Add completion logic that captures all responses and core insights
  - _Requirements: 2.6, 5.1, 8.1, 9.1_

- [ ] 14. Thought Mining Container
  - Build ThoughtMining.jsx to orchestrate the three-card sequence
  - Implement progress tracking with visual indicators for completed steps
  - Add "I have what I need" exit option available after first card completion
  - Create smooth transitions between cards with state preservation
  - _Requirements: 2.2, 2.7, 3.3_

## Phase 5: Hierarchical Thought Picker Integration

**Objective**: Integrate the existing React thought picker components into the canvas system with proper content pipeline integration.

**Definition of Done**: A complete hierarchical thought selection system that works within the canvas layout and connects to the content pipeline.

- [ ] 15. Thought Picker Canvas Integration

  - Integrate existing TopicSelector.jsx, SubTopicReveal.jsx, and ReplacementThoughtList.jsx into canvas
  - Adapt components to work with canvas state management and navigation
  - Ensure components use ContentSearchService for all content queries
  - Add canvas-specific styling and animations consistent with card system
  - _Requirements: 4.1, 4.2, 4.3, 5.1_

- [ ] 16. Hierarchical Selection Flow

  - Implement topic selection that reveals subcategories dynamically
  - Create smooth transitions between selection levels with breadcrumb navigation
  - Add filtering logic for replacement thoughts based on category, subcategory, and intensity
  - Include selection state management that integrates with overall canvas state
  - _Requirements: 4.4, 4.5, 3.3_

- [ ] 17. Thought Export and Capture
  - Build thought selection interface with export capabilities
  - Implement copy/export functionality for selected insights
  - Add selected thoughts to canvas insights collection
  - Create completion flow that integrates with overall session management
  - _Requirements: 4.6, 3.6, 5.1_

## Phase 6: Content Pipeline Enhancement

**Objective**: Enhance the existing content pipeline to support the new mining prompts structure required by the card system.

**Definition of Done**: Content pipeline generates properly structured mining prompts for neutralize, commonGround, and dataExtraction categories.

- [ ] 18. Mining Prompts Content Structure

  - Update content/raw/\*.json files to include comprehensive miningPrompts sections
  - Create neutralize prompts (5 per category) for voice neutralization exercises
  - Author commonGround prompts (5 per category) for protective intention exploration
  - Write dataExtraction prompts (5 per category) as either/or questions for data mining
  - _Requirements: 2.4, 2.5, 2.6, 5.1_

- [ ] 19. Content Pipeline Integration Testing
  - Verify ContentSearchService.getMiningPrompts() returns properly formatted prompts
  - Test content pipeline regeneration with npm run content:refresh
  - Validate that all card components receive expected prompt structures
  - Ensure graceful handling when prompts are missing or malformed
  - _Requirements: 5.4, 8.1, 8.4_

## Phase 7: Polish, Performance, and Accessibility

**Objective**: Complete the user experience with animations, performance optimizations, and full accessibility compliance.

**Definition of Done**: A polished, performant, and fully accessible canvas interface that meets all design and usability requirements.

- [ ] 20. Animation and Motion Implementation

  - Add Framer Motion animations for card entry, lane transitions, and micro-interactions
  - Implement hover states, button presses, and loading animations
  - Add support for prefers-reduced-motion with appropriate fallbacks
  - Create smooth transitions that enhance rather than distract from therapeutic work
  - _Requirements: 3.2, 7.4_

- [ ] 21. Performance Optimization

  - Implement lazy loading for cards and content to meet <15MB budget
  - Add React.memo and useMemo optimizations for expensive operations
  - Optimize ContentSearchService calls with caching and request deduplication
  - Ensure canvas remains responsive during AI model processing
  - _Requirements: 7.1, 7.2_

- [ ] 22. Accessibility Compliance

  - Complete WCAG 2.1 AA compliance audit with keyboard navigation testing
  - Add comprehensive ARIA attributes, focus management, and screen reader support
  - Implement high-contrast mode support and color-blind friendly design
  - Test with actual assistive technologies and incorporate feedback
  - _Requirements: 7.3, 7.4, 7.5, 9.2_

- [ ] 23. Mobile and Responsive Polish
  - Optimize canvas layout for mobile devices with touch-friendly interactions
  - Implement responsive card sizing and lane stacking for small screens
  - Add swipe gestures and mobile-specific navigation patterns
  - Test across device sizes and orientations for consistent experience
  - _Requirements: 7.4, 3.2_

## Phase 8: Integration and Deployment

**Objective**: Replace the existing vanilla JavaScript application with the new React canvas system and deploy.

**Definition of Done**: The Clarity Canvas is fully deployed, replacing the old system, with all functionality working end-to-end.

- [ ] 24. Legacy System Migration

  - Create feature flag system to toggle between old and new interfaces
  - Migrate existing session data and user preferences to new canvas system
  - Ensure backward compatibility with existing content and AI model infrastructure
  - Plan gradual rollout strategy with fallback to legacy system if needed
  - _Requirements: 6.1, 6.2_

- [ ] 25. End-to-End Testing

  - Create comprehensive Playwright tests for complete user journeys
  - Test readiness gate → thought mining → thought picker → export flows
  - Validate error handling, recovery scenarios, and edge cases
  - Perform cross-browser testing and device compatibility verification
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 26. Production Deployment

  - Build optimized production bundle with code splitting and compression
  - Deploy as Progressive Web App with offline capabilities
  - Configure proper caching strategies for models and content
  - Set up monitoring and error reporting for production issues
  - _Requirements: 6.1, 6.2, 7.1_

- [ ] 26.1 Monitoring and Error Reporting Setup

  - Integrate client-side error reporting (Sentry or similar) for production issue tracking
  - Add performance monitoring for canvas load times and user interactions
  - Implement usage analytics to track user journey completion rates
  - Create alerting for critical errors that affect user experience
  - _Requirements: 8.6, 7.1_

- [ ] 27. User Feedback and Iteration

  - Deploy to beta users and collect feedback on canvas experience
  - Monitor performance metrics and user engagement patterns
  - Iterate on card interactions and flow based on real usage data
  - Plan future enhancements based on user needs and feedback
  - _Requirements: All requirements validation_

- [ ] 27.1 Feature Flag Cleanup and Legacy Removal
  - Remove feature flags and toggle logic once canvas rollout is complete
  - Clean up legacy vanilla JavaScript code and unused components
  - Archive old HTML templates and static assets no longer needed
  - Update documentation to reflect new canvas-based architecture
  - _Requirements: 6.1, 6.2_
