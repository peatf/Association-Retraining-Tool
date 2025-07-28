/**
 * TopicSelector.jsx
 * React component for selecting categories dynamically from ContentSearchService
 * Replaces static topic selection with dynamic category loading
 */

import React, { useState, useEffect, useMemo } from 'react';
import contentSearchService from '../../services/ContentSearchService.js';
import { Spinner, ErrorState } from '../common/index.js';

const TopicSelector = ({ onTopicSelect, selectedTopic }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default icons for categories (fallback)
  const getDefaultIcon = (category) => {
    const iconMap = {
      'Money': '💰',
      'Relationships': '💕',
      'Self-Image': '🪞',
      'Romance': '💕'
    };
    return iconMap[category] || '🔹';
  };

  // Default descriptions for categories (fallback)
  const getDefaultDescription = (category) => {
    const descriptionMap = {
      'Money': 'Financial concerns, scarcity, and abundance mindset',
      'Relationships': 'Connection, trust, boundaries, intimacy',
      'Self-Image': 'Self-worth, confidence, and personal identity',
      'Romance': 'Dating, relationships, and emotional connections'
    };
    return descriptionMap[category] || `Work on ${category.toLowerCase()} related concerns`;
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleTopicClick = (category) => {
    if (onTopicSelect) {
      onTopicSelect(category);
    }
  };

  const retryLoading = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect
    window.location.reload = false; // Remove window.location.reload usage
    loadCategories();
  };

  const loadCategories = useMemo(() => async () => {
    try {
      setLoading(true);
      const cats = await contentSearchService.getCategories();
      
      if (cats.length === 0) {
        throw new Error('No categories found');
      }
      
      setCategories(cats);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
      // Fallback to default categories
      setCategories(['Money', 'Relationships', 'Self-Image']);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Spinner 
        message="Loading categories..." 
        aria-label="Loading available topic categories"
      />
    );
  }

  if (error && categories.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Categories"
        message={error}
        onRetry={retryLoading}
        retryText="Try Again"
      />
    );
  }

  return (
    <div className="topic-selector">
      <div id="topic-buttons" className="topic-buttons">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`btn-primary topic-button topic-${category.toLowerCase().replace(/[^a-z0-9]/g, '')} ${
              selectedTopic === category ? 'selected' : ''
            }`}
            onClick={() => handleTopicClick(category)}
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={`topic-button-${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            aria-pressed={selectedTopic === category}
            aria-describedby={`topic-desc-${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
          >
            <span className="topic-icon" aria-hidden="true">{getDefaultIcon(category)}</span>
            <span className="topic-name">{category}</span>
            <span 
              className="topic-description"
              id={`topic-desc-${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            >
              {getDefaultDescription(category)}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <div className="fallback-notice" role="status" aria-live="polite">
          <small>⚠️ Using fallback categories due to loading error</small>
        </div>
      )}
    </div>
  );
};

export default TopicSelector;