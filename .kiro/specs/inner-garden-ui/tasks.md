# Inner Garden UI Implementation Plan

## Implementation Principles

- **Visual Experience First**: Every component must deliver the immersive, cinematic garden experience described in the design
- **Asset-Driven Development**: Build components around the provided assets from assets_to_pull folder
- **Smooth Transitions**: All step transitions should feel like continuous camera movements, not abrupt screen changes
- **Performance Conscious**: Maintain 60fps animations while staying within the 15MB budget
- **Therapeutic Integrity**: Preserve all existing therapeutic functionality while enhancing the visual experience

## Phase 1: Foundation & Asset Integration

**Objective**: Set up the React application foundation with proper asset loading, global state management, and core garden layout system.

- [ ] 1. Project Setup and Asset Integration
  - Create React TypeScript application with Vite build system optimized for asset loading
  - Move all assets from assets_to_pull to public/assets/ with organized folder structure
  - Implement AssetPreloader component with progressive loading for critical vs decorative assets
  - Set up GSAP and Framer Motion for animation systems with proper TypeScript definitions
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 1.1 Global CSS and Animation Keyframes Setup
  - Create global.css with all keyframe animations (driftBack, driftFront, twinkle, breathing, pickerWiggle)
  - Implement z-index layering system (0: night_sky_bg, 1-2: clouds, 3: stars, 4-9: UI, 999: dialogs)
  - Add responsive breakpoints and design tokens for consistent theming across all components
  - Set up CSS-in-JS or Tailwind configuration for garden-specific styling patterns
  - _Requirements: 7.1, 9.1, 9.2_

- [ ] 2. Garden State Management System
  - Create GardenStateContext with TypeScript interfaces for all state models (GardenState, AnimationState)
  - Implement GardenStateProvider with step navigation, readiness tracking, and insight collection
  - Build useGardenState hook for accessing state throughout component tree
  - Add state persistence and recovery mechanisms for session continuity
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 3. Core Application Structure
  - Build App.tsx as main garden container with error boundary and state provider integration
  - Create GardenRouter component for step navigation with smooth transition management
  - Implement TransitionManager for coordinating complex multi-step animations using GSAP timelines
  - Add GardenErrorBoundary with garden-themed error states that preserve user insights
  - _Requirements: 8.5, 8.6, 8.7, 8.8_

## Phase 2: Step 1 - Night Sky Readiness Assessment

**Objective**: Build the immersive night sky environment with animated gates and readiness assessment functionality.

- [ ] 4. Night Sky Background System
  - Create Step1NightSky.tsx with layered background system (night_sky_bg.png, clouds, stars)
  - Implement CloudLayer component with configurable drift speeds using CSS animations
  - Build StarLayer component with twinkling effects using mix-blend-mode: screen
  - Add responsive background scaling that maintains visual quality across screen sizes
  - _Requirements: 1.1, 1.2, 6.4_

- [ ] 5. Animated Garden Gates
  - Create GateComponent.tsx supporting three gate types (open, partial, closed) with SVG bases
  - Implement WebM vine animations with proper autoPlay, loop, muted, playsInline attributes
  - Build gate glow system using PNG overlays with breathing animation and opacity control
  - Add gate selection logic with smooth glow transitions based on readiness slider position
  - _Requirements: 1.2, 1.3, 6.4, 9.3_

- [ ] 6. Readiness Slider and Assessment Logic
  - Build ReadinessSlider component styled as moonlight path with custom thumb and track
  - Implement slider value mapping to gate selection (0-30: closed, 30-70: partial, 70-100: open)
  - Create gate highlighting system with smooth glow intensity transitions
  - Add readiness assessment logic with 500ms delay before proceeding to next step
  - _Requirements: 1.4, 1.5, 1.6_

- [ ] 7. Rest Message and Off-Ramp System
  - Create RestMessage modal component for users selecting the closed gate
  - Implement gentle, supportive messaging with links to centering exercises
  - Build CenteringExercise component as therapeutic off-ramp with return-to-gates option
  - Add session pause functionality that preserves state while offering self-care resources
  - _Requirements: 1.7, 10.6_

## Phase 3: Step 2 - Map Transition and Topic Selection

**Objective**: Create the cinematic transition from night sky to garden map with smooth zoom and topic bed selection.

- [ ] 8. Sky-to-Map Transition Animation
  - Implement sky fade-out animation using GSAP timeline with opacity transitions
  - Create map reveal system using sky_to_map_overlay.png for seamless transition effect
  - Build zoom animation from map_world_overview.png to map_world_pickerzoomed.png coordinates
  - Add transition timing coordination with proper easing curves for cinematic feel
  - _Requirements: 2.1, 2.2, 6.6, 9.1_

