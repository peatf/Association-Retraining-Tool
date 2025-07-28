# Clarity Canvas Requirements Document

## Introduction

Clarity Canvas is an offline, privacy-first digital therapeutic tool that guides users through personalized thought-processing journeys via an interactive, card-based "canvas" interface. It leverages on-device AI for intelligent thought classification, powerful semantic search across a proprietary content library, and crisp summarization of insights. The system is explicitly not a chatbot but a modular, non-linear therapeutic toolkit.

## Requirements

### Requirement 1: Readiness Gate System

**User Story:** As a user seeking therapeutic support, I want a mandatory readiness assessment before beginning deep work, so that I am emotionally prepared and can be guided to appropriate alternatives if not ready.

#### Acceptance Criteria

1. WHEN a user first accesses the system THEN they SHALL encounter a Readiness Gate as the mandatory entry point
2. WHEN the Readiness Gate loads THEN it SHALL present a simple Yes/No prompt asking if they feel ready to move through a thought pattern
3. WHEN the Readiness Gate loads THEN it SHALL include an intensity slider to assess emotional state
4. WHEN a user indicates they are not ready THEN they SHALL be guided to a gentle off-ramp (centering exercise) not a dead end
5. WHEN a user indicates readiness THEN they SHALL proceed to the Thought Mining sequence
6. WHEN the off-ramp is completed THEN users SHALL have the option to return to the Readiness Gate

### Requirement 2: Thought Mining Card System

**User Story:** As a user ready to process thoughts, I want an interactive card-based system that helps me extract data from persistent thoughts through a structured sequence, so that I can understand and work with my thought patterns effectively.

#### Acceptance Criteria

1. WHEN a user passes the Readiness Gate THEN they SHALL see options to determine if data extraction is needed from their thought
2. WHEN a thought is identified as loud, disruptive, or looping THEN the system SHALL offer the Thought Mining sequence
3. WHEN Thought Mining begins THEN it SHALL present interactive cards in sequence: Neutralize Voice → Common Ground → Data Extraction
4. WHEN the Neutralize Voice card is activated THEN it SHALL help the user separate from the emotional charge using ContentSearchService.getMiningPrompts('category', 'neutralize')
5. WHEN the Common Ground card is activated THEN it SHALL guide understanding of the thought's protective intention using ContentSearchService.getMiningPrompts('category', 'commonGround')
6. WHEN the Data Extraction card is activated THEN it SHALL present either/or style prompts using ContentSearchService.getMiningPrompts('category', 'dataExtraction')
7. WHEN any card is completed THEN the user SHALL have the option to conclude the process or continue
8. WHEN the mining sequence completes THEN users SHALL be routed to the Better-Feeling Thought Picker

### Requirement 3: Card & Lane Canvas Interface

**User Story:** As a user interacting with the therapeutic system, I want a tactile, modular, and non-linear card-based interface, so that I feel engaged and have control over my therapeutic journey.

#### Acceptance Criteria

1. WHEN the system loads THEN it SHALL present a modern React-based component interface replacing static HTML
2. WHEN therapeutic modules are presented THEN they SHALL appear as interactive cards that users can engage with
3. WHEN cards are displayed THEN they SHALL be organized in lanes on a canvas-style layout
4. WHEN users navigate THEN they SHALL have breadcrumb or backtrack features to move between steps
5. WHEN users interact with cards THEN the interface SHALL feel tactile and responsive
6. WHEN the session is active THEN the system SHALL be ephemeral-by-default with no automatic saving
7. WHEN users want to preserve insights THEN a clearly visible "Copy/Export" button SHALL be present in the footer

### Requirement 4: Hierarchical Better-Feeling Thought Picker

**User Story:** As a user completing thought mining or seeking direct insight, I want a hierarchical selector for finding relevant better-feeling thoughts, so that I can access personalized therapeutic content based on my specific needs.

#### Acceptance Criteria

