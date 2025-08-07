import React, { useState } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import { useSession } from '../context/SessionContext';

const ThoughtEntryContainer = styled.div`
  padding: 1rem;
`;

const WelcomeMessage = styled.div`
  margin-bottom: 2rem;
  text-align: center;

  h4 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    line-height: 1.5;
  }
`;

const ThoughtInputSection = styled.div`
  margin-bottom: 2rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
`;

const ThoughtTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const PersistentThoughtQuestion = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;

  h5 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    margin: 0 0 1.5rem 0;
    color: #666;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const PersistentThoughtButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PersistentThoughtButton = styled.button<{ selected?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.selected ? '#e3f2fd' : '#ffffff'};
  border: 2px solid ${props => props.selected ? '#2196f3' : '#dee2e6'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;

  &:hover {
    border-color: #2196f3;
    background: #e3f2fd;
  }
`;

const ContinueSection = styled.div`
  text-align: center;
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

interface ReadinessGateProps {
  onReady: (data: { userThought: string; hasPersistentThought: boolean }) => void;
  onNotReady: () => void;
}

const ReadinessGate = ({ onReady, onNotReady }: ReadinessGateProps) => {
  const { updateCanvasState } = useSession();
  const [userThought, setUserThought] = useState('');
  const [hasPersistentThought, setHasPersistentThought] = useState<boolean | null>(null);

  const handlePersistentThoughtSelect = (isPersistent: boolean) => {
    setHasPersistentThought(isPersistent);
  };

  const handleContinue = () => {
    if (userThought.trim() && hasPersistentThought !== null) {
      // Update canvas state with the user's thought and persistence status
      updateCanvasState({
        userThought: userThought.trim(),
        hasPersistentThought,
        needsThoughtMining: hasPersistentThought,
        isReady: true
      });

      // Pass data to parent component
      onReady({
        userThought: userThought.trim(),
        hasPersistentThought
      });
    }
  };

  const canContinue = userThought.trim().length > 0 && hasPersistentThought !== null;

  return (
    <BaseCard
      title="What's on your mind?"
      testId="readiness-gate"
      showActions={false}
    >
      <ThoughtEntryContainer>
        <WelcomeMessage>
          <h4>Let's start with your thought</h4>
          <p>
            Share what's been on your mind. This could be a worry, doubt, 
            or any thought that's been taking up mental space.
          </p>
        </WelcomeMessage>

        <ThoughtInputSection>
          <label htmlFor="user-thought">
            What thought would you like to work with today?
          </label>
          <ThoughtTextArea
            id="user-thought"
            value={userThought}
            onChange={(e) => setUserThought(e.target.value)}
            placeholder="I keep thinking that I'm not good enough for this job..."
            data-testid="user-thought-input"
          />
        </ThoughtInputSection>

        {userThought.trim().length > 0 && (
          <PersistentThoughtQuestion>
            <h5>Is this thought persistent for you?</h5>
            <p>
              Does this thought keep coming back, feel loud or disruptive, 
              or seem to loop in your mind? Or is it more of a passing concern?
            </p>
            <PersistentThoughtButtons>
              <PersistentThoughtButton
                selected={hasPersistentThought === true}
                onClick={() => handlePersistentThoughtSelect(true)}
                data-testid="persistent-thought-yes"
              >
                Yes, it's persistent
              </PersistentThoughtButton>
              <PersistentThoughtButton
                selected={hasPersistentThought === false}
                onClick={() => handlePersistentThoughtSelect(false)}
                data-testid="persistent-thought-no"
              >
                No, just passing through
              </PersistentThoughtButton>
            </PersistentThoughtButtons>
          </PersistentThoughtQuestion>
        )}

        {canContinue && (
          <ContinueSection>
            <ContinueButton
              onClick={handleContinue}
              data-testid="continue-button"
            >
              {hasPersistentThought 
                ? "Continue to Topic Selection" 
                : "Continue to Better-Feeling Thoughts"
              }
            </ContinueButton>
          </ContinueSection>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={onNotReady} 
            data-testid="not-ready-button"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            I'm not ready right now
          </button>
        </div>
      </ThoughtEntryContainer>
    </BaseCard>
  );
};

export default ReadinessGate;
