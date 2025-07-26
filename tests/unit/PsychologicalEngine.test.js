/**
 * PsychologicalEngine Unit Tests
 * Tests therapeutic technique selection, journey building, and prompt generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import PsychologicalEngine from '../../js/PsychologicalEngine.js';

// Mock dependencies
const mockSessionManager = {
  getCurrentState: vi.fn(),
  updateState: vi.fn(),
  getState: vi.fn()
};

const mockContentManager = {
  getSubtopicContent: vi.fn(),
  getACTDefusionExercise: vi.fn(),
  selectSubtopicByKeywords: vi.fn(),
  getTherapeuticContent: vi.fn(),
  getThoughtBuffet: vi.fn()
};

describe('PsychologicalEngine', () => {
  let psychologicalEngine;

  beforeEach(() => {
    psychologicalEngine = new PsychologicalEngine(mockSessionManager, mockContentManager);
    vi.clearAllMocks();
  });

  describe('Technique Selection', () => {
    it('should select ACT for high intensity (7+)', () => {
      const userState = { intensity: 8, selectedEmotion: 'anxious' };
      const technique = psychologicalEngine.selectTechnique(userState);
      expect(technique).toBe('act');
    });

    it('should select CBT/Socratic for moderate intensity', () => {
      const userState = { intensity: 5, selectedEmotion: 'anxious', selectedTopic: 'Money' };
      const technique = psychologicalEngine.selectTechnique(userState);
      expect(['cbt', 'socratic']).toContain(technique);
    });

    it('should select CBT/Socratic for low intensity', () => {
      const userState = { intensity: 2, selectedEmotion: 'anxious', selectedTopic: 'Money' };
      const technique = psychologicalEngine.selectTechnique(userState);
      expect(['cbt', 'socratic']).toContain(technique);
    });
  });

  describe('Journey Sequence Building', () => {
    beforeEach(() => {
      mockContentManager.getTherapeuticContent.mockReturnValue({
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'Step 1', alternative: 'Alt 1' },
              { type: 'socratic', content: 'Step 2', alternative: 'Alt 2' }
            ]
          }
        }
      });
      mockContentManager.getACTDefusionExercise.mockReturnValue({
        instructions: 'ACT instructions',
        steps: ['Step 1'],
        closing: 'ACT closing'
      });
    });

    it('should build journey sequence for CBT/Socratic technique', async () => {
      const userState = {
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        intensity: 5
      };

      const sequence = await psychologicalEngine.buildJourneySequence(userState);

      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentTechnique', expect.any(String));
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('journeySequence', expect.any(Array));
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('totalSteps', expect.any(Number));
    });

    it('should route to ACT for high intensity', async () => {
      const userState = {
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        intensity: 8
      };

      const sequence = await psychologicalEngine.buildJourneySequence(userState);

      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentTechnique', 'act');
    });
  });

  describe('Prompt Generation', () => {
    beforeEach(async () => {
      // Set up a proper journey first
      const userState = {
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        intensity: 5
      };

      // Mock session manager to return user state
      mockSessionManager.getCurrentState.mockReturnValue(userState);

      mockContentManager.getTherapeuticContent.mockReturnValue({
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'First prompt', alternative: 'First alt' },
              { type: 'socratic', content: 'Second prompt', alternative: 'Second alt' }
            ]
          }
        }
      });

      await psychologicalEngine.buildJourneySequence(userState);
    });

    it('should return next prompt when continuing', () => {
      const prompt = psychologicalEngine.getNextPrompt('continue');

      expect(prompt.content).toBe('Second prompt'); // Advances to step 1 (second item)
      expect(prompt.step).toBe(2);
      expect(prompt.isComplete).toBe(false);
    });

    it('should return alternative prompt when trying another angle', () => {
      const prompt = psychologicalEngine.getNextPrompt('try-another');

      expect(prompt.content).toBe('First alt'); // Alternative for current step (step 0)
      expect(prompt.isAlternative).toBe(true);
    });

    it('should trigger ACT flow after two alternative angle clicks', () => {
      mockContentManager.getACTDefusionExercise.mockReturnValue({
        instructions: 'ACT exercise instructions'
      });

      // First try another angle
      psychologicalEngine.getNextPrompt('try-another');
      // Second try another angle should trigger ACT
      const prompt = psychologicalEngine.getNextPrompt('try-another');

      expect(prompt.requiresACTFlow).toBe(true);
      expect(prompt.content).toBe('ACT exercise instructions');
    });

    it('should mark journey as complete on final step', () => {
      // Advance through all steps
      psychologicalEngine.getNextPrompt('continue'); // Step 1
      const finalPrompt = psychologicalEngine.getNextPrompt('continue'); // Should complete

      expect(finalPrompt.isComplete).toBe(true);
      expect(finalPrompt.content).toContain('worked through');
    });
  });

  describe('ACT Defusion Integration', () => {
    beforeEach(() => {
      mockContentManager.getACTDefusionExercise.mockReturnValue({
        title: 'Test ACT Exercise',
        instructions: 'Test ACT instructions',
        steps: ['Step 1', 'Step 2'],
        closing: 'Test closing'
      });
    });

    it('should build ACT sequence for high intensity', async () => {
      const userState = {
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        intensity: 8
      };

      const sequence = await psychologicalEngine.buildJourneySequence(userState);

      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentTechnique', 'act');
      expect(mockContentManager.getACTDefusionExercise).toHaveBeenCalledWith('Money');
    });

    it('should trigger ACT flow through alternative angle mechanism', async () => {
      // Set up a journey first
      const userState = {
        selectedTopic: 'Romance',
        selectedEmotion: 'lonely',
        intensity: 5
      };

      // Mock session manager to return user state
      mockSessionManager.getCurrentState.mockReturnValue(userState);

      mockContentManager.getTherapeuticContent.mockReturnValue({
        sequences: {
          Romance: {
            lonely: [
              { type: 'cbt_reframe', content: 'Test prompt', alternative: 'Test alt' }
            ]
          }
        }
      });

      await psychologicalEngine.buildJourneySequence(userState);

      // Trigger ACT through multiple alternative attempts
      psychologicalEngine.getNextPrompt('try-another');
      const actPrompt = psychologicalEngine.getNextPrompt('try-another');

      expect(actPrompt.requiresACTFlow).toBe(true);
      expect(mockContentManager.getACTDefusionExercise).toHaveBeenCalledWith('Romance');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing content gracefully', async () => {
      mockContentManager.getTherapeuticContent.mockReturnValue({
        sequences: {} // Empty sequences
      });

      const userState = {
        selectedTopic: 'Unknown',
        selectedEmotion: 'unknown',
        intensity: 5
      };

      const sequence = await psychologicalEngine.buildJourneySequence(userState);

      // Should still create a journey with fallback content
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentTechnique', expect.any(String));
    });

    it('should throw error when no journey is active', () => {
      expect(() => {
        psychologicalEngine.getNextPrompt('continue');
      }).toThrow('No active journey. Call buildJourneySequence first.');
    });
  });

  describe('Journey State Management', () => {
    it('should maintain journey state correctly', async () => {
      const userState = {
        selectedTopic: 'Money',
        selectedEmotion: 'anxious',
        intensity: 5
      };

      mockContentManager.getTherapeuticContent.mockReturnValue({
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'First prompt', alternative: 'First alt' }
            ]
          }
        }
      });

      await psychologicalEngine.buildJourneySequence(userState);

      // Should update session state correctly
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentStep', 0);
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('totalSteps', 1);
    });

    it('should reset journey when requested', () => {
      psychologicalEngine.resetJourney();

      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentTechnique', null);
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('journeySequence', []);
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('currentStep', 0);
      expect(mockSessionManager.updateState).toHaveBeenCalledWith('totalSteps', 0);
    });
  });
});