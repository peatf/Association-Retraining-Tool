/**
 * ReplacementThoughtList.jsx
 * React component for displaying replacement thoughts filtered by category, subcategory, and intensity
 * Queries replacementThoughts where (category, subcategory, level ≤ intensity)
 */

import React, { useState, useEffect } from 'react';
import contentSearchService from '../../services/ContentSearchService.js';
import { Spinner, ErrorState } from '../common/index.js';

const ReplacementThoughtList = ({ 
  category, 
  subcategory = null, 
  intensity = 10, 
  onThoughtSelect,
  selectedThought 
}) => {
  const [replacementThoughts, setReplacementThoughts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReplacementThoughts = async () => {
      if (!category) {
        setReplacementThoughts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const thoughts = await contentSearchService.getReplacementThoughts(
          category, 
          subcategory, 
          intensity
        );
        
        setReplacementThoughts(thoughts);
        
        if (thoughts.length === 0) {
          console.warn(`No replacement thoughts found for ${category}${subcategory ? ` > ${subcategory}` : ''}`);
        }
      } catch (err) {
        console.error('Error loading replacement thoughts:', err);
        setError(err.message);
        setReplacementThoughts([]);
      } finally {
        setLoading(false);
      }
    };

    loadReplacementThoughts();
  }, [category, subcategory, intensity]);

  const handleThoughtClick = (thought) => {
    if (onThoughtSelect) {
      onThoughtSelect(thought);
    }
  };

  // Don't render if no category is selected
  if (!category) {
    return null;
  }

  if (loading) {
    return (
      <Spinner 
        message="Loading replacement thoughts..."
        aria-label="Loading better-feeling thoughts for your selection"
      />
    );
  }

  const retryLoading = () => {
    setError(null);
    setLoading(true);
    // Re-trigger useEffect by updating dependencies
  };

  if (error) {
    return (
      <ErrorState
        title="Error loading replacement thoughts"
        message={error}
        onRetry={retryLoading}
        retryText="Try Again"
      />
    );
  }

  if (replacementThoughts.length === 0) {
    return (
      <div className="replacement-thought-list empty">
        <h3>No replacement thoughts available</h3>
        <p>
          No replacement thoughts found for {category}
          {subcategory && ` > ${subcategory}`} at intensity level {intensity}.
        </p>
        <div className="empty-actions">
          <button 
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="replacement-thought-list">
      <h3>
        Better-feeling thoughts for {category}
        {subcategory && ` > ${subcategory}`}
      </h3>
      
      {intensity < 10 && (
        <div className="intensity-filter-info" role="status" aria-live="polite">
          <small>Showing thoughts for intensity level ≤ {intensity}</small>
        </div>
      )}
      
      <div className="thought-buttons">
        {replacementThoughts.map((thought, index) => (
          <button
            key={index}
            className={`btn-primary thought-button ${
              selectedThought === thought ? 'selected' : ''
            }`}
            onClick={() => handleThoughtClick(thought)}
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={`thought-button-${index}`}
            aria-pressed={selectedThought === thought}
            title={thought}
          >
            <span className="thought-text">{thought}</span>
          </button>
        ))}
      </div>
      
      <div className="thought-list-footer">
        <small>
          Found {replacementThoughts.length} replacement thought{replacementThoughts.length !== 1 ? 's' : ''}
        </small>
        {selectedThought && (
          <button
            className="btn-primary"
            onClick={() => {
              navigator.clipboard.writeText(selectedThought);
              alert('Copied to clipboard!');
            }}
          >
            Export Selected Thought
          </button>
        )}
      </div>
    </div>
  );
};

export default ReplacementThoughtList;