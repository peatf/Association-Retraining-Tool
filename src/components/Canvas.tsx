// Main Canvas component - Layout container for therapeutic cards
// Manages lane-based layout and navigation between canvas states

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Breadcrumb from './Breadcrumb';
import ErrorState from './common/ErrorState';
import ReadinessGate from './ReadinessGate';
import CenteringExercise from './CenteringExercise';
import { useSession } from '../context/SessionContext';
import { motion, AnimatePresence } from 'framer-motion';
import CardNeutralize from './CardNeutralize';
import CardCommonGround from './CardCommonGround';
import CardDataExtraction from './CardDataExtraction';
import ThoughtMining from './ThoughtMining';
import ThoughtPicker from './ThoughtPicker';

const CanvasLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  min-height: 60vh;
`;

const CanvasLanes = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.xl};
  
  /* Desktop: 3 lanes side by side */
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  /* Tablet: 2 lanes, picker stacks below */
  @media (max-width: ${props => props.theme.breakpoints.desktop}) and (min-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
    
    .picker-lane {
      grid-column: 1 / -1;
    }
  }
  
  /* Mobile: Single column, cards stack vertically */
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h1 {
    color: ${props => props.theme.colors.primary};
    font-size: ${props => props.theme.typography.sizes['2xl']};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.lg};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const LaneCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
`;

const LaneHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  
  h3 {
    margin: 0;
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.primary};
  }
`;

const LaneContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  min-height: 200px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
    min-height: 150px;
  }
`;

function Canvas() {
  const { updateCanvasState } = useSession();
  const [error, setError] = useState(null);
  const [showCenteringExercise, setShowCenteringExercise] = useState(false);
  const [showReadinessGate, setShowReadinessGate] = useState(true);

  const handleComponentError = (error: Error, info?: any) => {
    console.error("Caught an error:", error, info);
    setError(error);
  };

  const resetError = () => {
    setError(null);
  };

  const handleReady = (intensity: number) => {
    console.log("Ready with intensity:", intensity);
    updateCanvasState({ isReady: true, intensity: intensity });
    setShowReadinessGate(false);
  };

  const handleNotReady = () => {
    setShowCenteringExercise(true);
  };

  const handleCenteringComplete = () => {
    setShowCenteringExercise(false);
  };

  const handleExit = () => {
    setShowCenteringExercise(false);
  };

  const thoughtMiningComponent = useMemo(() => <ThoughtMining onComplete={() => console.log('Thought Mining complete')} />, []);
  const thoughtPickerComponent = useMemo(() => <ThoughtPicker />, []);

  if (error) {
    return (
      <CanvasLayout>
        <ErrorState
          title="Oops! Something went wrong in the Canvas."
          message="We've encountered an issue displaying the canvas. You can try to refresh the component or return to the previous state."
          onRetry={resetError}
          retryText="Refresh Canvas"
          error={error}
          showDetails={true}
        />
      </CanvasLayout>
    );
  }

  return (
    <CanvasLayout>
      <Breadcrumb />
      
      <WelcomeMessage>
        <h1>Welcome to Clarity Canvas</h1>
        <p>
          A private, interactive space to work through challenging thoughts 
          and discover new perspectives through guided therapeutic exercises.
        </p>
        <button onClick={() => handleComponentError(new Error("Test Error"))}>Simulate Error</button>
      </WelcomeMessage>

      <CanvasLanes>
        {/* Readiness Lane */}
        {showReadinessGate && (
          <LaneCard>
            <LaneHeader>
              <h3>Readiness Assessment</h3>
            </LaneHeader>
            <LaneContent>
            <AnimatePresence mode="wait">
              {showCenteringExercise ? (
                <motion.div
                  key="centering"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                >
                  <CenteringExercise onComplete={handleCenteringComplete} onExit={handleExit} />
                </motion.div>
              ) : (
                <motion.div
                  key="readiness"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                >
                  <ReadinessGate onReady={handleReady} onNotReady={handleNotReady} />
                </motion.div>
              )}
            </AnimatePresence>
            </LaneContent>
          </LaneCard>
        )}

        {/* Mining Lane */}
        {!showReadinessGate && (
          <LaneCard>
            <LaneHeader>
              <h3>Thought Mining</h3>
            </LaneHeader>
            <LaneContent>
              {thoughtMiningComponent}
            </LaneContent>
          </LaneCard>
        )}

        {/* Picker Lane */}
        {!showReadinessGate && (
          <LaneCard className="picker-lane">
            <LaneHeader>
              <h3>Better-Feeling Thoughts</h3>
            </LaneHeader>
            <LaneContent>
              {thoughtPickerComponent}
            </LaneContent>
          </LaneCard>
        )}
      </CanvasLanes>
    </CanvasLayout>
  );
}

export default Canvas;