- [ ] 9. Topic Bed Selection System
  - Create TopicBed component with hover states switching between PNG and WebM assets
  - Implement three topic beds (money, relationships, selfImage) with unique visual characteristics
  - Build bed positioning system using absolute coordinates that scale responsively
  - Add selection prompt "Which part of your garden calls for attention?" with fade-in timing
  - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [ ] 10. Map Container and Zoom Controls
  - Build MapContainer component with transform-origin center for smooth scaling
  - Implement GSAP zoom animation with scale and translate properties for camera movement
  - Add hotspot overlay system for clickable topic bed areas
  - Create responsive zoom calculations that work across different screen sizes
  - _Requirements: 2.2, 2.7, 7.1_

## Phase 4: Step 3 - Field Entry and Thought Capture

**Objective**: Create the immersive field dive experience with journal-style thought capture interface.

- [ ] 11. Field Dive Animation and Background
  - Create Step3FieldEntry.tsx with topic-specific field backgrounds (field_money_bg.png, etc.)
  - Implement dive animation using scale and perspective transforms to simulate camera swoop
  - Add field background blur effect (filter: blur(5px) brightness(.85)) for focus
  - Build petal drift overlay using petal_drift_overlay.webm with mix-blend-mode: soft-light
  - _Requirements: 3.1, 3.2, 3.3, 6.4_

- [ ] 12. Journal Input Interface
  - Create journal-style input card with parchment aesthetic and drop shadow
  - Implement autosize textarea for thought input with placeholder text
  - Build thought submission flow with validation and character limits
  - Add card fade-in animation (500ms delay) after dive animation completes
  - _Requirements: 3.4, 3.5, 7.2_

- [ ] 13. Persistence Question Flow
  - Implement follow-up question "Is this a persistent sprout—one that keeps pushing through?"
  - Create yes/no button interface with clear visual distinction
  - Build routing logic: yes → Step 4 (Botanical Reflection), no → Step 5 (Garden Path)
  - Add smooth transition animations between question states
  - _Requirements: 3.6, 3.7, 8.1_

## Phase 5: Step 4 - Botanical Reflection Mining Process

**Objective**: Build the three-phase thought mining process using botanical metaphors and visual flower transformations.

- [ ] 14. Flower Sprite System
  - Create FlowerSprite.tsx with support for all flower states (bud, neutral, fullbloom, wilted)
  - Implement topic-specific flower assets (flower_money_*, flower_relationships_*, flower_selfimage_*)
  - Build smooth cross-fade transitions between flower states using GSAP
  - Add subtle sway animation (pickerWiggle keyframe) for organic movement
  - _Requirements: 4.1, 4.2, 6.4, 9.3_

- [ ] 15. Three-Phase Mining Interface
  - Build MiningPhaseCard component for each phase (Neutralize, Common Ground, Data Extraction)
  - Implement phase icons (magnifying_glass, watering_can, pruning_shears) with descriptions
  - Create phase progression system with visual progress indicators
  - Add ContentSearchService integration for loading mining prompts by topic and phase
  - _Requirements: 4.3, 4.4, 4.5, 10.1_

- [ ] 16. Root Animation and Visual Feedback
  - Implement flower_roots_dynamic.webm animation for Phase 2 (Root Purpose)
  - Create flower transformation sequence: bud → neutral → fullbloom with timing coordination
  - Build visual feedback system that responds to user input and phase completion
  - Add completion animations that prepare for transition to Garden Path
  - _Requirements: 4.6, 4.7, 9.3_

- [ ] 17. Mining Results Collection
  - Create MiningResult data structure for capturing user insights from each phase
  - Implement result storage system that integrates with garden state management
  - Build mining completion flow with option to proceed or return to previous steps
  - Add export preparation for mining insights to be included in final bouquet
  - _Requirements: 4.7, 8.4, 10.7_

## Phase 6: Step 5 - Garden Path and Thought Selection

**Objective**: Create the final thought selection experience with sunlight dial, flower picker, and bouquet creation.

- [ ] 18. Sunlight Dial Control System
  - Create SunlightDial.tsx with dial_base.png and dial_knob.png assets
  - Implement pointer-based drag interaction for knob rotation with angle constraints
  - Build sunlight level mapping (low/mid/high) with visual feedback labels
  - Add sunlight overlay system using sunlight_overlay_low/mid/high.png with screen blend mode
  - _Requirements: 5.1, 5.2, 5.3, 6.4_

