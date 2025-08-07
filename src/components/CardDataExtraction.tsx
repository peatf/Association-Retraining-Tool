import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import { useSession } from '../context/SessionContext';
import contentSearchService from '../services/ContentSearchService';
import { Spinner, ErrorState } from './common';

const ExtractionContainer = styled.div`
  padding: 1rem;
`;

const CardInstruction = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const EitherOrPrompt = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const PromptQuestion = styled.p`
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const EitherOrOptions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const OptionButton = styled.button<{ selected?: boolean; optionType: 'A' | 'B' }>`
  flex: 1;
  min-width: 200px;
  padding: 1rem;
  background: ${props => props.selected 
    ? (props.optionType === 'A' ? '#e3f2fd' : '#f3e5f5')
    : '#ffffff'};
  border: 2px solid ${props => props.selected 
    ? (props.optionType === 'A' ? '#2196f3' : '#9c27b0')
    : '#dee2e6'};
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.optionType === 'A' ? '#2196f3' : '#9c27b0'};
    background: ${props => props.optionType === 'A' ? '#e3f2fd' : '#f3e5f5'};
  }

  &::before {
    content: '${props => props.optionType}';
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: ${props => props.optionType === 'A' ? '#2196f3' : '#9c27b0'};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    opacity: ${props => props.selected ? 1 : 0.3};
  }
`;

const ExtractionSummary = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;

  h4 {
    margin: 0 0 1rem 0;
    color: #495057;
  }

  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  li {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
    border-left: 4px solid #dee2e6;
  }

  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #333;
  }
`;

const CompletionSection = styled.div`
  text-align: center;
  margin-top: 1.5rem;
`;

const CompleteButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: #218838;
  }
`;

const ThankYouContent = styled.div`
  text-align: center;
`;

const GratitudeSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #e8f5e8;
  border-radius: 8px;

  h4 {
    color: #2d5a2d;
    margin-bottom: 1rem;
  }
`;

const GratitudeMessage = styled.p`
  font-style: italic;
  color: #2d5a2d;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
`;

const NewJobSection = styled.div`
  h4 {
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    margin-bottom: 1.5rem;
  }
`;

const JobOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const JobOption = styled.button`
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const CustomJob = styled.div`
  p {
    margin-bottom: 0.5rem;
    text-align: left;
  }
`;

const CustomJobInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
`;

interface EitherOrPrompt {
  question: string;
  optionA: string;
  optionB: string;
}

interface Response {
  choice: 'A' | 'B';
  text: string;
  question: string;
}

interface CardDataExtractionProps {
  onComplete: () => void;
}

