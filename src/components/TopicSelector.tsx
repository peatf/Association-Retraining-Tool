import React, { useState } from "react";
import styled from "styled-components";
import BaseCard from "./BaseCard";
import { useSession } from "../context/SessionContext";
import nlpService, { TopicClassificationResult } from "../services/NLPService";

const TopicContainer = styled.div`
  padding: 1rem;
`;

const TopicSelection = styled.div`
  h4 {
    margin-bottom: 1rem;
    color: #333;
    text-align: center;
  }

  p {
    margin-bottom: 1.5rem;
    color: #666;
    text-align: center;
    line-height: 1.5;
  }
`;

const TopicButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TopicButton = styled.button<{ selected?: boolean }>`
  padding: 1.5rem;
  background: ${(props) => (props.selected ? "#e3f2fd" : "#f8f9fa")};
  border: 2px solid ${(props) => (props.selected ? "#2196f3" : "#dee2e6")};
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #2196f3;
    background: #e3f2fd;
  }

  .topic-icon {
    font-size: 2rem;
  }

  .topic-name {
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .topic-description {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
    line-height: 1.3;
  }
`;

const ContinueSection = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const SuggestSection = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const SuggestInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const SuggestButton = styled.button`
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #1976d2;
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuggestionResult = styled.div<{ confidence: number }>`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.confidence > 0.7 ? '#d4edda' : props.confidence > 0.4 ? '#fff3cd' : '#f8d7da'};
  border: 1px solid ${props => props.confidence > 0.7 ? '#c3e6cb' : props.confidence > 0.4 ? '#ffeaa7' : '#f5c6cb'};
  border-radius: 4px;
  font-size: 0.875rem;
`;

const ContinueButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;

interface TopicSelectorProps {
  onComplete: (data: {
    hasPersistentThought: boolean;
    selectedTopic: string;
  }) => void;
}

const TopicSelector = ({ onComplete }: TopicSelectorProps) => {
  const { canvasState, updateCanvasState } = useSession();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [thoughtText, setThoughtText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<TopicClassificationResult | null>(null);
  const [showSuggestSection, setShowSuggestSection] = useState<boolean>(false);

  // Since this is now the first step, we don't have persistent thought info yet

  const topics = [
    {
      id: "Money",
      name: "Money",
      icon: "💰",
      description: "Financial concerns, scarcity, abundance, and security",
    },
    {
      id: "Relationships",
      name: "Relationships",
      icon: "💕",
      description: "Connection, trust, boundaries, and intimacy",
    },
    {
      id: "Self-Image",
      name: "Self-Image",
      icon: "🪞",
      description: "Self-worth, confidence, and personal identity",
    },
  ];

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setSuggestion(null); // Clear any previous suggestion
  };

  const handleSuggestTopic = async () => {
    if (!thoughtText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setSuggestion(null);

    try {
      const result = await nlpService.classifyThought(thoughtText);
      if (result) {
        setSuggestion(result);
        // Auto-select if confidence is high enough
        if (result.confidence > 0.6) {
          setSelectedTopic(result.topic);
        }
      } else {
        setSuggestion({ topic: "Unable to classify", confidence: 0 });
      }
    } catch (error) {
      console.error('Topic classification error:', error);
      setSuggestion({ topic: "Error in analysis", confidence: 0 });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (selectedTopic) {
      // Update canvas state with topic selection and thought text
      updateCanvasState({
        selectedTopic,
        userThought: thoughtText.trim() || undefined,
      });

      // Pass data to parent component - we'll determine persistent thought later
      onComplete({
        hasPersistentThought: false, // This will be determined in ReadinessGate
        selectedTopic,
      });
    }
  };

  const canContinue = selectedTopic !== null;

  return (
    <BaseCard
      title="Let's Get Started"
      testId="topic-selector"
      showActions={false}
    >
      <TopicContainer>
        <TopicSelection>
          <h4>Which area would you like to explore?</h4>
          <p>
            Choose the area you'd like to focus on today, or let our AI suggest one based on your thoughts.
          </p>

          {!showSuggestSection && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <SuggestButton
                onClick={() => setShowSuggestSection(true)}
                data-testid="show-suggest-section"
              >
                🌟 Get AI Topic Suggestion
              </SuggestButton>
            </div>
          )}

          {showSuggestSection && (
            <SuggestSection>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
                Describe your persistent thought:
              </h5>
              <SuggestInput
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="e.g., 'I'm worried about whether I'll have enough money for retirement...'"
                data-testid="thought-input"
              />
              <SuggestButton
                onClick={handleSuggestTopic}
                disabled={!thoughtText.trim() || isAnalyzing}
                data-testid="suggest-topic-button"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner />
                    Analyzing...
                  </>
                ) : (
                  '🔍 Suggest Topic'
                )}
              </SuggestButton>
              
              {suggestion && (
                <SuggestionResult 
                  confidence={suggestion.confidence}
                  data-testid="suggestion-result"
                >
                  {suggestion.confidence > 0 ? (
                    <>
                      <strong>Suggested:</strong> {suggestion.topic} 
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Confidence: {Math.round(suggestion.confidence * 100)}%
                        {suggestion.confidence > 0.6 && " (Auto-selected)"}
                      </div>
                    </>
                  ) : (
                    suggestion.topic
                  )}
                </SuggestionResult>
              )}
            </SuggestSection>
          )}

          <TopicButtons>
            {topics.map((topic) => (
              <TopicButton
                key={topic.id}
                selected={selectedTopic === topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                data-testid={`topic-${topic.id.toLowerCase()}`}
              >
                <span className="topic-icon">{topic.icon}</span>
                <h5 className="topic-name">{topic.name}</h5>
                <p className="topic-description">{topic.description}</p>
              </TopicButton>
            ))}
          </TopicButtons>
        </TopicSelection>

        {canContinue && (
          <ContinueSection>
            <ContinueButton
              onClick={handleContinue}
              data-testid="continue-to-next-step"
            >
              Continue
            </ContinueButton>
          </ContinueSection>
        )}
      </TopicContainer>
    </BaseCard>
  );
};

export default TopicSelector;