- [ ] 19. Thought Flower Grid System
  - Create ThoughtFlower component using picker_flower_generic1-16.png assets
  - Implement CSS Grid layout with auto-flow dense for masonry-style arrangement
  - Build flower wiggle animations (pickerWiggle keyframe) with staggered timing
  - Add ContentSearchService integration for loading replacement thoughts by intensity level
  - _Requirements: 5.4, 5.5, 6.4, 10.1_

- [ ] 20. Bouquet Collection and Animation
  - Create BouquetHolder component using bouquet_holder.png positioned in corner
  - Implement flower-to-bouquet animation using GSAP translate/scale transforms
  - Build selected thoughts tracking with visual feedback in bouquet area
  - Add bouquet completion detection with export/save functionality
  - _Requirements: 5.6, 5.7, 9.3, 8.4_

- [ ] 21. Export and Session Completion
  - Implement bouquet export functionality with image generation or HTML-to-image conversion
  - Create session summary with all collected insights (readiness, mining results, selected thoughts)
  - Build export modal with sharing options and session data download
  - Add session cleanup and reset functionality for new garden journeys
  - _Requirements: 5.7, 8.4, 10.7_

## Phase 7: Performance Optimization and Polish

**Objective**: Optimize performance, add responsive design, and ensure smooth 60fps animations across all devices.

- [ ] 22. Asset Loading and Performance Optimization
  - Implement progressive asset loading with critical path prioritization
  - Add lazy loading for non-critical assets (decorative flowers, background elements)
  - Build asset preloading system with loading progress indicators
  - Optimize WebM and PNG assets for web delivery while maintaining visual quality
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [ ] 23. Animation Performance and Frame Rate Optimization
  - Implement frame rate monitoring with automatic quality reduction on low-end devices
  - Add hardware acceleration using CSS transforms and opacity for smooth animations
  - Build animation queuing system to prevent conflicts and maintain 60fps performance
  - Create reduced motion alternatives that respect user preferences
  - _Requirements: 6.6, 9.1, 9.2, 9.3_

- [ ] 24. Responsive Design and Mobile Optimization
  - Implement responsive layouts that adapt from desktop to tablet to mobile
  - Add touch-friendly interactions for mobile devices with appropriate touch targets
  - Build mobile-specific navigation patterns and gesture support
  - Create responsive asset scaling that maintains visual quality across screen sizes
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 25. Accessibility and Inclusive Design
  - Add comprehensive ARIA labels and descriptions for all interactive elements
  - Implement full keyboard navigation with visible focus indicators
  - Build screen reader support with appropriate live regions and announcements
  - Create high contrast mode support and color-blind friendly design alternatives
  - _Requirements: 7.4, 7.5, 7.6, 7.7_

## Phase 8: Integration and Testing

**Objective**: Integrate with existing therapeutic content system and ensure all functionality works end-to-end.