1. WHEN users access the thought picker THEN they SHALL select from top-level topics (Money, Relationships, Self-Image)
2. WHEN a top-level topic is selected THEN "invisible" sub-topics SHALL be revealed based on ContentSearchService.getSubcategories()
3. WHEN sub-topics are revealed THEN they SHALL be populated dynamically from the content pipeline
4. WHEN selections are made THEN relevant insights SHALL be filtered using ContentSearchService.getReplacementThoughts()
5. WHEN thoughts are presented THEN they SHALL be hierarchically organized and easily navigable
6. WHEN users find suitable thoughts THEN they SHALL be able to export or copy them

### Requirement 5: Content Pipeline Integration

**User Story:** As a system processing therapeutic content, I want robust integration with the existing content pipeline, so that all cards and pickers are populated with dynamic, up-to-date therapeutic content.

#### Acceptance Criteria

1. WHEN mining cards load THEN they SHALL use ContentSearchService.getMiningPrompts() for all prompt content
2. WHEN the thought picker loads THEN it SHALL use ContentSearchService.getCategories() and getSubcategories()
3. WHEN replacement thoughts are needed THEN they SHALL use ContentSearchService.getReplacementThoughts()
4. WHEN content is unavailable THEN the system SHALL provide graceful fallbacks
5. WHEN content is updated THEN the system SHALL reflect changes without code modifications

### Requirement 6: Privacy-First Architecture

**User Story:** As a privacy-conscious user, I want all processing to happen on my device with no data transmission, so that my therapeutic work remains completely private and secure.

#### Acceptance Criteria

1. WHEN the system operates THEN it SHALL function entirely offline after initial load
2. WHEN AI processing occurs THEN it SHALL happen on-device using local models
3. WHEN content is searched THEN it SHALL use local semantic search without external requests
4. WHEN sessions end THEN all user-generated content SHALL be automatically purged
5. WHEN models and content are cached THEN they SHALL use browser IndexedDB for performance
6. WHEN users export data THEN it SHALL be generated client-side only

### Requirement 7: Performance and Accessibility

**User Story:** As a user on various devices, I want the system to be fast, responsive, and accessible, so that I can use it effectively regardless of my device capabilities or accessibility needs.

#### Acceptance Criteria

1. WHEN the system loads THEN it SHALL meet performance targets (<15 MB total, <5 second load time)
2. WHEN AI processing occurs THEN it SHALL happen in background WebWorkers to maintain UI responsiveness
3. WHEN the interface is used THEN it SHALL be fully navigable by keyboard
4. WHEN accessibility features are needed THEN it SHALL support high-contrast modes and reduced-motion settings
5. WHEN text is presented THEN it SHALL be clear, jargon-free, and gently guide users
6. WHEN the system detects lower-power devices THEN it SHALL fall back to lighter model variants
### 
Requirement 8: Error Handling and Loading States

**User Story:** As a user experiencing technical issues, I want clear feedback and recovery options when content or models fail to load, so that I can continue using the system or understand what's happening.

#### Acceptance Criteria

1. WHEN content index fails to load THEN the system SHALL display a friendly offline message with retry button
2. WHEN AI models fail to load THEN the system SHALL provide fallback functionality and clear error messaging
3. WHEN cards are loading prompts THEN they SHALL display loading spinners or skeleton states
4. WHEN network issues occur THEN the system SHALL gracefully degrade to cached content
5. WHEN errors are recoverable THEN users SHALL be provided with clear retry mechanisms
6. WHEN errors are not recoverable THEN users SHALL be guided to alternative functionality

### Requirement 9: Testing and Quality Assurance

**User Story:** As a developer maintaining the system, I want all components to be testable and accessible to automated QA, so that I can ensure reliability and catch regressions.

#### Acceptance Criteria

1. WHEN components are created THEN they SHALL expose data-testid attributes for automated testing
2. WHEN interactive elements are built THEN they SHALL include proper ARIA attributes for accessibility testing
3. WHEN cards change state THEN the changes SHALL be detectable by testing frameworks
4. WHEN user flows are implemented THEN they SHALL be testable end-to-end with Playwright
5. WHEN components render THEN they SHALL be unit testable with proper mocking of services