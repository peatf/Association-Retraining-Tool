import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import { useSession } from '../context/SessionContext';
import contentSearchService from '../services/ContentSearchService.js';
import { Spinner, ErrorState } from './common';

const CardCommonGround = ({ onComplete }) => {
  const { canvasState, updateCanvasState } = useSession();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reflection, setReflection] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const fetchedPrompts = await contentSearchService.getMiningPrompts(canvasState.selectedTopic, 'commonGround');
        setPrompts(fetchedPrompts);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    if (canvasState.selectedTopic) {
      fetchPrompts();
    }
  }, [canvasState.selectedTopic]);

  const handleComplete = () => {
    updateCanvasState({
      miningResults: {
        ...canvasState.miningResults,
        commonGround: {
          reflection,
          timestamp: new Date().toISOString(),
        },
      },
    });
    onComplete();
  };

  if (loading) {
    return <Spinner message="Loading prompts..." />;
  }

  if (error) {
    return <ErrorState title="Error loading prompts" message={error.message} />;
  }

  const showNextPrompt = () => {
    setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % prompts.length);
  };

  const showPrevPrompt = () => {
    setCurrentPromptIndex((prevIndex) => (prevIndex - 1 + prompts.length) % prompts.length);
  };

  return (
    <BaseCard title="Find Common Ground" onComplete={handleComplete} completionText="Continue">
      <div style={{ padding: '1rem' }}>
        <p>{prompts[currentPromptIndex]}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button className="btn-secondary" onClick={showPrevPrompt}>Previous</button>
          <button className="btn-secondary" onClick={showNextPrompt}>Next</button>
        </div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Your reflections..."
          style={{ width: '100%', minHeight: '100px', marginTop: '1rem' }}
        />
      </div>
    </BaseCard>
  );
};

export default CardCommonGround;
