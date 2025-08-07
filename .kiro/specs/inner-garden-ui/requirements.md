# Inner Garden UI Requirements Document

## Introduction

The Inner Garden UI is a complete visual redesign of the Clarity Canvas therapeutic tool, transforming the card-based interface into an immersive, garden-themed experience. Users journey from a contemplative night sky through ornate gates, across a hand-drawn map, into painterly flower fields where they process thoughts through botanical metaphors. The system maintains the same therapeutic functionality while providing a more visually engaging and metaphorically rich user experience.

## Implementation Note

**For the implementing AI agent**: You have explicit permission to depart from specific technical implementation details in these requirements if you identify more elegant, performant, or maintainable solutions. The core UX goals and user journey must be preserved, but feel free to optimize the technical approach, asset usage, animation techniques, or architectural patterns as you see fit. Prioritize delivering an exceptional user experience over strict adherence to implementation specifics.

## Requirements

### Requirement 1: Night Sky Readiness Assessment

**User Story:** As a user seeking therapeutic support, I want to assess my readiness in a peaceful night sky environment with three ornate garden gates, so that I can choose the appropriate level of engagement based on my emotional state.

#### Acceptance Criteria

1. WHEN the application loads THEN it SHALL display a deep night sky background with slowly moving clouds and twinkling stars
2. WHEN the night sky is displayed THEN three ornate garden gates SHALL fade into view horizontally (Wide Open, Partially Open, Closed)
3. WHEN the gates appear THEN they SHALL have subtle animations including swaying vines and gentle rocking motion
4. WHEN the gates are visible THEN a readiness slider styled as moonlight or fallen branch SHALL appear below them
5. WHEN the user moves the slider THEN the corresponding gate SHALL be highlighted with a soft breathing glow
6. WHEN the slider moves toward the Closed Gate THEN a gentle rest message SHALL appear with supportive resources
7. WHEN the slider moves toward Open/Partially Open Gates THEN the system SHALL trigger transition to Step 2 after 500ms delay

### Requirement 2: Seamless Map Transition and Topic Selection

**User Story:** As a user who has indicated readiness, I want to experience a smooth cinematic transition from night sky to a beautiful garden map, so that I can select which area of my inner garden needs attention.

#### Acceptance Criteria

1. WHEN readiness is confirmed THEN the night sky SHALL fade out while a garden map is revealed beneath
2. WHEN the map is revealed THEN the view SHALL smoothly zoom in toward three distinct flower bed areas
3. WHEN the zoom completes THEN three topic beds SHALL be visible (Money, Relationships, Self-Image)
4. WHEN topic beds are displayed THEN each SHALL have unique visual characteristics (golden marigolds, climbing roses, elegant lilies)
5. WHEN beds are hovered THEN they SHALL show subtle motion effects (PNG to WebM swap)
6. WHEN a bed is selected THEN the choice SHALL be stored and trigger transition to Step 3
7. WHEN the prompt appears THEN it SHALL ask "Which part of your garden calls for attention?"

### Requirement 3: Immersive Field Entry and Thought Capture

**User Story:** As a user who has selected a topic area, I want to dive into a first-person view of that specific flower field, so that I can reflect on my thoughts in an immersive, focused environment.

#### Acceptance Criteria

1. WHEN a flower bed is chosen THEN the view SHALL animate a "dive" into that specific field environment
2. WHEN the dive animation completes THEN the background SHALL show a rich, painterly field of the selected flowers
3. WHEN the field is displayed THEN the background SHALL be slightly blurred to focus attention on the foreground
4. WHEN the field is ready THEN a journal-style text input area SHALL appear over the blurred background
5. WHEN the input appears THEN it SHALL prompt "What thought has been growing in this field?"
6. WHEN the user enters their thought THEN a follow-up question SHALL appear asking about persistence
7. WHEN persistence is determined THEN the system SHALL route to either Botanical Reflection (yes) or Garden Path (no)

### Requirement 4: Botanical Reflection for Persistent Thoughts

**User Story:** As a user with a persistent thought, I want to work through a three-phase botanical reflection process, so that I can transform my thought using gardening metaphors and visual feedback.

#### Acceptance Criteria

1. WHEN botanical reflection begins THEN a close-up thought-flower SHALL appear against the blurred field
2. WHEN the flower is displayed THEN its appearance SHALL reflect the nature of the user's thought
3. WHEN Phase 1 begins THEN the magnifying glass icon SHALL guide neutral observation with flower balancing
4. WHEN Phase 2 begins THEN the watering can icon SHALL guide root purpose exploration with root animation
5. WHEN Phase 3 begins THEN the pruning shears icon SHALL guide new growth perspective with flower transformation
6. WHEN each phase completes THEN the flower SHALL visually transform to show progress
7. WHEN all phases complete THEN the user SHALL proceed to Garden Path or summary

### Requirement 5: Garden Path for Thought Selection

**User Story:** As a user completing reflection or seeking fleeting thoughts, I want to walk a garden path with a sunlight dial and flower selection system, so that I can create a personalized bouquet of new perspectives.

