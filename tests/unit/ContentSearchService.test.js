import { describe, it, expect, vi, beforeEach } from 'vitest';
import contentSearchService from '../../src/services/ContentSearchService.js';
import errorHandlingService from '../../src/services/ErrorHandlingService.js';

const mockContentIndex = {
  metadata: {
    categories: ['Money', 'Relationships', 'Self-Image'],
    subcategories: {
      Money: ['Savings', 'Debt', 'Investing'],
      Relationships: ['Romance', 'Friendship', 'Family'],
      'Self-Image': ['Self-Talk', 'Confidence', 'Worthiness'],
    },
  },
  entries: [
    {
      category: 'Money',
      subcategories: ['Savings'],
      summaryForVectorization: 'Summary for Money',
      miningPrompts: {
        neutralize: ['Neutralize prompt for Money'],
        commonGround: ['Common Ground prompt for Money'],
        dataExtraction: ['Data Extraction prompt for Money'],
      },
      replacementThoughts: ['Replacement thought for Money'],
    },
    {
      category: 'Relationships',
      subcategories: ['Romance'],
      summaryForVectorization: 'Summary for Relationships',
      miningPrompts: {
        neutralize: ['Neutralize prompt for Relationships'],
        commonGround: ['Common Ground prompt for Relationships'],
        dataExtraction: ['Data Extraction prompt for Relationships'],
      },
      replacementThoughts: ['Replacement thought for Relationships'],
    },
  ],
};

vi.mock('../../src/services/ErrorHandlingService.js', () => ({
  default: {
    handleContentServiceError: vi.fn(),
  },
}));

describe('ContentSearchService', () => {
  beforeEach(() => {
    contentSearchService.contentIndex = mockContentIndex;
    contentSearchService.isLoaded = true;
    vi.clearAllMocks();
  });

  it('should get categories', async () => {
    const categories = await contentSearchService.getCategories();
    expect(categories).toEqual(['Money', 'Relationships', 'Self-Image']);
  });

  it('should get subcategories', async () => {
    const subcategories = await contentSearchService.getSubcategories('Money');
    expect(subcategories).toEqual(['Savings', 'Debt', 'Investing']);
  });

  it('should get replacement thoughts', async () => {
    const thoughts = await contentSearchService.getReplacementThoughts('Money');
    expect(thoughts).toEqual(['Replacement thought for Money']);
  });

  it('should get mining prompts', async () => {
    const prompts = await contentSearchService.getMiningPrompts('Money', 'neutralize');
    expect(prompts).toEqual(['Neutralize prompt for Money']);
  });

  it('should handle error when getting categories', async () => {
    errorHandlingService.handleContentServiceError.mockReturnValue({ fallbackData: ['fallback'] });
    contentSearchService.isLoaded = false;
    const categories = await contentSearchService.getCategories();
    expect(categories).toEqual(['fallback']);
  });
});
