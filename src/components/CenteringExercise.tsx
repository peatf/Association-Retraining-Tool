import React from 'react';
import styled from 'styled-components';
import BaseCard from './BaseCard';

const CenteringExercise = ({ onComplete, onExit }) => {
  return (
    <BaseCard title="A Moment to Center">
      <div style={{ padding: '1rem' }}>
        <p>
          Let's take a moment to ground ourselves. Find a comfortable position, either sitting or lying down.
        </p>
        <p>
          Gently close your eyes, or lower your gaze. Bring your attention to your breath. Notice the sensation of the air entering your nostrils, filling your lungs, and then leaving your body.
        </p>
        <p>
          There's no need to change your breathing in any way. Simply observe it. If your mind wanders, gently guide it back to your breath.
        </p>
        <p>
          Stay with this for a few moments. When you feel ready, you can continue.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={onComplete}>I'm ready to continue</button>
          <button className="btn-secondary" onClick={onExit}>Maybe later</button>
        </div>
      </div>
    </BaseCard>
  );
};

export default CenteringExercise;
