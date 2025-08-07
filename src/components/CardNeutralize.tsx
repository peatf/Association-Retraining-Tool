import React, { useState, useEffect } from "react";
import styled from "styled-components";
import BaseCard from "./BaseCard";
import { useSession } from "../context/SessionContext";
import contentSearchService from "../services/ContentSearchService";
import sentimentAnalysisService from "../services/SentimentAnalysisService";
import { Spinner, ErrorState } from "./common";

const NeutralizeContainer = styled.div`
  padding: 1rem;
`;

const StepProgress = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  background: #3498db;
  width: ${(props) => props.width}%;
  transition: width 0.3s ease;
`;

const StepContainer = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  color: #333;
  margin-bottom: 0.5rem;
`;

const StepInstruction = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const IntensitySlider = styled.div`
  margin: 1rem 0;
`;

const SliderInput = styled.input`
  width: 100%;
  margin: 0.5rem 0;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
`;

const TextInput = styled.div`
  margin: 1rem 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ActivitySelection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
`;

const ActivityOption = styled.button`
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const StepSummary = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;

  h5 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.25rem;
    color: #6c757d;
  }
`;

const SentimentSuggestion = styled.div<{ isAnalyzing: boolean }>`
  background: ${(props) => (props.isAnalyzing ? "#fff3cd" : "#d4edda")};
  border: 1px solid ${(props) => (props.isAnalyzing ? "#ffeaa7" : "#c3e6cb")};
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AnalyzingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #00000020;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const IntensityHint = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  font-style: italic;
`;

const ContinueButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;

interface NeutralizationStep {
  id: number;
  title: string;
  instruction: string;
  component: "slider" | "text" | "select" | "instruction";
  options?: string[];
  placeholder?: string;
}

interface StepData {
  initialCharge: number;
  observerShiftComplete: boolean;
  thirdPersonReword: string;
  distractionActivity: string;
  finalCharge: number;
}

interface CardNeutralizeProps {
  onComplete: () => void;
}