- [ ] 26. Content Pipeline Integration
  - Integrate with existing ContentSearchService for all therapeutic content queries
  - Ensure compatibility with existing content/raw/*.json structure and build pipeline
  - Add error handling for content loading failures with graceful fallbacks
  - Test content refresh workflow (npm run content:refresh) with new garden interface
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 27. Session State and Context Integration
  - Integrate garden state with existing SessionContext for backward compatibility
  - Ensure proper session management and insight preservation across garden steps
  - Add session recovery mechanisms for handling browser refresh and navigation
  - Test integration with existing AI processing and PsychologicalEngine
  - _Requirements: 8.1, 8.2, 8.3, 10.5_

- [ ] 28. Error Handling and Resilience
  - Implement comprehensive error boundaries for each garden step
  - Add asset loading failure handling with appropriate fallbacks
  - Build content service error handling with retry mechanisms
  - Create user-friendly error messages that maintain the garden theme
  - _Requirements: 8.5, 8.6, 8.7, 8.8_

- [ ] 29. End-to-End Testing and Validation
  - Create comprehensive user journey tests from night sky to bouquet export
  - Test all animation sequences and transition timing across different devices
  - Validate asset loading performance and fallback scenarios
  - Perform cross-browser testing and device compatibility verification
  - _Requirements: 6.6, 9.1, 9.2, 9.3_

## Phase 9: Deployment and Production Readiness

**Objective**: Deploy the Inner Garden UI as a complete replacement for the existing interface with proper monitoring and rollback capabilities.

- [ ] 30. Production Build and Optimization
  - Create optimized production build with code splitting and asset compression
  - Implement proper caching strategies for static assets and dynamic content
  - Add bundle analysis and size optimization to meet 15MB budget requirement
  - Configure CDN integration for optimal asset delivery performance
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 31. Feature Flag and Migration System
  - Implement feature flag system to toggle between existing canvas and garden interface
  - Create gradual rollout strategy with A/B testing capabilities
  - Build user preference system for interface selection during transition period
  - Add rollback mechanisms for quick reversion if issues arise
  - _Requirements: 8.8, 10.6_

- [ ] 32. Monitoring and Analytics Integration
  - Add performance monitoring for animation frame rates and loading times
  - Implement user journey analytics to track completion rates and engagement
  - Create error reporting system for production issue tracking and resolution
  - Build usage metrics dashboard for monitoring garden interface adoption
  - _Requirements: 6.6, 8.8_

- [ ] 33. Documentation and Maintenance Setup
  - Create comprehensive component documentation with usage examples
  - Build asset management guide for future updates and additions
  - Document animation timing and transition coordination for maintenance
  - Create troubleshooting guide for common issues and performance optimization
  - _Requirements: All requirements validation_

## Asset Reference Guide

### Step 1 - Night Sky Assets
- `night_sky_bg.png` - Base night sky background
- `clouds_layer_back.png`, `clouds_layer_front.png` - Animated cloud layers
- `star_twinkle_static.png` - Twinkling stars overlay
- `gate_open_base.svg`, `gate_partial_base.svg`, `gate_closed_base.svg` - Gate structures
- `gate_vines_wideopen.webm`, `gate_vines_partial.webm`, `gate_vines_closed.webm` - Vine animations
- `gate_open_glow.png`, `gate_partial_glow.png`, `gate_closed_glow.png` - Gate glow effects

### Step 2 - Map Transition Assets
- `sky_to_map_overlay.png` - Transition overlay
- `map_world_overview.png` - Full garden map
- `map_world_pickerzoomed.png` - Zoomed flower bed area
- `path_picker_money.png/.webm` - Money topic bed
- `path_picker_relationships.png/.webm` - Relationships topic bed
- `path_picker_selfimage.png/.webm` - Self-image topic bed

### Step 3 - Field Entry Assets
- `field_money_bg.png`, `field_relationship_bg.png`, `field_selfimage_bg.png` - Field backgrounds
- `petal_drift_overlay.webm` - Floating petal animation
- `journal_page_bg.png` - Journal input styling reference

### Step 4 - Botanical Reflection Assets
- `flower_money_bud.png`, `flower_money_neutral.png`, `flower_money_fullbloom.png` - Money flowers
- `flower_relationship_bud.png`, `flower_relationships_neutral.png`, `flower_relationship_fullbloom.png` - Relationship flowers
- `flower_selfimage_bud.png`, `flower_selfimage_neutral.png`, `flower_selfimage_fullbloom.png` - Self-image flowers
- `flower_roots_dynamic.webm`, `flower_roots_static.png` - Root system animations
- `icon_magnifying_glass.png`, `icon_watering_can.png`, `icon_pruning_shears.png` - Phase icons

### Step 5 - Garden Path Assets
- `dial_base.png`, `dial_knob.png` - Sunlight dial components
- `sunlight_overlay_low.png`, `sunlight_overlay_mid.png`, `sunlight_overlay_high.png` - Intensity overlays
- `picker_flower_generic1.png` through `picker_flower_generic16.png` - Selectable flowers
- `bouquet_holder.png` - Bouquet collection container

## Technical Implementation Notes

### Animation Timing Coordination
- All step transitions should use GSAP timelines for precise timing control
- WebM videos should be preloaded and ready before triggering animations
- Use `onComplete` callbacks to chain animations and maintain smooth flow
- Implement animation queuing to prevent conflicts during rapid user interactions

### Performance Targets
- Maintain 60fps during all animations and transitions
- Keep total bundle size under 15MB including all assets
- Achieve <5 second initial load time on average connections
- Ensure smooth performance on devices with limited GPU capabilities

### Responsive Breakpoints
- Desktop (1024px+): Full visual fidelity with all animations
- Tablet (768px-1023px): Adapted layouts with maintained visual appeal
- Mobile (320px-767px): Touch-optimized with simplified animations

### Browser Compatibility
- Modern browsers with ES2020+ support
- WebM video support with PNG fallbacks
- CSS Grid and Flexbox for layouts
- GSAP 3.x for animations with CSS fallbacks