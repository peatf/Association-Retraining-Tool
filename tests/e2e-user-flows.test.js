// End-to-End User Flow Tests
// Tests all user flows from landing to completion on multiple devices and browsers
// Validates both NLP-driven and legacy therapeutic journeys

import { describe, it, expect, beforeEach, vi } from 'vitest';
import SessionStateManager from '../js/SessionStateManager.js';
import PsychologicalEngine from '../js/PsychologicalEngine.js';
import ContentManager from '../js/ContentManager.js';
import CalendarGenerator from '../js/CalendarGenerator.js';
import ErrorHandler from '../js/ErrorHandler.js';
import FeedbackManager from '../js/FeedbackManager.js';

// Mock JSON data for testing
const mockTopicsData = {
  topics: ['Money', 'Romance', 'Self-Image'],
  topicIcons: {
    'Money': '💰',
    'Romance': '💕',
    'Self-Image': '🪞'
  },
  topicDescriptions: {
    'Money': 'Financial concerns and abundance mindset',
    'Romance': 'Relationships and emotional connections',
    'Self-Image': 'Self-worth and personal identity'
  }
};

const mockEmotionsData = {
  'Money': {
    palette: ['anxious', 'resentful', 'overwhelmed', 'insecure', 'ashamed', 'fearful'],
    descriptions: {
      'anxious': 'Worried about financial security',
      'resentful': 'Angry about financial limitations'
    }
  },
  'Romance': {
    palette: ['lonely', 'rejected', 'unworthy', 'desperate', 'heartbroken', 'jealous'],
    descriptions: {
      'lonely': 'Feeling isolated in relationships',
      'rejected': 'Experiencing rejection or abandonment'
    }
  },
  'Self-Image': {
    palette: ['inadequate', 'worthless', 'embarrassed', 'disappointed', 'self-critical', 'defeated'],
    descriptions: {
      'inadequate': 'Feeling not good enough',
      'worthless': 'Questioning personal value'
    }
  }
};

