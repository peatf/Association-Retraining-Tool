# Implementation Plan

## Guiding Principles

- **Quality & Thoroughness First**: The accuracy and nuance of the psychological classification are the top priorities.
- **Privacy is Non-Negotiable**: All processing must occur client-side. No user data, text, or metadata is ever to be sent to an external server.
- **Therapeutic UX**: The user experience must be calming, supportive, and graceful, especially during initial setup and loading phases.

## Phase 1: Foundation & Core User Flow

**Objective**: Build the complete, visually polished user journey from the landing page to the point of therapeutic intervention. Establish the core application structure and all necessary UI components.

**Definition of Done**: A user can navigate seamlessly from the landing page, through the emotional readiness check, select a topic and emotion, and arrive at the text input screen. All screens are visually styled, animated, and fully responsive.

- [ ] Epic 1: Project & NLP Infrastructure Setup
- [x] 1.1 Initial Project Configuration

  - De-integrate and remove compromise.js and any related backend dependencies
  - Set up a clean, static front-end project structure (HTML, CSS, JS modules)
  - Implement a SessionStateManager class for transient, memory-only session storage
  - _Requirements: 6.1, 6.5_

- [x] 1.2 Transformers.js Infrastructure

  - Install the @xenova/transformers library
  - Download the Xenova/nli-deberta-v3-base model files (.onnx, config, tokenizer)
  - Create a /public/models/ directory and host the model files locally
  - Configure Transformers.js environment to use localModelPath and disable allowRemoteModels to guarantee privacy
  - _Requirements: 6.2, 6.3, 8.1_

- [x] Epic 2: Build the Core User Interface & Screens
- [x] 2.1 Landing & Readiness Screens

  - Implement the landing screen with the headline "Ready to trade your old story for a new one?" and a "Start Your 3-Minute Shift" button
  - Create the emotional readiness check screen with a 0-10 intensity slider
  - Implement contextual messaging that changes based on the slider's value
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Topic & Emotion Selection Screens

  - Build the topic selection screen (Money, Romance, Self-Image) with distinct iconography
  - Create a JSON structure for topic-specific emotion palettes (e.g., Money -> anxious, resentful; Romance -> lonely, rejected)
  - Implement the emotion selection screen, which dynamically displays buttons based on the chosen topic
  - _Requirements: 1.3, 1.4_

- [x] 2.3 Text Input & Completion Screens

  - Create the optional text input screen where the NLP classification will occur
  - Design the journey completion screen, which will summarize the emotional shift and provide a soothing affirmation
  - _Requirements: 1.5, 2.5_

- [x] 2.4 UI Polish & Visual Design
  - Apply a consistent, therapeutic color palette and typography across all screens
  - Implement smooth, calming screen transitions and subtle micro-animations
  - Ensure all UI components are fully responsive for both mobile and desktop
  - Implement a visual progress indicator system (e.g., dots) for the therapeutic journey
  - _Requirements: 7.1, 7.2, 7.3_

## Phase 2: Therapeutic Content & Psychological Engine

**Objective**: Develop the core logic that powers the therapeutic experience. This includes authoring all therapeutic content and building the system that intelligently selects and delivers it to the user.

**Definition of Done**: The application can take a user's state (topic, emotion, intensity, and later, NLP classification) and deliver a complete, multi-step therapeutic journey using the appropriate techniques (CBT, ACT, Socratic).

- [ ] Epic 3: Author All Therapeutic Content
- [x] 3.1 High-Fidelity "Thought Buffet" Content (for NLP)

  - Define the master list of psychological candidateLabels for the NLP model (e.g., feeling_of_worthlessness, financial_scarcity_mindset)
  - Create thought-buffet.json, mapping each label to an array of 3-5 high-quality, empathetic reframing statements
  - Author a "Generic Fallback" buffet for low-confidence classifications
  - _Requirements: 8.5, 8.6, 8.7_