const CardNeutralize = ({ onComplete }: CardNeutralizeProps) => {
  const { canvasState, updateCanvasState } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({
    initialCharge: 5,
    observerShiftComplete: false,
    thirdPersonReword: "",
    distractionActivity: "",
    finalCharge: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [sentimentSuggested, setSentimentSuggested] = useState(false);

  // Auto-analyze sentiment when component loads if we have thought text
  useEffect(() => {
    const thoughtText = canvasState.userThought;
    if (thoughtText && !sentimentSuggested && currentStep === 1) {
      analyzeSentimentAndSuggest(thoughtText);
    }
  }, [canvasState.userThought, sentimentSuggested, currentStep]);

  const analyzeSentimentAndSuggest = async (thoughtText: string) => {
    if (!thoughtText.trim() || isAnalyzingSentiment) return;

    setIsAnalyzingSentiment(true);
    try {
      const intensity = await sentimentAnalysisService.getThoughtIntensity(
        thoughtText
      );
      setStepData((prev) => ({ ...prev, initialCharge: intensity }));
      setSentimentSuggested(true);
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      // Keep the default value
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const neutralizationSteps: NeutralizationStep[] = [
    {
      id: 1,
      title: "Name the Thought, Feel the Charge",
      instruction: "Rate the emotional intensity of this thought (1-10):",
      component: "slider",
    },
    {
      id: 2,
      title: "Observer Shift",
      instruction:
        "Either say out loud to yourself or in your mind the thought in a voice that sounds monotone",
      component: "instruction",
    },
    {
      id: 3,
      title: "Third-Person Reword",
      instruction:
        "If this were a line in a novel describing someone else, how would the narrator phrase it?",
      component: "text",
      placeholder:
        "She is having the thought that people won't take her seriously...",
    },
    {
      id: 4,
      title: "Distract with Mildness",
      instruction: "Choose a gentle distraction activity:",
      component: "select",
      options: [
        "Describe the room you're in",
        "Name colors around you",
        "Describe the texture of your shirt",
        "Count your breaths to 10",
        "Pet your cat/dog",
        "Other mindful activity",
      ],
    },
    {
      id: 5,
      title: "Recheck the Charge",
      instruction:
        "What number is it now? Even a drop from 7 to 5 means you've reclaimed energetic control:",
      component: "slider",
    },
  ];

  const handleStepComplete = (stepId: number, value: any) => {
    const stepKey = {
      1: "initialCharge",
      2: "observerShiftComplete",
      3: "thirdPersonReword",
      4: "distractionActivity",
      5: "finalCharge",
    }[stepId] as keyof StepData;

    const newStepData = { ...stepData, [stepKey]: value };
    setStepData(newStepData);

    if (stepId < 5) {
      setCurrentStep(stepId + 1);
    } else {
      // Complete neutralization process
      const chargeReduction = newStepData.initialCharge - value;
      updateCanvasState({
        miningResults: {
          ...canvasState.miningResults,
          neutralize: {
            type: "neutralize",
            steps: newStepData,
            chargeReduction,
            timestamp: new Date().toISOString(),
          },
        },
      });
      onComplete();
    }
  };

  const currentStepConfig = neutralizationSteps[currentStep - 1];

  return (
    <BaseCard
      title="Neutralize the Voice"
      onActivate={() => {}}
      testId="card-neutralize"
      onSkip={() => {}}
      aria-describedby="neutralize-description"
      aria-label="Neutralize the Voice"
      showActions={false}
    >
      <NeutralizeContainer>
        <StepProgress>
          <span>Step {currentStep} of 5</span>
          <ProgressBar>
            <ProgressFill width={(currentStep / 5) * 100} />
          </ProgressBar>
        </StepProgress>

        <StepContainer>
          <StepTitle>{currentStepConfig.title}</StepTitle>
          <StepInstruction>{currentStepConfig.instruction}</StepInstruction>

          {currentStepConfig.component === "slider" && (
            <IntensitySlider>
              {/* Show sentiment analysis feedback for first step */}
              {currentStep === 1 &&
                (isAnalyzingSentiment || sentimentSuggested) && (
                  <SentimentSuggestion
                    isAnalyzing={isAnalyzingSentiment}
                    data-testid="sentiment-suggestion"
                  >
                    {isAnalyzingSentiment ? (
                      <>
                        <AnalyzingSpinner />
                        Analyzing your thought's emotional intensity...
                      </>
                    ) : (
                      <>
                        🧠 AI suggested intensity: {stepData.initialCharge}/10
                        <div style={{ fontSize: "0.75rem" }}>
                          (
                          {sentimentAnalysisService.getIntensityDescription(
                            stepData.initialCharge
                          )}
                          )
                        </div>
                      </>
                    )}
                  </SentimentSuggestion>
                )}

              <SliderInput
                type="range"
                min="1"
                max="10"
                value={
                  stepData[currentStep === 1 ? "initialCharge" : "finalCharge"]
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const stepKey =
                    currentStep === 1 ? "initialCharge" : "finalCharge";
                  setStepData((prev) => ({ ...prev, [stepKey]: value }));
                }}
                onMouseUp={(e) =>
                  handleStepComplete(
                    currentStep,
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onTouchEnd={(e) =>
                  handleStepComplete(
                    currentStep,
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                data-testid={`neutralize-step-${currentStep}-slider`}
                disabled={isAnalyzingSentiment}
              />
              <SliderLabels>
                <span>1 - Calm</span>
                <span>10 - Overwhelming</span>
              </SliderLabels>
              <div
                style={{
                  textAlign: "center",
                  marginTop: "0.5rem",
                  color: "#666",
                }}
              >
                Current value:{" "}
                {stepData[currentStep === 1 ? "initialCharge" : "finalCharge"]}
                {currentStep === 1 && (
                  <IntensityHint>
                    {sentimentAnalysisService.getIntensityDescription(
                      stepData.initialCharge
                    )}
                  </IntensityHint>
                )}
              </div>
            </IntensitySlider>
          )}

          {currentStepConfig.component === "text" && (
            <TextInput>
              <TextArea
                placeholder={currentStepConfig.placeholder}
                value={stepData.thirdPersonReword}
                onChange={(e) =>
                  setStepData((prev) => ({
                    ...prev,
                    thirdPersonReword: e.target.value,
                  }))
                }
                data-testid={`neutralize-step-${currentStep}-text`}
              />
              <ContinueButton
                onClick={() =>
                  handleStepComplete(currentStep, stepData.thirdPersonReword)
                }
                disabled={!stepData.thirdPersonReword.trim()}
              >
                Continue
              </ContinueButton>
            </TextInput>
          )}

          {currentStepConfig.component === "instruction" && (
            <div style={{ margin: "1rem 0" }}>
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                  borderLeft: "4px solid #3498db",
                }}
              >
                <p style={{ margin: 0, fontStyle: "italic" }}>
                  Have the user prepend the phrase "My mind just produced the
                  thought..." (in a monotone) and speak/hear it once more.
                </p>
              </div>
              <ContinueButton
                onClick={() => handleStepComplete(currentStep, true)}
              >
                I've Done This Step
              </ContinueButton>
            </div>
          )}

          {currentStepConfig.component === "select" && (
            <ActivitySelection>
              {currentStepConfig.options?.map((option, index) => (
                <ActivityOption
                  key={index}
                  onClick={() => handleStepComplete(currentStep, option)}
                  data-testid={`neutralize-step-${currentStep}-option-${index}`}
                >
                  {option}
                </ActivityOption>
              ))}
            </ActivitySelection>
          )}
        </StepContainer>

        {currentStep > 1 && (
          <StepSummary>
            <h5>Progress so far:</h5>
            <ul>
              {currentStep > 1 && (
                <li>Initial charge: {stepData.initialCharge}/10</li>
              )}
              {currentStep > 2 && <li>Observer shift: Completed</li>}
              {currentStep > 3 && (
                <li>Third-person reword: "{stepData.thirdPersonReword}"</li>
              )}
              {currentStep > 4 && (
                <li>Distraction: {stepData.distractionActivity}</li>
              )}
            </ul>
          </StepSummary>
        )}
      </NeutralizeContainer>
    </BaseCard>
  );
};

export default CardNeutralize;