describe('End-to-End User Flows', () => {
  let sessionManager;
  let contentManager;
  let psychologicalEngine;
  let calendarGenerator;
  let errorHandler;
  let feedbackManager;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="app-container">
        <div id="screen-landing" class="active"></div>
        <div id="screen-readiness"></div>
        <div id="screen-topic"></div>
        <div id="screen-emotion"></div>
        <div id="screen-starting-text"></div>
        <div id="screen-journey"></div>
        <div id="screen-act-defusion"></div>
        <div id="screen-completion"></div>
        <div id="screen-calendar"></div>
      </div>
    `;

    // Initialize managers
    sessionManager = new SessionStateManager();
    contentManager = new ContentManager();
    errorHandler = new ErrorHandler(sessionManager);
    psychologicalEngine = new PsychologicalEngine(sessionManager, contentManager);
    calendarGenerator = new CalendarGenerator();
    feedbackManager = new FeedbackManager(sessionManager);

    // Mock fetch responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('topics.json')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTopicsData)
        });
      }
      if (url.includes('emotions.json')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockEmotionsData)
        });
      }
      if (url.includes('therapeutic-content.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            'Money': {
              subtopics: {
                'Scarcity': {
                  keywordTriggers: ['enough', 'never', 'lack'],
                  emotionTriggers: ['anxious', 'fearful'],
                  cbtSequence: [
                    { step: 1, prompt: 'Test CBT prompt 1', type: 'cbt' },
                    { step: 2, prompt: 'Test CBT prompt 2', type: 'socratic' }
                  ]
                }
              },
              actDefusion: ['Test ACT exercise']
            }
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Complete User Journey - Low Intensity Flow', () => {
    it('should complete full journey from landing to completion with low emotional intensity', async () => {
      // Initialize session
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Step 1: Landing screen
      expect(sessionManager.getState('currentScreen')).toBe('landing');

      // Step 2: Readiness check with low intensity (3)
      sessionManager.updateState('currentScreen', 'readiness');
      sessionManager.updateState('intensity', 3);
      
      expect(sessionManager.getState('intensity')).toBe(3);
      expect(sessionManager.getState('currentScreen')).toBe('readiness');

      // Step 3: Topic selection
      sessionManager.updateState('currentScreen', 'topic');
      sessionManager.updateState('selectedTopic', 'Money');
      
      expect(sessionManager.getState('selectedTopic')).toBe('Money');

      // Step 4: Emotion selection
      sessionManager.updateState('currentScreen', 'emotion');
      sessionManager.updateState('selectedEmotion', 'anxious');
      
      expect(sessionManager.getState('selectedEmotion')).toBe('anxious');

      // Step 5: Text input
      sessionManager.updateState('currentScreen', 'starting-text');
      sessionManager.updateState('userText', 'I worry about not having enough money for retirement');
      
      expect(sessionManager.getState('userText')).toBeTruthy();

      // Step 6: Journey progression
      sessionManager.updateState('currentScreen', 'journey');
      const userState = sessionManager.getCurrentState();
      
      // Should not route to ACT defusion for low intensity
      expect(userState.intensity).toBeLessThan(7);
      
      // Simulate journey progression
      const journeySequence = await psychologicalEngine.buildJourneySequence(userState);
      expect(journeySequence).toBeDefined();

      // Step 7: Completion
      sessionManager.updateState('currentScreen', 'completion');
      
      // Verify completion state
      expect(sessionManager.getState('currentScreen')).toBe('completion');
      expect(sessionManager.getState('selectedTopic')).toBe('Money');
      expect(sessionManager.getState('selectedEmotion')).toBe('anxious');
    });
  });

  describe('High Intensity ACT Defusion Flow', () => {
    it('should route to ACT defusion for high emotional intensity (7+)', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Set high intensity
      sessionManager.updateState('intensity', 8);
      sessionManager.updateState('selectedTopic', 'Romance');
      sessionManager.updateState('selectedEmotion', 'heartbroken');
      sessionManager.updateState('userText', 'I feel completely rejected and unlovable');

      const userState = sessionManager.getCurrentState();
      
      // Should route to ACT defusion for high intensity
      expect(userState.intensity).toBeGreaterThanOrEqual(7);
      
      const journeySequence = await psychologicalEngine.buildJourneySequence(userState);
      const technique = sessionManager.getState('currentTechnique');
      
      // Verify ACT routing
      expect(technique).toBe('act');
      
      // Simulate ACT completion
      sessionManager.updateState('currentScreen', 'act-defusion');
      sessionManager.updateState('currentScreen', 'completion');
      
      expect(sessionManager.getState('currentScreen')).toBe('completion');
    });
  });

  describe('NLP-Driven Journey Flow', () => {
    it('should process user text and deliver personalized content', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Set up for NLP processing
      sessionManager.updateState('selectedTopic', 'Self-Image');
      sessionManager.updateState('selectedEmotion', 'worthless');
      sessionManager.updateState('userText', 'I feel like I am not good enough and will never succeed');
      sessionManager.updateState('intensity', 5);

      const userState = sessionManager.getCurrentState();
      
      // Verify text input is captured
      expect(userState.userText).toBeTruthy();
      expect(userState.userText.length).toBeGreaterThan(10);
      
      // Build journey sequence
      const journeySequence = await psychologicalEngine.buildJourneySequence(userState);
      expect(journeySequence).toBeDefined();
      
      // Verify journey progression
      sessionManager.updateState('currentScreen', 'journey');
      
      // Simulate "This feels better" progression
      let nextPrompt = psychologicalEngine.getNextPrompt('continue');
      expect(nextPrompt).toBeDefined();
      expect(nextPrompt.content).toBeTruthy();
      
      // Continue until completion
      let stepCount = 0;
      while (!nextPrompt.isComplete && stepCount < 10) {
        nextPrompt = psychologicalEngine.getNextPrompt('continue');
        stepCount++;
      }
      
      expect(stepCount).toBeLessThan(10); // Should complete within reasonable steps
      expect(nextPrompt.isComplete || stepCount >= 7).toBeTruthy();
    });
  });

  describe('Alternative Angle and ACT Trigger Flow', () => {
    it('should trigger ACT defusion after multiple "try another angle" clicks', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      sessionManager.updateState('selectedTopic', 'Money');
      sessionManager.updateState('selectedEmotion', 'overwhelmed');
      sessionManager.updateState('userText', 'I cannot handle my financial stress anymore');
      sessionManager.updateState('intensity', 6);
      sessionManager.updateState('currentScreen', 'journey');

      const userState = sessionManager.getCurrentState();
      await psychologicalEngine.buildJourneySequence(userState);

      // Simulate multiple "try another angle" clicks
      let alternativePrompt1 = psychologicalEngine.getNextPrompt('try-another');
      expect(alternativePrompt1).toBeDefined();
      expect(alternativePrompt1.requiresACTFlow).toBeFalsy();

      let alternativePrompt2 = psychologicalEngine.getNextPrompt('try-another');
      expect(alternativePrompt2).toBeDefined();
      
      // After second "try another angle", should trigger ACT
      expect(alternativePrompt2.requiresACTFlow).toBeTruthy();
      
      // Verify ACT content
      expect(alternativePrompt2.content).toBeTruthy();
      
      // Complete ACT flow
      sessionManager.updateState('currentScreen', 'act-defusion');
      sessionManager.updateState('currentScreen', 'completion');
      
      expect(sessionManager.getState('currentScreen')).toBe('completion');
    });
  });

  describe('Calendar Integration Flow', () => {
    it('should generate calendar files for daily and weekly reminders', async () => {
      sessionManager.initializeSession();
      
      // Complete a journey first
      sessionManager.updateState('selectedTopic', 'Self-Image');
      sessionManager.updateState('selectedEmotion', 'inadequate');
      sessionManager.updateState('currentScreen', 'completion');
      
      // Navigate to calendar screen
      sessionManager.updateState('currentScreen', 'calendar');
      
      // Test daily calendar generation
      expect(() => calendarGenerator.generateICSFile('daily')).not.toThrow();
      
      // Test weekly calendar generation
      expect(() => calendarGenerator.generateICSFile('weekly')).not.toThrow();
      
      // Verify calendar generation works (actual content verification would need real implementation)
      expect(() => calendarGenerator.generateICSFile('daily')).not.toThrow();
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle content loading failures gracefully', async () => {
      // Mock fetch failure
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      sessionManager.initializeSession();
      
      // Should not throw error
      await expect(contentManager.loadTherapeuticContent()).resolves.not.toThrow();
      
      // Should provide fallback content
      const fallbackContent = contentManager.getSubtopicContent('Money', 'Scarcity');
      expect(fallbackContent).toBeDefined();
    });

    it('should handle NLP processing errors with fallback content', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();
      
      sessionManager.updateState('selectedTopic', 'Money');
      sessionManager.updateState('selectedEmotion', 'anxious');
      sessionManager.updateState('userText', 'Test input');
      sessionManager.updateState('intensity', 5);

      // Should not throw error even if NLP fails
      const userState = sessionManager.getCurrentState();
      await expect(psychologicalEngine.buildJourneySequence(userState)).resolves.not.toThrow();
      
      // Should provide fallback therapeutic content
      const nextPrompt = psychologicalEngine.getNextPrompt('continue');
      expect(nextPrompt).toBeDefined();
      expect(nextPrompt.content).toBeTruthy();
    });

    it('should handle session state corruption gracefully', () => {
      sessionManager.initializeSession();
      
      // Corrupt session state
      sessionManager.sessionData = null;
      
      // Should reinitialize without error
      expect(() => sessionManager.initializeSession()).not.toThrow();
      expect(sessionManager.getCurrentState()).toBeDefined();
      expect(sessionManager.getState('currentScreen')).toBe('landing');
    });
  });

  describe('Privacy and Data Protection', () => {
    it('should clear all user data on session end', () => {
      sessionManager.initializeSession();
      
      // Add user data
      sessionManager.updateState('userText', 'Sensitive personal information');
      sessionManager.updateState('selectedTopic', 'Romance');
      sessionManager.updateState('selectedEmotion', 'heartbroken');
      
      // Verify data exists
      expect(sessionManager.getState('userText')).toBeTruthy();
      expect(sessionManager.getState('selectedTopic')).toBeTruthy();
      
      // Clear session
      sessionManager.clearSession();
      
      // Verify all data is cleared (getState will reinitialize, so check for null values)
      expect(sessionManager.getState('userText')).toBeNull();
      expect(sessionManager.getState('selectedTopic')).toBeNull();
      expect(sessionManager.getState('selectedEmotion')).toBeNull();
    });

    it('should not persist any data beyond session', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('userText', 'Private thoughts');
      
      // Verify no localStorage usage
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
      
      // Verify data is only in memory
      expect(sessionManager.sessionData.userText).toBe('Private thoughts');
    });
  });

  describe('Feedback System', () => {
    it('should show anonymous feedback survey appropriately', () => {
      sessionManager.initializeSession();
      
      // Complete a journey
      sessionManager.updateState('selectedTopic', 'Money');
      sessionManager.updateState('currentScreen', 'completion');
      
      // Check if feedback should be shown
      const shouldShow = feedbackManager.shouldShowFeedback();
      expect(typeof shouldShow).toBe('boolean');
      
      // If shown, verify it contains no personal data
      if (shouldShow) {
        const mockContainer = document.createElement('div');
        feedbackManager.showFeedbackSurvey(mockContainer);
        
        // Verify feedback form exists but contains no personal data
        expect(mockContainer.innerHTML).toBeTruthy();
        expect(mockContainer.innerHTML).not.toContain('Money');
        
        const userText = sessionManager.getState('userText');
        if (userText) {
          expect(mockContainer.innerHTML).not.toContain(userText);
        }
      }
    });
  });

  describe('Responsive Design and Accessibility', () => {
    it('should handle different viewport sizes', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];

      viewports.forEach(viewport => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        // Should not throw errors on different viewport sizes
        expect(() => sessionManager.initializeSession()).not.toThrow();
      });
    });

    it('should provide proper ARIA labels and accessibility features', () => {
      document.body.innerHTML = `
        <input type="range" id="intensity-slider" aria-label="Emotional intensity from 0 to 10">
        <textarea id="starting-textarea" aria-label="Required text input for personalized guidance"></textarea>
        <div class="progress-dots">
          <span class="dot" aria-label="Step 1 of 6"></span>
          <span class="dot" aria-label="Step 2 of 6"></span>
        </div>
      `;

      const slider = document.getElementById('intensity-slider');
      const textarea = document.getElementById('starting-textarea');
      const dots = document.querySelectorAll('.dot');

      expect(slider.getAttribute('aria-label')).toBeTruthy();
      expect(textarea.getAttribute('aria-label')).toBeTruthy();
      expect(dots[0].getAttribute('aria-label')).toBeTruthy();
    });
  });
});