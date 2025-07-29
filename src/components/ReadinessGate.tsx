import React, { useState } from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';

const IntensitySlider = styled.input`
  width: 100%;
  margin: 1rem 0;
`;

interface ReadinessGateProps {
  onReady: (intensity: number) => void;
  onNotReady: () => void;
}

const ReadinessGate = ({ onReady, onNotReady }: ReadinessGateProps) => {
  const [intensity, setIntensity] = useState(5);

  const getIntensityMessage = (value: number) => {
    const numValue = Number(value);
    if (numValue <= 3) return "A gentle exploration.";
    if (numValue <= 7) return "A moderate level of challenge.";
    return "A deep dive into your thoughts.";
  };

  return (
    <BaseCard 
      title="Are you ready to begin?"
      onActivate={() => {}}
      onComplete={() => onReady(intensity)}
      testId="readiness-gate"
      onSkip={onNotReady}
      aria-describedby="readiness-description"
      aria-label="Are you ready to begin?"
    >
      <div style={{ padding: '1rem' }}>
        <p>This tool is designed to help you work through challenging thoughts. It's most effective when you're in a calm and reflective state.</p>

        <label htmlFor="intensity-slider">How intense is the feeling right now?</label>
        <IntensitySlider
          type="range"
          id="intensity-slider"
          min="0"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          data-testid="intensity-slider"
        />
        <div data-testid="intensity-value">Intensity: {intensity}</div>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }} data-testid="intensity-message">
          {getIntensityMessage(intensity)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={() => onReady(intensity)} data-testid="ready-button">Yes, I'm ready</button>
          <button className="btn-secondary" onClick={onNotReady} data-testid="not-ready-button">No, not right now</button>
        </div>
      </div>
    </BaseCard>
  );
};

export default ReadinessGate;
