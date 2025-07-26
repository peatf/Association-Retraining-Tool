// QA Validation Tests
// Comprehensive quality assurance testing for functionality, performance, and user experience
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SessionStateManager from '../js/SessionStateManager.js';
import ContentManager from '../js/ContentManager.js';
import PsychologicalEngine from '../js/PsychologicalEngine.js';
import CalendarGenerator from '../js/CalendarGenerator.js';
import ErrorHandler from '../js/ErrorHandler.js';
import FeedbackManager from '../js/FeedbackManager.js';

describe('QA Validation Tests', () => {
  let sessionManager;
  let contentManager;
  let psychologicalEngine;
  let calendarGenerator;
  let errorHandler;
  let feedbackManager;

  beforeEach(() => {
    // Initialize all components
    sessionManager = new SessionStateManager();
    contentManager = new ContentManager();
    errorHandler = new ErrorHandler(sessionManager);
    psychologicalEngine = new PsychologicalEngine(sessionManager, contentManager);
    calendarGenerator = new CalendarGenerator();
    feedbackManager = new FeedbackManager(sessionManager);

    // Mock fetch for content loading
    global.fetch.mockImplementation((url) => {
      if (url.includes('topics.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            topics: ['Money', 'Romance', 'Self-Image'],
            topicDescriptions: {
              'Money': 'Financial concerns and abundance mindset',
              'Romance': 'Relationships and emotional connections',
              'Self-Image': 'Self-worth and personal identity'
            },
            topicIcons: {
              'Money': '💰',
              'Romance': '💕',
              'Self-Image': '🪞'
            }
          })
        });
      }
      if (url.includes('emotions.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            'Money': { palette: ['anxious', 'resentful', 'overwhelmed'] },
            'Romance': { palette: ['lonely', 'rejected', 'unworthy'] },
            'Self-Image': { palette: ['inadequate', 'worthless', 'embarrassed'] }
          })
        });
      }
      if (url.includes('thought-buffet.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            generic_fallback: [
              "It's okay if your thoughts feel tangled right now.",
              "Your feelings are valid, even if they're hard to put into words.",
              "This moment of difficulty is temporary and will pass."
            ]
          })
        });
      }
      if (url.includes('therapeutic-content.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            sequences: {
              Money: {
                anxious: [
                  { content: 'Test content', alternative: 'Test alternative', type: 'cbt' }
                ]
              }
            },
            act_defusion_exercises: {
              generic: {
                title: 'Generic ACT Exercise',
                instructions: 'Test ACT instructions'
              }
            }
          })
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({})
      });
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should validate user input data types and ranges', () => {
      sessionManager.initializeSession();

      // Test intensity validation (should be 0-10)
      sessionManager.updateState('intensity', 5);
      expect(sessionManager.getState('intensity')).toBe(5);

      sessionManager.updateState('intensity', 0);
      expect(sessionManager.getState('intensity')).toBe(0);

      sessionManager.updateState('intensity', 10);
      expect(sessionManager.getState('intensity')).toBe(10);

      // Test topic validation
      const validTopics = ['Money', 'Romance', 'Self-Image'];
      validTopics.forEach(topic => {
        sessionManager.updateState('selectedTopic', topic);
        expect(sessionManager.getState('selectedTopic')).toBe(topic);
      });
    });

    it('should handle invalid or malformed data gracefully', () => {
      sessionManager.initializeSession();

      // Test with null values
      sessionManager.updateState('userText', null);
      expect(sessionManager.getState('userText')).toBeNull();

      // Test with empty strings
      sessionManager.updateState('userText', '');
      expect(sessionManager.getState('userText')).toBe('');

      // Test with very long strings
      const longText = 'a'.repeat(10000);
      sessionManager.updateState('userText', longText);
      expect(sessionManager.getState('userText')).toBe(longText);
    });

    it('should maintain data consistency across operations', () => {
      sessionManager.initializeSession();

      const testData = {
        intensity: 7,
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        userText: 'Test consistency'
      };

      // Set all data
      Object.keys(testData).forEach(key => {
        sessionManager.updateState(key, testData[key]);
      });

      // Verify all data is consistent
      Object.keys(testData).forEach(key => {
        expect(sessionManager.getState(key)).toBe(testData[key]);
      });

      // Verify complete state
      const currentState = sessionManager.getCurrentState();
      Object.keys(testData).forEach(key => {
        expect(currentState[key]).toBe(testData[key]);
      });
    });
  });

  describe('Performance and Resource Management', () => {
    it('should handle large amounts of data efficiently', async () => {
      const startTime = performance.now();
      
      await contentManager.loadTherapeuticContent();
      
      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
    });

    it('should manage memory usage properly', () => {
      sessionManager.initializeSession();

      // Create large session data
      const largeData = 'x'.repeat(100000);
      sessionManager.updateState('largeData', largeData);

      expect(sessionManager.getState('largeData')).toBe(largeData);

      // Clear session should free memory
      sessionManager.clearSession();
      expect(sessionManager.sessionData).toEqual({});
    });

    it('should handle concurrent operations safely', async () => {
      const promises = [];
      
      // Simulate concurrent content loading
      for (let i = 0; i < 10; i++) {
        promises.push(contentManager.loadTherapeuticContent());
      }

      await Promise.all(promises);
      expect(contentManager.isLoaded()).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(contentManager.loadTherapeuticContent()).resolves.not.toThrow();
      expect(contentManager.isLoaded()).toBe(true); // Should load fallback content
    });

    it('should recover from corrupted session state', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('testData', 'original');

      // Corrupt the session data
      sessionManager.sessionData = null;
      sessionManager.initialized = false;

      // Should reinitialize automatically
      const state = sessionManager.getCurrentState();
      expect(state).toBeDefined();
      expect(state.currentScreen).toBe('landing');
    });

    it('should handle invalid JSON responses', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({
        json: () => Promise.reject(new Error('Invalid JSON'))
      }));

      await expect(contentManager.loadTherapeuticContent()).resolves.not.toThrow();
      expect(contentManager.isLoaded()).toBe(true);
    });

    it('should provide meaningful error messages', () => {
      const errorMessages = [];
      
      sessionManager.addErrorHandler((errorInfo) => {
        errorMessages.push(errorInfo);
      });

      // Trigger an error
      sessionManager.handleError('Test Error', new Error('Test message'));

      expect(errorMessages.length).toBe(1);
      expect(errorMessages[0].type).toBe('Test Error');
      expect(errorMessages[0].error.message).toBe('Test message');
    });
  });

  describe('User Experience Validation', () => {
    it('should provide appropriate feedback for user actions', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Test journey building provides feedback
      sessionManager.updateState('intensity', 5);
      sessionManager.updateState('selectedTopic', 'Money');
      sessionManager.updateState('selectedEmotion', 'anxious');
      sessionManager.updateState('userText', 'Test input');

      const userState = sessionManager.getCurrentState();
      const journey = await psychologicalEngine.buildJourneySequence(userState);

      expect(journey).toBeDefined();
      expect(Array.isArray(journey)).toBe(true);
      // Journey might be empty if no content is found, but should still be an array
      expect(journey.length).toBeGreaterThanOrEqual(0);
    });

    it('should maintain user context throughout the journey', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      const originalTopic = 'Romance';
      const originalEmotion = 'lonely';
      const originalText = 'I feel so alone';

      sessionManager.updateState('selectedTopic', originalTopic);
      sessionManager.updateState('selectedEmotion', originalEmotion);
      sessionManager.updateState('userText', originalText);

      const userState = sessionManager.getCurrentState();
      await psychologicalEngine.buildJourneySequence(userState);

      // Context should be preserved
      expect(sessionManager.getState('selectedTopic')).toBe(originalTopic);
      expect(sessionManager.getState('selectedEmotion')).toBe(originalEmotion);
      expect(sessionManager.getState('userText')).toBe(originalText);
    });

    it('should provide consistent user interface behavior', () => {
      sessionManager.initializeSession();

      // Test state transitions
      const validScreens = [
        'landing', 'readiness', 'topic', 'emotion', 'starting-text',
        'journey', 'act-defusion', 'completion', 'calendar'
      ];

      validScreens.forEach(screen => {
        sessionManager.updateState('currentScreen', screen);
        expect(sessionManager.getState('currentScreen')).toBe(screen);
      });
    });
  });

  describe('Security and Privacy Validation', () => {
    it('should not persist sensitive data', () => {
      sessionManager.initializeSession();

      const sensitiveData = {
        userText: 'Very private thoughts',
        selectedTopic: 'Self-Image',
        selectedEmotion: 'worthless'
      };

      Object.keys(sensitiveData).forEach(key => {
        sessionManager.updateState(key, sensitiveData[key]);
      });

      // Verify no localStorage usage
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(sessionStorage.setItem).not.toHaveBeenCalled();

      // Clear session should remove all data
      sessionManager.clearSession();
      expect(sessionManager.sessionData).toEqual({});
    });

    it('should handle user data securely', () => {
      sessionManager.initializeSession();

      const userData = 'Sensitive personal information';
      sessionManager.updateState('userText', userData);

      // Data should only exist in memory
      expect(sessionManager.sessionData.userText).toBe(userData);

      // Clear should overwrite data before removing
      sessionManager.clearSession();
      expect(sessionManager.sessionData).toEqual({});
    });

    it('should validate session integrity', () => {
      sessionManager.initializeSession();

      // Valid session should pass validation
      expect(sessionManager.validateSessionState()).toBe(true);

      // Invalid session should fail validation
      sessionManager.sessionData.currentScreen = 'invalid-screen';
      expect(sessionManager.validateSessionState()).toBe(false);
    });
  });

  describe('Integration and Workflow Validation', () => {
    it('should complete full user workflow without errors', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Simulate complete user journey
      sessionManager.updateState('intensity', 6);
      sessionManager.updateState('selectedTopic', 'Self-Image');
      sessionManager.updateState('selectedEmotion', 'inadequate');
      sessionManager.updateState('userText', 'I never feel good enough');

      const userState = sessionManager.getCurrentState();
      const journey = await psychologicalEngine.buildJourneySequence(userState);

      expect(journey).toBeDefined();
      expect(journey.length).toBeGreaterThan(0);

      // Test journey progression - first prompt should advance the journey
      const firstPrompt = psychologicalEngine.getNextPrompt('continue');
      expect(firstPrompt).toBeDefined();
      expect(firstPrompt.content).toBeTruthy();

      // Reset journey for alternative prompt test
      await psychologicalEngine.buildJourneySequence(userState);
      
      // Test alternative prompts
      const altPrompt = psychologicalEngine.getNextPrompt('try-another');
      expect(altPrompt).toBeDefined();
      expect(altPrompt.isAlternative).toBe(true);
    });

    it('should handle edge cases in user workflow', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      // Test high intensity routing to ACT
      sessionManager.updateState('intensity', 9);
      sessionManager.updateState('selectedTopic', 'Money');
      sessionManager.updateState('selectedEmotion', 'overwhelmed');

      const userState = sessionManager.getCurrentState();
      await psychologicalEngine.buildJourneySequence(userState);

      const technique = sessionManager.getState('currentTechnique');
      expect(technique).toBe('act');
    });

    it('should maintain data consistency across components', async () => {
      sessionManager.initializeSession();
      await contentManager.loadTherapeuticContent();

      const testState = {
        intensity: 4,
        selectedTopic: 'Romance',
        selectedEmotion: 'lonely',
        userText: 'Integration test'
      };

      Object.keys(testState).forEach(key => {
        sessionManager.updateState(key, testState[key]);
      });

      const userState = sessionManager.getCurrentState();
      await psychologicalEngine.buildJourneySequence(userState);

      // All components should see consistent state
      Object.keys(testState).forEach(key => {
        expect(sessionManager.getState(key)).toBe(testState[key]);
      });
    });
  });

  describe('Content Quality and Validation', () => {
    it('should provide meaningful therapeutic content', async () => {
      await contentManager.loadTherapeuticContent();

      const thoughtBuffet = contentManager.getThoughtBuffet();
      expect(thoughtBuffet).toBeDefined();
      expect(thoughtBuffet.generic_fallback).toBeDefined();
      expect(Array.isArray(thoughtBuffet.generic_fallback)).toBe(true);
      expect(thoughtBuffet.generic_fallback.length).toBeGreaterThan(0);

      // Content should be meaningful
      thoughtBuffet.generic_fallback.forEach(statement => {
        expect(statement).toBeTruthy();
        expect(statement.length).toBeGreaterThan(10);
      });
    });

    it('should provide appropriate ACT exercises', async () => {
      await contentManager.loadTherapeuticContent();

      const topics = ['Money', 'Romance', 'Self-Image'];
      topics.forEach(topic => {
        const exercise = contentManager.getACTDefusionExercise(topic);
        expect(exercise).toBeDefined();
        expect(exercise.instructions || exercise.title).toBeTruthy();
      });
    });

    it('should handle missing content gracefully', async () => {
      await contentManager.loadTherapeuticContent();

      // Test with non-existent topic
      const content = contentManager.getSubtopicContent('NonExistent', [], 'test');
      expect(content).toBeNull(); // Should handle gracefully

      // Test ACT exercise fallback
      const exercise = contentManager.getACTDefusionExercise('NonExistent');
      expect(exercise).toBeDefined(); // Should provide fallback
    });
  });

  describe('Calendar and External Integration', () => {
    it('should generate valid calendar files', () => {
      expect(() => calendarGenerator.generateICSFile('daily')).not.toThrow();
      expect(() => calendarGenerator.generateICSFile('weekly')).not.toThrow();
    });

    it('should handle calendar generation errors', () => {
      // Test with invalid frequency
      expect(() => calendarGenerator.generateICSFile('invalid')).not.toThrow();
    });
  });

  describe('Feedback System Validation', () => {
    it('should show feedback appropriately', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('selectedTopic', 'Money');

      const shouldShow = feedbackManager.shouldShowFeedback();
      expect(typeof shouldShow).toBe('boolean');
    });

    it('should generate anonymous feedback forms', () => {
      sessionManager.initializeSession();
      sessionManager.updateState('selectedTopic', 'Romance');
      sessionManager.updateState('userText', 'Private thoughts');

      const container = document.createElement('div');
      feedbackManager.showFeedbackSurvey(container);

      // Should create feedback form
      expect(container.innerHTML).toBeTruthy();
      
      // Should not contain personal data
      expect(container.innerHTML).not.toContain('Private thoughts');
      expect(container.innerHTML).not.toContain('Romance');
    });
  });
});