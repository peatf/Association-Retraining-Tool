import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import { useSession } from '../context/SessionContext';
import contentSearchService from '../services/ContentSearchService';
import { Spinner, ErrorState } from './common';

const OptionButton = styled.button`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  background-color: ${props => props.selected ? '#e0e0e0' : '#f0f0f0'};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const CardDataExtraction = ({ onComplete }) => {
  const { canvasState, updateCanvasState } = useSession();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const fetchedPrompts = await contentSearchService.getMiningPrompts(canvasState.selectedTopic, 'dataExtraction');
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

  const handleAnswerSelect = (prompt, answer) => {
    setAnswers({ ...answers, [prompt]: answer });
  };

  const handleComplete = () => {
    updateCanvasState({
      miningResults: {
        ...canvasState.miningResults,
        dataExtraction: {
          answers,
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

  const summary = Object.values(answers).reduce((acc, answer) => {
    acc[answer] = (acc[answer] || 0) + 1;
    return acc;
  }, {});

  return (
    <BaseCard title="Data Extraction" onComplete={handleComplete} completionText="Continue">
      <div style={{ padding: '1rem' }}>
        {prompts.map((prompt, index) => {
          const parts = prompt.split(' or ');
          if (parts.length === 2) {
            const optionA = parts[0].replace('A: ', '');
            const optionB = parts[1].replace('B: ', '');
            return (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <p>{prompt}</p>
                <div>
                  <OptionButton
                    selected={answers[prompt] === 'A'}
                    onClick={() => handleAnswerSelect(prompt, 'A')}
                  >
                    {optionA}
                  </OptionButton>
                  <OptionButton
                    selected={answers[prompt] === 'B'}
                    onClick={() => handleAnswerSelect(prompt, 'B')}
                  >
                    {optionB}
                  </OptionButton>
                </div>
              </div>
            );
          }
          return <p key={index}>{prompt}</p>;
        })}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h4>Summary</h4>
          <p>A answers: {summary.A || 0}</p>
          <p>B answers: {summary.B || 0}</p>
        </div>
      </div>
    </BaseCard>
  );
};

export default CardDataExtraction;
