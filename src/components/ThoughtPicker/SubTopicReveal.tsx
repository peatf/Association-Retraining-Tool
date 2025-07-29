/**
 * SubTopicReveal.jsx
 * React component for revealing subcategories for a selected category
 * Uses ContentSearchService.getSubcategories(selectedCategory)
 */

import React, { useState, useEffect } from 'react';
import contentSearchService from '../../services/ContentSearchService';
import { Spinner, ErrorState } from '../common';

const SubTopicReveal = ({ selectedCategory, onSubTopicSelect, selectedSubTopic }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const subs = await contentSearchService.getSubcategories(selectedCategory);
        setSubcategories(subs);
        
        if (subs.length === 0) {
          console.warn(`No subcategories found for ${selectedCategory}`);
        }
      } catch (err) {
        console.error('Error loading subcategories:', err);
        setError(err.message);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [selectedCategory]);

  const handleSubTopicClick = (subcategory) => {
    if (onSubTopicSelect) {
      onSubTopicSelect(subcategory);
    }
  };

  // Don't render if no category is selected
  if (!selectedCategory) {
    return null;
  }

  if (loading) {
    return (
      <Spinner 
        message={`Loading subcategories for ${selectedCategory}...`}
        aria-label={`Loading subcategories for ${selectedCategory}`}
      />
    );
  }

  const retryLoading = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by changing selectedCategory state
  };

  if (error) {
    return (
      <ErrorState
        title={`Error loading subcategories for ${selectedCategory}`}
        message={error}
        onRetry={retryLoading}
        retryText="Try Again"
      />
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="subtopic-reveal empty">
        <h3>{selectedCategory}</h3>
        <p>No specific subcategories available. You can continue with the general category.</p>
        <button 
          className="btn-primary"
          onClick={() => handleSubTopicClick(null)}
        >
          Continue with {selectedCategory}
        </button>
      </div>
    );
  }

  return (
    <div className="subtopic-reveal">
      <h3>Choose a specific area within {selectedCategory}:</h3>
      <div className="subtopic-buttons">
        {subcategories.map((subcategory, index) => (
          <button
            key={subcategory}
            className={`btn-primary subtopic-button subtopic-${subcategory.toLowerCase().replace(/[^a-z0-9]/g, '')} ${
              selectedSubTopic === subcategory ? 'selected' : ''
            }`}
            onClick={() => handleSubTopicClick(subcategory)}
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={`subtopic-button-${subcategory.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            aria-pressed={selectedSubTopic === subcategory}
          >
            <span className="subtopic-name">{subcategory}</span>
          </button>
        ))}
        
        {/* Option to skip subcategory selection */}
        <button
          className="btn-secondary general-category-button"
          onClick={() => handleSubTopicClick(null)}
          style={{ animationDelay: `${subcategories.length * 0.1}s` }}
        >
          General {selectedCategory}
        </button>
      </div>
    </div>
  );
};

export default SubTopicReveal;