- [x] 3.2 Legacy Therapeutic Content (for Non-NLP Flow)

  - Author 5-7 step therapeutic sequences for each topic/subtopic combination (e.g., Money -> Scarcity)
  - Content should include a mix of CBT reframes and Socratic questions
  - Author comprehensive, topic-specific ACT defusion exercises (e.g., "cloud-drifting thought" visualization)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.3 Content Validation

  - Review all authored content for clinical appropriateness, tone, and effectiveness
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] Epic 4: Build the Psychological Engine
- [x] 4.1 Implement Core Engine Logic

  - Create a central PsychologicalEngine class to manage the user's therapeutic journey
  - Build a system to select the appropriate therapeutic path: If the user provides text -> Use the NLP-driven "Thought Buffet" (to be implemented in Phase 3). If the user skips text -> Use the topic/emotion to trigger the "Legacy Therapeutic Content" sequence
  - _Requirements: 3.1, 3.2, 4.1, 4.4_

- [x] 4.2 Implement the Multi-Step Journey

  - Build the logic for the 5-7 step therapeutic sequences
  - Implement the "This feels better" button to advance to the next step
  - Implement the "Try another angle" button to show an alternative prompt for the current step
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4.3 Implement the ACT Defusion Trigger
  - The engine must automatically route the user to an ACT defusion exercise if their initial intensity is high (e.g., 7+)
  - The engine must also trigger an ACT exercise if the user clicks "Try another angle" twice on the same step, indicating they feel stuck
  - _Requirements: 3.1, 3.2, 3.3_

## Phase 3: High-Fidelity NLP Integration & Final Features

**Objective**: Integrate the Transformers.js model to enable deep text understanding. Finalize the application with privacy-first features, robust error handling, and comprehensive testing.

**Definition of Done**: The app is a complete, robust, and privacy-first therapeutic tool. The NLP engine accurately classifies user input and delivers personalized content, with a seamless loading experience and bulletproof fallbacks.

- [x] Epic 5: Integrate the NLP Engine
- [x] 5.1 Implement the Singleton Pipeline Manager

  - Build the SingletonPipelineManager class to handle the lazy-loading of the zero-shot-classification pipeline
  - Implement progress callbacks to track model download status
  - _Requirements: 6.6, 8.1_

- [x] 5.2 Create the Model Loading UI

  - Design and implement a user-friendly loading screen that displays progress
  - Use positive, therapeutic messaging during the model download (e.g., "Warming up the engine...")
  - _Requirements: 6.6, 8.1_

- [x] 5.3 Build the Classification System

  - Create the HighFidelityNLPEngine class that uses the pipeline manager to classify user text against the candidateLabels
  - Implement the logic to select the best "Thought Buffet" based on the top-scoring label from the model
  - Implement the confidence-based fallback system: if the top score is below a 45% threshold, use the "Generic Fallback" buffet
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] Epic 6: Final Features & Polish
- [x] 6.1 Privacy-First Calendar Integration

  - Build a CalendarGenerator class that creates .ics calendar event files entirely on the client-side
  - Implement the UI for the calendar setup screen, allowing users to choose a reminder frequency and download the file
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6.2 Session Management & Error Handling

  - Ensure the SessionStateManager correctly handles the user's state throughout their journey and clears it upon exit
  - Implement comprehensive error handling for potential issues like content loading failures or NLP processing errors
  - _Requirements: 6.1, 6.2, 6.4_

- [x] 6.3 Anonymous Feedback (Optional)

  - Create an optional, anonymous exit survey to gather qualitative feedback on the app's effectiveness
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [-] Epic 7: Testing & Deployment
- [x] 7.1 End-to-End Testing

  - Conduct thorough testing of all user flows, from landing to completion, on multiple devices and browsers
  - Validate both the NLP-driven and the legacy therapeutic journeys
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [-] 7.2 Accessibility & QA

  - Perform accessibility testing, ensuring screen reader compatibility and keyboard navigation
  - Verify color contrast and responsive design compliance
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7.3 Deployment Preparation
  - Optimize all assets for a static site deployment
  - Create deployment documentation and ensure all security headers are in place
  - _Requirements: 6.1, 6.2, 6.4_
