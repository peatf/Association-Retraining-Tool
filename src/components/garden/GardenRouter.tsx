// Garden Router - Navigation system for the 5 garden steps
// Handles step transitions and manages the garden journey flow

import React, { Suspense } from 'react';
import { useGardenState } from '../../context/GardenStateContext';
import type { StepType } from '../../context/GardenStateTypes';

// Lazy load step components for better performance
const Step1NightSky = React.lazy(() => import('./steps/Step1NightSky'));
const Step2MapTransition = React.lazy(() => import('./steps/Step2MapTransition'));
const Step3FieldEntry = React.lazy(() => import('./steps/Step3FieldEntry'));
const Step4BotanicalReflection = React.lazy(() => import('./steps/Step4BotanicalReflection'));
const Step5GardenPath = React.lazy(() => import('./steps/Step5GardenPath'));

interface GardenRouterProps {
  className?: string;
}

// Loading fallback for step transitions
const StepLoadingFallback: React.FC<{ step: StepType }> = ({ step }) => (
  <div 
    className="garden-step-loading"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--garden-night-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--garden-moonlight)',
      zIndex: 'var(--z-garden-ui-base)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div 
        className="garden-loading"
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid var(--garden-moonlight)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto var(--garden-spacing-md) auto',
        }}
      />
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        Preparing {step.replace(/([A-Z])/g, ' $1').toLowerCase()}...
      </p>
    </div>
    
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const GardenRouter: React.FC<GardenRouterProps> = ({ className = '' }) => {
  const { gardenState } = useGardenState();
  const { currentStep, isTransitioning } = gardenState;

  // Render the appropriate step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'nightSky':
        return (
          <Suspense fallback={<StepLoadingFallback step="nightSky" />}>
            <Step1NightSky />
          </Suspense>
        );
      
      case 'mapTransition':
        return (
          <Suspense fallback={<StepLoadingFallback step="mapTransition" />}>
            <Step2MapTransition />
          </Suspense>
        );
      
      case 'fieldEntry':
        return (
          <Suspense fallback={<StepLoadingFallback step="fieldEntry" />}>
            <Step3FieldEntry />
          </Suspense>
        );
      
      case 'botanicalReflection':
        return (
          <Suspense fallback={<StepLoadingFallback step="botanicalReflection" />}>
            <Step4BotanicalReflection />
          </Suspense>
        );
      
      case 'gardenPath':
        return (
          <Suspense fallback={<StepLoadingFallback step="gardenPath" />}>
            <Step5GardenPath />
          </Suspense>
        );
      
      default:
        return (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--garden-night-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--garden-moonlight)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2>Unknown Garden Step</h2>
              <p>Step "{currentStep}" is not recognized.</p>
              <button 
                onClick={() => window.location.reload()}
                className="garden-button"
                style={{ marginTop: 'var(--garden-spacing-md)' }}
              >
                Restart Garden Journey
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`garden-router ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      data-current-step={currentStep}
      data-transitioning={isTransitioning}
    >
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            zIndex: 1000,
            fontFamily: 'monospace',
          }}
        >
          Step: {currentStep}
          {isTransitioning && ' (transitioning)'}
        </div>
      )}
      
      {/* Render current step */}
      {renderCurrentStep()}
      
      {/* Global transition overlay */}
      {isTransitioning && (
        <div
          className="garden-transition-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: 'var(--z-garden-overlays)',
          }}
        />
      )}
    </div>
  );
};

export default GardenRouter;