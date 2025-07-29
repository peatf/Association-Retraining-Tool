import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import { useSession } from '../context/SessionContext';
import contentSearchService from '../services/ContentSearchService';
import { Spinner, ErrorState } from './common';

const PromptButton = styled.button`
  display: block;
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  text-align: left;
  background-color: ${props => props.selected ? '#e0e0e0' : '#f0f0f0'};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const CardNeutralize = ({ onComplete }) => {
  const { canvasState, updateCanvasState } = useSession();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const fetchedPrompts = await contentSearchService.getMiningPrompts(canvasState.selectedTopic, 'neutralize');
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

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleComplete = () => {
    updateCanvasState({
      miningResults: {
        ...canvasState.miningResults,
        neutralize: {
          prompt: selectedPrompt,
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

  return (
    <BaseCard title="Neutralize the Thought" onComplete={handleComplete} completionText="Continue">
      <div style={{ padding: '1rem' }}>
        <p>Select a prompt to help neutralize the thought:</p>
        <div>
          {prompts.map((prompt, index) => (
            <PromptButton
              key={index}
              selected={selectedPrompt === prompt}
              onClick={() => handlePromptSelect(prompt)}
            >
              {prompt}
            </PromptButton>
          ))}
        </div>
      </div>
    </BaseCard>
  );
};

export default CardNeutralize;
