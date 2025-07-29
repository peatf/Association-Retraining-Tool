import React, { useState, Suspense, memo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Spinner } from './common';

const CardNeutralize = React.lazy(() => import('./CardNeutralize.jsx'));
const CardCommonGround = React.lazy(() => import('./CardCommonGround.jsx'));
const CardDataExtraction = React.lazy(() => import('./CardDataExtraction.jsx'));

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
`;

const ProgressStep = styled.div`
  padding: 0.5rem;
  border-bottom: 2px solid ${props => props.active ? 'blue' : 'transparent'};
  color: ${props => props.active ? 'blue' : 'inherit'};
`;

const ThoughtMining = memo(({ onComplete }) => {
  const [step, setStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <CardNeutralize onComplete={handleNextStep} />;
      case 1:
        return <CardCommonGround onComplete={handleNextStep} />;
      case 2:
        return <CardDataExtraction onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <ProgressIndicator>
        <ProgressStep active={step === 0}>1. Neutralize</ProgressStep>
        <ProgressStep active={step === 1}>2. Common Ground</ProgressStep>
        <ProgressStep active={step === 2}>3. Data Extraction</ProgressStep>
      </ProgressIndicator>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 50 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, x: -50 }}
        >
          <Suspense fallback={<Spinner />}>
            {renderStep()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {step > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-secondary" onClick={onComplete}>
            I have what I need
          </button>
        </div>
      )}
    </div>
  );
});

export default ThoughtMining;
