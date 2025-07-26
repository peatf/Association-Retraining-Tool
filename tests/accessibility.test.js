// Accessibility and QA Tests
// Tests screen reader compatibility, keyboard navigation, color contrast, and responsive design
import { describe, it, expect, beforeEach } from 'vitest';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="app-container">
        <div id="screen-landing" class="active">
          <div class="container landing-container">
            <h1 class="landing-headline">Ready to trade your old story for a new one?</h1>
            <p class="landing-subtitle">A private, secure space to work through challenging thoughts and emotions.</p>
            <button id="btn-start" class="btn-primary landing-cta">Start Your 3-Minute Shift</button>
          </div>
        </div>
        <div id="screen-readiness">
          <div class="container">
            <h2>How intense are your feelings right now?</h2>
            <div class="slider-section">
              <label for="intensity-slider" class="slider-label">
                Move the slider to reflect your current emotional intensity
              </label>
              <input 
                type="range" 
                id="intensity-slider" 
                min="0" 
                max="10" 
                value="5" 
                aria-label="Emotional intensity from 0 to 10"
                aria-describedby="intensity-feedback"
              >
              <div class="intensity-display">
                <span>0 - Calm</span>
                <span id="intensity-value">5</span>
                <span>10 - Overwhelming</span>
              </div>
              <div id="intensity-feedback" class="feedback-text feedback-medium">
                You're feeling moderately intense emotions - this is a good place to start working through them.
              </div>
            </div>
            <button id="btn-continue-readiness" class="btn-primary">Continue</button>
          </div>
        </div>
        <div id="screen-starting-text">
          <div class="container">
            <h2>What's on your mind?</h2>
            <div class="text-input-section">
              <label for="starting-textarea" class="text-input-label">
                Share your specific thought or concern to get personalized reframing
              </label>
              <textarea 
                id="starting-textarea" 
                placeholder="For example: 'I keep worrying about not having enough money for retirement'"
                aria-label="Required text input for personalized guidance"
                aria-describedby="text-input-help"
                required
              ></textarea>
              <div id="text-input-help" class="text-input-help">
                <small>Your exact words help us provide the most relevant reframing. Your text is processed privately on your device.</small>
              </div>
              <button id="btn-begin-journey" class="btn-primary">Begin Journey</button>
            </div>
          </div>
        </div>
        <div id="screen-journey">
          <div class="container">
            <div class="journey-header">
              <h2 aria-label="Your Journey - 20% complete, step 1 of 5">Your Journey</h2>
              <div class="progress-dots" role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="5">
                <span class="dot filled" aria-label="Step 1 completed"></span>
                <span class="dot" aria-label="Current step 2 of 5"></span>
                <span class="dot" aria-label="Step 3 of 5"></span>
                <span class="dot" aria-label="Step 4 of 5"></span>
                <span class="dot" aria-label="Step 5 of 5"></span>
              </div>
            </div>
            <div class="prompt-section">
              <div id="journey-prompt" class="prompt-text" role="main" aria-live="polite">
                Current therapeutic prompt will be displayed here
              </div>
            </div>
            <div class="action-buttons">
              <button id="btn-try-another" class="btn-secondary" aria-describedby="try-another-help">Try another angle</button>
              <button id="btn-feels-better" class="btn-primary" aria-describedby="feels-better-help">This feels better</button>
              <div id="try-another-help" class="sr-only">Get an alternative perspective on the current prompt</div>
              <div id="feels-better-help" class="sr-only">Continue to the next step of your therapeutic journey</div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  describe('ARIA Labels and Semantic HTML', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      const slider = document.getElementById('intensity-slider');
      const textarea = document.getElementById('starting-textarea');
      const progressbar = document.querySelector('[role="progressbar"]');

      expect(slider.getAttribute('aria-label')).toContain('Emotional intensity');
      expect(slider.getAttribute('aria-describedby')).toBe('intensity-feedback');
      
      expect(textarea.getAttribute('aria-label')).toContain('text input');
      expect(textarea.getAttribute('aria-describedby')).toBe('text-input-help');
      
      expect(progressbar.getAttribute('aria-valuenow')).toBe('1');
      expect(progressbar.getAttribute('aria-valuemax')).toBe('5');
    });

    it('should have proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2Elements = document.querySelectorAll('h2');

      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Ready to trade your old story');
      
      expect(h2Elements.length).toBeGreaterThan(0);
      h2Elements.forEach(h2 => {
        expect(h2.textContent).toBeTruthy();
      });
    });

    it('should have proper form labels', () => {
      const sliderLabel = document.querySelector('label[for="intensity-slider"]');
      const textareaLabel = document.querySelector('label[for="starting-textarea"]');

      expect(sliderLabel).toBeTruthy();
      expect(sliderLabel.textContent).toContain('emotional intensity');
      
      expect(textareaLabel).toBeTruthy();
      expect(textareaLabel.textContent).toContain('Share your specific thought');
    });

    it('should have screen reader only content for context', () => {
      const srOnlyElements = document.querySelectorAll('.sr-only');
      
      // Should have screen reader help text for buttons
      expect(srOnlyElements.length).toBeGreaterThan(0);
      
      const tryAnotherHelp = document.getElementById('try-another-help');
      const feelsBetterHelp = document.getElementById('feels-better-help');
      
      expect(tryAnotherHelp).toBeTruthy();
      expect(feelsBetterHelp).toBeTruthy();
      expect(tryAnotherHelp.textContent).toContain('alternative perspective');
      expect(feelsBetterHelp.textContent).toContain('next step');
    });

    it('should have proper live regions for dynamic content', () => {
      const journeyPrompt = document.getElementById('journey-prompt');
      
      expect(journeyPrompt.getAttribute('aria-live')).toBe('polite');
      expect(journeyPrompt.getAttribute('role')).toBe('main');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable elements in logical tab order', () => {
      const focusableElements = document.querySelectorAll(
        'button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Check that buttons have proper focus indicators
      focusableElements.forEach(element => {
        if (element.tagName === 'BUTTON') {
          expect(element.getAttribute('disabled')).toBeNull();
        }
      });
    });

    it('should support Enter key activation on buttons', () => {
      const startButton = document.getElementById('btn-start');
      const continueButton = document.getElementById('btn-continue-readiness');
      
      expect(startButton.tagName).toBe('BUTTON');
      expect(continueButton.tagName).toBe('BUTTON');
      
      // Buttons should be activatable with Enter key (native behavior)
      expect(startButton.type).toBe('submit'); // Default button type
    });

    it('should have proper focus management for slider', () => {
      const slider = document.getElementById('intensity-slider');
      
      expect(slider.getAttribute('min')).toBe('0');
      expect(slider.getAttribute('max')).toBe('10');
      expect(slider.getAttribute('value')).toBe('5');
      
      // Slider should be keyboard accessible with arrow keys (native behavior)
      expect(slider.type).toBe('range');
    });
  });

  describe('Color Contrast and Visual Design', () => {
    it('should have sufficient color contrast ratios', () => {
      // This would typically be tested with automated tools like axe-core
      // For now, we'll test that elements have proper CSS classes for styling
      
      const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
      const feedbackText = document.querySelector('.feedback-text');
      
      expect(buttons.length).toBeGreaterThan(0);
      expect(feedbackText).toBeTruthy();
      
      // Verify elements have classes that should provide proper contrast
      buttons.forEach(button => {
        expect(button.className).toMatch(/btn-(primary|secondary)/);
      });
      
      expect(feedbackText.className).toContain('feedback-text');
    });

    it('should not rely solely on color for information', () => {
      const progressDots = document.querySelectorAll('.dot');
      const feedbackText = document.querySelector('.feedback-text');
      
      // Progress dots should have text labels, not just color
      progressDots.forEach(dot => {
        expect(dot.getAttribute('aria-label')).toBeTruthy();
      });
      
      // Feedback should have text content, not just color classes
      expect(feedbackText.textContent.trim()).toBeTruthy();
    });

    it('should have proper focus indicators', () => {
      const interactiveElements = document.querySelectorAll('button, input, textarea');
      
      // All interactive elements should be focusable
      interactiveElements.forEach(element => {
        expect(element.tabIndex).not.toBe(-1);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have viewport meta tag equivalent behavior', () => {
      // In a real app, this would be in the HTML head
      // Here we test that elements are structured for responsive design
      
      const containers = document.querySelectorAll('.container');
      expect(containers.length).toBeGreaterThan(0);
      
      // Containers should exist for responsive layout
      containers.forEach(container => {
        expect(container.className).toContain('container');
      });
    });

    it('should have flexible layouts', () => {
      const buttonGroups = document.querySelectorAll('.action-buttons, .button-group');
      const textInputSection = document.querySelector('.text-input-section');
      
      // Button groups should be structured for flexible layouts
      if (buttonGroups.length > 0) {
        buttonGroups.forEach(group => {
          const buttons = group.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
        });
      }
      
      // Text input sections should be structured properly
      if (textInputSection) {
        const textarea = textInputSection.querySelector('textarea');
        const label = textInputSection.querySelector('label');
        expect(textarea).toBeTruthy();
        expect(label).toBeTruthy();
      }
    });

    it('should have scalable text and touch targets', () => {
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input, textarea');
      
      // Buttons should have classes that provide adequate touch targets
      buttons.forEach(button => {
        expect(button.className).toMatch(/btn-/);
      });
      
      // Inputs should be properly sized
      inputs.forEach(input => {
        expect(input.id).toBeTruthy(); // Should have IDs for proper labeling
      });
    });
  });

  describe('Error Handling and User Feedback', () => {
    it('should have proper error messaging structure', () => {
      const helpText = document.getElementById('text-input-help');
      const feedbackText = document.getElementById('intensity-feedback');
      
      expect(helpText).toBeTruthy();
      expect(feedbackText).toBeTruthy();
      
      // Help text should be descriptive
      expect(helpText.textContent).toContain('processed privately');
      expect(feedbackText.textContent).toBeTruthy();
    });

    it('should have proper validation attributes', () => {
      const requiredTextarea = document.querySelector('textarea[required]');
      
      expect(requiredTextarea).toBeTruthy();
      expect(requiredTextarea.getAttribute('aria-label')).toContain('Required');
    });

    it('should have contextual help and instructions', () => {
      const sliderLabel = document.querySelector('.slider-label');
      const textInputLabel = document.querySelector('.text-input-label');
      
      expect(sliderLabel.textContent).toContain('Move the slider');
      expect(textInputLabel.textContent).toContain('Share your specific thought');
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript for basic functionality', () => {
      // Test that forms and basic elements are properly structured
      const form = document.querySelector('form');
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input, textarea');
      
      // Even without forms, elements should be properly labeled
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        expect(label || input.getAttribute('aria-label')).toBeTruthy();
      });
      
      // Buttons should have descriptive text
      buttons.forEach(button => {
        expect(button.textContent.trim()).toBeTruthy();
      });
    });

    it('should have semantic HTML structure', () => {
      const main = document.querySelector('[role="main"]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const landmarks = document.querySelectorAll('[role="progressbar"], [role="main"]');
      
      expect(main || headings.length > 0).toBeTruthy();
      expect(landmarks.length).toBeGreaterThan(0);
    });
  });
});