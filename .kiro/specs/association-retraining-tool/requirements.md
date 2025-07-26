# Requirements Document

## Introduction

The Association-Retraining Tool is a privacy-first, entirely client-side psychological intervention platform that helps users reframe negative thought patterns using evidence-based therapeutic techniques (CBT, Socratic questioning, and ACT). The system must be a therapeutically robust, nuanced tool that guides users through a complete 5-7 step journey with sophisticated psychological depth, visual progress tracking, and privacy-first calendar integration. The tool must be completely self-contained with no backend dependencies for core functionality.

## Requirements

### Requirement 1

**User Story:** As a user seeking psychological support, I want to complete a compelling user flow that guides me from initial readiness assessment through topic selection to a complete therapeutic journey, so that I experience a structured and effective intervention.

#### Acceptance Criteria

1. WHEN a user first visits THEN the system SHALL display a compelling landing screen with headline "Ready to trade your old story for a new one?" and call-to-action "Start Your 3-Minute Shift"
2. WHEN a user starts the process THEN the system SHALL present a tactile emotional readiness check with 0-10 intensity slider and contextual messaging
3. WHEN readiness is assessed THEN the system SHALL present clear topic selection between Money, Romance, and Self-Image
4. WHEN a topic is selected THEN the system SHALL display curated, topic-specific emotion palettes for granular affect labeling
5. WHEN an emotion is selected THEN the system SHALL optionally collect user text input for NLP keyword extraction

### Requirement 2

**User Story:** As a user progressing through the therapeutic intervention, I want to experience a complete 5-7 step guided journey with visual progress tracking, so that I feel supported and can see my advancement through the process.

#### Acceptance Criteria

1. WHEN the journey begins THEN the system SHALL present a multi-step therapeutic sequence (5-7 steps) with visual progress indicators
2. WHEN I click "This feels better" THEN the system SHALL advance to the next therapeutic prompt in the sequence
3. WHEN I click "Try another angle" THEN the system SHALL present an alternative prompt while maintaining step progression
4. WHEN I click "Try another angle" twice on the same step THEN the system SHALL divert to an ACT defusion exercise
5. WHEN the journey completes THEN the system SHALL display completion screen with emotional shift summary and celebratory micro-animation

### Requirement 3

**User Story:** As a user experiencing high emotional intensity or needing alternative approaches, I want access to ACT-style defusion exercises, so that I can work with my thoughts in a mindful, non-judgmental way.

#### Acceptance Criteria

1. WHEN my emotional intensity is 7+ on the readiness scale THEN the system SHALL automatically route me to ACT defusion exercises
2. WHEN I click "Try another angle" twice during the journey THEN the system SHALL present ACT defusion exercises like "cloud-drifting thought" visualization
3. WHEN completing ACT exercises THEN the system SHALL provide mindful, present-moment awareness techniques
4. WHEN ACT exercises are complete THEN the system SHALL route to the completion screen with appropriate summary

### Requirement 4

**User Story:** As a user working through different psychological concerns, I want access to sophisticated therapeutic techniques including CBT reframes and Socratic questioning, so that I can experience evidence-based interventions tailored to my specific needs.

#### Acceptance Criteria

1. WHEN the system selects therapeutic content THEN it SHALL differentiate between CBT reframes and Socratic questions based on user state and topic
2. WHEN presenting CBT content THEN the system SHALL offer thought reframing exercises specific to the chosen topic and subtopic
3. WHEN presenting Socratic content THEN the system SHALL ask guided questions that promote self-reflection and insight
4. WHEN content is selected THEN the system SHALL use NLP analysis of user input to intelligently choose relevant subtopics and techniques

### Requirement 5

**User Story:** As a user who wants to maintain my therapeutic practice, I want privacy-first calendar integration, so that I can set reminders without compromising my personal data.

#### Acceptance Criteria

