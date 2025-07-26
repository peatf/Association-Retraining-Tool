/**
 * ContentManager Unit Tests
 * Tests content loading, selection, and therapeutic content delivery
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ContentManager from '../../js/ContentManager.js';

// Mock fetch for testing
global.fetch = vi.fn();

describe('ContentManager', () => {
  let contentManager;

  beforeEach(() => {
    contentManager = new ContentManager();
    vi.clearAllMocks();
  });

  describe('Content Loading', () => {
    it('should load therapeutic content successfully', async () => {
      const mockTherapeuticContent = {
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'Test content', alternative: 'Test alternative' }
            ]
          }
        },
        act_defusion_exercises: {
          Money: { title: 'Test Exercise', instructions: 'Test instructions' }
        }
      };

      const mockThoughtBuffet = { generic_fallback: ['Test fallback'] };
      const mockTopics = { topics: ['Money'] };
      const mockEmotions = { Money: { palette: ['anxious'] } };

      fetch.mockImplementation((url) => {
        if (url.includes('therapeutic-content.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTherapeuticContent });
        } else if (url.includes('thought-buffet.json')) {
          return Promise.resolve({ ok: true, json: async () => mockThoughtBuffet });
        } else if (url.includes('topics.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTopics });
        } else if (url.includes('emotions.json')) {
          return Promise.resolve({ ok: true, json: async () => mockEmotions });
        }
      });

      await contentManager.loadTherapeuticContent();

      expect(fetch).toHaveBeenCalledWith('./js/therapeutic-content.json');
      expect(contentManager.therapeuticContent).toEqual(mockTherapeuticContent);
    });

    it('should handle content loading failure gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await contentManager.loadTherapeuticContent();

      // Should have fallback content
      expect(contentManager.therapeuticContent).toBeDefined();
      expect(contentManager.therapeuticContent.sequences).toBeDefined();
    });
  });

  describe('Emotion Palette Retrieval', () => {
    beforeEach(async () => {
      const mockTherapeuticContent = { sequences: {} };
      const mockThoughtBuffet = { generic_fallback: ['Test'] };
      const mockTopics = { topics: ['Money'] };
      const mockEmotions = {
        Money: { palette: ['anxious', 'resentful', 'overwhelmed', 'insecure', 'ashamed', 'fearful'] },
        Romance: { palette: ['lonely', 'rejected', 'unworthy', 'desperate', 'heartbroken', 'jealous'] },
        'Self-Image': { palette: ['inadequate', 'worthless', 'embarrassed', 'disappointed', 'self-critical', 'defeated'] }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('therapeutic-content.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTherapeuticContent });
        } else if (url.includes('thought-buffet.json')) {
          return Promise.resolve({ ok: true, json: async () => mockThoughtBuffet });
        } else if (url.includes('topics.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTopics });
        } else if (url.includes('emotions.json')) {
          return Promise.resolve({ ok: true, json: async () => mockEmotions });
        }
      });

      await contentManager.loadTherapeuticContent();
    });

    it('should return correct emotion palette for Money topic', () => {
      const palette = contentManager.getEmotionPalette('Money');
      expect(palette).toEqual(['anxious', 'resentful', 'overwhelmed', 'insecure', 'ashamed', 'fearful']);
    });

    it('should return correct emotion palette for Romance topic', () => {
      const palette = contentManager.getEmotionPalette('Romance');
      expect(palette).toEqual(['lonely', 'rejected', 'unworthy', 'desperate', 'heartbroken', 'jealous']);
    });

    it('should return fallback emotions for unknown topic', () => {
      const palette = contentManager.getEmotionPalette('Unknown');
      expect(palette).toEqual(['anxious', 'overwhelmed', 'frustrated']);
    });
  });

  describe('Subtopic Content Retrieval', () => {
    beforeEach(async () => {
      const mockTherapeuticContent = {
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'Money anxiety reframe', alternative: 'Alternative reframe' },
              { type: 'socratic', content: 'Money anxiety question', alternative: 'Alternative question' }
            ]
          }
        }
      };

      const mockThoughtBuffet = { generic_fallback: ['Test'] };
      const mockTopics = { topics: ['Money'] };
      const mockEmotions = { Money: { palette: ['anxious'] } };

      fetch.mockImplementation((url) => {
        if (url.includes('therapeutic-content.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTherapeuticContent });
        } else if (url.includes('thought-buffet.json')) {
          return Promise.resolve({ ok: true, json: async () => mockThoughtBuffet });
        } else if (url.includes('topics.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTopics });
        } else if (url.includes('emotions.json')) {
          return Promise.resolve({ ok: true, json: async () => mockEmotions });
        }
      });

      await contentManager.loadTherapeuticContent();
    });

    it('should return correct subtopic content', () => {
      const content = contentManager.getSubtopicContent('Money', [], 'anxious');
      expect(content.subtopic).toBe('anxious');
      expect(content.content).toHaveLength(2);
      expect(content.content[0].type).toBe('cbt_reframe');
      expect(content.content[1].type).toBe('socratic');
    });

    it('should return fallback content for unknown subtopic', () => {
      const content = contentManager.getSubtopicContent('Money', [], 'unknown');
      expect(content.subtopic).toBe('anxious'); // Falls back to first available
      expect(content.content).toBeDefined();
    });
  });

  describe('ACT Defusion Exercises', () => {
    beforeEach(async () => {
      const mockTherapeuticContent = {
        sequences: {},
        act_defusion_exercises: {
          Money: {
            title: 'Financial Worry Cloud',
            instructions: 'Imagine your money worries as clouds',
            steps: ['Step 1', 'Step 2'],
            closing: 'You are the sky'
          },
          generic: {
            title: 'Thoughts as Leaves on a Stream',
            instructions: 'A gentle exercise for creating space between you and any difficult thoughts.',
            steps: ['Generic step'],
            closing: 'Thoughts come and go like leaves on a stream. You are the constant, aware presence watching from the shore.'
          }
        }
      };

      const mockThoughtBuffet = { generic_fallback: ['Test'] };
      const mockTopics = { topics: ['Money'] };
      const mockEmotions = { Money: { palette: ['anxious'] } };

      fetch.mockImplementation((url) => {
        if (url.includes('therapeutic-content.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTherapeuticContent });
        } else if (url.includes('thought-buffet.json')) {
          return Promise.resolve({ ok: true, json: async () => mockThoughtBuffet });
        } else if (url.includes('topics.json')) {
          return Promise.resolve({ ok: true, json: async () => mockTopics });
        } else if (url.includes('emotions.json')) {
          return Promise.resolve({ ok: true, json: async () => mockEmotions });
        }
      });

      await contentManager.loadTherapeuticContent();
    });

    it('should return topic-specific ACT exercise', () => {
      const exercise = contentManager.getACTDefusionExercise('Money');
      expect(exercise.title).toBe('Financial Worry Cloud');
      expect(exercise.instructions).toBe('Imagine your money worries as clouds');
    });

    it('should return generic exercise for unknown topic', () => {
      const exercise = contentManager.getACTDefusionExercise('Unknown');
      expect(exercise.title).toBe('Thoughts as Leaves on a Stream');
    });
  });

  describe('Subtopic Selection by Keywords', () => {
    beforeEach(async () => {
      const mockContent = {
        sequences: {
          Money: {
            anxious: [{ type: 'cbt_reframe', content: 'Anxiety content' }],
            overwhelmed: [{ type: 'cbt_reframe', content: 'Overwhelm content' }],
            resentful: [{ type: 'cbt_reframe', content: 'Resentment content' }]
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContent
      });

      await contentManager.loadTherapeuticContent();
    });

    it('should select subtopic based on emotion when no keywords match', () => {
      const subtopic = contentManager.selectSubtopicByKeywords('Money', [], 'anxious');
      expect(subtopic).toBe('anxious');
    });

    it('should select first available subtopic when emotion not found', () => {
      const subtopic = contentManager.selectSubtopicByKeywords('Money', [], 'unknown');
      expect(subtopic).toBe('anxious'); // First available
    });

    it('should handle empty topic gracefully', () => {
      const subtopic = contentManager.selectSubtopicByKeywords('Unknown', [], 'anxious');
      expect(subtopic).toBe('anxious'); // Fallback to emotion
    });
  });

  describe('Content Validation', () => {
    it('should validate content structure', async () => {
      const validContent = {
        sequences: {
          Money: {
            anxious: [
              { type: 'cbt_reframe', content: 'Valid content', alternative: 'Valid alternative' }
            ]
          }
        },
        act_defusion_exercises: {
          Money: {
            title: 'Valid Exercise',
            instructions: 'Valid instructions',
            steps: ['Valid step'],
            closing: 'Valid closing'
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validContent
      });

      await contentManager.loadTherapeuticContent();

      expect(contentManager.therapeuticContent.sequences).toBeDefined();
      expect(contentManager.therapeuticContent.act_defusion_exercises).toBeDefined();
    });
  });
});