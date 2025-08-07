import React, { useState } from "react";
import styled from "styled-components";
import BaseCard from "./BaseCard";
import { useSession } from "../context/SessionContext";

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
  };

  const handleContinue = () => {
    if (selectedTopic) {
      // Update canvas state with topic selection
      updateCanvasState({
        selectedTopic,
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
            Choose the area you'd like to focus on today. This will help us provide the most relevant guidance for your journey.
          </p>
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