const CardDataExtraction = ({ onComplete }: CardDataExtractionProps) => {
  const { canvasState, updateCanvasState } = useSession();
  const [eitherOrPrompts, setEitherOrPrompts] = useState<EitherOrPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [newJobOptions, setNewJobOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadDataExtractionPrompts = async () => {
      try {
        setLoading(true);
        const structuredPrompts = await contentSearchService.getEitherOrPrompts(
          canvasState.selectedTopic || ''
        );
        
        setEitherOrPrompts(structuredPrompts);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading data extraction prompts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (canvasState.selectedTopic) {
      loadDataExtractionPrompts();
    }
  }, [canvasState.selectedTopic]);

  const handleResponse = (promptIndex: number, choice: 'A' | 'B', choiceText: string) => {
    setResponses(prev => ({
      ...prev,
      [promptIndex]: {
        choice,
        text: choiceText,
        question: eitherOrPrompts[promptIndex].question
      }
    }));
  };

  const handleAllQuestionsComplete = () => {
    // Generate new job options based on extracted data
    const extractedInsights = Object.values(responses);
    generateNewJobOptions(extractedInsights);
    setShowThankYou(true);
  };

  const generateNewJobOptions = async (insights: Response[]) => {
    try {
      // Use AI to generate alternative "jobs" for the thought based on insights
      // For now, provide fallback options based on topic
      const topicJobOptions = {
        'Self-Image': [
          "Remind me to check in with my values before making decisions",
          "Help me notice when I need to pause and practice self-compassion",
          "Alert me to opportunities for celebrating small wins"
        ],
        'Money': [
          "Help me pause and consider my true priorities before financial decisions",
          "Remind me that my worth isn't measured by my bank account",
          "Guide me to make choices from abundance rather than scarcity"
        ],
        'Relationships': [
          "Help me communicate my needs with clarity and kindness",
          "Remind me to maintain healthy boundaries while staying open to connection",
          "Guide me to respond from love rather than fear in conflicts"
        ]
      };
      
      const defaultOptions = topicJobOptions[canvasState.selectedTopic as keyof typeof topicJobOptions] || [
        "Remind me to check in with my values before making decisions",
        "Help me notice when I need to pause and breathe",
        "Alert me to opportunities for self-compassion"
      ];
      
      setNewJobOptions(defaultOptions);
    } catch (err) {
      // Fallback job options
      setNewJobOptions([
        "Remind me to check in with my values before making decisions",
        "Help me notice when I need to pause and breathe",
        "Alert me to opportunities for self-compassion"
      ]);
    }
  };

  const handleJobSelection = (selectedJob: string) => {
    updateCanvasState({
      miningResults: {
        ...canvasState.miningResults,
        dataExtraction: {
          type: 'dataExtraction',
          responses,
          extractedData: Object.values(responses),
          thoughtThankYou: true,
          newJob: selectedJob,
          timestamp: new Date().toISOString()
        },
      },
    });
    onComplete();
  };

  const allQuestionsAnswered = Object.keys(responses).length === eitherOrPrompts.length;

  if (loading) {
    return <Spinner message="Loading extraction prompts..." />;
  }

  if (error) {
    return <ErrorState title="Error loading prompts" message={error.message} aria-label="Error loading prompts" />;
  }

  if (showThankYou) {
    return (
      <BaseCard
        title="Thank the Thought & Offer New Job"
        testId="card-data-extraction-thankyou"
        showActions={false}
      >
        <ThankYouContent>
          <GratitudeSection>
            <h4>Thank the Thought (Genuinely)</h4>
            <GratitudeMessage>
              "I see you were trying to help. You're not the enemy. 
              You showed up when I needed some kind of safety."
            </GratitudeMessage>
          </GratitudeSection>
          
          <NewJobSection>
            <h4>Offer an Updated Job</h4>
            <p>Based on what we learned, here are some new roles this thought could play:</p>
            
            <JobOptions>
              {newJobOptions.map((job, index) => (
                <JobOption
                  key={index}
                  onClick={() => handleJobSelection(job)}
                  data-testid={`new-job-option-${index}`}
                >
                  {job}
                </JobOption>
              ))}
            </JobOptions>
            
            <CustomJob>
              <p>Or create your own:</p>
              <CustomJobInput
                placeholder="What new job would you like to offer this thought?"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleJobSelection(e.target.value.trim());
                  }
                }}
                data-testid="custom-job-input"
              />
            </CustomJob>
          </NewJobSection>
        </ThankYouContent>
      </BaseCard>
    );
  }

  return (
    <BaseCard
      title="Extract Core Data"
      testId="card-data-extraction"
      showActions={false}
    >
      <ExtractionContainer>
        <CardInstruction>
          Answer these either/or questions to mine your thought for its core message:
        </CardInstruction>
        
        <div>
          {eitherOrPrompts.map((promptPair, index) => (
            <EitherOrPrompt key={index}>
              <PromptQuestion>{promptPair.question}</PromptQuestion>
              <EitherOrOptions>
                <OptionButton
                  optionType="A"
                  selected={responses[index]?.choice === 'A'}
                  onClick={() => handleResponse(index, 'A', promptPair.optionA)}
                  data-testid={`extraction-option-${index}-a`}
                >
                  {promptPair.optionA}
                </OptionButton>
                <OptionButton
                  optionType="B"
                  selected={responses[index]?.choice === 'B'}
                  onClick={() => handleResponse(index, 'B', promptPair.optionB)}
                  data-testid={`extraction-option-${index}-b`}
                >
                  {promptPair.optionB}
                </OptionButton>
              </EitherOrOptions>
            </EitherOrPrompt>
          ))}
        </div>
        
        {Object.keys(responses).length > 0 && (
          <ExtractionSummary>
            <h4>Your Insights So Far:</h4>
            <ul>
              {Object.values(responses).map((response, index) => (
                <li key={index}>
                  <strong>Q:</strong> {response.question}<br/>
                  <strong>A:</strong> {response.text}
                </li>
              ))}
            </ul>
          </ExtractionSummary>
        )}
        
        {allQuestionsAnswered && (
          <CompletionSection>
            <CompleteButton
              onClick={handleAllQuestionsComplete}
              data-testid="complete-data-extraction"
            >
              Thank the Thought & Continue
            </CompleteButton>
          </CompletionSection>
        )}
      </ExtractionContainer>
    </BaseCard>
  );
};

export default CardDataExtraction;