1. WHEN I complete a session THEN the system SHALL offer calendar reminder options (daily, weekly, or no thanks)
2. WHEN I select a reminder frequency THEN the system SHALL generate a downloadable .ICS calendar file client-side
3. WHEN the calendar file is generated THEN it SHALL contain no personally identifiable information or session details
4. WHEN the file is created THEN it SHALL include generic therapeutic check-in reminders with appropriate frequency

### Requirement 6

**User Story:** As a user concerned about privacy, I want a completely client-side system with high-fidelity NLP capabilities using modern machine learning, so that my personal information never leaves my device while receiving sophisticated, nuanced therapeutic guidance.

#### Acceptance Criteria

1. WHEN the system operates THEN it SHALL function entirely client-side with no backend dependencies for core functionality
2. WHEN processing user text input THEN the system SHALL use client-side Transformers.js with zero-shot text classification for sophisticated psychological understanding
3. WHEN the NLP model loads THEN it SHALL use a self-hosted, local-only model (Xenova/nli-deberta-v3-base) with no external network requests
4. WHEN therapeutic content is needed THEN it SHALL be loaded from local JSON files with modular, expandable structure
5. WHEN sessions end THEN all user data SHALL be automatically purged with no persistent storage or tracking
6. WHEN the model initializes THEN it SHALL display graceful loading indicators with progress updates and positive messaging
7. WHEN classification confidence is low THEN the system SHALL fallback to generic, universally supportive therapeutic content

### Requirement 7

**User Story:** As a user experiencing the therapeutic interface, I want a calming, professional design with smooth animations and clear visual feedback, so that the technology supports rather than distracts from my therapeutic work.

#### Acceptance Criteria

1. WHEN I interact with the interface THEN it SHALL display calming typography, colors, and iconography consistent with therapeutic settings
2. WHEN I progress through steps THEN the system SHALL show clear visual progress indicators (filled dots or progress bar)
3. WHEN I complete the journey THEN the system SHALL display a subtle celebratory micro-animation and emotional shift summary
4. WHEN I navigate between screens THEN transitions SHALL be smooth and supportive of the therapeutic experience

### Requirement 8

**User Story:** As a user providing text input, I want a high-fidelity NLP engine that can deeply understand my psychological state and concerns, so that I receive precisely targeted therapeutic interventions based on nuanced classification of my thoughts and feelings.

#### Acceptance Criteria

1. WHEN I provide text input THEN the system SHALL use zero-shot text classification with comprehensive psychological labels (feeling of worthlessness, anxiety about the future, lack of motivation, conflict between desire and action, self-criticism, fear of failure, financial scarcity mindset, loneliness in relationships, imposter syndrome, procrastination due to feeling overwhelmed)
2. WHEN the NLP engine processes my text THEN it SHALL return confidence-scored classifications sorted by relevance to my psychological state
3. WHEN classification confidence exceeds the threshold THEN the system SHALL select therapeutic content matching the highest-confidence psychological label
4. WHEN classification confidence is below threshold THEN the system SHALL serve generic fallback content with universally supportive statements
5. WHEN the system selects content THEN it SHALL use the "Thought Buffet" JSON structure where each psychological label maps to 3-5 high-quality reframing statements
6. WHEN multiple labels have similar confidence scores THEN the system SHALL intelligently combine or prioritize based on therapeutic effectiveness
7. WHEN the model processes text THEN it SHALL use multi-label classification to capture complex, overlapping psychological states

### Requirement 9

**User Story:** As a system administrator wanting to improve the tool, I want optional user feedback collection, so that I can gather qualitative insights while maintaining user privacy.

#### Acceptance Criteria

1. WHEN a user completes a session THEN the system SHALL optionally present a brief, anonymous exit survey
2. WHEN feedback is collected THEN it SHALL contain no personally identifiable information or session details
3. WHEN users decline feedback THEN the system SHALL respect their choice without impact on functionality
4. WHEN feedback is provided THEN it SHALL focus on therapeutic effectiveness and user experience insights