#### Acceptance Criteria

1. WHEN the garden path loads THEN the view SHALL pull back to show a winding path through the painterly field
2. WHEN the path is visible THEN many different flowers representing pre-written thoughts SHALL be displayed
3. WHEN the sunlight dial appears THEN it SHALL allow intensity level setting (low/mid/high)
4. WHEN intensity is adjusted THEN appropriate thoughts SHALL be revealed from gentle to transformative
5. WHEN flowers are displayed THEN they SHALL have subtle wiggle animations and be selectable
6. WHEN flowers are selected THEN they SHALL animate toward the bouquet holder in the corner
7. WHEN the bouquet is complete THEN it SHALL be saveable or exportable

### Requirement 6: Asset Integration and Performance

**User Story:** As a user experiencing the Inner Garden interface, I want smooth performance with properly loaded visual assets, so that the immersive experience is not disrupted by loading delays or missing graphics.

#### Acceptance Criteria

1. WHEN the application loads THEN all required PNG, SVG, and WebM assets SHALL be properly imported from assets_to_pull
2. WHEN animations play THEN WebM assets SHALL have playsInline, autoPlay, loop, and muted attributes
3. WHEN images are displayed THEN they SHALL be served from /public/assets/ with proper Vite/Webpack integration
4. WHEN transitions occur THEN they SHALL use GSAP or Framer Motion for smooth camera movements
5. WHEN assets fail to load THEN graceful fallbacks SHALL be provided without breaking the experience
6. WHEN performance is measured THEN the application SHALL meet the existing 15MB budget and 5-second load time
7. WHEN the interface is used THEN it SHALL maintain 60fps performance during animations

### Requirement 7: Responsive Design and Accessibility

**User Story:** As a user on various devices with different accessibility needs, I want the Inner Garden interface to be fully usable and beautiful across all screen sizes and input methods.

#### Acceptance Criteria

1. WHEN viewed on desktop THEN the interface SHALL display with full visual fidelity and smooth animations
2. WHEN viewed on tablet THEN layouts SHALL adapt appropriately while maintaining visual appeal
3. WHEN viewed on mobile THEN touch interactions SHALL be optimized and layouts SHALL stack appropriately
4. WHEN using keyboard navigation THEN all interactive elements SHALL be accessible and clearly focused
5. WHEN using screen readers THEN appropriate ARIA labels and descriptions SHALL be provided
6. WHEN reduced motion is preferred THEN animations SHALL be simplified or disabled appropriately
7. WHEN high contrast is needed THEN the interface SHALL maintain usability with sufficient color contrast

### Requirement 8: State Management and Data Flow

**User Story:** As a user progressing through the Inner Garden experience, I want my choices and insights to be properly tracked and preserved, so that I can complete my journey without losing progress.

#### Acceptance Criteria

1. WHEN progressing through steps THEN the current state SHALL be maintained using Zustand, Redux, or React Context
2. WHEN selections are made THEN they SHALL be stored in the appropriate state management system
3. WHEN errors occur THEN user progress and insights SHALL be preserved and recoverable
4. WHEN the session completes THEN all insights SHALL be available for export or saving
5. WHEN navigation occurs THEN users SHALL be able to move between completed steps
6. WHEN the application is refreshed THEN session state SHALL be appropriately handled
7. WHEN data is exported THEN it SHALL include all user selections and generated insights

### Requirement 9: Animation and Interaction Polish

**User Story:** As a user experiencing the Inner Garden interface, I want smooth, organic animations and interactions that enhance the therapeutic experience, so that the interface feels alive and responsive.

#### Acceptance Criteria

1. WHEN elements appear THEN they SHALL use organic, gentle animations that feel natural
2. WHEN transitions occur THEN they SHALL feel like continuous camera movements rather than abrupt changes
3. WHEN interactive elements are hovered THEN they SHALL provide appropriate visual feedback
4. WHEN selections are made THEN confirmation animations SHALL provide clear feedback
5. WHEN loading occurs THEN appropriate loading states SHALL be displayed without breaking immersion
6. WHEN animations play THEN they SHALL respect user preferences for reduced motion
7. WHEN interactions complete THEN the system SHALL provide clear indication of next steps

### Requirement 10: Integration with Existing Therapeutic Content

**User Story:** As a user of the Inner Garden interface, I want access to the same high-quality therapeutic content as the existing system, so that the visual redesign enhances rather than replaces the therapeutic value.

#### Acceptance Criteria

1. WHEN content is needed THEN it SHALL be sourced from the existing ContentSearchService
2. WHEN mining prompts are displayed THEN they SHALL use the existing content pipeline structure
3. WHEN replacement thoughts are shown THEN they SHALL be filtered and categorized appropriately
4. WHEN content fails to load THEN graceful fallbacks SHALL maintain the therapeutic experience
5. WHEN new content is added THEN the Inner Garden SHALL reflect updates without code changes
6. WHEN AI processing occurs THEN it SHALL use the existing on-device models and processing
7. WHEN privacy is required THEN all processing SHALL remain client-side as in the existing system